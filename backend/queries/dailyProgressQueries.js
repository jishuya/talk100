const { safeQuery, safeQueryOneOrNone, withTransaction } = require('../config/database');

/**
 * Daily Progress Queries
 * 일일 학습 진행상황 관련 데이터베이스 쿼리
 * 홈 화면 대시보드 및 MyPage 통계 제공
 */

/**
 * 오늘의 학습 현황 조회 (핵심 정보)
 * @param {string} userId - 사용자 ID
 * @param {string} date - 날짜 (YYYY-MM-DD), 기본값: 오늘
 * @returns {Object} 오늘의 학습 현황
 */
async function getTodayProgress(userId, date = null) {
  const targetDate = date || new Date().toISOString().split('T')[0];

  const query = `
    SELECT
      u.daily_goal,
      u.current_streak,
      u.longest_streak,
      u.total_days_studied,
      u.weekly_attendance,
      COALESCE(dp.days_completed, 0) as days_completed,
      COALESCE(dp.goal_met, false) as goal_met,
      COALESCE(dp.additional_days, 0) as additional_days,
      dp.date as progress_date,
      ROUND(
        (COALESCE(dp.days_completed, 0)::FLOAT / u.daily_goal) * 100, 1
      ) as progress_percentage
    FROM users u
    LEFT JOIN daily_progress dp
      ON u.uid = dp.user_id
      AND dp.date = $2
    WHERE u.uid = $1
  `;

  return safeQueryOneOrNone(query, [userId, targetDate]);
}

/**
 * 일일 진행상황 업데이트 또는 생성
 * @param {string} userId - 사용자 ID
 * @param {number} daysCompleted - 완료한 Day 수
 * @param {string} date - 날짜 (선택사항)
 * @returns {Object} 업데이트된 진행상황
 */
async function updateOrCreateDailyProgress(userId, daysCompleted, date = null) {
  return withTransaction(async (t) => {
    const targetDate = date || new Date().toISOString().split('T')[0];

    // 사용자의 daily_goal 조회
    const user = await t.oneOrNone(
      'SELECT daily_goal FROM users WHERE uid = $1',
      [userId]
    );

    if (!user) {
      throw new Error('User not found');
    }

    const goalMet = daysCompleted >= user.daily_goal;
    const additionalDays = Math.max(0, daysCompleted - user.daily_goal);

    const result = await t.one(`
      INSERT INTO daily_progress
      (user_id, date, days_completed, goal_met, additional_days)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, date)
      DO UPDATE SET
        days_completed = $3,
        goal_met = $4,
        additional_days = $5
      RETURNING *
    `, [userId, targetDate, daysCompleted, goalMet, additionalDays]);

    return result;
  });
}

/**
 * 학습 연속일 업데이트
 * @param {string} userId - 사용자 ID
 * @returns {Object} 업데이트된 연속일 정보
 */
async function updateStreakData(userId) {
  return withTransaction(async (t) => {
    // 최근 30일간의 학습 기록 조회
    const recentProgress = await t.any(`
      SELECT date, days_completed > 0 as studied
      FROM daily_progress
      WHERE user_id = $1
        AND date >= CURRENT_DATE - INTERVAL '30 days'
        AND date <= CURRENT_DATE
      ORDER BY date DESC
    `, [userId]);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // 현재 연속일 계산 (오늘부터 거슬러 올라가면서)
    for (let i = 0; i < recentProgress.length; i++) {
      if (recentProgress[i].studied) {
        if (i === 0 || currentStreak > 0) {
          currentStreak++;
        }
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (i === 0) currentStreak = 0; // 오늘 학습 안함
        tempStreak = 0;
      }
    }

    // 총 학습일 계산
    const totalStudied = await t.oneOrNone(`
      SELECT COUNT(*) as total_days
      FROM daily_progress
      WHERE user_id = $1 AND days_completed > 0
    `, [userId]);

    const totalDaysStudied = parseInt(totalStudied?.total_days) || 0;

    // users 테이블 업데이트
    const result = await t.one(`
      UPDATE users
      SET current_streak = $2,
          longest_streak = GREATEST(longest_streak, $3),
          total_days_studied = $4
      WHERE uid = $1
      RETURNING current_streak, longest_streak, total_days_studied
    `, [userId, currentStreak, longestStreak, totalDaysStudied]);

    return result;
  });
}

/**
 * 주간 출석 패턴 업데이트
 * @param {string} userId - 사용자 ID
 * @param {number} dayOfWeek - 요일 (0=일, 1=월, ..., 6=토)
 * @returns {Array} 업데이트된 주간 출석 배열
 */
async function updateWeeklyAttendance(userId, dayOfWeek) {
  const query = `
    UPDATE users
    SET weekly_attendance[${dayOfWeek + 1}] = weekly_attendance[${dayOfWeek + 1}] + 1
    WHERE uid = $1
    RETURNING weekly_attendance
  `;

  const result = await safeQueryOneOrNone(query, [userId]);
  return result?.weekly_attendance || [0,0,0,0,0,0,0];
}

/**
 * 날짜별 학습 히스토리 조회
 * @param {string} userId - 사용자 ID
 * @param {number} days - 조회할 일수 (기본값: 30일)
 * @returns {Array} 날짜별 학습 기록
 */
async function getDailyHistory(userId, days = 30) {
  const query = `
    SELECT
      dp.date,
      dp.days_completed,
      dp.goal_met,
      dp.additional_days,
      u.daily_goal,
      ROUND(
        (dp.days_completed::FLOAT / u.daily_goal) * 100, 1
      ) as progress_percentage
    FROM daily_progress dp
    JOIN users u ON dp.user_id = u.uid
    WHERE dp.user_id = $1
      AND dp.date >= CURRENT_DATE - INTERVAL '${days} days'
      AND dp.date <= CURRENT_DATE
    ORDER BY dp.date DESC
  `;

  return safeQuery(query, [userId]);
}

/**
 * 종합 학습 통계 조회
 * @param {string} userId - 사용자 ID
 * @returns {Object} 전체 학습 통계
 */
async function getOverallStats(userId) {
  const query = `
    SELECT
      u.total_questions_attempted,
      u.total_correct_answers,
      u.total_days_studied,
      u.current_streak,
      u.longest_streak,
      u.daily_goal,
      u.created_at,
      u.weekly_attendance,
      CASE
        WHEN u.total_questions_attempted > 0
        THEN ROUND((u.total_correct_answers::FLOAT / u.total_questions_attempted) * 100, 1)
        ELSE 0
      END as overall_accuracy,
      -- 이번 달 학습 통계
      COUNT(CASE WHEN dp.date >= DATE_TRUNC('month', CURRENT_DATE)
                   AND dp.days_completed > 0 THEN 1 END) as this_month_studied_days,
      COUNT(CASE WHEN dp.date >= DATE_TRUNC('month', CURRENT_DATE)
                   AND dp.goal_met = true THEN 1 END) as this_month_goals_met,
      -- 평균 일일 완료 수
      ROUND(AVG(CASE WHEN dp.days_completed > 0 THEN dp.days_completed END), 1) as avg_daily_completion
    FROM users u
    LEFT JOIN daily_progress dp ON u.uid = dp.user_id
    WHERE u.uid = $1
    GROUP BY u.uid, u.total_questions_attempted, u.total_correct_answers,
             u.total_days_studied, u.current_streak, u.longest_streak,
             u.daily_goal, u.created_at, u.weekly_attendance
  `;

  return safeQueryOneOrNone(query, [userId]);
}

/**
 * 다가오는 복습 정보 조회
 * @param {string} userId - 사용자 ID
 * @returns {Object} 복습 예정 정보
 */
async function getUpcomingReviews(userId) {
  const query = `
    SELECT
      COUNT(CASE WHEN scheduled_for::date = CURRENT_DATE THEN 1 END) as today_reviews,
      COUNT(CASE WHEN scheduled_for::date = CURRENT_DATE + INTERVAL '1 day' THEN 1 END) as tomorrow_reviews,
      COUNT(CASE WHEN scheduled_for::date <= CURRENT_DATE + INTERVAL '7 days' THEN 1 END) as week_reviews
    FROM review_queue
    WHERE user_id = $1
  `;

  const result = await safeQueryOneOrNone(query, [userId]);
  return result || {
    today_reviews: 0,
    tomorrow_reviews: 0,
    week_reviews: 0
  };
}

/**
 * 오늘의 퀴즈 활동 통계
 * @param {string} userId - 사용자 ID
 * @returns {Object} 오늘의 활동 요약
 */
async function getTodayActivity(userId) {
  const today = new Date().toISOString().split('T')[0];

  const query = `
    SELECT
      COUNT(CASE WHEN wa.added_at::date = $2 THEN 1 END) as today_wrong_answers,
      COUNT(CASE WHEN f.added_at::date = $2 THEN 1 END) as today_favorites
    FROM users u
    LEFT JOIN wrong_answers wa ON u.uid = wa.user_id
    LEFT JOIN favorites f ON u.uid = f.user_id
    WHERE u.uid = $1
    GROUP BY u.uid
  `;

  const result = await safeQueryOneOrNone(query, [userId, today]);
  return result || {
    today_wrong_answers: 0,
    today_favorites: 0
  };
}

/**
 * 학습 패턴 분석
 * @param {string} userId - 사용자 ID
 * @returns {Object} 학습 패턴 정보
 */
async function getLearningPattern(userId) {
  const query = `
    SELECT
      u.weekly_attendance,
      -- 가장 활발한 요일 (0=일요일)
      (
        SELECT idx - 1 as most_active_day
        FROM unnest(u.weekly_attendance) WITH ORDINALITY AS t(val, idx)
        ORDER BY val DESC
        LIMIT 1
      ),
      -- 최근 30일 목표 달성률
      ROUND(
        COUNT(CASE WHEN dp.goal_met = true AND dp.date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END)::FLOAT /
        NULLIF(COUNT(CASE WHEN dp.date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END), 0) * 100,
        1
      ) as monthly_goal_achievement_rate,
      -- 평균 추가 학습
      ROUND(AVG(CASE WHEN dp.additional_days > 0 THEN dp.additional_days END), 1) as avg_additional_learning
    FROM users u
    LEFT JOIN daily_progress dp ON u.uid = dp.user_id
    WHERE u.uid = $1
    GROUP BY u.uid, u.weekly_attendance
  `;

  return safeQueryOneOrNone(query, [userId]);
}

/**
 * 목표 달성 트렌드 분석 (최근 7일)
 * @param {string} userId - 사용자 ID
 * @returns {Array} 일별 목표 달성 여부
 */
async function getWeeklyTrend(userId) {
  const query = `
    WITH date_series AS (
      SELECT generate_series(
        CURRENT_DATE - INTERVAL '6 days',
        CURRENT_DATE,
        '1 day'::interval
      )::date as date
    )
    SELECT
      ds.date,
      EXTRACT(DOW FROM ds.date) as day_of_week,  -- 0=일, 1=월, ...
      COALESCE(dp.days_completed, 0) as days_completed,
      COALESCE(dp.goal_met, false) as goal_met,
      u.daily_goal
    FROM date_series ds
    CROSS JOIN users u
    LEFT JOIN daily_progress dp ON ds.date = dp.date AND u.uid = dp.user_id
    WHERE u.uid = $1
    ORDER BY ds.date
  `;

  return safeQuery(query, [userId]);
}

module.exports = {
  getTodayProgress,
  updateOrCreateDailyProgress,
  updateStreakData,
  updateWeeklyAttendance,
  getDailyHistory,
  getOverallStats,
  getUpcomingReviews,
  getTodayActivity,
  getLearningPattern,
  getWeeklyTrend
};