const { db, safeQuery, safeQueryOneOrNone, withTransaction } = require('../config/database');

/**
 * 틀린 문제 관리 관련 쿼리 함수들
 * wrong_answers 테이블 관리 및 ⭐ 토글 기능
 */

// 사용자의 틀린 문제들 조회 (⭐ 표시된 것만)
async function getUserWrongAnswers(userId, starredOnly = true) {
  const query = `
    SELECT
      wa.user_id,
      wa.question_id,
      wa.added_at,
      wa.wrong_count,
      wa.is_starred,
      q.category,
      q.day,
      q.question_number,
      q.question_type,
      q.korean_content,
      q.english_content,
      q.person_a_korean,
      q.person_a_english,
      q.person_b_korean,
      q.person_b_english,
      q.audio_male_full,
      q.audio_female_full,
      q.audio_male_person_a,
      q.audio_female_person_a,
      q.audio_male_person_b,
      q.audio_female_person_b,
      q.keywords
    FROM wrong_answers wa
    JOIN questions q ON wa.question_id = q.question_id
    WHERE wa.user_id = $1
      ${starredOnly ? 'AND wa.is_starred = true' : ''}
    ORDER BY wa.added_at DESC, q.category, q.day, q.question_number
  `;

  return safeQuery(query, [userId]);
}

// 카테고리별 틀린 문제 조회
async function getWrongAnswersByCategory(userId, category, starredOnly = true) {
  const query = `
    SELECT
      wa.user_id,
      wa.question_id,
      wa.added_at,
      wa.wrong_count,
      wa.is_starred,
      q.category,
      q.day,
      q.question_number,
      q.question_type,
      q.korean_content,
      q.english_content,
      q.person_a_korean,
      q.person_a_english,
      q.person_b_korean,
      q.person_b_english,
      q.keywords
    FROM wrong_answers wa
    JOIN questions q ON wa.question_id = q.question_id
    WHERE wa.user_id = $1 AND q.category = $2
      ${starredOnly ? 'AND wa.is_starred = true' : ''}
    ORDER BY wa.added_at DESC, q.day, q.question_number
  `;

  return safeQuery(query, [userId, category]);
}

// 특정 문제가 틀린 문제로 등록되어 있는지 확인
async function isWrongAnswer(userId, questionId) {
  const query = `
    SELECT wrong_count, is_starred FROM wrong_answers
    WHERE user_id = $1 AND question_id = $2
  `;

  return safeQueryOneOrNone(query, [userId, questionId]);
}

// 틀린 문제 추가 또는 카운트 증가
async function addOrUpdateWrongAnswer(userId, questionId) {
  const query = `
    INSERT INTO wrong_answers (user_id, question_id, added_at, wrong_count, is_starred)
    VALUES ($1, $2, CURRENT_TIMESTAMP, 1, true)
    ON CONFLICT (user_id, question_id)
    DO UPDATE SET
      wrong_count = wrong_answers.wrong_count + 1,
      is_starred = true,
      added_at = CURRENT_TIMESTAMP
    RETURNING *
  `;

  return safeQueryOneOrNone(query, [userId, questionId]);
}

// ⭐ 토글 (틀린 문제 리스트에서 보이기/숨기기)
async function toggleStar(userId, questionId) {
  return withTransaction(async (t) => {
    // 현재 상태 확인
    const existing = await t.oneOrNone(
      'SELECT * FROM wrong_answers WHERE user_id = $1 AND question_id = $2',
      [userId, questionId]
    );

    if (!existing) {
      // 틀린 문제가 아직 등록되지 않은 경우, 새로 추가
      const result = await t.one(
        `INSERT INTO wrong_answers (user_id, question_id, added_at, wrong_count, is_starred)
         VALUES ($1, $2, CURRENT_TIMESTAMP, 1, true)
         RETURNING *`,
        [userId, questionId]
      );
      return { action: 'added', isStarred: true, result };
    } else {
      // 기존 기록의 starred 상태 토글
      const newStarred = !existing.is_starred;
      const result = await t.one(
        `UPDATE wrong_answers SET is_starred = $3
         WHERE user_id = $1 AND question_id = $2
         RETURNING *`,
        [userId, questionId, newStarred]
      );
      return { action: 'toggled', isStarred: newStarred, result };
    }
  });
}

// 틀린 문제 완전 삭제
async function removeWrongAnswer(userId, questionId) {
  const query = `
    DELETE FROM wrong_answers
    WHERE user_id = $1 AND question_id = $2
    RETURNING *
  `;

  return safeQueryOneOrNone(query, [userId, questionId]);
}

// 틀린 문제 개수 조회 (⭐ 표시된 것만)
async function getWrongAnswersCount(userId, starredOnly = true) {
  const query = `
    SELECT COUNT(*) as count
    FROM wrong_answers
    WHERE user_id = $1
      ${starredOnly ? 'AND is_starred = true' : ''}
  `;

  const result = await safeQueryOneOrNone(query, [userId]);
  return parseInt(result.count) || 0;
}

// 카테고리별 틀린 문제 개수 조회
async function getWrongAnswersCountByCategory(userId, starredOnly = true) {
  const query = `
    SELECT
      q.category,
      COUNT(*) as count
    FROM wrong_answers wa
    JOIN questions q ON wa.question_id = q.question_id
    WHERE wa.user_id = $1
      ${starredOnly ? 'AND wa.is_starred = true' : ''}
    GROUP BY q.category
    ORDER BY q.category
  `;

  return safeQuery(query, [userId]);
}

// 최근 틀린 문제들 조회
async function getRecentWrongAnswers(userId, limit = 10, starredOnly = true) {
  const query = `
    SELECT
      wa.user_id,
      wa.question_id,
      wa.added_at,
      wa.wrong_count,
      wa.is_starred,
      q.category,
      q.day,
      q.question_number,
      q.question_type,
      q.korean_content,
      q.english_content,
      q.person_a_korean,
      q.person_a_english,
      q.person_b_korean,
      q.person_b_english
    FROM wrong_answers wa
    JOIN questions q ON wa.question_id = q.question_id
    WHERE wa.user_id = $1
      ${starredOnly ? 'AND wa.is_starred = true' : ''}
    ORDER BY wa.added_at DESC
    LIMIT $2
  `;

  return safeQuery(query, [userId, limit]);
}

// 틀린 문제들을 랜덤으로 조회 (퀴즈용)
async function getRandomWrongAnswers(userId, limit = 5, starredOnly = true) {
  const query = `
    SELECT
      wa.user_id,
      wa.question_id,
      wa.added_at,
      wa.wrong_count,
      wa.is_starred,
      q.category,
      q.day,
      q.question_number,
      q.question_type,
      q.korean_content,
      q.english_content,
      q.person_a_korean,
      q.person_a_english,
      q.person_b_korean,
      q.person_b_english,
      q.keywords
    FROM wrong_answers wa
    JOIN questions q ON wa.question_id = q.question_id
    WHERE wa.user_id = $1
      ${starredOnly ? 'AND wa.is_starred = true' : ''}
    ORDER BY RANDOM()
    LIMIT $2
  `;

  return safeQuery(query, [userId, limit]);
}

// 틀린 문제 통계 조회
async function getWrongAnswersStats(userId) {
  const query = `
    SELECT
      COUNT(*) as total_wrong_answers,
      COUNT(CASE WHEN is_starred = true THEN 1 END) as starred_count,
      COUNT(CASE WHEN is_starred = false THEN 1 END) as unstarred_count,
      COUNT(CASE WHEN q.question_type = 'single' THEN 1 END) as single_questions,
      COUNT(CASE WHEN q.question_type = 'dialogue' THEN 1 END) as dialogue_questions,
      COUNT(CASE WHEN q.category = 'model_example' THEN 1 END) as model_example_count,
      COUNT(CASE WHEN q.category = 'small_talk' THEN 1 END) as small_talk_count,
      COUNT(CASE WHEN q.category = 'cases_in_point' THEN 1 END) as cases_in_point_count,
      AVG(wrong_count) as avg_wrong_count,
      MAX(wrong_count) as max_wrong_count,
      MIN(added_at) as first_wrong_date,
      MAX(added_at) as latest_wrong_date
    FROM wrong_answers wa
    JOIN questions q ON wa.question_id = q.question_id
    WHERE wa.user_id = $1
  `;

  const result = await safeQueryOneOrNone(query, [userId]);
  return result || {
    total_wrong_answers: 0,
    starred_count: 0,
    unstarred_count: 0,
    single_questions: 0,
    dialogue_questions: 0,
    model_example_count: 0,
    small_talk_count: 0,
    cases_in_point_count: 0,
    avg_wrong_count: 0,
    max_wrong_count: 0,
    first_wrong_date: null,
    latest_wrong_date: null
  };
}

// 특정 Day의 틀린 문제들 조회
async function getWrongAnswersByDay(userId, category, day, starredOnly = true) {
  const query = `
    SELECT
      wa.user_id,
      wa.question_id,
      wa.added_at,
      wa.wrong_count,
      wa.is_starred,
      q.category,
      q.day,
      q.question_number,
      q.question_type,
      q.korean_content,
      q.english_content,
      q.person_a_korean,
      q.person_a_english,
      q.person_b_korean,
      q.person_b_english,
      q.keywords
    FROM wrong_answers wa
    JOIN questions q ON wa.question_id = q.question_id
    WHERE wa.user_id = $1 AND q.category = $2 AND q.day = $3
      ${starredOnly ? 'AND wa.is_starred = true' : ''}
    ORDER BY q.question_number
  `;

  return safeQuery(query, [userId, category, day]);
}

// 틀린 횟수가 많은 문제들 조회 (취약 문제 분석용)
async function getMostWrongAnswers(userId, limit = 10, starredOnly = true) {
  const query = `
    SELECT
      wa.user_id,
      wa.question_id,
      wa.added_at,
      wa.wrong_count,
      wa.is_starred,
      q.category,
      q.day,
      q.question_number,
      q.korean_content,
      q.english_content
    FROM wrong_answers wa
    JOIN questions q ON wa.question_id = q.question_id
    WHERE wa.user_id = $1
      ${starredOnly ? 'AND wa.is_starred = true' : ''}
    ORDER BY wa.wrong_count DESC, wa.added_at DESC
    LIMIT $2
  `;

  return safeQuery(query, [userId, limit]);
}

// 틀린 문제 일괄 삭제 (카테고리별)
async function removeWrongAnswersByCategory(userId, category) {
  const query = `
    DELETE FROM wrong_answers
    WHERE user_id = $1 AND question_id IN (
      SELECT question_id FROM questions WHERE category = $2
    )
    RETURNING COUNT(*) as deleted_count
  `;

  const result = await safeQueryOneOrNone(query, [userId, category]);
  return parseInt(result.deleted_count) || 0;
}

// 모든 틀린 문제 일괄 삭제
async function removeAllWrongAnswers(userId) {
  const query = `
    DELETE FROM wrong_answers
    WHERE user_id = $1
    RETURNING COUNT(*) as deleted_count
  `;

  const result = await safeQueryOneOrNone(query, [userId]);
  return parseInt(result.deleted_count) || 0;
}

// ⭐ 모두 해제 (모든 틀린 문제의 starred를 false로)
async function unstarAllWrongAnswers(userId) {
  const query = `
    UPDATE wrong_answers
    SET is_starred = false
    WHERE user_id = $1 AND is_starred = true
    RETURNING COUNT(*) as updated_count
  `;

  const result = await safeQueryOneOrNone(query, [userId]);
  return parseInt(result.updated_count) || 0;
}

module.exports = {
  getUserWrongAnswers,
  getWrongAnswersByCategory,
  isWrongAnswer,
  addOrUpdateWrongAnswer,
  toggleStar,
  removeWrongAnswer,
  getWrongAnswersCount,
  getWrongAnswersCountByCategory,
  getRecentWrongAnswers,
  getRandomWrongAnswers,
  getWrongAnswersStats,
  getWrongAnswersByDay,
  getMostWrongAnswers,
  removeWrongAnswersByCategory,
  removeAllWrongAnswers,
  unstarAllWrongAnswers
};