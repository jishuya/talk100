const { db } = require('../config/database');
const badgeService = require('../services/badgeService');

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
   * 오늘의 퀴즈 - daily_goal 개수만큼 문제 조회
   * @param {string} userId - 사용자 ID
   * @returns {Object} { quiz_type, start_question_id, end_question_id, daily_goal, progress, questions }
   */
  async getTodayQuizQuestions(userId) {
    try {
      const result = await db.task(async t => {
        console.log('📅 [Today Quiz] Starting for userId:', userId);

        // 1. 사용자 설정 조회 (daily_goal)
        const settings = await this._getUserQuizSettings(t, userId);
        const dailyGoal = settings.daily_goal || 20; // 기본값 20문제

        // 2. user_progress 조회 (category_id = 4: 오늘의 퀴즈)
        let userProgress = await t.oneOrNone(
          `SELECT
            last_studied_question_id,
            solved_count,
            last_studied_timestamp
          FROM user_progress
          WHERE user_id = $1 AND category_id = 4`,
          [userId]
        );

        // user_progress 없으면 생성
        if (!userProgress) {
          await t.none(
            `INSERT INTO user_progress (user_id, category_id, last_studied_question_id, solved_count)
             VALUES ($1, 4, 0, 0)`,
            [userId]
          );
          userProgress = { last_studied_question_id: 0, solved_count: 0 };
        } else {
          // 🌅 자정 리셋 체크: last_studied_timestamp가 오늘이 아니면 solved_count를 0으로 리셋
          const lastStudiedDate = userProgress.last_studied_timestamp
            ? new Date(userProgress.last_studied_timestamp).toISOString().split('T')[0]
            : null;
          const today = new Date().toISOString().split('T')[0];

          if (lastStudiedDate && lastStudiedDate !== today) {
            console.log('🌅 [Today Quiz] New day detected - resetting solved_count');
            await t.none(
              `UPDATE user_progress
               SET solved_count = 0
               WHERE user_id = $1 AND category_id = 4`,
              [userId]
            );
            userProgress.solved_count = 0;
          }
        }

        // 3. 다음 문제 범위 계산 (question_id 기준)
        // 남은 문제 수 = daily_goal - solved_count
        const remainingQuestions = Math.max(0, dailyGoal - userProgress.solved_count);
        const startQuestionId = userProgress.last_studied_question_id + 1;

        // 목표 달성 후 추가 학습: remainingQuestions = 0이면 daily_goal 만큼 추가 제공
        const questionsToFetch = remainingQuestions > 0 ? remainingQuestions : dailyGoal;
        const endQuestionId = startQuestionId + questionsToFetch - 1;

        // 4. 문제 조회 (question_id 범위로)
        const questions = await t.any(
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
            EXISTS(SELECT 1 FROM favorites WHERE question_id = q.question_id AND user_id = $3) as is_favorite,
            EXISTS(SELECT 1 FROM wrong_answers WHERE question_id = q.question_id AND user_id = $3) as is_wrong_answer
          FROM questions q
          WHERE q.question_id >= $1 AND q.question_id <= $2
          ORDER BY q.question_id ASC`,
          [startQuestionId, endQuestionId, userId]
        );

        console.log('✅ [Today Quiz] Questions loaded:', questions.length);

        // 5. 진행률 계산 (solved_count / daily_goal * 100)
        const percentage = Math.round((userProgress.solved_count / dailyGoal) * 100);

        console.log('📊 [Today Quiz] Progress:', {
          solved: userProgress.solved_count,
          goal: dailyGoal,
          percentage
        });

        return {
          quiz_type: 'daily',
          start_question_id: startQuestionId,
          end_question_id: endQuestionId,
          daily_goal: dailyGoal,
          progress: {
            solved: userProgress.solved_count,
            total: dailyGoal,
            percentage
          },
          questions
        };
      });

      return result;
    } catch (error) {
      console.error('❌ [Today Quiz] Error:', error);
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

        // 2. 목표 Day 계산
        let targetDay = 1; // 기본값: Day 1부터 시작
        let startQuestionNumber = 1; // 기본값: 1번 문제부터
        let completed = 0; // 기본값: 완료한 문제 수 0

        if (progressInfo && progressInfo.last_studied_day) {
          const lastDay = progressInfo.last_studied_day;
          const lastQuestionNumber = progressInfo.completed || 0;
          const totalQuestionsInDay = progressInfo.total || 0;

          // Day를 완료했으면 다음 Day로, 아니면 현재 Day 계속
          if (lastQuestionNumber >= totalQuestionsInDay) {
            // Day 완료 → 다음 Day의 1번 문제부터
            targetDay = lastDay + 1;
            startQuestionNumber = 1;
            completed = 0;
          } else {
            // Day 진행 중 → 현재 Day의 다음 문제부터
            targetDay = lastDay;
            startQuestionNumber = lastQuestionNumber + 1;
            completed = lastQuestionNumber;
          }
        }

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

  /**
   * 문제 시도 기록 (question_attempts 테이블에 INSERT)
   * + daily_summary 업데이트 (questions_attempted, goal_met)
   * + 오늘 첫 학습 시 streak 업데이트
   * @param {string} userId - 사용자 ID
   * @param {number} questionId - 문제 ID
   * @returns {Object} { success, isFirstStudyToday, streakUpdated, newStreak, goalMet, questionsToday, dailyGoal }
   */
  async recordQuestionAttempt(userId, questionId) {
    try {
      return await db.tx(async t => {
        const today = new Date().toISOString().split('T')[0];

        // 1. 오늘 첫 학습인지 확인 (question_attempts 조회)
        const todayRecord = await t.oneOrNone(
          `SELECT 1 FROM question_attempts
           WHERE user_id = $1 AND date = $2
           LIMIT 1`,
          [userId, today]
        );

        const isFirstStudyToday = !todayRecord;

        // 2. question_attempts INSERT
        await t.none(
          `INSERT INTO question_attempts (user_id, question_id, date, attempted_at)
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
           ON CONFLICT (user_id, question_id, date) DO NOTHING`,
          [userId, questionId, today]
        );

        // 2-1. daily_summary 업데이트 (questions_attempted +1)
        await t.none(
          `INSERT INTO daily_summary (user_id, date, questions_attempted)
           VALUES ($1, $2, 1)
           ON CONFLICT (user_id, date)
           DO UPDATE SET
             questions_attempted = daily_summary.questions_attempted + 1,
             updated_at = CURRENT_TIMESTAMP`,
          [userId, today]
        );

        // 2-2. goal_met 계산 및 업데이트
        const user = await t.one(
          `SELECT daily_goal FROM users WHERE uid = $1`,
          [userId]
        );

        const summary = await t.one(
          `SELECT questions_attempted FROM daily_summary
           WHERE user_id = $1 AND date = $2`,
          [userId, today]
        );

        const goalMet = summary.questions_attempted >= user.daily_goal;

        if (goalMet) {
          await t.none(
            `UPDATE daily_summary
             SET goal_met = true
             WHERE user_id = $1 AND date = $2`,
            [userId, today]
          );

          console.log(`🎯 [Goal Met] User: ${userId}, Questions: ${summary.questions_attempted}/${user.daily_goal}`);
        }

        // 3. 오늘 첫 학습이면 streak 업데이트
        let streakUpdated = false;
        let newStreak = null;

        if (isFirstStudyToday) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

          // 어제 학습했는지 확인
          const studiedYesterday = await t.oneOrNone(
            `SELECT 1 FROM question_attempts
             WHERE user_id = $1 AND date = $2
             LIMIT 1`,
            [userId, yesterday]
          );

          // 현재 streak 조회
          const user = await t.one(
            `SELECT current_streak, longest_streak FROM users WHERE uid = $1`,
            [userId]
          );

          // 새로운 streak 계산
          newStreak = studiedYesterday
            ? user.current_streak + 1  // 연속 학습
            : 1;                        // 새로 시작

          const newLongest = Math.max(newStreak, user.longest_streak);

          // users 테이블 업데이트
          await t.none(
            `UPDATE users
             SET current_streak = $1,
                 longest_streak = $2,
                 total_days_studied = total_days_studied + 1
             WHERE uid = $3`,
            [newStreak, newLongest, userId]
          );

          streakUpdated = true;

          console.log(`✅ [Streak Updated] User: ${userId}, New Streak: ${newStreak}, Longest: ${newLongest}`);
        }

        // 4. users 테이블의 total_questions_attempted 업데이트
        await t.none(
          `UPDATE users
           SET total_questions_attempted = total_questions_attempted + 1
           WHERE uid = $1`,
          [userId]
        );

        return {
          success: true,
          isFirstStudyToday,
          streakUpdated,
          newStreak,
          goalMet,
          questionsToday: summary.questions_attempted,
          dailyGoal: user.daily_goal,
          message: isFirstStudyToday
            ? 'Question attempt recorded and streak updated'
            : 'Question attempt recorded successfully'
        };
      });
    } catch (error) {
      console.error('recordQuestionAttempt query error:', error);
      throw new Error('Failed to record question attempt');
    }
  }

  /**
   * 문제 시도 기록 + 뱃지 체크 (통합 버전)
   * @param {string} userId - 사용자 UID
   * @param {number} questionId - 문제 ID
   * @returns {Object} { success, isFirstStudyToday, streakUpdated, newStreak, goalMet, questionsToday, dailyGoal, newBadges }
   */
  async recordQuestionAttemptWithBadges(userId, questionId) {
    try {
      // 1. 기본 문제 시도 기록
      const attemptResult = await this.recordQuestionAttempt(userId, questionId);

      // 2. 뱃지 체크
      const badgeResult = await badgeService.checkAndUpdateBadges(userId);

      // 3. 결과 통합
      return {
        ...attemptResult,
        newBadges: badgeResult.newBadges || []
      };

    } catch (error) {
      console.error('recordQuestionAttemptWithBadges error:', error);
      throw error;
    }
  }

}

module.exports = new QuizQueries();
