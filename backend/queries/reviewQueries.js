const { db, safeQuery, safeQueryOneOrNone, withTransaction } = require('../config/database');

/**
 * 복습 쿼리 함수들
 * review_queue 테이블 관련 함수들 (간격반복학습)
 */

// 복습 큐에 문제 추가
async function addToReviewQueue(userId, questionId, categoryId, wrongCount = 1) {
  const query = `
    INSERT INTO review_queue (
      user_id, question_id, category,
      priority, wrong_count, scheduled_for, interval_days
    ) VALUES (
      $1, $2, $3,
      $4, $4, CURRENT_TIMESTAMP + INTERVAL '1 day', 1
    )
    ON CONFLICT (user_id, question_id)
    DO UPDATE SET
      wrong_count = review_queue.wrong_count + 1,
      priority = review_queue.wrong_count + 1,
      scheduled_for = CURRENT_TIMESTAMP + INTERVAL '1 day',
      interval_days = 1,
      added_at = CURRENT_TIMESTAMP
    RETURNING *
  `;

  return safeQueryOneOrNone(query, [userId, questionId, categoryId, wrongCount]);
}

// 복습 예정 문제들 조회
async function getReviewQuestions(userId, categoryId = null, limit = 20) {
  let query = `
    SELECT
      rq.*,
      q.korean_content,
      q.english_content,
      q.person_a_korean,
      q.person_a_english,
      q.person_b_korean,
      q.person_b_english,
      q.question_type,
      q.keywords,
      q.audio_male_full,
      q.audio_female_full,
      q.audio_male_person_a,
      q.audio_female_person_a,
      q.audio_male_person_b,
      q.audio_female_person_b
    FROM review_queue rq
    JOIN questions q ON rq.question_id = q.question_id
    WHERE rq.user_id = $1
      AND rq.scheduled_for <= CURRENT_TIMESTAMP
  `;

  const params = [userId];
  let paramIndex = 2;

  if (categoryId) {
    query += ` AND rq.category = $${paramIndex}`;
    params.push(categoryId);
    paramIndex++;
  }

  query += `
    ORDER BY rq.priority ASC, rq.scheduled_for ASC
    LIMIT $${paramIndex}
  `;
  params.push(limit);

  return safeQuery(query, params);
}

// 복습 큐에서 문제 제거 (5회 연속 정답 시)
async function removeFromReviewQueue(userId, questionId) {
  const query = `
    DELETE FROM review_queue
    WHERE user_id = $1 AND question_id = $2
    RETURNING *
  `;

  return safeQueryOneOrNone(query, [userId, questionId]);
}

// 복습 일정 업데이트 (간격반복학습)
async function updateReviewSchedule(userId, questionId, isCorrect) {
  return withTransaction(async (t) => {
    const current = await t.oneOrNone(
      'SELECT * FROM review_queue WHERE user_id = $1 AND question_id = $2',
      [userId, questionId]
    );

    if (!current) {
      return null; // 복습 큐에 없음
    }

    if (isCorrect) {
      // 정답 - 간격 증가
      const newInterval = calculateNextInterval(current.interval_days, current.ease_factor, true);
      const newEaseFactor = Math.max(1.3, current.ease_factor + 0.1);

      const updated = await t.one(`
        UPDATE review_queue SET
          interval_days = $3,
          scheduled_for = CURRENT_TIMESTAMP + INTERVAL '${newInterval} days',
          ease_factor = $4,
          priority = GREATEST(1, priority - 1)
        WHERE user_id = $1 AND question_id = $2
        RETURNING *
      `, [userId, questionId, newInterval, newEaseFactor]);

      return updated;
    } else {
      // 오답 - 간격 초기화
      const newEaseFactor = Math.max(1.3, current.ease_factor - 0.2);

      const updated = await t.one(`
        UPDATE review_queue SET
          interval_days = 1,
          scheduled_for = CURRENT_TIMESTAMP + INTERVAL '1 day',
          ease_factor = $3,
          wrong_count = wrong_count + 1,
          priority = wrong_count + 1
        WHERE user_id = $1 AND question_id = $2
        RETURNING *
      `, [userId, questionId, newEaseFactor]);

      return updated;
    }
  });
}

// 다음 복습 간격 계산 (SuperMemo 알고리즘 기반)
function calculateNextInterval(currentInterval, easeFactor, isCorrect) {
  if (!isCorrect) return 1;

  if (currentInterval === 1) return 3;
  if (currentInterval === 3) return 7;

  return Math.ceil(currentInterval * easeFactor);
}

// 복습 대기열 통계
async function getReviewQueueStats(userId, categoryId = null) {
  let query = `
    SELECT
      COUNT(*) as total_review_questions,
      COUNT(CASE WHEN scheduled_for <= CURRENT_TIMESTAMP THEN 1 END) as due_now,
      COUNT(CASE WHEN scheduled_for <= CURRENT_TIMESTAMP + INTERVAL '1 day' THEN 1 END) as due_tomorrow,
      COUNT(CASE WHEN wrong_count >= 5 THEN 1 END) as difficult_questions,
      AVG(interval_days)::INTEGER as avg_interval,
      MAX(wrong_count) as max_wrong_count
    FROM review_queue rq
    WHERE rq.user_id = $1
  `;

  const params = [userId];
  let paramIndex = 2;

  if (categoryId) {
    query += ` AND rq.category = $${paramIndex}`;
    params.push(categoryId);
    paramIndex++;
  }

  return safeQueryOneOrNone(query, params);
}

// 카테고리별 복습 현황
async function getReviewStatsByCategory(userId) {
  const query = `
    SELECT
      rq.category,
      COUNT(*) as review_count,
      COUNT(CASE WHEN rq.scheduled_for <= CURRENT_TIMESTAMP THEN 1 END) as due_now,
      AVG(rq.wrong_count)::INTEGER as avg_wrong_count,
      AVG(rq.interval_days)::INTEGER as avg_interval
    FROM review_queue rq
    WHERE rq.user_id = $1
    GROUP BY rq.category
    ORDER BY review_count DESC
  `;

  return safeQuery(query, [userId]);
}

// 어려운 문제 식별 (자주 틀리는 문제)
async function getDifficultQuestions(userId, minWrongCount = 3, limit = 10) {
  const query = `
    SELECT
      rq.*,
      q.korean_content,
      q.english_content,
      q.keywords,
      q.category
    FROM review_queue rq
    JOIN questions q ON rq.question_id = q.question_id
    WHERE rq.user_id = $1
      AND rq.wrong_count >= $2
    ORDER BY rq.wrong_count DESC, rq.priority ASC
    LIMIT $3
  `;

  return safeQuery(query, [userId, minWrongCount, limit]);
}

// 복습 세션용 문제 선택 (우선순위 기반)
async function getReviewSessionQuestions(userId, sessionSize = 10, categoryId = null) {
  let query = `
    SELECT
      rq.*,
      q.korean_content,
      q.english_content,
      q.person_a_korean,
      q.person_a_english,
      q.person_b_korean,
      q.person_b_english,
      q.question_type,
      q.keywords,
      q.audio_male_full,
      q.audio_female_full,
      q.audio_male_person_a,
      q.audio_female_person_a,
      q.audio_male_person_b,
      q.audio_female_person_b
    FROM review_queue rq
    JOIN questions q ON rq.question_id = q.question_id
    WHERE rq.user_id = $1
      AND rq.scheduled_for <= CURRENT_TIMESTAMP
  `;

  const params = [userId];
  let paramIndex = 2;

  if (categoryId) {
    query += ` AND rq.category = $${paramIndex}`;
    params.push(categoryId);
    paramIndex++;
  }

  query += `
    ORDER BY
      CASE WHEN rq.scheduled_for < CURRENT_TIMESTAMP - INTERVAL '1 day' THEN 1 ELSE 2 END,
      rq.priority ASC,
      rq.wrong_count DESC,
      rq.scheduled_for ASC
    LIMIT $${paramIndex}
  `;
  params.push(sessionSize);

  return safeQuery(query, params);
}

// 복습 완료 처리
async function completeReview(userId, questionId, isCorrect, responseTime = null) {
  return withTransaction(async (t) => {
    // 복습 스케줄 업데이트
    const updated = await updateReviewSchedule(userId, questionId, isCorrect);

    // user_progress도 업데이트
    if (updated) {
      await t.any(`
        UPDATE user_progress SET
          total_attempts = total_attempts + 1,
          correct_attempts = correct_attempts + CASE WHEN $3 THEN 1 ELSE 0 END,
          wrong_attempts = wrong_attempts + CASE WHEN $3 THEN 0 ELSE 1 END,
          last_attempt_timestamp = CURRENT_TIMESTAMP,
          last_is_correct = $3,
          last_time_taken = $4
        WHERE user_id = $1 AND question_id = $2
      `, [userId, questionId, isCorrect, responseTime]);
    }

    return updated;
  });
}

// 복습 이력 조회
async function getReviewHistory(userId, days = 7, limit = 50) {
  const query = `
    SELECT
      rq.question_id,
      rq.category,
      q.korean_content,
      q.english_content,
      rq.wrong_count,
      rq.interval_days,
      rq.scheduled_for,
      up.last_attempt_timestamp,
      up.last_is_correct
    FROM review_queue rq
    JOIN questions q ON rq.question_id = q.question_id
    LEFT JOIN user_progress up ON rq.user_id = up.user_id AND rq.question_id = up.question_id
    WHERE rq.user_id = $1
      AND up.last_attempt_timestamp >= CURRENT_TIMESTAMP - INTERVAL '${days} days'
    ORDER BY up.last_attempt_timestamp DESC
    LIMIT $2
  `;

  return safeQuery(query, [userId, limit]);
}

// 복습 큐 초기화 (전체 또는 카테고리별)
async function clearReviewQueue(userId, categoryId = null) {
  let query = `DELETE FROM review_queue WHERE user_id = $1`;
  const params = [userId];

  if (categoryId) {
    query += ` AND category = $2`;
    params.push(categoryId);
  }

  const result = await db.result(query, params);
  return { success: true, deletedCount: result.rowCount };
}

module.exports = {
  addToReviewQueue,
  getReviewQuestions,
  removeFromReviewQueue,
  updateReviewSchedule,
  getReviewQueueStats,
  getReviewStatsByCategory,
  getDifficultQuestions,
  getReviewSessionQuestions,
  completeReview,
  getReviewHistory,
  clearReviewQueue
};