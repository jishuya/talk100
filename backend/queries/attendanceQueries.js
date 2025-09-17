const { db, safeQuery, safeQueryOne, safeQueryOneOrNone, withTransaction } = require('../config/database');

/**
 * 출석 쿼리 함수들
 * daily_attendance 테이블 관련 함수들
 */

// 일일 출석 기록 생성
async function createDailyAttendance(userId, attendanceData = {}) {
  const {
    date = new Date().toISOString().split('T')[0], // YYYY-MM-DD 형식
    startTime = new Date(),
    categoriesStudied = []
  } = attendanceData;

  const query = `
    INSERT INTO daily_attendance (
      user_id, date, start_time, categories_studied
    ) VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
      start_time = COALESCE(daily_attendance.start_time, EXCLUDED.start_time),
      categories_studied = ARRAY(
        SELECT DISTINCT unnest(daily_attendance.categories_studied || EXCLUDED.categories_studied)
      )
    RETURNING *
  `;

  return safeQueryOne(query, [userId, date, startTime, categoriesStudied]);
}

// 일일 출석 기록 업데이트
async function updateDailyAttendance(userId, date, updateData) {
  const {
    endTime,
    questionsAttempted,
    correctAnswers,
    categoriesStudied = [],
    dailyGoalMet = false,
    streakMaintained = false,
    accuracyGoalMet = false
  } = updateData;

  const query = `
    UPDATE daily_attendance SET
      end_time = COALESCE($3, end_time),
      questions_attempted = COALESCE($4, questions_attempted),
      correct_answers = COALESCE($5, correct_answers),
      categories_studied = CASE
        WHEN array_length($6, 1) > 0
        THEN ARRAY(SELECT DISTINCT unnest(COALESCE(categories_studied, ARRAY[]::TEXT[]) || $6))
        ELSE categories_studied
      END,
      daily_goal_met = COALESCE($7, daily_goal_met),
      streak_maintained = COALESCE($8, streak_maintained),
      accuracy_goal_met = COALESCE($9, accuracy_goal_met)
    WHERE user_id = $1 AND date = $2
    RETURNING *
  `;

  return safeQueryOneOrNone(query, [
    userId, date, endTime, questionsAttempted, correctAnswers,
    categoriesStudied, dailyGoalMet, streakMaintained, accuracyGoalMet
  ]);
}

// 특정 날짜 출석 기록 조회
async function getDailyAttendance(userId, date) {
  const query = `
    SELECT * FROM daily_attendance
    WHERE user_id = $1 AND date = $2
  `;

  return safeQueryOneOrNone(query, [userId, date]);
}

// 사용자의 출석 기록 조회 (기간별)
async function getAttendanceHistory(userId, startDate = null, endDate = null, limit = 30) {
  let query = `
    SELECT
      date,
      start_time,
      end_time,
      questions_attempted,
      correct_answers,
      categories_studied,
      daily_goal_met,
      streak_maintained,
      accuracy_goal_met,
      CASE
        WHEN end_time IS NOT NULL AND start_time IS NOT NULL
        THEN EXTRACT(EPOCH FROM (end_time - start_time))/60
        ELSE NULL
      END as duration_minutes
    FROM daily_attendance
    WHERE user_id = $1
  `;

  const params = [userId];
  let paramIndex = 2;

  if (startDate) {
    query += ` AND date >= $${paramIndex}`;
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    query += ` AND date <= $${paramIndex}`;
    params.push(endDate);
    paramIndex++;
  }

  query += `
    ORDER BY date DESC
    LIMIT $${paramIndex}
  `;
  params.push(limit);

  return safeQuery(query, params);
}

// 주간 출석률 계산
async function getWeeklyAttendanceRate(userId, weeksAgo = 0) {
  const query = `
    SELECT
      COUNT(*) as days_attended,
      ROUND((COUNT(*)::FLOAT / 7) * 100, 2) as attendance_rate,
      SUM(questions_attempted) as total_questions,
      SUM(correct_answers) as total_correct,
      ARRAY_AGG(DISTINCT unnest(categories_studied)) FILTER (WHERE categories_studied IS NOT NULL) as categories_studied
    FROM daily_attendance
    WHERE user_id = $1
      AND date >= CURRENT_DATE - INTERVAL '${7 * (weeksAgo + 1)} days'
      AND date < CURRENT_DATE - INTERVAL '${7 * weeksAgo} days'
  `;

  return safeQueryOne(query, [userId]);
}

// 월간 출석 통계
async function getMonthlyAttendanceStats(userId, year = null, month = null) {
  const currentDate = new Date();
  const targetYear = year || currentDate.getFullYear();
  const targetMonth = month || (currentDate.getMonth() + 1);

  const query = `
    SELECT
      COUNT(*) as days_attended,
      SUM(questions_attempted) as total_questions,
      SUM(correct_answers) as total_correct,
      AVG(questions_attempted)::INTEGER as avg_daily_questions,
      COUNT(CASE WHEN daily_goal_met THEN 1 END) as goal_achieved_days,
      COUNT(CASE WHEN streak_maintained THEN 1 END) as streak_days,
      ROUND(AVG(
        CASE WHEN questions_attempted > 0
        THEN (correct_answers::FLOAT / questions_attempted) * 100
        ELSE NULL END
      )::NUMERIC, 2) as monthly_accuracy
    FROM daily_attendance
    WHERE user_id = $1
      AND EXTRACT(YEAR FROM date) = $2
      AND EXTRACT(MONTH FROM date) = $3
  `;

  return safeQueryOne(query, [userId, targetYear, targetMonth]);
}

// 연속 학습일 계산
async function calculateStreak(userId) {
  const query = `
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
  `;

  const result = await safeQueryOne(query, [userId]);
  return parseInt(result.current_streak);
}

// 최고 연속 기록 계산
async function calculateLongestStreak(userId) {
  const query = `
    WITH date_sequences AS (
      SELECT date,
             date - (ROW_NUMBER() OVER (ORDER BY date))::INTEGER * INTERVAL '1 day' as group_date
      FROM daily_attendance
      WHERE user_id = $1
    ),
    streak_lengths AS (
      SELECT group_date, COUNT(*) as streak_length
      FROM date_sequences
      GROUP BY group_date
    )
    SELECT COALESCE(MAX(streak_length), 0) as longest_streak
    FROM streak_lengths
  `;

  const result = await safeQueryOne(query, [userId]);
  return parseInt(result.longest_streak);
}

// 출석 패턴 분석 (요일별)
async function getAttendancePatternByWeekday(userId, weeks = 4) {
  const query = `
    SELECT
      EXTRACT(DOW FROM date) as day_of_week,
      CASE EXTRACT(DOW FROM date)
        WHEN 0 THEN 'Sunday'
        WHEN 1 THEN 'Monday'
        WHEN 2 THEN 'Tuesday'
        WHEN 3 THEN 'Wednesday'
        WHEN 4 THEN 'Thursday'
        WHEN 5 THEN 'Friday'
        WHEN 6 THEN 'Saturday'
      END as day_name,
      COUNT(*) as attendance_count,
      AVG(questions_attempted)::INTEGER as avg_questions,
      ROUND(AVG(
        CASE WHEN questions_attempted > 0
        THEN (correct_answers::FLOAT / questions_attempted) * 100
        ELSE NULL END
      )::NUMERIC, 2) as avg_accuracy
    FROM daily_attendance
    WHERE user_id = $1
      AND date >= CURRENT_DATE - INTERVAL '${weeks * 7} days'
    GROUP BY EXTRACT(DOW FROM date)
    ORDER BY day_of_week
  `;

  return safeQuery(query, [userId]);
}

// 목표 달성률 조회
async function getGoalAchievementRate(userId, days = 30) {
  const query = `
    SELECT
      COUNT(*) as total_days,
      COUNT(CASE WHEN daily_goal_met THEN 1 END) as goal_met_days,
      COUNT(CASE WHEN streak_maintained THEN 1 END) as streak_days,
      COUNT(CASE WHEN accuracy_goal_met THEN 1 END) as accuracy_goal_days,
      ROUND((COUNT(CASE WHEN daily_goal_met THEN 1 END)::FLOAT / COUNT(*)) * 100, 2) as goal_achievement_rate,
      ROUND((COUNT(CASE WHEN accuracy_goal_met THEN 1 END)::FLOAT / COUNT(*)) * 100, 2) as accuracy_achievement_rate
    FROM daily_attendance
    WHERE user_id = $1
      AND date >= CURRENT_DATE - INTERVAL '${days} days'
  `;

  return safeQueryOne(query, [userId]);
}

// 카테고리별 학습 패턴
async function getCategoryLearningPattern(userId, days = 30) {
  const query = `
    SELECT
      unnest(categories_studied) as category,
      COUNT(*) as study_days,
      ROUND((COUNT(*)::FLOAT / (
        SELECT COUNT(DISTINCT date)
        FROM daily_attendance
        WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '${days} days'
      )) * 100, 2) as frequency_percentage
    FROM daily_attendance
    WHERE user_id = $1
      AND date >= CURRENT_DATE - INTERVAL '${days} days'
      AND categories_studied IS NOT NULL
    GROUP BY unnest(categories_studied)
    ORDER BY study_days DESC
  `;

  return safeQuery(query, [userId]);
}

// 출석 기록 삭제
async function deleteAttendanceRecord(userId, date) {
  const query = `
    DELETE FROM daily_attendance
    WHERE user_id = $1 AND date = $2
    RETURNING *
  `;

  return safeQueryOneOrNone(query, [userId, date]);
}

module.exports = {
  createDailyAttendance,
  updateDailyAttendance,
  getDailyAttendance,
  getAttendanceHistory,
  getWeeklyAttendanceRate,
  getMonthlyAttendanceStats,
  calculateStreak,
  calculateLongestStreak,
  getAttendancePatternByWeekday,
  getGoalAchievementRate,
  getCategoryLearningPattern,
  deleteAttendanceRecord
};