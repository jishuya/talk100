const { db, safeQuery, safeQueryOneOrNone, withTransaction } = require('../config/database');

/**
 * 복습 관련 쿼리 함수들
 * review_queue 테이블 관리 및 8단계 복습 주기 구현
 */

// 복습 간격 상수 (1→3→7→14→30→60→90→120일)
const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60, 90, 120];

// 사용자의 복습 대기 문제들 조회 (오늘 복습할 것들)
async function getTodayReviewQuestions(userId) {
  const query = `
    SELECT
      rq.queue_id,
      rq.user_id,
      rq.question_id,
      rq.interval_days,
      rq.scheduled_for,
      rq.wrong_count,
      rq.added_at,
      rq.review_type,
      rq.source_day,
      q.category,
      q.day,
      q.question_number,
      q.question_type,
      q.korean_content AS korean,
      q.english_content AS english,
      q.person_a_korean,
      q.person_a_english,
      q.person_b_korean,
      q.person_b_english,
      q.keywords
    FROM review_queue rq
    JOIN questions q ON rq.question_id = q.question_id
    WHERE rq.user_id = $1
      AND rq.scheduled_for <= CURRENT_TIMESTAMP
    ORDER BY rq.scheduled_for, rq.review_type, q.category, q.day, q.question_number
  `;

  return safeQuery(query, [userId]);
}

// 사용자의 모든 복습 스케줄 조회
async function getAllReviewSchedule(userId) {
  const query = `
    SELECT
      rq.queue_id,
      rq.user_id,
      rq.question_id,
      rq.interval_days,
      rq.scheduled_for,
      rq.wrong_count,
      rq.added_at,
      rq.review_type,
      rq.source_day,
      q.category,
      q.day,
      q.question_number,
      q.korean_content,
      q.english_content
    FROM review_queue rq
    JOIN questions q ON rq.question_id = q.question_id
    WHERE rq.user_id = $1
    ORDER BY rq.scheduled_for, q.category, q.day, q.question_number
  `;

  return safeQuery(query, [userId]);
}

// 복습 타입별 조회
async function getReviewsByType(userId, reviewType) {
  const query = `
    SELECT
      rq.queue_id,
      rq.user_id,
      rq.question_id,
      rq.interval_days,
      rq.scheduled_for,
      rq.wrong_count,
      rq.added_at,
      rq.review_type,
      rq.source_day,
      q.category,
      q.day,
      q.question_number,
      q.korean_content,
      q.english_content
    FROM review_queue rq
    JOIN questions q ON rq.question_id = q.question_id
    WHERE rq.user_id = $1 AND rq.review_type = $2
    ORDER BY rq.scheduled_for, q.category, q.day, q.question_number
  `;

  return safeQuery(query, [userId, reviewType]);
}

// 틀린 문제를 복습 큐에 추가
async function addWrongAnswerToReview(userId, questionId) {
  const query = `
    INSERT INTO review_queue (
      user_id, question_id, interval_days, scheduled_for,
      wrong_count, review_type, added_at
    ) VALUES (
      $1, $2, 1, NOW() + INTERVAL '1 day',
      1, 'wrong', CURRENT_TIMESTAMP
    )
    ON CONFLICT (user_id, question_id)
    DO UPDATE SET
      interval_days = 1,
      scheduled_for = NOW() + INTERVAL '1 day',
      wrong_count = review_queue.wrong_count + 1,
      added_at = CURRENT_TIMESTAMP
    RETURNING *
  `;

  return safeQueryOneOrNone(query, [userId, questionId]);
}

// Day 완료 복습 생성
async function createDayCompleteReview(userId, dayNumber, category, questionIds) {
  return withTransaction(async (t) => {
    const results = [];

    for (const questionId of questionIds) {
      const result = await t.one(`
        INSERT INTO review_queue (
          user_id, question_id, interval_days, scheduled_for,
          wrong_count, review_type, source_day, added_at
        ) VALUES (
          $1, $2, 1, NOW() + INTERVAL '1 day',
          0, 'day_complete', $3, CURRENT_TIMESTAMP
        )
        ON CONFLICT (user_id, question_id)
        DO UPDATE SET
          interval_days = 1,
          scheduled_for = NOW() + INTERVAL '1 day',
          review_type = 'day_complete',
          source_day = $3,
          added_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [userId, questionId, dayNumber]);

      results.push(result);
    }

    return results;
  });
}

// 복습 결과 업데이트 (8단계 간격 시스템)
async function updateReviewResult(userId, questionId, isCorrect) {
  return withTransaction(async (t) => {
    // 현재 복습 정보 조회
    const currentReview = await t.oneOrNone(
      'SELECT * FROM review_queue WHERE user_id = $1 AND question_id = $2',
      [userId, questionId]
    );

    if (!currentReview) {
      throw new Error('Review item not found');
    }

    const currentInterval = currentReview.interval_days || 1;
    const currentIndex = REVIEW_INTERVALS.indexOf(currentInterval);

    if (isCorrect) {
      if (currentIndex < REVIEW_INTERVALS.length - 1) {
        // 다음 단계로 이동
        const nextInterval = REVIEW_INTERVALS[currentIndex + 1];
        const nextScheduledFor = new Date();
        nextScheduledFor.setDate(nextScheduledFor.getDate() + nextInterval);

        const result = await t.one(`
          UPDATE review_queue SET
            interval_days = $3,
            scheduled_for = $4,
            wrong_count = CASE WHEN $5 = false THEN wrong_count ELSE wrong_count END
          WHERE user_id = $1 AND question_id = $2
          RETURNING *
        `, [userId, questionId, nextInterval, nextScheduledFor, isCorrect]);

        return { action: 'updated', result };
      } else {
        // 120일 완료 - 복습 완료로 삭제
        await t.none(
          'DELETE FROM review_queue WHERE user_id = $1 AND question_id = $2',
          [userId, questionId]
        );

        return { action: 'completed', result: null };
      }
    } else {
      // 오답 - 처음으로 되돌리기
      const nextScheduledFor = new Date();
      nextScheduledFor.setDate(nextScheduledFor.getDate() + 1);

      const result = await t.one(`
        UPDATE review_queue SET
          interval_days = 1,
          scheduled_for = $3,
          wrong_count = wrong_count + 1
        WHERE user_id = $1 AND question_id = $2
        RETURNING *
      `, [userId, questionId, nextScheduledFor]);

      return { action: 'reset', result };
    }
  });
}

// 복습 문제 삭제
async function removeFromReview(userId, questionId) {
  const query = `
    DELETE FROM review_queue
    WHERE user_id = $1 AND question_id = $2
    RETURNING *
  `;

  return safeQueryOneOrNone(query, [userId, questionId]);
}

// 복습 통계 조회
async function getReviewStats(userId) {
  const query = `
    SELECT
      COUNT(*) as total_reviews,
      COUNT(CASE WHEN scheduled_for <= CURRENT_TIMESTAMP THEN 1 END) as due_today,
      COUNT(CASE WHEN review_type = 'wrong' THEN 1 END) as wrong_answer_reviews,
      COUNT(CASE WHEN review_type = 'day_complete' THEN 1 END) as day_complete_reviews,
      COUNT(CASE WHEN interval_days = 1 THEN 1 END) as stage_1,
      COUNT(CASE WHEN interval_days = 3 THEN 1 END) as stage_2,
      COUNT(CASE WHEN interval_days = 7 THEN 1 END) as stage_3,
      COUNT(CASE WHEN interval_days = 14 THEN 1 END) as stage_4,
      COUNT(CASE WHEN interval_days = 30 THEN 1 END) as stage_5,
      COUNT(CASE WHEN interval_days = 60 THEN 1 END) as stage_6,
      COUNT(CASE WHEN interval_days = 90 THEN 1 END) as stage_7,
      COUNT(CASE WHEN interval_days = 120 THEN 1 END) as stage_8,
      AVG(wrong_count) as avg_wrong_count
    FROM review_queue
    WHERE user_id = $1
  `;

  const result = await safeQueryOneOrNone(query, [userId]);
  return result || {
    total_reviews: 0,
    due_today: 0,
    wrong_answer_reviews: 0,
    day_complete_reviews: 0,
    stage_1: 0, stage_2: 0, stage_3: 0, stage_4: 0,
    stage_5: 0, stage_6: 0, stage_7: 0, stage_8: 0,
    avg_wrong_count: 0
  };
}

// 다가오는 복습 일정 조회 (향후 7일)
async function getUpcomingReviews(userId, days = 7) {
  const query = `
    SELECT
      DATE(scheduled_for) as review_date,
      COUNT(*) as question_count,
      COUNT(CASE WHEN review_type = 'wrong' THEN 1 END) as wrong_count,
      COUNT(CASE WHEN review_type = 'day_complete' THEN 1 END) as day_complete_count
    FROM review_queue
    WHERE user_id = $1
      AND scheduled_for >= CURRENT_TIMESTAMP
      AND scheduled_for <= CURRENT_TIMESTAMP + INTERVAL '${days} days'
    GROUP BY DATE(scheduled_for)
    ORDER BY review_date
  `;

  return safeQuery(query, [userId]);
}

// 특정 interval 단계의 복습 문제들 조회
async function getReviewsByInterval(userId, intervalDays) {
  const query = `
    SELECT
      rq.queue_id,
      rq.user_id,
      rq.question_id,
      rq.interval_days,
      rq.scheduled_for,
      rq.wrong_count,
      rq.review_type,
      rq.source_day,
      q.category,
      q.day,
      q.question_number,
      q.korean_content,
      q.english_content
    FROM review_queue rq
    JOIN questions q ON rq.question_id = q.question_id
    WHERE rq.user_id = $1 AND rq.interval_days = $2
    ORDER BY rq.scheduled_for, q.category, q.day, q.question_number
  `;

  return safeQuery(query, [userId, intervalDays]);
}

// 복습 완료율 계산
async function calculateReviewCompletionRate(userId, days = 30) {
  const query = `
    WITH review_activity AS (
      SELECT
        DATE(scheduled_for) as review_date,
        COUNT(*) as scheduled_count
      FROM review_queue
      WHERE user_id = $1
        AND scheduled_for >= CURRENT_DATE - INTERVAL '${days} days'
        AND scheduled_for < CURRENT_DATE
      GROUP BY DATE(scheduled_for)
    ),
    progress_activity AS (
      SELECT
        DATE(last_attempt_timestamp) as attempt_date,
        COUNT(DISTINCT question_id) as attempted_count
      FROM user_progress
      WHERE user_id = $1
        AND last_attempt_timestamp >= CURRENT_DATE - INTERVAL '${days} days'
        AND last_attempt_timestamp < CURRENT_DATE
        AND question_id IN (
          SELECT question_id FROM review_queue
          WHERE user_id = $1
        )
      GROUP BY DATE(last_attempt_timestamp)
    )
    SELECT
      COALESCE(SUM(ra.scheduled_count), 0) as total_scheduled,
      COALESCE(SUM(pa.attempted_count), 0) as total_attempted,
      CASE
        WHEN SUM(ra.scheduled_count) > 0
        THEN ROUND((SUM(pa.attempted_count)::FLOAT / SUM(ra.scheduled_count)) * 100, 2)
        ELSE 0
      END as completion_rate
    FROM review_activity ra
    FULL OUTER JOIN progress_activity pa ON ra.review_date = pa.attempt_date
  `;

  const result = await safeQueryOneOrNone(query, [userId]);
  return result || { total_scheduled: 0, total_attempted: 0, completion_rate: 0 };
}

module.exports = {
  REVIEW_INTERVALS,
  getTodayReviewQuestions,
  getAllReviewSchedule,
  getReviewsByType,
  addWrongAnswerToReview,
  createDayCompleteReview,
  updateReviewResult,
  removeFromReview,
  getReviewStats,
  getUpcomingReviews,
  getReviewsByInterval,
  calculateReviewCompletionRate
};