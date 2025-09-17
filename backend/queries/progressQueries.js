const { db, safeQuery, safeQueryOne, safeQueryOneOrNone, withTransaction } = require('../config/database');

/**
 * 학습 진행상황 쿼리 함수들
 * user_progress 테이블 관련 함수들
 */

// 사용자의 특정 문제 진행상황 조회
async function getUserProgress(userId, questionId) {
  const query = `
    SELECT * FROM user_progress
    WHERE user_id = $1 AND question_id = $2
  `;

  return safeQueryOneOrNone(query, [userId, questionId]);
}

// 사용자의 모든 진행상황 조회
async function getAllUserProgress(userId, status = null, limit = 100, offset = 0) {
  let query = `
    SELECT
      up.*,
      q.category,
      q.day,
      q.question_number,
      q.korean_content,
      q.english_content,
      q.question_type
    FROM user_progress up
    JOIN questions q ON up.question_id = q.question_id
    WHERE up.user_id = $1
  `;

  const params = [userId];
  let paramIndex = 2;

  if (status) {
    query += ` AND up.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  query += `
    ORDER BY up.last_attempt_timestamp DESC NULLS LAST,
             q.day ASC, q.question_number ASC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  params.push(limit, offset);

  return safeQuery(query, params);
}

// 카테고리별 진행상황 통계
async function getProgressStatsByCategory(userId, categoryId = null) {
  let query = `
    SELECT
      q.category,
      COUNT(*) as total_questions,
      COUNT(CASE WHEN up.status = 'new' OR up.status IS NULL THEN 1 END) as new_questions,
      COUNT(CASE WHEN up.status = 'learning' THEN 1 END) as learning_questions,
      COUNT(CASE WHEN up.status = 'mastered' THEN 1 END) as mastered_questions,
      COUNT(CASE WHEN up.status = 'review' THEN 1 END) as review_questions,
      COALESCE(AVG(
        CASE WHEN up.total_attempts > 0
        THEN up.correct_attempts::FLOAT / up.total_attempts * 100
        ELSE NULL END
      )::INTEGER, 0) as avg_accuracy
    FROM questions q
    LEFT JOIN user_progress up ON q.question_id = up.question_id AND up.user_id = $1
  `;

  const params = [userId];
  let paramIndex = 2;

  if (categoryId) {
    query += ` WHERE q.category = $${paramIndex}`;
    params.push(categoryId);
    paramIndex++;
  }

  query += ` GROUP BY q.category ORDER BY q.category`;

  return safeQuery(query, params);
}

// 진행상황 생성 또는 업데이트
async function createOrUpdateProgress(progressData) {
  const {
    userId,
    questionId,
    isCorrect,
    timeToken,
    inputMethod = 'keyboard'
  } = progressData;

  return withTransaction(async (t) => {
    // 기존 진행상황 조회
    const existing = await t.oneOrNone(
      'SELECT * FROM user_progress WHERE user_id = $1 AND question_id = $2',
      [userId, questionId]
    );

    let result;

    if (existing) {
      // 기존 기록 업데이트
      const newConsecutiveCorrect = isCorrect ? existing.consecutive_correct + 1 : 0;
      const newStatus = determineNewStatus(existing.status, isCorrect, newConsecutiveCorrect);

      result = await t.one(`
        UPDATE user_progress SET
          total_attempts = total_attempts + 1,
          correct_attempts = correct_attempts + CASE WHEN $3 THEN 1 ELSE 0 END,
          wrong_attempts = wrong_attempts + CASE WHEN $3 THEN 0 ELSE 1 END,
          consecutive_correct = $4,
          last_attempt_timestamp = CURRENT_TIMESTAMP,
          last_is_correct = $3,
          last_time_taken = $5,
          last_input_method = $6,
          status = $7
        WHERE user_id = $1 AND question_id = $2
        RETURNING *
      `, [
        userId, questionId, isCorrect, newConsecutiveCorrect,
        timeToken, inputMethod, newStatus
      ]);
    } else {
      // 새 기록 생성
      const initialStatus = isCorrect ? 'learning' : 'review';

      result = await t.one(`
        INSERT INTO user_progress (
          user_id, question_id, total_attempts,
          correct_attempts, wrong_attempts, consecutive_correct,
          last_attempt_timestamp, last_is_correct,
          last_time_taken, last_input_method, status
        ) VALUES (
          $1, $2, 1,
          CASE WHEN $3 THEN 1 ELSE 0 END,
          CASE WHEN $3 THEN 0 ELSE 1 END,
          CASE WHEN $3 THEN 1 ELSE 0 END,
          CURRENT_TIMESTAMP, $3, $4, $5, $6
        )
        RETURNING *
      `, [userId, questionId, isCorrect, timeToken, inputMethod, initialStatus]);
    }

    return result;
  });
}

// 상태 결정 로직
function determineNewStatus(currentStatus, isCorrect, consecutiveCorrect) {
  if (consecutiveCorrect >= 5) {
    return 'mastered';
  }

  if (!isCorrect) {
    return 'review';
  }

  if (currentStatus === 'new' || currentStatus === 'review') {
    return 'learning';
  }

  return currentStatus;
}

// 특정 상태의 문제들 조회
async function getQuestionsByStatus(userId, status, categoryId = null, limit = 50) {
  let query = `
    SELECT
      up.*,
      q.category,
      q.day,
      q.question_number,
      q.korean_content,
      q.english_content,
      q.question_type,
      q.keywords,
      q.audio_male_full,
      q.audio_female_full
    FROM user_progress up
    JOIN questions q ON up.question_id = q.question_id
    WHERE up.user_id = $1 AND up.status = $2
  `;

  const params = [userId, status];
  let paramIndex = 3;

  if (categoryId) {
    query += ` AND q.category = $${paramIndex}`;
    params.push(categoryId);
    paramIndex++;
  }

  query += `
    ORDER BY up.last_attempt_timestamp ASC NULLS LAST,
             q.day ASC, q.question_number ASC
    LIMIT $${paramIndex}
  `;
  params.push(limit);

  return safeQuery(query, params);
}

// 마스터된 문제 수 조회
async function getMasteredCount(userId, categoryId = null) {
  let query = `
    SELECT COUNT(*) as count
    FROM user_progress up
    JOIN questions q ON up.question_id = q.question_id
    WHERE up.user_id = $1 AND up.status = 'mastered'
  `;

  const params = [userId];
  let paramIndex = 2;

  if (categoryId) {
    query += ` AND q.category = $${paramIndex}`;
    params.push(categoryId);
    paramIndex++;
  }

  const result = await safeQueryOne(query, params);
  return parseInt(result.count);
}

// 정답률 계산
async function getAccuracyRate(userId, categoryId = null, days = null) {
  let query = `
    SELECT
      COALESCE(SUM(up.total_attempts), 0) as total_attempts,
      COALESCE(SUM(up.correct_attempts), 0) as correct_attempts,
      CASE
        WHEN SUM(up.total_attempts) > 0
        THEN (SUM(up.correct_attempts)::FLOAT / SUM(up.total_attempts) * 100)::INTEGER
        ELSE 0
      END as accuracy_rate
    FROM user_progress up
    JOIN questions q ON up.question_id = q.question_id
    WHERE up.user_id = $1
  `;

  const params = [userId];
  let paramIndex = 2;

  if (categoryId) {
    query += ` AND q.category = $${paramIndex}`;
    params.push(categoryId);
    paramIndex++;
  }

  if (days) {
    query += ` AND up.last_attempt_timestamp >= CURRENT_TIMESTAMP - INTERVAL '${days} days'`;
  }

  return safeQueryOne(query, params);
}

// 학습 패턴 분석
async function getLearningPattern(userId, days = 30) {
  const query = `
    SELECT
      DATE(up.last_attempt_timestamp) as study_date,
      COUNT(*) as questions_attempted,
      SUM(CASE WHEN up.last_is_correct THEN 1 ELSE 0 END) as correct_answers,
      AVG(up.last_time_taken)::INTEGER as avg_response_time,
      ARRAY_AGG(DISTINCT q.category) as categories_studied
    FROM user_progress up
    JOIN questions q ON up.question_id = q.question_id
    WHERE up.user_id = $1
      AND up.last_attempt_timestamp >= CURRENT_TIMESTAMP - INTERVAL '${days} days'
    GROUP BY DATE(up.last_attempt_timestamp)
    ORDER BY study_date DESC
  `;

  return safeQuery(query, [userId]);
}

// 약한 영역 식별
async function getWeakAreas(userId, limit = 10) {
  const query = `
    SELECT
      q.category,
      STRING_AGG(DISTINCT unnest(q.keywords), ', ') as common_keywords,
      COUNT(*) as wrong_count,
      AVG(up.total_attempts)::INTEGER as avg_attempts,
      (COUNT(*)::FLOAT / SUM(COUNT(*)) OVER ()) * 100 as error_percentage
    FROM user_progress up
    JOIN questions q ON up.question_id = q.question_id
    WHERE up.user_id = $1 AND up.wrong_attempts > 0
    GROUP BY q.category
    ORDER BY wrong_count DESC, avg_attempts DESC
    LIMIT $2
  `;

  return safeQuery(query, [userId, limit]);
}

// 진행상황 리셋 (특정 문제 또는 전체)
async function resetProgress(userId, questionId = null) {
  if (questionId) {
    // 특정 문제만 리셋
    const query = `
      UPDATE user_progress
      SET
        total_attempts = 0,
        correct_attempts = 0,
        wrong_attempts = 0,
        consecutive_correct = 0,
        last_attempt_timestamp = NULL,
        last_is_correct = NULL,
        last_time_taken = NULL,
        status = 'new'
      WHERE user_id = $1 AND question_id = $2
      RETURNING *
    `;

    return safeQueryOneOrNone(query, [userId, questionId]);
  } else {
    // 전체 진행상황 리셋
    const query = `
      UPDATE user_progress
      SET
        total_attempts = 0,
        correct_attempts = 0,
        wrong_attempts = 0,
        consecutive_correct = 0,
        last_attempt_timestamp = NULL,
        last_is_correct = NULL,
        last_time_taken = NULL,
        status = 'new'
      WHERE user_id = $1
    `;

    const result = await db.result(query, [userId]);
    return { success: true, resetCount: result.rowCount };
  }
}

// 진행상황 삭제
async function deleteProgress(userId, questionId) {
  const query = `
    DELETE FROM user_progress
    WHERE user_id = $1 AND question_id = $2
    RETURNING question_id
  `;

  return safeQueryOneOrNone(query, [userId, questionId]);
}

module.exports = {
  getUserProgress,
  getAllUserProgress,
  getProgressStatsByCategory,
  createOrUpdateProgress,
  getQuestionsByStatus,
  getMasteredCount,
  getAccuracyRate,
  getLearningPattern,
  getWeakAreas,
  resetProgress,
  deleteProgress
};