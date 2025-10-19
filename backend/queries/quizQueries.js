const { db } = require('../config/database');

class QuizQueries {
  // ==========================================
  // 🔧 헬퍼 함수들 (Private Methods)
  // ==========================================

  /**
   * 사용자 퀴즈 설정 조회 (목적: daily_goal 조회, 사용처: getTodayQuizQuestions)
   * @private
   * @param {Object} t - pg-promise transaction object
   * @param {string} userId - 사용자 ID
   * @returns {Object} { daily_goal, default_difficulty }
   */
  async _getUserQuizSettings(t, userId) {
    return t.one(
      `SELECT daily_goal, default_difficulty
       FROM users
       WHERE uid = $1`,
      [userId]
    );
  }

  /**
   * 사용자 진행 상황 조회 (목적: 어느 Day, 몇 번 문제까지 풀었는지, 사용처: getTodayQuizQuestions, getCategoryQuizQuestions)
   * @private
   * @param {Object} t - pg-promise transaction object
   * @param {string} userId - 사용자 ID
   * @param {number} categoryId - 카테고리 ID
   * @returns {Object} { last_studied_day, last_studied_question_id, completed, total }
   */
  async _getUserProgress(t, userId, categoryId) {
    return t.oneOrNone(
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
          AND (category_id = $2 OR $2 = 4)
      ) day_total ON true
      WHERE up.user_id = $1 AND up.category_id = $2`,
      [userId, categoryId]
    );
  }

  /**
   * 목표 Day 계산 (목적: 다음 학습할 Day 계산, 사용처: getTodayQuizQuestions, getCategoryQuizQuestions)
   * @private
   * @param {Object} progressInfo - 진행 상황 객체
   * @returns {Object} { targetDay, startQuestionNumber, completed, total }
   */
  _calculateTargetDay(progressInfo) {
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
        total = 0; // 다음 Day 총 문제 수는 호출자가 조회
      }
    }

    return { targetDay, startQuestionNumber, completed, total };
  }

  /**
   * Day별 총 문제 수 조회(사용처: getTodayQuizQuestions)
   * @private
   * @param {Object} t - pg-promise transaction object
   * @param {number} day - Day 번호
   * @returns {number} 총 문제 수
   */
  async _getDayTotalQuestions(t, day) {
    const result = await t.one(
      `SELECT MAX(question_number) as total
       FROM questions
       WHERE day = $1`,
      [day]
    );
    return result.total || 0;
  }

  /**
   * 여러 Day의 문제들 조회 (daily_goal 만큼, 사용처: getTodayQuizQuestions)
   * @private
   * @param {Object} t - pg-promise transaction object
   * @param {string} userId - 사용자 ID
   * @param {number} startDay - 시작 Day
   * @param {number} dayCount - 가져올 Day 개수
   * @param {number} startQuestionNumber - 첫 번째 Day의 시작 문제 번호
   * @returns {Array} 문제 배열
   */
  async _getQuestionsForMultipleDays(t, userId, startDay, dayCount, startQuestionNumber = 1) {
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
      WHERE q.day >= $1
        AND q.day < $1 + $3
        AND (q.day > $1 OR q.question_number >= $4)
      ORDER BY q.day ASC, q.question_number ASC`,
      [startDay, userId, dayCount, startQuestionNumber]
    );
    return questions;
  }

  /**
   * 특정 카테고리의 단일 Day 문제들 조회(목적: 카테고리별 문제 조회, 사용처: getCategoryQuizQuestions)
   * @private
   * @param {Object} t - pg-promise transaction object
   * @param {string} userId - 사용자 ID
   * @param {number} categoryId - 카테고리 ID
   * @param {number} day - Day 번호
   * @param {number} startQuestionNumber - 시작 문제 번호
   * @returns {Array} 문제 배열
   */
  async _getQuestionsForCategory(t, userId, categoryId, day, startQuestionNumber = 1) {
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
      [day, userId, categoryId, startQuestionNumber]
    );
    return questions;
  }

  /**
   * 특정 카테고리 Day의 총 문제 수 조회(사용처: getCategoryQuizQuestions)
   * @private
   * @param {Object} t - pg-promise transaction object
   * @param {number} categoryId - 카테고리 ID
   * @param {number} day - Day 번호
   * @returns {number} 총 문제 수
   */
  async _getCategoryDayTotal(t, categoryId, day) {
    const result = await t.oneOrNone(
      `SELECT MAX(question_number) as total
       FROM questions
       WHERE day = $1 AND category_id = $2`,
      [day, categoryId]
    );
    return result?.total || 0;
  }

  // ==========================================
  // 📝 메인 퀴즈 조회 함수들
  // ==========================================

  /**
   * 오늘의 퀴즈 - daily_goal만큼의 Day 조회 (진행률 + 문제들)
   * @param {string} userId - 사용자 ID
   * @returns {Object} { quiz_type, days, progress, questions }
   */
  async getTodayQuizQuestions(userId) {
    try {
      const result = await db.task(async t => {
        // 1. 사용자 설정 조회 (daily_goal)
        const settings = await this._getUserQuizSettings(t, userId);
        const dailyGoal = settings.daily_goal || 1;

        // 2. 진행 상황 조회 (카테고리 4: 오늘의 퀴즈)
        const progressInfo = await this._getUserProgress(t, userId, 4);

        // 3. 목표 Day 계산
        let { targetDay, startQuestionNumber, completed } = this._calculateTargetDay(progressInfo);

        // 4. daily_goal만큼의 Day 문제들 조회
        const questions = await this._getQuestionsForMultipleDays(
          t,
          userId,
          targetDay,
          dailyGoal,
          startQuestionNumber
        );

        // 5. 전체 문제 수 계산 (daily_goal만큼의 Day들) - 한 번의 반복문으로 통합
        let totalQuestionsForGoal = 0;
        let currentDayTotal = 0;
        for (let i = 0; i < dailyGoal; i++) {
          const dayTotal = await this._getDayTotalQuestions(t, targetDay + i);
          totalQuestionsForGoal += dayTotal;

          // 첫 번째 Day의 총 문제 수 저장
          if (i === 0) {
            currentDayTotal = dayTotal;
          }
        }

        // 첫 번째 Day는 진행 중일 수 있으므로 조정
        if (startQuestionNumber > 1) {
          totalQuestionsForGoal -= (startQuestionNumber - 1);
        }

        // 6. Progress 계산 및 결과 반환
        return {
          quiz_type: 'daily',
          day: targetDay,
          days: Array.from({ length: dailyGoal }, (_, i) => targetDay + i), // [1, 2, 3] 형태
          daily_goal: dailyGoal,
          progress: {
            completed,
            total: totalQuestionsForGoal,
            percentage: totalQuestionsForGoal > 0 ? Math.round((completed / totalQuestionsForGoal) * 100) : 0,
            last_studied_day: progressInfo?.last_studied_day || null,
            last_studied_question_id: progressInfo?.last_studied_question_id || null,
            current_day_total: currentDayTotal // 현재 Day의 문제 수
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
        // 1. 진행 상황 조회 (헬퍼 함수 사용)
        const progressInfo = await this._getUserProgress(t, userId, categoryId);

        // 2. 목표 Day 계산 (헬퍼 함수 사용)
        let { targetDay, startQuestionNumber, completed } = this._calculateTargetDay(progressInfo);

        // 3. 해당 Day의 총 문제 수 조회 (카테고리 특화 헬퍼 함수 사용)
        const total = await this._getCategoryDayTotal(t, categoryId, targetDay);

        // 4. 남은 문제들 조회 (카테고리 특화 헬퍼 함수 사용)
        const questions = await this._getQuestionsForCategory(
          t,
          userId,
          categoryId,
          targetDay,
          startQuestionNumber
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
          wa.added_at
        FROM wrong_answers wa
        JOIN questions q ON q.question_id = wa.question_id
        WHERE wa.user_id = $1
        ORDER BY wa.added_at DESC`,
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

  /**
   * 틀린 문제 토글 (추가 또는 삭제)
   * @param {string} userId - 사용자 ID
   * @param {number} questionId - 문제 ID
   * @param {boolean} isStarred - 현재 별 상태 (true: 채워짐, false: 비어짐)
   * @returns {Object} { isStarred: boolean }
   */
  async toggleWrongAnswer(userId, questionId, isStarred) {
    try {
      if (isStarred) {
        // 채워진 별 → 빈 별 (DELETE)
        await db.none(
          `DELETE FROM wrong_answers WHERE user_id = $1 AND question_id = $2`,
          [userId, questionId]
        );
        return { isStarred: false };
      } else {
        // 빈 별 → 채워진 별 (INSERT, added_at은 자동 생성)
        await db.none(
          `INSERT INTO wrong_answers (user_id, question_id)
           VALUES ($1, $2)
           ON CONFLICT (user_id, question_id) DO NOTHING`,
          [userId, questionId]
        );
        return { isStarred: true };
      }
    } catch (error) {
      console.error('toggleWrongAnswer query error:', error);
      throw new Error('Failed to toggle wrong answer');
    }
  }

  /**
   * 즐겨찾기 토글 (추가 또는 삭제)
   * @param {string} userId - 사용자 ID
   * @param {number} questionId - 문제 ID
   * @param {boolean} isFavorite - 현재 하트 상태 (true: 채워짐, false: 비어짐)
   * @returns {Object} { isFavorite: boolean }
   */
  async toggleFavorite(userId, questionId, isFavorite) {
    try {
      if (isFavorite) {
        // 채워진 하트 → 빈 하트 (DELETE)
        await db.none(
          `DELETE FROM favorites WHERE user_id = $1 AND question_id = $2`,
          [userId, questionId]
        );
        return { isFavorite: false };
      } else {
        // 빈 하트 → 채워진 하트 (INSERT, added_at은 자동 생성)
        await db.none(
          `INSERT INTO favorites (user_id, question_id)
           VALUES ($1, $2)
           ON CONFLICT (user_id, question_id) DO NOTHING`,
          [userId, questionId]
        );
        return { isFavorite: true };
      }
    } catch (error) {
      console.error('toggleFavorite query error:', error);
      throw new Error('Failed to toggle favorite');
    }
  }

}

module.exports = new QuizQueries();
