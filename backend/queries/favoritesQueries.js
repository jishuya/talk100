const { db, safeQuery, safeQueryOneOrNone, withTransaction } = require('../config/database');

/**
 * 즐겨찾기 관련 쿼리 함수들
 * favorites 테이블 관리 및 ❤️ 토글 기능
 */

// 사용자의 즐겨찾기 문제들 조회
async function getUserFavorites(userId) {
  const query = `
    SELECT
      f.user_id,
      f.question_id,
      f.added_at,
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
      q.audio_male_full,
      q.audio_female_full,
      q.audio_male_person_a,
      q.audio_female_person_a,
      q.audio_male_person_b,
      q.audio_female_person_b,
      q.keywords
    FROM favorites f
    JOIN questions q ON f.question_id = q.question_id
    WHERE f.user_id = $1
    ORDER BY f.added_at DESC, q.category, q.day, q.question_number
  `;

  return safeQuery(query, [userId]);
}

// 카테고리별 즐겨찾기 조회
async function getFavoritesByCategory(userId, category) {
  const query = `
    SELECT
      f.user_id,
      f.question_id,
      f.added_at,
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
    FROM favorites f
    JOIN questions q ON f.question_id = q.question_id
    WHERE f.user_id = $1 AND q.category = $2
    ORDER BY f.added_at DESC, q.day, q.question_number
  `;

  return safeQuery(query, [userId, category]);
}

// 특정 문제가 즐겨찾기인지 확인
async function isFavorite(userId, questionId) {
  const query = `
    SELECT 1 FROM favorites
    WHERE user_id = $1 AND question_id = $2
  `;

  const result = await safeQueryOneOrNone(query, [userId, questionId]);
  return !!result;
}

// 즐겨찾기 추가
async function addToFavorites(userId, questionId) {
  const query = `
    INSERT INTO favorites (user_id, question_id, added_at)
    VALUES ($1, $2, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, question_id) DO NOTHING
    RETURNING *
  `;

  return safeQueryOneOrNone(query, [userId, questionId]);
}

// 즐겨찾기 제거
async function removeFromFavorites(userId, questionId) {
  const query = `
    DELETE FROM favorites
    WHERE user_id = $1 AND question_id = $2
    RETURNING *
  `;

  return safeQueryOneOrNone(query, [userId, questionId]);
}

// 즐겨찾기 토글 (❤️ 버튼 기능)
async function toggleFavorite(userId, questionId) {
  return withTransaction(async (t) => {
    // 현재 즐겨찾기 상태 확인
    const existing = await t.oneOrNone(
      'SELECT * FROM favorites WHERE user_id = $1 AND question_id = $2',
      [userId, questionId]
    );

    if (existing) {
      // 즐겨찾기 제거
      await t.none(
        'DELETE FROM favorites WHERE user_id = $1 AND question_id = $2',
        [userId, questionId]
      );
      return { action: 'removed', isFavorited: false };
    } else {
      // 즐겨찾기 추가
      const result = await t.one(
        `INSERT INTO favorites (user_id, question_id, added_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         RETURNING *`,
        [userId, questionId]
      );
      return { action: 'added', isFavorited: true, result };
    }
  });
}

// 즐겨찾기 개수 조회
async function getFavoritesCount(userId) {
  const query = `
    SELECT COUNT(*) as count
    FROM favorites
    WHERE user_id = $1
  `;

  const result = await safeQueryOneOrNone(query, [userId]);
  return parseInt(result.count) || 0;
}

// 카테고리별 즐겨찾기 개수 조회
async function getFavoritesCountByCategory(userId) {
  const query = `
    SELECT
      q.category,
      COUNT(*) as count
    FROM favorites f
    JOIN questions q ON f.question_id = q.question_id
    WHERE f.user_id = $1
    GROUP BY q.category
    ORDER BY q.category
  `;

  return safeQuery(query, [userId]);
}

// 최근 즐겨찾기 추가된 문제들 조회
async function getRecentFavorites(userId, limit = 10) {
  const query = `
    SELECT
      f.user_id,
      f.question_id,
      f.added_at,
      q.category,
      q.day,
      q.question_number,
      q.question_type,
      q.korean_content AS korean,
      q.english_content AS english,
      q.person_a_korean,
      q.person_a_english,
      q.person_b_korean,
      q.person_b_english
    FROM favorites f
    JOIN questions q ON f.question_id = q.question_id
    WHERE f.user_id = $1
    ORDER BY f.added_at DESC
    LIMIT $2
  `;

  return safeQuery(query, [userId, limit]);
}

// 즐겨찾기 문제들을 랜덤으로 조회 (퀴즈용)
async function getRandomFavorites(userId, limit = 5) {
  const query = `
    SELECT
      f.user_id,
      f.question_id,
      f.added_at,
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
    FROM favorites f
    JOIN questions q ON f.question_id = q.question_id
    WHERE f.user_id = $1
    ORDER BY RANDOM()
    LIMIT $2
  `;

  return safeQuery(query, [userId, limit]);
}

// 즐겨찾기 통계 조회
async function getFavoritesStats(userId) {
  const query = `
    SELECT
      COUNT(*) as total_favorites,
      COUNT(CASE WHEN q.question_type = 'single' THEN 1 END) as single_questions,
      COUNT(CASE WHEN q.question_type = 'dialogue' THEN 1 END) as dialogue_questions,
      COUNT(CASE WHEN q.category = 1 THEN 1 END) as model_example_count,
      COUNT(CASE WHEN q.category = 2 THEN 1 END) as small_talk_count,
      COUNT(CASE WHEN q.category = 3 THEN 1 END) as cases_in_point_count,
      MIN(f.added_at) as first_favorite_date,
      MAX(f.added_at) as latest_favorite_date
    FROM favorites f
    JOIN questions q ON f.question_id = q.question_id
    WHERE f.user_id = $1
  `;

  const result = await safeQueryOneOrNone(query, [userId]);
  return result || {
    total_favorites: 0,
    single_questions: 0,
    dialogue_questions: 0,
    model_example_count: 0,
    small_talk_count: 0,
    cases_in_point_count: 0,
    first_favorite_date: null,
    latest_favorite_date: null
  };
}

// 특정 Day의 즐겨찾기 문제들 조회
async function getFavoritesByDay(userId, category, day) {
  const query = `
    SELECT
      f.user_id,
      f.question_id,
      f.added_at,
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
    FROM favorites f
    JOIN questions q ON f.question_id = q.question_id
    WHERE f.user_id = $1 AND q.category = $2 AND q.day = $3
    ORDER BY q.question_number
  `;

  return safeQuery(query, [userId, category, day]);
}

// 즐겨찾기 일괄 삭제 (카테고리별)
async function removeFavoritesByCategory(userId, category) {
  const query = `
    DELETE FROM favorites
    WHERE user_id = $1 AND question_id IN (
      SELECT question_id FROM questions WHERE category = $2
    )
    RETURNING COUNT(*) as deleted_count
  `;

  const result = await safeQueryOneOrNone(query, [userId, category]);
  return parseInt(result.deleted_count) || 0;
}

// 즐겨찾기 일괄 삭제 (모든 즐겨찾기)
async function removeAllFavorites(userId) {
  const query = `
    DELETE FROM favorites
    WHERE user_id = $1
    RETURNING COUNT(*) as deleted_count
  `;

  const result = await safeQueryOneOrNone(query, [userId]);
  return parseInt(result.deleted_count) || 0;
}

module.exports = {
  getUserFavorites,
  getFavoritesByCategory,
  isFavorite,
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  getFavoritesCount,
  getFavoritesCountByCategory,
  getRecentFavorites,
  getRandomFavorites,
  getFavoritesStats,
  getFavoritesByDay,
  removeFavoritesByCategory,
  removeAllFavorites
};