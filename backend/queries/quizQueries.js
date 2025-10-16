const { db } = require('../config/database');

class QuizQueries {
  /**
   * 오늘의 퀴즈 - 진행률 + 남은 문제들 조회
   * @param {string} userId - 사용자 ID
   * @returns {Object} { quiz_type, day, progress, questions }
   */
  async getTodayQuizQuestions(userId) {
    try {
      const result = await db.task(async t => {
        // 1. 진행 상황 + Day별 총 문제 수를 한 번에 조회 (LATERAL JOIN 활용)
        const progressInfo = await t.oneOrNone(
          `SELECT
            up.last_studied_day,
            up.last_studied_question_id,
            q.question_number as completed,
            day_total.total
          FROM user_progress up
          LEFT JOIN questions q ON q.question_id = up.last_studied_question_id
          LEFT JOIN LATERAL (
            SELECT MAX(question_number) as total
            FROM questions
            WHERE day = up.last_studied_day
          ) day_total ON true
          WHERE up.user_id = $1 AND up.category_id = 4`,
          [userId]
        );

        // 2. Day 계산 로직
        let targetDay = 1;
        let startQuestionNumber = 1;
        let completed = 0;
        let total = 0;

        if (progressInfo?.last_studied_day) {
          targetDay = progressInfo.last_studied_day;
          completed = progressInfo.completed || 0;
          total = progressInfo.total || 0;
          startQuestionNumber = completed + 1;

          // Day 완료시 다음 Day로 이동
          if (startQuestionNumber > total) {
            targetDay++;
            startQuestionNumber = 1;
            completed = 0;
            total = 0; // 다음 Day 총 문제 수는 아래에서 조회
          }
        }

        // 3. 해당 Day의 총 문제 수 조회 (신규 사용자 OR 다음 Day로 이동한 경우)
        if (total === 0) {
          const dayTotal = await t.one(
            `SELECT MAX(question_number) as total FROM questions WHERE day = $1`,
            [targetDay]
          );
          total = dayTotal.total || 0;
        }

        // 4. 남은 문제들 조회 (EXISTS 서브쿼리로 성능 개선)
        const questions = await t.manyOrNone(
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
            EXISTS(SELECT 1 FROM favorites WHERE question_id = q.question_id AND user_id = $2) as is_favorite,
            EXISTS(SELECT 1 FROM wrong_answers WHERE question_id = q.question_id AND user_id = $2) as is_wrong_answer
          FROM questions q
          WHERE q.day = $1 AND q.question_number >= $3
          ORDER BY q.question_number ASC`,
          [targetDay, userId, startQuestionNumber]
        );

        // 5. Progress 계산 및 결과 반환
        return {
          quiz_type: 'daily',
          day: targetDay,
          progress: {
            completed,
            total,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
            last_studied_day: progressInfo?.last_studied_day || null,
            last_studied_question_id: progressInfo?.last_studied_question_id || null
          },
          questions
        };
      });

      return result;
    } catch (error) {
      console.error('getTodayQuizQuestions query error:', error);
      throw new Error('Failed to get today quiz with progress');
    }
  }

  /**
   * 카테고리별 퀴즈 - 진행률 + 남은 문제들 조회
   * @param {string} userId - 사용자 ID
   * @param {number} categoryId - 카테고리 ID (1: Model Example, 2: Small Talk, 3: Cases in Point)
   * @returns {Object} { quiz_type, category_id, day, progress, questions }
   */
  async getCategoryQuizQuestions(userId, categoryId) {
    try {
      const result = await db.task(async t => {
        // 1. 진행 상황 + Day별 총 문제 수를 한 번에 조회 (LATERAL JOIN 활용)
        const progressInfo = await t.oneOrNone(
          `SELECT
            up.last_studied_day,
            up.last_studied_question_id,
            q.question_number as completed,
            day_total.total
          FROM user_progress up
          LEFT JOIN questions q ON q.question_id = up.last_studied_question_id
          LEFT JOIN LATERAL (
            SELECT MAX(question_number) as total
            FROM questions
            WHERE day = up.last_studied_day AND category_id = $2
          ) day_total ON true
          WHERE up.user_id = $1 AND up.category_id = $2`,
          [userId, categoryId]
        );

        // 2. Day 계산 로직
        let targetDay = 1;
        let startQuestionNumber = 1;
        let completed = 0;
        let total = 0;

        if (progressInfo?.last_studied_day) {
          targetDay = progressInfo.last_studied_day;
          completed = progressInfo.completed || 0;
          total = progressInfo.total || 0;
          startQuestionNumber = completed + 1;

          // Day 완료시 다음 Day로 이동
          if (startQuestionNumber > total) {
            targetDay++;
            startQuestionNumber = 1;
            completed = 0;
            total = 0; // 다음 Day 총 문제 수는 아래에서 조회
          }
        }

        // 3. 해당 Day의 총 문제 수 조회 (신규 사용자 OR 다음 Day로 이동한 경우)
        if (total === 0) {
          const dayTotal = await t.oneOrNone(
            `SELECT MAX(question_number) as total
             FROM questions
             WHERE day = $1 AND category_id = $2`,
            [targetDay, categoryId]
          );
          total = dayTotal?.total || 0;
        }

        // 4. 남은 문제들 조회 (category_id 조건 추가)
        const questions = await t.manyOrNone(
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
            EXISTS(SELECT 1 FROM favorites WHERE question_id = q.question_id AND user_id = $2) as is_favorite,
            EXISTS(SELECT 1 FROM wrong_answers WHERE question_id = q.question_id AND user_id = $2) as is_wrong_answer
          FROM questions q
          WHERE q.category_id = $3 AND q.day = $1 AND q.question_number >= $4
          ORDER BY q.question_number ASC`,
          [targetDay, userId, categoryId, startQuestionNumber]
        );

        // 5. Progress 계산 및 결과 반환
        return {
          quiz_type: 'category',
          category_id: categoryId,
          day: targetDay,
          progress: {
            completed,
            total,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
            last_studied_day: progressInfo?.last_studied_day || null,
            last_studied_question_id: progressInfo?.last_studied_question_id || null
          },
          questions
        };
      });

      return result;
    } catch (error) {
      console.error('getCategoryQuizQuestions query error:', error);
      throw new Error('Failed to get category quiz with progress');
    }
  }

  /**
   * 틀린 문제 퀴즈 조회 (Category ID: 5)
   * @param {string} userId - 사용자 ID
   * @returns {Object} { quiz_type, category_id, progress, questions }
   */
  async getWrongAnswersQuiz(userId) {
    try {
      // wrong_answers 테이블에서 사용자의 틀린 문제들 조회
      const questions = await db.manyOrNone(
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
          EXISTS(SELECT 1 FROM favorites WHERE question_id = q.question_id AND user_id = $1) as is_favorite,
          true as is_wrong_answer,
          wa.wrong_count,
          wa.added_at
        FROM wrong_answers wa
        JOIN questions q ON q.question_id = wa.question_id
        WHERE wa.user_id = $1
        ORDER BY wa.added_at ASC`,
        [userId]
      );

      const total = questions.length;

      return {
        quiz_type: 'personal',
        category_id: 5, // Wrong Answers
        progress: {
          completed: 0,
          total,
          percentage: 0
        },
        questions
      };
    } catch (error) {
      console.error('getWrongAnswersQuiz query error:', error);
      throw new Error('Failed to get wrong answers quiz');
    }
  }

  /**
   * 즐겨찾기 퀴즈 조회 (Category ID: 6)
   * @param {string} userId - 사용자 ID
   * @returns {Object} { quiz_type, category_id, progress, questions }
   */
  async getFavoritesQuiz(userId) {
    try {
      // favorites 테이블에서 사용자의 즐겨찾기 문제들 조회
      const questions = await db.manyOrNone(
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
          true as is_favorite,
          EXISTS(SELECT 1 FROM wrong_answers WHERE question_id = q.question_id AND user_id = $1) as is_wrong_answer,
          f.added_at
        FROM favorites f
        JOIN questions q ON q.question_id = f.question_id
        WHERE f.user_id = $1
        ORDER BY f.added_at ASC`,
        [userId]
      );

      const total = questions.length;

      return {
        quiz_type: 'personal',
        category_id: 6, // Favorites
        progress: {
          completed: 0,
          total,
          percentage: 0
        },
        questions
      };
    } catch (error) {
      console.error('getFavoritesQuiz query error:', error);
      throw new Error('Failed to get favorites quiz');
    }
  }

}

module.exports = new QuizQueries();
