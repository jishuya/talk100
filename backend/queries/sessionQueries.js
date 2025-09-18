const { db, safeQuery, safeQueryOneOrNone, withTransaction } = require('../config/database');

/**
 * 학습 세션 쿼리 함수들
 * study_sessions, study_sessions_logs 테이블 관련 함수들
 */

// 학습 세션 시작
async function startStudySession(userId, categoriesStudied = []) {
  const query = `
    INSERT INTO study_sessions (
      user_id, started_at, categories_studied
    ) VALUES (
      $1, CURRENT_TIMESTAMP, $2
    )
    RETURNING *
  `;

  const categoriesJson = categoriesStudied.length > 0
    ? categoriesStudied.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {})
    : {};

  return safeQueryOneOrNone(query, [userId, JSON.stringify(categoriesJson)]);
}

// 학습 세션 종료
async function endStudySession(sessionId) {
  return withTransaction(async (t) => {
    // 세션 통계 계산
    const stats = await t.oneOrNone(`
      SELECT
        COUNT(*) as total_questions,
        COUNT(CASE WHEN is_correct THEN 1 END) as correct_answers,
        AVG(response_time) as avg_response_time
      FROM study_sessions_logs
      WHERE session_id = $1
    `, [sessionId]);

    // 카테고리별 통계 계산
    const categoryStats = await t.any(`
      SELECT
        q.category,
        COUNT(*) as question_count
      FROM study_sessions_logs ssl
      JOIN questions q ON ssl.question_id = q.question_id
      WHERE ssl.session_id = $1
      GROUP BY q.category
    `, [sessionId]);

    const categoriesStudied = categoryStats.reduce((acc, stat) => {
      acc[stat.category] = parseInt(stat.question_count);
      return acc;
    }, {});

    // 세션 업데이트
    const updatedSession = await t.one(`
      UPDATE study_sessions SET
        ended_at = CURRENT_TIMESTAMP,
        total_questions = $2,
        correct_answers = $3,
        average_response_time = $4,
        categories_studied = $5
      WHERE session_id = $1
      RETURNING *
    `, [
      sessionId,
      stats ? parseInt(stats.total_questions) : 0,
      stats ? parseInt(stats.correct_answers) : 0,
      stats ? parseFloat(stats.avg_response_time) : null,
      JSON.stringify(categoriesStudied)
    ]);

    return updatedSession;
  });
}

// 세션에 문제 풀이 기록 추가
async function logQuestionAttempt(sessionId, logData) {
  const {
    questionId,
    userAnswer,
    correctAnswer,
    isCorrect,
    responseTime,
    difficulty = 2
  } = logData;

  const query = `
    INSERT INTO study_sessions_logs (
      session_id, question_id, user_answer,
      correct_answer, is_correct, response_time, difficulty
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7
    )
    RETURNING *
  `;

  return safeQueryOneOrNone(query, [
    sessionId, questionId, userAnswer,
    correctAnswer, isCorrect, responseTime, difficulty
  ]);
}

// 사용자의 세션 이력 조회
async function getUserSessions(userId, limit = 20, offset = 0) {
  const query = `
    SELECT
      session_id,
      started_at,
      ended_at,
      total_questions,
      correct_answers,
      average_response_time,
      categories_studied,
      CASE
        WHEN ended_at IS NOT NULL AND started_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (ended_at - started_at))/60
        ELSE NULL
      END as duration_minutes,
      CASE
        WHEN total_questions > 0
        THEN ROUND((correct_answers::FLOAT / total_questions) * 100, 2)
        ELSE 0
      END as accuracy_rate
    FROM study_sessions
    WHERE user_id = $1
    ORDER BY started_at DESC
    LIMIT $2 OFFSET $3
  `;

  return safeQuery(query, [userId, limit, offset]);
}

// 특정 세션 상세 조회
async function getSessionDetails(sessionId) {
  const query = `
    SELECT
      ss.*,
      u.name as user_name,
      CASE
        WHEN ss.ended_at IS NOT NULL AND ss.started_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (ss.ended_at - ss.started_at))/60
        ELSE NULL
      END as duration_minutes
    FROM study_sessions ss
    JOIN users u ON ss.user_id = u.uid
    WHERE ss.session_id = $1
  `;

  return safeQueryOneOrNone(query, [sessionId]);
}

// 세션의 문제 풀이 로그 조회
async function getSessionLogs(sessionId) {
  const query = `
    SELECT
      ssl.*,
      q.korean_content,
      q.english_content,
      q.category,
      q.day,
      q.question_number
    FROM study_sessions_logs ssl
    JOIN questions q ON ssl.question_id = q.question_id
    WHERE ssl.session_id = $1
    ORDER BY ssl.timestamp ASC
  `;

  return safeQuery(query, [sessionId]);
}

// 사용자의 학습 통계 (세션 기반)
async function getUserStudyStats(userId, days = 30) {
  const query = `
    SELECT
      COUNT(*) as total_sessions,
      SUM(total_questions) as total_questions_attempted,
      SUM(correct_answers) as total_correct_answers,
      ROUND(AVG(
        CASE WHEN total_questions > 0
        THEN (correct_answers::FLOAT / total_questions) * 100
        ELSE NULL END
      )::NUMERIC, 2) as overall_accuracy,
      AVG(average_response_time)::INTEGER as avg_response_time,
      AVG(EXTRACT(EPOCH FROM (ended_at - started_at))/60)::INTEGER as avg_session_duration,
      COUNT(DISTINCT DATE(started_at)) as study_days
    FROM study_sessions
    WHERE user_id = $1
      AND started_at >= CURRENT_TIMESTAMP - INTERVAL '${days} days'
      AND ended_at IS NOT NULL
  `;

  return safeQueryOneOrNone(query, [userId]);
}

// 일별 학습 패턴 분석
async function getDailyStudyPattern(userId, days = 30) {
  const query = `
    SELECT
      DATE(started_at) as study_date,
      COUNT(*) as session_count,
      SUM(total_questions) as questions_attempted,
      SUM(correct_answers) as correct_answers,
      AVG(EXTRACT(EPOCH FROM (ended_at - started_at))/60)::INTEGER as avg_session_duration,
      ROUND(AVG(
        CASE WHEN total_questions > 0
        THEN (correct_answers::FLOAT / total_questions) * 100
        ELSE NULL END
      )::NUMERIC, 2) as daily_accuracy
    FROM study_sessions
    WHERE user_id = $1
      AND started_at >= CURRENT_TIMESTAMP - INTERVAL '${days} days'
      AND ended_at IS NOT NULL
    GROUP BY DATE(started_at)
    ORDER BY study_date DESC
  `;

  return safeQuery(query, [userId]);
}

// 시간대별 학습 패턴 분석
async function getHourlyStudyPattern(userId, days = 30) {
  const query = `
    SELECT
      EXTRACT(HOUR FROM started_at) as hour,
      COUNT(*) as session_count,
      AVG(total_questions)::INTEGER as avg_questions,
      ROUND(AVG(
        CASE WHEN total_questions > 0
        THEN (correct_answers::FLOAT / total_questions) * 100
        ELSE NULL END
      )::NUMERIC, 2) as avg_accuracy
    FROM study_sessions
    WHERE user_id = $1
      AND started_at >= CURRENT_TIMESTAMP - INTERVAL '${days} days'
      AND ended_at IS NOT NULL
    GROUP BY EXTRACT(HOUR FROM started_at)
    ORDER BY hour
  `;

  return safeQuery(query, [userId]);
}

// 카테고리별 학습 통계
async function getCategoryStudyStats(userId, days = 30) {
  const query = `
    SELECT
      q.category,
      COUNT(*) as questions_attempted,
      COUNT(CASE WHEN ssl.is_correct THEN 1 END) as correct_answers,
      ROUND((COUNT(CASE WHEN ssl.is_correct THEN 1 END)::FLOAT / COUNT(*)) * 100, 2) as accuracy_rate,
      AVG(ssl.response_time)::INTEGER as avg_response_time,
      COUNT(DISTINCT ss.session_id) as sessions_with_category
    FROM study_sessions ss
    JOIN study_sessions_logs ssl ON ss.session_id = ssl.session_id
    JOIN questions q ON ssl.question_id = q.question_id
    WHERE ss.user_id = $1
      AND ss.started_at >= CURRENT_TIMESTAMP - INTERVAL '${days} days'
    GROUP BY q.category
    ORDER BY questions_attempted DESC
  `;

  return safeQuery(query, [userId]);
}

// 어려운 문제 식별 (세션 로그 기반)
async function getProblematicQuestions(userId, minAttempts = 2, maxAccuracy = 50, limit = 10) {
  const query = `
    SELECT
      ssl.question_id,
      q.korean_content,
      q.english_content,
      q.category,
      COUNT(*) as attempt_count,
      COUNT(CASE WHEN ssl.is_correct THEN 1 END) as correct_count,
      ROUND((COUNT(CASE WHEN ssl.is_correct THEN 1 END)::FLOAT / COUNT(*)) * 100, 2) as accuracy_rate,
      AVG(ssl.response_time)::INTEGER as avg_response_time
    FROM study_sessions ss
    JOIN study_sessions_logs ssl ON ss.session_id = ssl.session_id
    JOIN questions q ON ssl.question_id = q.question_id
    WHERE ss.user_id = $1
    GROUP BY ssl.question_id, q.korean_content, q.english_content, q.category
    HAVING COUNT(*) >= $2 AND
           (COUNT(CASE WHEN ssl.is_correct THEN 1 END)::FLOAT / COUNT(*)) * 100 <= $3
    ORDER BY accuracy_rate ASC, attempt_count DESC
    LIMIT $4
  `;

  return safeQuery(query, [userId, minAttempts, maxAccuracy, limit]);
}

// 학습 진도 추적
async function getStudyProgress(userId) {
  const query = `
    SELECT
      q.category,
      COUNT(DISTINCT ssl.question_id) as questions_attempted,
      (
        SELECT COUNT(*)
        FROM questions
        WHERE category = q.category
      ) as total_questions_in_category,
      ROUND(
        (COUNT(DISTINCT ssl.question_id)::FLOAT / (
          SELECT COUNT(*)
          FROM questions
          WHERE category = q.category
        )) * 100, 2
      ) as category_progress_rate
    FROM study_sessions ss
    JOIN study_sessions_logs ssl ON ss.session_id = ssl.session_id
    JOIN questions q ON ssl.question_id = q.question_id
    WHERE ss.user_id = $1
    GROUP BY q.category
    ORDER BY q.category
  `;

  return safeQuery(query, [userId]);
}

// 활성 세션 조회 (종료되지 않은 세션)
async function getActiveSessions(userId) {
  const query = `
    SELECT *
    FROM study_sessions
    WHERE user_id = $1 AND ended_at IS NULL
    ORDER BY started_at DESC
  `;

  return safeQuery(query, [userId]);
}

// 세션 삭제
async function deleteSession(sessionId) {
  return withTransaction(async (t) => {
    // 세션 로그 먼저 삭제
    await t.any('DELETE FROM study_sessions_logs WHERE session_id = $1', [sessionId]);

    // 세션 삭제
    const deletedSession = await t.oneOrNone(
      'DELETE FROM study_sessions WHERE session_id = $1 RETURNING *',
      [sessionId]
    );

    return deletedSession;
  });
}

module.exports = {
  startStudySession,
  endStudySession,
  logQuestionAttempt,
  getUserSessions,
  getSessionDetails,
  getSessionLogs,
  getUserStudyStats,
  getDailyStudyPattern,
  getHourlyStudyPattern,
  getCategoryStudyStats,
  getProblematicQuestions,
  getStudyProgress,
  getActiveSessions,
  deleteSession
};