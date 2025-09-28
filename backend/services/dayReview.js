const { safeQuery, withTransaction } = require('../config/database');

/**
 * Day 완료 복습 생성 서비스 (Day 번호만 저장)
 * 복습 원칙: Day 번호만 저장하여 복습 시점에 문제 동적 선택
 */

/**
 * Day 완료시 복습 큐에 Day 번호만 추가
 * @param {string} userId - 사용자 ID
 * @param {number} dayNumber - 완료한 Day 번호
 */
async function createDayReview(userId, dayNumber) {
  try {
    const result = await safeQuery(`
      INSERT INTO review_queue
      (user_id, day, scheduled_for, interval_days)
      VALUES ($1, $2, NOW() + INTERVAL '1 day', 1)
      ON CONFLICT (user_id, day) DO NOTHING
      RETURNING queue_id
    `, [userId, dayNumber]);

    console.log(`Day ${dayNumber} scheduled for review for user ${userId}`);

    return {
      success: true,
      dayNumber,
      message: result.length > 0 ? 'Review scheduled' : 'Review already exists'
    };

  } catch (error) {
    console.error('Error creating day review:', error.message);
    throw error;
  }
}

/**
 * 다음 복습할 Day 번호 조회
 * @param {string} userId - 사용자 ID
 */
async function getNextReviewDay(userId) {
  const result = await safeQuery(`
    SELECT day, queue_id, interval_days, scheduled_for
    FROM review_queue
    WHERE user_id = $1
      AND scheduled_for <= CURRENT_TIMESTAMP
    ORDER BY scheduled_for
    LIMIT 1
  `, [userId]);

  return result[0] || null;
}

/**
 * Day 번호로 복습 문제 동적 선택
 * @param {number} dayNumber - Day 번호
 */
async function getReviewQuestions(dayNumber) {
  try {
    const questions = [];

    // Model Example 3문제 랜덤
    const modelQuestions = await safeQuery(`
      SELECT * FROM questions
      WHERE day = $1 AND category = 'model_example'
      ORDER BY RANDOM()
      LIMIT 3
    `, [dayNumber]);
    questions.push(...modelQuestions);

    // Small Talk 2세트 랜덤
    const talkQuestions = await safeQuery(`
      SELECT * FROM questions
      WHERE day = $1 AND category = 'small_talk'
      ORDER BY RANDOM()
      LIMIT 2
    `, [dayNumber]);
    questions.push(...talkQuestions);

    // Cases in Point 1문제 랜덤
    const caseQuestions = await safeQuery(`
      SELECT * FROM questions
      WHERE day = $1 AND category = 'cases_in_point'
      ORDER BY RANDOM()
      LIMIT 1
    `, [dayNumber]);
    questions.push(...caseQuestions);

    return questions;

  } catch (error) {
    console.error(`Error selecting review questions for Day ${dayNumber}:`, error.message);
    throw error;
  }
}

/**
 * 복습 완료 후 다음 주기 설정
 * @param {number} queueId - 큐 ID
 * @param {boolean} isCorrect - 정답 여부
 */
async function updateReviewSchedule(queueId, isCorrect) {
  return withTransaction(async (t) => {
    // 현재 복습 정보 가져오기
    const current = await t.oneOrNone(`
      SELECT interval_days FROM review_queue
      WHERE queue_id = $1
    `, [queueId]);

    if (!current) {
      throw new Error('Review queue item not found');
    }

    const INTERVALS = [1, 3, 7, 14, 30, 60, 90, 120];
    const currentInterval = current.interval_days;
    const currentIndex = INTERVALS.indexOf(currentInterval);

    if (isCorrect && currentIndex < INTERVALS.length - 1) {
      // 다음 복습 주기로
      const nextInterval = INTERVALS[currentIndex + 1];
      await t.none(`
        UPDATE review_queue
        SET interval_days = $1,
            scheduled_for = NOW() + INTERVAL '${nextInterval} days',
            last_reviewed = NOW(),
            review_count = review_count + 1
        WHERE queue_id = $2
      `, [nextInterval, queueId]);

      return { action: 'advanced', nextInterval };

    } else if (isCorrect && currentIndex === INTERVALS.length - 1) {
      // 120일 완료 - 삭제
      await t.none(`
        DELETE FROM review_queue WHERE queue_id = $1
      `, [queueId]);

      return { action: 'completed' };

    } else {
      // 오답 - 1일로 리셋
      await t.none(`
        UPDATE review_queue
        SET interval_days = 1,
            scheduled_for = NOW() + INTERVAL '1 day',
            last_reviewed = NOW()
        WHERE queue_id = $1
      `, [queueId]);

      return { action: 'reset', nextInterval: 1 };
    }
  });
}

/**
 * 복습 스케줄 조회 (Day 번호 기반)
 * @param {string} userId - 사용자 ID
 */
async function getReviewSchedule(userId) {
  const query = `
    SELECT
      day,
      interval_days,
      scheduled_for,
      review_count,
      added_at
    FROM review_queue
    WHERE user_id = $1
    ORDER BY scheduled_for ASC
  `;

  return safeQuery(query, [userId]);
}

/**
 * 복습 통계 조회
 * @param {string} userId - 사용자 ID
 */
async function getReviewStats(userId) {
  const query = `
    SELECT
      COUNT(*) as total_reviews,
      COUNT(CASE WHEN scheduled_for <= NOW() THEN 1 END) as due_today,
      AVG(interval_days) as avg_interval_days,
      COUNT(CASE WHEN interval_days >= 120 THEN 1 END) as near_completion
    FROM review_queue
    WHERE user_id = $1
  `;

  const result = await safeQuery(query, [userId]);
  return result[0] || {
    total_reviews: 0,
    due_today: 0,
    avg_interval_days: 0,
    near_completion: 0
  };
}

module.exports = {
  createDayReview,
  getNextReviewDay,
  getReviewQuestions,
  updateReviewSchedule,
  getReviewSchedule,
  getReviewStats
};