const { db, safeQuery, safeQueryOne, safeQueryOneOrNone, withTransaction } = require('../config/database');

/**
 * 사용자 쿼리 함수들
 * OAuth 로그인 시 Google/Naver ID를 uid로 사용
 */

// 사용자 생성 (OAuth 로그인 시)
async function createUser(userData) {
  const {
    uid, // Google ID 또는 Naver ID
    name,
    email,
    profile_image = null,
    voice_gender = 'male',
    default_difficulty = 2
  } = userData;

  const query = `
    INSERT INTO users (
      uid, name, email, profile_image,
      voice_gender, default_difficulty,
      created_at, last_login_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    RETURNING *
  `;

  return safeQueryOne(query, [
    uid, name, email, profile_image,
    voice_gender, default_difficulty
  ]);
}

// 사용자 조회 (uid로)
async function findUserByUid(uid) {
  const query = `
    SELECT * FROM users
    WHERE uid = $1
  `;

  return safeQueryOneOrNone(query, [uid]);
}

// 사용자 조회 (이메일로)
async function findUserByEmail(email) {
  const query = `
    SELECT * FROM users
    WHERE email = $1
  `;

  return safeQueryOneOrNone(query, [email]);
}

// 사용자 또는 생성 (OAuth 로그인용)
async function findOrCreateUser(userData) {
  return withTransaction(async (t) => {
    // 먼저 uid로 찾기
    let user = await t.oneOrNone(
      'SELECT * FROM users WHERE uid = $1',
      [userData.uid]
    );

    if (user) {
      // 기존 사용자 - 마지막 로그인 시간 업데이트
      user = await t.one(
        `UPDATE users
         SET last_login_at = CURRENT_TIMESTAMP
         WHERE uid = $1
         RETURNING *`,
        [userData.uid]
      );
    } else {
      // 새 사용자 생성
      user = await t.one(`
        INSERT INTO users (
          uid, name, email, profile_image,
          voice_gender, default_difficulty,
          created_at, last_login_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING *
      `, [
        userData.uid,
        userData.name,
        userData.email,
        userData.profile_image || null,
        userData.voice_gender || 'male',
        userData.default_difficulty || 2
      ]);
    }

    return user;
  });
}

// 사용자 설정 업데이트
async function updateUserSettings(uid, settings) {
  const allowedFields = [
    'voice_gender',
    'default_difficulty',
    'notification_enabled'
  ];

  const updateFields = [];
  const values = [];
  let paramIndex = 1;

  Object.keys(settings).forEach(key => {
    if (allowedFields.includes(key) && settings[key] !== undefined) {
      updateFields.push(`${key} = $${paramIndex}`);
      values.push(settings[key]);
      paramIndex++;
    }
  });

  if (updateFields.length === 0) {
    throw new Error('No valid fields to update');
  }

  values.push(uid);

  const query = `
    UPDATE users
    SET ${updateFields.join(', ')}, last_login_at = CURRENT_TIMESTAMP
    WHERE uid = $${paramIndex}
    RETURNING *
  `;

  return safeQueryOne(query, values);
}

// 사용자 통계 업데이트 (캐시)
async function updateUserStats(uid, stats) {
  const {
    total_days_studied,
    current_streak,
    longest_streak,
    total_questions_attempted,
    total_correct_answers,
    weekly_attendance
  } = stats;

  const query = `
    UPDATE users SET
      total_days_studied = COALESCE($2, total_days_studied),
      current_streak = COALESCE($3, current_streak),
      longest_streak = GREATEST(longest_streak, COALESCE($4, longest_streak)),
      total_questions_attempted = COALESCE($5, total_questions_attempted),
      total_correct_answers = COALESCE($6, total_correct_answers),
      weekly_attendance = COALESCE($7, weekly_attendance)
    WHERE uid = $1
    RETURNING *
  `;

  return safeQueryOne(query, [
    uid,
    total_days_studied,
    current_streak,
    longest_streak,
    total_questions_attempted,
    total_correct_answers,
    weekly_attendance
  ]);
}

// 사용자 통계 계산 및 캐시 업데이트
async function recalculateAndUpdateUserStats(uid) {
  return withTransaction(async (t) => {
    // 총 학습일 수 계산
    const daysStudied = await t.one(`
      SELECT COUNT(DISTINCT date) as days
      FROM daily_attendance
      WHERE user_id = $1
    `, [uid]);

    // 총 문제 시도/정답 수 계산
    const questionStats = await t.one(`
      SELECT
        COALESCE(SUM(total_attempts), 0) as total_attempted,
        COALESCE(SUM(correct_attempts), 0) as total_correct
      FROM user_progress
      WHERE user_id = $1
    `, [uid]);

    // 현재 연속 학습 일수 계산
    const streakData = await t.oneOrNone(`
      WITH ordered_dates AS (
        SELECT date,
               LAG(date) OVER (ORDER BY date) as prev_date
        FROM daily_attendance
        WHERE user_id = $1
        ORDER BY date DESC
      ),
      streak_calc AS (
        SELECT date,
               CASE
                 WHEN prev_date IS NULL OR prev_date = date - INTERVAL '1 day'
                 THEN 0
                 ELSE 1
               END as break_marker
        FROM ordered_dates
      ),
      streak_groups AS (
        SELECT date,
               SUM(break_marker) OVER (ORDER BY date DESC) as group_id
        FROM streak_calc
      )
      SELECT COUNT(*) as current_streak
      FROM streak_groups
      WHERE group_id = 0
    `, [uid]);

    const currentStreak = streakData ? streakData.current_streak : 0;

    // 최고 연속 기록 계산 (복잡한 쿼리이므로 현재 스트릭과 기존 값 중 최대값 사용)
    const existingUser = await t.one('SELECT longest_streak FROM users WHERE uid = $1', [uid]);
    const longestStreak = Math.max(currentStreak, existingUser.longest_streak || 0);

    // 주간 출석 배열 계산 (최근 7일)
    const weeklyData = await t.any(`
      SELECT
        EXTRACT(DOW FROM date) as day_of_week,
        COUNT(*) as attended
      FROM daily_attendance
      WHERE user_id = $1
        AND date >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY EXTRACT(DOW FROM date)
    `, [uid]);

    // 배열 초기화 [일,월,화,수,목,금,토]
    const weeklyAttendance = new Array(7).fill(0);
    weeklyData.forEach(row => {
      weeklyAttendance[row.day_of_week] = 1;
    });

    // 통계 업데이트
    const updatedUser = await t.one(`
      UPDATE users SET
        total_days_studied = $2,
        current_streak = $3,
        longest_streak = $4,
        total_questions_attempted = $5,
        total_correct_answers = $6,
        weekly_attendance = $7
      WHERE uid = $1
      RETURNING *
    `, [
      uid,
      parseInt(daysStudied.days),
      currentStreak,
      longestStreak,
      parseInt(questionStats.total_attempted),
      parseInt(questionStats.total_correct),
      weeklyAttendance
    ]);

    return updatedUser;
  });
}

// 사용자 삭제 (GDPR 준수)
async function deleteUser(uid) {
  const query = `
    DELETE FROM users WHERE uid = $1
    RETURNING uid, name, email
  `;

  return safeQueryOneOrNone(query, [uid]);
}

// 모든 사용자 목록 조회 (관리자용)
async function getAllUsers(limit = 100, offset = 0) {
  const query = `
    SELECT
      uid, name, email, created_at, last_login_at,
      total_days_studied, current_streak, longest_streak,
      total_questions_attempted, total_correct_answers
    FROM users
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;

  return safeQuery(query, [limit, offset]);
}

// 활성 사용자 수 조회
async function getActiveUsersCount(days = 7) {
  const query = `
    SELECT COUNT(*) as active_users
    FROM users
    WHERE last_login_at >= CURRENT_TIMESTAMP - INTERVAL '${days} days'
  `;

  const result = await safeQueryOne(query);
  return parseInt(result.active_users);
}

module.exports = {
  createUser,
  findUserByUid,
  findUserByEmail,
  findOrCreateUser,
  updateUserSettings,
  updateUserStats,
  recalculateAndUpdateUserStats,
  deleteUser,
  getAllUsers,
  getActiveUsersCount
};