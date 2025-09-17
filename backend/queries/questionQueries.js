const { db, safeQuery, safeQueryOne, safeQueryOneOrNone } = require('../config/database');

/**
 * 문제 쿼리 함수들
 * categories, questions 테이블 관련 함수들
 */

// 모든 카테고리 조회
async function getAllCategories() {
  const query = `
    SELECT
      category_id,
      name,
      display_name,
      description,
      order_num,
      total_questions,
      is_active
    FROM categories
    WHERE is_active = true
    ORDER BY order_num ASC
  `;

  return safeQuery(query);
}

// 특정 카테고리 조회
async function getCategoryById(categoryId) {
  const query = `
    SELECT * FROM categories
    WHERE category_id = $1 AND is_active = true
  `;

  return safeQueryOneOrNone(query, [categoryId]);
}

// 카테고리별 문제 수 조회
async function getQuestionCountByCategory(categoryId) {
  const query = `
    SELECT COUNT(*) as count
    FROM questions
    WHERE category = $1
  `;

  const result = await safeQueryOne(query, [categoryId]);
  return parseInt(result.count);
}

// 카테고리별 Day 목록 조회
async function getDaysByCategory(categoryId) {
  const query = `
    SELECT DISTINCT day
    FROM questions
    WHERE category = $1
    ORDER BY day ASC
  `;

  return safeQuery(query, [categoryId]);
}

// 특정 카테고리의 특정 Day 문제들 조회
async function getQuestionsByCategoryAndDay(categoryId, day) {
  const query = `
    SELECT
      question_id,
      category,
      day,
      question_number,
      question_type,
      korean_content,
      english_content,
      person_a_korean,
      person_a_english,
      person_b_korean,
      person_b_english,
      audio_male_full,
      audio_female_full,
      audio_male_person_a,
      audio_female_person_a,
      audio_male_person_b,
      audio_female_person_b,
      keywords,
      acceptable_variations,
      is_long_form,
      character_count_korean,
      character_count_english,
      estimated_time,
      tags
    FROM questions
    WHERE category = $1 AND day = $2
    ORDER BY question_number ASC
  `;

  return safeQuery(query, [categoryId, day]);
}

// 특정 문제 조회
async function getQuestionById(questionId) {
  const query = `
    SELECT * FROM questions
    WHERE question_id = $1
  `;

  return safeQueryOneOrNone(query, [questionId]);
}

// 카테고리별 모든 문제 조회 (페이지네이션)
async function getQuestionsByCategory(categoryId, limit = 50, offset = 0) {
  const query = `
    SELECT
      question_id,
      day,
      question_number,
      question_type,
      korean_content,
      english_content,
      person_a_korean,
      person_a_english,
      person_b_korean,
      person_b_english,
      keywords,
      is_long_form,
      estimated_time
    FROM questions
    WHERE category = $1
    ORDER BY day ASC, question_number ASC
    LIMIT $2 OFFSET $3
  `;

  return safeQuery(query, [categoryId, limit, offset]);
}

// 랜덤 문제 조회 (복습용)
async function getRandomQuestions(categoryId = null, limit = 10, excludeIds = []) {
  let query = `
    SELECT
      question_id,
      category,
      day,
      question_number,
      question_type,
      korean_content,
      english_content,
      person_a_korean,
      person_a_english,
      person_b_korean,
      person_b_english,
      keywords,
      audio_male_full,
      audio_female_full,
      audio_male_person_a,
      audio_female_person_a,
      audio_male_person_b,
      audio_female_person_b
    FROM questions
    WHERE 1=1
  `;

  const params = [];
  let paramIndex = 1;

  if (categoryId) {
    query += ` AND category = $${paramIndex}`;
    params.push(categoryId);
    paramIndex++;
  }

  if (excludeIds.length > 0) {
    query += ` AND question_id NOT IN (${excludeIds.map((_, i) => `$${paramIndex + i}`).join(', ')})`;
    params.push(...excludeIds);
    paramIndex += excludeIds.length;
  }

  query += `
    ORDER BY RANDOM()
    LIMIT $${paramIndex}
  `;
  params.push(limit);

  return safeQuery(query, params);
}

// 키워드로 문제 검색
async function searchQuestionsByKeyword(keyword, categoryId = null, limit = 20) {
  let query = `
    SELECT
      question_id,
      category,
      day,
      question_number,
      korean_content,
      english_content,
      keywords,
      tags
    FROM questions
    WHERE (
      korean_content ILIKE $1 OR
      english_content ILIKE $1 OR
      $2 = ANY(keywords) OR
      $2 = ANY(tags)
    )
  `;

  const params = [`%${keyword}%`, keyword];
  let paramIndex = 3;

  if (categoryId) {
    query += ` AND category = $${paramIndex}`;
    params.push(categoryId);
    paramIndex++;
  }

  query += `
    ORDER BY
      CASE WHEN korean_content ILIKE $1 THEN 1 ELSE 2 END,
      day ASC,
      question_number ASC
    LIMIT $${paramIndex}
  `;
  params.push(limit);

  return safeQuery(query, params);
}

// 태그별 문제 조회
async function getQuestionsByTag(tag, limit = 20, offset = 0) {
  const query = `
    SELECT
      question_id,
      category,
      day,
      question_number,
      korean_content,
      english_content,
      tags
    FROM questions
    WHERE $1 = ANY(tags)
    ORDER BY category, day ASC, question_number ASC
    LIMIT $2 OFFSET $3
  `;

  return safeQuery(query, [tag, limit, offset]);
}

// 문제 유형별 조회 (single, dialogue)
async function getQuestionsByType(questionType, categoryId = null, limit = 50) {
  let query = `
    SELECT
      question_id,
      category,
      day,
      question_number,
      question_type,
      korean_content,
      english_content,
      person_a_korean,
      person_a_english,
      person_b_korean,
      person_b_english
    FROM questions
    WHERE question_type = $1
  `;

  const params = [questionType];
  let paramIndex = 2;

  if (categoryId) {
    query += ` AND category = $${paramIndex}`;
    params.push(categoryId);
    paramIndex++;
  }

  query += `
    ORDER BY day ASC, question_number ASC
    LIMIT $${paramIndex}
  `;
  params.push(limit);

  return safeQuery(query, params);
}

// 장문 문제만 조회 (Cases in Point용)
async function getLongFormQuestions(categoryId = null, limit = 10) {
  let query = `
    SELECT
      question_id,
      category,
      day,
      question_number,
      korean_content,
      english_content,
      keywords,
      character_count_korean,
      character_count_english,
      estimated_time
    FROM questions
    WHERE is_long_form = true
  `;

  const params = [];
  let paramIndex = 1;

  if (categoryId) {
    query += ` AND category = $${paramIndex}`;
    params.push(categoryId);
    paramIndex++;
  }

  query += `
    ORDER BY estimated_time DESC, day ASC
    LIMIT $${paramIndex}
  `;
  params.push(limit);

  return safeQuery(query, params);
}

// 문제 통계 조회
async function getQuestionStats() {
  const query = `
    SELECT
      category,
      COUNT(*) as total_questions,
      COUNT(CASE WHEN question_type = 'single' THEN 1 END) as single_questions,
      COUNT(CASE WHEN question_type = 'dialogue' THEN 1 END) as dialogue_questions,
      COUNT(CASE WHEN is_long_form = true THEN 1 END) as long_form_questions,
      AVG(character_count_korean)::INTEGER as avg_korean_length,
      AVG(character_count_english)::INTEGER as avg_english_length,
      AVG(estimated_time)::INTEGER as avg_time
    FROM questions
    GROUP BY category
    ORDER BY category
  `;

  return safeQuery(query);
}

// 특정 사용자의 미완료 문제들 조회
async function getIncompleteQuestions(userId, categoryId = null, limit = 20) {
  let query = `
    SELECT
      q.question_id,
      q.category,
      q.day,
      q.question_number,
      q.korean_content,
      q.english_content,
      q.question_type,
      COALESCE(up.status, 'new') as progress_status
    FROM questions q
    LEFT JOIN user_progress up ON q.question_id = up.question_id AND up.user_id = $1
    WHERE COALESCE(up.status, 'new') != 'mastered'
  `;

  const params = [userId];
  let paramIndex = 2;

  if (categoryId) {
    query += ` AND q.category = $${paramIndex}`;
    params.push(categoryId);
    paramIndex++;
  }

  query += `
    ORDER BY q.day ASC, q.question_number ASC
    LIMIT $${paramIndex}
  `;
  params.push(limit);

  return safeQuery(query, params);
}

module.exports = {
  getAllCategories,
  getCategoryById,
  getQuestionCountByCategory,
  getDaysByCategory,
  getQuestionsByCategoryAndDay,
  getQuestionById,
  getQuestionsByCategory,
  getRandomQuestions,
  searchQuestionsByKeyword,
  getQuestionsByTag,
  getQuestionsByType,
  getLongFormQuestions,
  getQuestionStats,
  getIncompleteQuestions
};