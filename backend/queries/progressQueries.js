const { db, safeQuery, safeQueryOneOrNone, withTransaction } = require('../config/database');

/**
 * 학습 진행상황 관련 쿼리 함수들
 * user_progress와 daily_progress 테이블 관리
 */

// 사용자의 특정 문제 진행상황 조회
async function getUserProgress(userId, questionId) {
  const query = `
    SELECT
      progress_id,
      user_id,
      question_id,
      total_attempts,
      correct_attempts,
      last_attempt_timestamp,
      last_is_correct,
      status
    FROM user_progress
    WHERE user_id = $1 AND question_id = $2
  `;

  return safeQueryOneOrNone(query, [userId, questionId]);
}

// 사용자의 모든 진행상황 조회
async function getAllUserProgress(userId) {
  const query = `
    SELECT
      up.progress_id,
      up.user_id,
      up.question_id,
      up.total_attempts,
      up.correct_attempts,
      up.last_attempt_timestamp,
      up.last_is_correct,
      up.status,
      q.category,
      q.day,
      q.question_number
    FROM user_progress up
    JOIN questions q ON up.question_id = q.question_id
    WHERE up.user_id = $1
    ORDER BY q.category, q.day, q.question_number
  `;

  return safeQuery(query, [userId]);
}

// 카테고리별 진행상황 조회
async function getProgressByCategory(userId, category) {
  const query = `
    SELECT
      up.progress_id,
      up.user_id,
      up.question_id,
      up.total_attempts,
      up.correct_attempts,
      up.last_attempt_timestamp,
      up.last_is_correct,
      up.status,
      q.day,
      q.question_number
    FROM user_progress up
    JOIN questions q ON up.question_id = q.question_id
    WHERE up.user_id = $1 AND q.category = $2
    ORDER BY q.day, q.question_number
  `;

  return safeQuery(query, [userId, category]);
}

// 진행상황 업데이트 또는 생성
async function updateOrCreateProgress(userId, questionId, isCorrect) {
  return withTransaction(async (t) => {
    // 기존 진행상황 조회
    const existing = await t.oneOrNone(
      'SELECT * FROM user_progress WHERE user_id = $1 AND question_id = $2',
      [userId, questionId]
    );

    let result;
    if (existing) {
      // 기존 기록 업데이트
      const newTotalAttempts = existing.total_attempts + 1;
      const newCorrectAttempts = existing.correct_attempts + (isCorrect ? 1 : 0);

      // 상태 계산 (간단한 로직)
      let newStatus = 'learning';
      if (newCorrectAttempts >= 3) {
        newStatus = 'mastered';
      } else if (newTotalAttempts === 1) {
        newStatus = 'new';
      }

      result = await t.one(`
        UPDATE user_progress SET
          total_attempts = $3,
          correct_attempts = $4,
          last_attempt_timestamp = CURRENT_TIMESTAMP,
          last_is_correct = $5,
          status = $6
        WHERE user_id = $1 AND question_id = $2
        RETURNING *
      `, [userId, questionId, newTotalAttempts, newCorrectAttempts, isCorrect, newStatus]);
    } else {
      // 새 기록 생성
      result = await t.one(`
        INSERT INTO user_progress (
          user_id, question_id, total_attempts, correct_attempts,
          last_attempt_timestamp, last_is_correct, status
        ) VALUES (
          $1, $2, 1, $3, CURRENT_TIMESTAMP, $4, 'new'
        )
        RETURNING *
      `, [userId, questionId, isCorrect ? 1 : 0, isCorrect]);
    }

    return result;
  });
}

// 사용자 전체 통계 조회
async function getUserStats(userId) {
  const query = `
    SELECT
      COUNT(*) as total_questions_studied,
      SUM(total_attempts) as total_attempts,
      SUM(correct_attempts) as total_correct_answers,
      COUNT(CASE WHEN status = 'mastered' THEN 1 END) as mastered_questions,
      COUNT(CASE WHEN status = 'learning' THEN 1 END) as learning_questions,
      COUNT(CASE WHEN status = 'new' THEN 1 END) as new_questions,
      ROUND(
        CASE
          WHEN SUM(total_attempts) > 0
          THEN (SUM(correct_attempts)::FLOAT / SUM(total_attempts)) * 100
          ELSE 0
        END, 2
      ) as accuracy_percentage
    FROM user_progress
    WHERE user_id = $1
  `;

  const result = await safeQueryOneOrNone(query, [userId]);
  return result || {
    total_questions_studied: 0,
    total_attempts: 0,
    total_correct_answers: 0,
    mastered_questions: 0,
    learning_questions: 0,
    new_questions: 0,
    accuracy_percentage: 0
  };
}

// 카테고리별 통계 조회
async function getCategoryProgressStats(userId) {
  const query = `
    SELECT
      q.category,
      COUNT(*) as questions_studied,
      SUM(up.total_attempts) as total_attempts,
      SUM(up.correct_attempts) as correct_attempts,
      COUNT(CASE WHEN up.status = 'mastered' THEN 1 END) as mastered_count,
      COUNT(CASE WHEN up.status = 'learning' THEN 1 END) as learning_count,
      COUNT(CASE WHEN up.status = 'new' THEN 1 END) as new_count,
      ROUND(
        CASE
          WHEN SUM(up.total_attempts) > 0
          THEN (SUM(up.correct_attempts)::FLOAT / SUM(up.total_attempts)) * 100
          ELSE 0
        END, 2
      ) as accuracy_percentage
    FROM user_progress up
    JOIN questions q ON up.question_id = q.question_id
    WHERE up.user_id = $1
    GROUP BY q.category
    ORDER BY q.category
  `;

  return safeQuery(query, [userId]);
}

// 일일 진행상황 조회
async function getDailyProgress(userId, date = null) {
  const targetDate = date || new Date().toISOString().split('T')[0];

  const query = `
    SELECT
      user_id,
      date,
      days_completed,
      goal_met,
      additional_days
    FROM daily_progress
    WHERE user_id = $1 AND date = $2
  `;

  return safeQueryOneOrNone(query, [userId, targetDate]);
}

// 일일 진행상황 업데이트 또는 생성
async function updateOrCreateDailyProgress(userId, daysCompleted, additionalDays = 0, date = null) {
  const targetDate = date || new Date().toISOString().split('T')[0];

  return withTransaction(async (t) => {
    // 사용자의 daily_goal 조회
    const user = await t.one('SELECT daily_goal FROM users WHERE uid = $1', [userId]);
    const goalMet = daysCompleted >= user.daily_goal;

    // 기존 기록 조회
    const existing = await t.oneOrNone(
      'SELECT * FROM daily_progress WHERE user_id = $1 AND date = $2',
      [userId, targetDate]
    );

    let result;
    if (existing) {
      // 업데이트
      result = await t.one(`
        UPDATE daily_progress SET
          days_completed = $3,
          goal_met = $4,
          additional_days = $5
        WHERE user_id = $1 AND date = $2
        RETURNING *
      `, [userId, targetDate, daysCompleted, goalMet, additionalDays]);
    } else {
      // 새 기록 생성
      result = await t.one(`
        INSERT INTO daily_progress (user_id, date, days_completed, goal_met, additional_days)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [userId, targetDate, daysCompleted, goalMet, additionalDays]);
    }

    return result;
  });
}

// 주간 진행상황 조회
async function getWeeklyProgress(userId) {
  const query = `
    SELECT
      date,
      days_completed,
      goal_met,
      additional_days
    FROM daily_progress
    WHERE user_id = $1
      AND date >= CURRENT_DATE - INTERVAL '6 days'
      AND date <= CURRENT_DATE
    ORDER BY date
  `;

  return safeQuery(query, [userId]);
}

// 월간 진행상황 조회
async function getMonthlyProgress(userId, year, month) {
  const query = `
    SELECT
      date,
      days_completed,
      goal_met,
      additional_days
    FROM daily_progress
    WHERE user_id = $1
      AND EXTRACT(YEAR FROM date) = $2
      AND EXTRACT(MONTH FROM date) = $3
    ORDER BY date
  `;

  return safeQuery(query, [userId, year, month]);
}

// 연속 학습 일수 계산
async function calculateCurrentStreak(userId) {
  const query = `
    WITH ordered_dates AS (
      SELECT date,
             LAG(date) OVER (ORDER BY date) as prev_date
      FROM daily_progress
      WHERE user_id = $1 AND goal_met = true
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
  `;

  const result = await safeQueryOneOrNone(query, [userId]);
  return result ? parseInt(result.current_streak) : 0;
}

// 특정 기간 학습 통계
async function getProgressStatsByPeriod(userId, startDate, endDate) {
  const query = `
    SELECT
      COUNT(*) as study_days,
      SUM(days_completed) as total_days_completed,
      SUM(additional_days) as total_additional_days,
      COUNT(CASE WHEN goal_met = true THEN 1 END) as goal_met_days,
      ROUND(
        CASE
          WHEN COUNT(*) > 0
          THEN (COUNT(CASE WHEN goal_met = true THEN 1 END)::FLOAT / COUNT(*)) * 100
          ELSE 0
        END, 2
      ) as goal_achievement_rate
    FROM daily_progress
    WHERE user_id = $1
      AND date >= $2
      AND date <= $3
  `;

  const result = await safeQueryOneOrNone(query, [userId, startDate, endDate]);
  return result || {
    study_days: 0,
    total_days_completed: 0,
    total_additional_days: 0,
    goal_met_days: 0,
    goal_achievement_rate: 0
  };
}

module.exports = {
  getUserProgress,
  getAllUserProgress,
  getProgressByCategory,
  updateOrCreateProgress,
  getUserStats,
  getCategoryProgressStats,
  getDailyProgress,
  updateOrCreateDailyProgress,
  getWeeklyProgress,
  getMonthlyProgress,
  calculateCurrentStreak,
  getProgressStatsByPeriod
};