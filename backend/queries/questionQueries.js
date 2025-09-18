const { db, safeQuery, safeQueryOneOrNone, withTransaction } = require('../config/database');

/**
 * 문제 관련 쿼리 함수들
 * 카테고리별, Day별 문제 조회
 */

// 카테고리 목록 조회
async function getAllCategories() {
  const query = `
    SELECT
      category_id,
      name,
      display_name,
      order_num,
      is_active
    FROM categories
    WHERE is_active = true
    ORDER BY order_num, category_id
  `;

  return safeQuery(query);
}

// 특정 카테고리의 특정 Day 문제들 조회
async function getQuestionsByDay(category, day) {
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
      keywords
    FROM questions
    WHERE category = $1 AND day = $2
    ORDER BY question_number
  `;

  return safeQuery(query, [category, day]);
}

// 특정 카테고리의 모든 문제 조회
async function getQuestionsByCategory(category) {
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
      keywords
    FROM questions
    WHERE category = $1
    ORDER BY day, question_number
  `;

  return safeQuery(query, [category]);
}

// 특정 문제 ID로 문제 조회
async function getQuestionById(questionId) {
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
      keywords
    FROM questions
    WHERE question_id = $1
  `;

  return safeQueryOneOrNone(query, [questionId]);
}

// 복수 문제 ID로 문제들 조회
async function getQuestionsByIds(questionIds) {
  if (!questionIds || questionIds.length === 0) {
    return [];
  }

  const placeholders = questionIds.map((_, index) => `$${index + 1}`).join(',');
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
      keywords
    FROM questions
    WHERE question_id IN (${placeholders})
    ORDER BY category, day, question_number
  `;

  return safeQuery(query, questionIds);
}

// Day 완료를 위한 복습 문제 선택
async function selectReviewQuestions(dayNumber, category) {
  const questions = [];

  if (category === 'model_example') {
    // Model Example에서 랜덤 3문제
    const modelQuestions = await safeQuery(`
      SELECT question_id FROM questions
      WHERE category = 'model_example' AND day = $1
      ORDER BY RANDOM() LIMIT 3
    `, [dayNumber]);
    questions.push(...modelQuestions.map(q => q.question_id));
  }

  if (category === 'small_talk') {
    // Small Talk에서 1세트 (dialogue)
    const talkQuestions = await safeQuery(`
      SELECT question_id FROM questions
      WHERE category = 'small_talk' AND day = $1 AND question_type = 'dialogue'
      ORDER BY RANDOM() LIMIT 1
    `, [dayNumber]);
    questions.push(...talkQuestions.map(q => q.question_id));
  }

  if (category === 'cases_in_point') {
    // Cases in Point에서 1문제
    const caseQuestions = await safeQuery(`
      SELECT question_id FROM questions
      WHERE category = 'cases_in_point' AND day = $1
      ORDER BY RANDOM() LIMIT 1
    `, [dayNumber]);
    questions.push(...caseQuestions.map(q => q.question_id));
  }

  return questions;
}

// 카테고리별 총 Day 수 조회
async function getTotalDaysByCategory(category) {
  const query = `
    SELECT MAX(day) as total_days
    FROM questions
    WHERE category = $1
  `;

  const result = await safeQueryOneOrNone(query, [category]);
  return result ? parseInt(result.total_days) : 0;
}

// 카테고리별 통계 조회
async function getCategoryStats() {
  const query = `
    SELECT
      category,
      COUNT(*) as total_questions,
      COUNT(DISTINCT day) as total_days,
      MIN(day) as first_day,
      MAX(day) as last_day
    FROM questions
    GROUP BY category
    ORDER BY category
  `;

  return safeQuery(query);
}

// 랜덤 문제 조회 (특정 카테고리에서)
async function getRandomQuestions(category, limit = 5) {
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
      keywords
    FROM questions
    WHERE category = $1
    ORDER BY RANDOM()
    LIMIT $2
  `;

  return safeQuery(query, [category, limit]);
}

// 문제 검색 (키워드 기반)
async function searchQuestions(searchTerm) {
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
      person_b_english
    FROM questions
    WHERE
      korean_content ILIKE $1 OR
      english_content ILIKE $1 OR
      person_a_korean ILIKE $1 OR
      person_a_english ILIKE $1 OR
      person_b_korean ILIKE $1 OR
      person_b_english ILIKE $1
    ORDER BY category, day, question_number
    LIMIT 50
  `;

  return safeQuery(query, [`%${searchTerm}%`]);
}

module.exports = {
  getAllCategories,
  getQuestionsByDay,
  getQuestionsByCategory,
  getQuestionById,
  getQuestionsByIds,
  selectReviewQuestions,
  getTotalDaysByCategory,
  getCategoryStats,
  getRandomQuestions,
  searchQuestions
};