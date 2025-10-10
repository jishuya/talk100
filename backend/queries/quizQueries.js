const { db } = require('../config/database');

class QuizQueries {
  /**
   * Day별 전체 문제 조회
   * @param {number} categoryId - 카테고리 ID (4: 오늘의 퀴즈)
   * @param {number} day - Day 번호
   * @returns {Array} 해당 Day의 모든 문제
   */
  async getQuestionsByDay(categoryId, day) {
    try {
      const result = await db.manyOrNone(
        `SELECT
          question_id,
          category_id,
          day,
          question_number,
          question_type,
          korean,
          english,
          korean_a,
          english_a,
          korean_b,
          english_b,
          audio_male,
          audio_female,
          audio_male_a,
          audio_female_a,
          audio_male_b,
          audio_female_b,
          keywords
        FROM questions
        WHERE category_id = $1 AND day = $2
        ORDER BY question_number ASC`,
        [categoryId, day]
      );

      return result || [];
    } catch (error) {
      console.error('getQuestionsByDay query error:', error);
      throw new Error('Failed to fetch questions by day');
    }
  }

  /**
   * 특정 문제 조회
   * @param {number} questionId - 문제 ID
   * @returns {Object} 문제 정보
   */
  async getQuestionById(questionId) {
    try {
      const result = await db.oneOrNone(
        `SELECT
          question_id,
          category_id,
          day,
          question_number,
          question_type,
          korean,
          english,
          korean_a,
          english_a,
          korean_b,
          english_b,
          audio_male,
          audio_female,
          audio_male_a,
          audio_female_a,
          audio_male_b,
          audio_female_b,
          keywords
        FROM questions
        WHERE question_id = $1`,
        [questionId]
      );

      return result;
    } catch (error) {
      console.error('getQuestionById query error:', error);
      throw new Error('Failed to fetch question by id');
    }
  }

  /**
   * 카테고리별 Day 범위 조회 (최소/최대 Day)
   * @param {number} categoryId - 카테고리 ID
   * @returns {Object} {min_day, max_day}
   */
  async getDayRange(categoryId) {
    try {
      const result = await db.oneOrNone(
        `SELECT
          MIN(day) as min_day,
          MAX(day) as max_day
        FROM questions
        WHERE category_id = $1`,
        [categoryId]
      );

      return result || { min_day: 1, max_day: 1 };
    } catch (error) {
      console.error('getDayRange query error:', error);
      throw new Error('Failed to fetch day range');
    }
  }

  /**
   * 즐겨찾기 문제 조회
   * @param {string} userId - 사용자 ID
   * @returns {Array} 즐겨찾기 문제 목록
   */
  async getFavoriteQuestions(userId) {
    try {
      const result = await db.manyOrNone(
        `SELECT
          q.question_id,
          q.category_id,
          q.day,
          q.question_number,
          q.question_type,
          q.korean,
          q.english,
          q.korean_a,
          q.english_a,
          q.korean_b,
          q.english_b,
          q.audio_male,
          q.audio_female,
          q.audio_male_a,
          q.audio_female_a,
          q.audio_male_b,
          q.audio_female_b,
          q.keywords
        FROM favorites f
        JOIN questions q ON f.question_id = q.question_id
        WHERE f.user_id = $1
        ORDER BY f.added_at DESC`,
        [userId]
      );

      return result || [];
    } catch (error) {
      console.error('getFavoriteQuestions query error:', error);
      throw new Error('Failed to fetch favorite questions');
    }
  }

  /**
   * 틀린 문제 조회
   * @param {string} userId - 사용자 ID
   * @returns {Array} 틀린 문제 목록
   */
  async getWrongAnswerQuestions(userId) {
    try {
      const result = await db.manyOrNone(
        `SELECT
          q.question_id,
          q.category_id,
          q.day,
          q.question_number,
          q.question_type,
          q.korean,
          q.english,
          q.korean_a,
          q.english_a,
          q.korean_b,
          q.english_b,
          q.audio_male,
          q.audio_female,
          q.audio_male_a,
          q.audio_female_a,
          q.audio_male_b,
          q.audio_female_b,
          q.keywords,
          w.wrong_count
        FROM wrong_answers w
        JOIN questions q ON w.question_id = q.question_id
        WHERE w.user_id = $1
        ORDER BY w.added_at DESC`,
        [userId]
      );

      return result || [];
    } catch (error) {
      console.error('getWrongAnswerQuestions query error:', error);
      throw new Error('Failed to fetch wrong answer questions');
    }
  }

  /**
   * 오늘의 퀴즈 - 다음 학습할 문제들 조회
   * @param {string} userId - 사용자 ID
   * @returns {Object} { day, questions } - 학습할 Day와 문제 목록
   */
  async getTodayQuizQuestions(userId) {
    try {
      // 한 번의 쿼리로 마지막 진행상황 + 다음 문제들 조회
      const result = await db.task(async t => {
        // 1. 마지막 학습 위치 조회
        const progress = await t.oneOrNone(
          `SELECT
            COALESCE(q.day, 0) as last_day,
            COALESCE(q.question_number, 0) as last_question_number
          FROM user_progress up
          LEFT JOIN questions q ON up.last_studied_question_id = q.question_id
          WHERE up.user_id = $1 AND up.category_id = 4`,
          [userId]
        );

        let targetDay = 1;
        let startQuestionNumber = 1;

        if (progress && progress.last_day > 0) {
          targetDay = progress.last_day;
          startQuestionNumber = progress.last_question_number + 1;

          // 2. 해당 day의 마지막 question_number 확인
          const maxQuestionNum = await t.oneOrNone(
            `SELECT MAX(question_number) as max_num
            FROM questions
            WHERE day = $1 AND category_id IN (1, 2, 3)`,
            [targetDay]
          );

          // 현재 day에 남은 문제가 없으면 다음 day로
          if (maxQuestionNum && startQuestionNumber > maxQuestionNum.max_num) {
            targetDay = targetDay + 1;
            startQuestionNumber = 1;
          }
        }

        // 3. targetDay의 startQuestionNumber부터 끝까지 가져오기
        const questions = await t.manyOrNone(
          `SELECT
            question_id,
            category_id,
            day,
            question_number,
            question_type,
            korean,
            english,
            korean_a,
            english_a,
            korean_b,
            english_b,
            audio_male,
            audio_female,
            audio_male_a,
            audio_female_a,
            audio_male_b,
            audio_female_b,
            keywords
          FROM questions
          WHERE day = $1 AND category_id IN (1, 2, 3) AND question_number >= $2
          ORDER BY category_id ASC, question_number ASC`,
          [targetDay, startQuestionNumber]
        );

        return {
          day: targetDay,
          questions: questions || []
        };
      });

      return result;
    } catch (error) {
      console.error('getTodayQuizQuestions query error:', error);
      throw new Error('Failed to fetch today quiz questions');
    }
  }
}

module.exports = new QuizQueries();
