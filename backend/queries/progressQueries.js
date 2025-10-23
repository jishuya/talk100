const { db } = require('../config/database');

class ProgressQueries {
  /**
   * user_progress 업데이트 - 정답을 맞췄을 때 호출
   * 모든 종류의 퀴즈(category_id 1~6)에서 사용 가능
   * @param {string} userId - 사용자 ID
   * @param {number} categoryId - 카테고리 ID (1: Model, 2: Small Talk, 3: Cases, 4: Today, 5: Wrong, 6: Favorites)
   * @param {number} day - Day 번호
   * @param {number} questionId - 마지막으로 푼 문제 ID
   * @returns {Object} { success: boolean, message: string }
   */
  async updateUserProgress(userId, categoryId, day, questionId) {
    try {
      console.log('🔄 [User Progress] Updating...', {
        userId,
        categoryId,
        day,
        questionId
      });

      // user_progress 테이블에 INSERT 또는 UPDATE (UPSERT 패턴)
      await db.none(
        `INSERT INTO user_progress (user_id, category_id, last_studied_day, last_studied_question_id, last_studied_timestamp)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (user_id, category_id)
         DO UPDATE SET
           last_studied_day = $3,
           last_studied_question_id = $4,
           last_studied_timestamp = NOW()`,
        [userId, categoryId, day, questionId]
      );

      // 업데이트 후 확인
      const updated = await db.oneOrNone(
        `SELECT last_studied_day, last_studied_question_id, last_studied_timestamp
         FROM user_progress
         WHERE user_id = $1 AND category_id = $2`,
        [userId, categoryId]
      );

      console.log('✅ [User Progress] Updated successfully:', updated);

      return {
        success: true,
        message: 'User progress updated successfully',
        data: updated
      };
    } catch (error) {
      console.error('❌ [User Progress] Update failed:', error);
      throw new Error('Failed to update user progress');
    }
  }

  /**
   * daily_progress 업데이트 - Day 완료 시 호출
   * 오늘 날짜 기준으로 days_completed +1, goal_met 자동 계산
   * @param {string} userId - 사용자 ID
   * @returns {Object} { days_completed, goal_met }
   */
  async updateDailyProgress(userId) {
    try {
      console.log('🔄 [Daily Progress] Updating for userId:', userId);

      // 먼저 현재 상태 확인
      const currentState = await db.oneOrNone(
        `SELECT user_id, date, start_day, days_completed, goal_met, additional_days
         FROM daily_progress
         WHERE user_id = $1 AND date = CURRENT_DATE`,
        [userId]
      );
      console.log('📌 [Daily Progress] Current state BEFORE update:', currentState);

      // user_progress에서 현재 완료한 Day 조회
      const userProgress = await db.oneOrNone(
        `SELECT last_studied_day FROM user_progress
         WHERE user_id = $1 AND category_id = 4`,
        [userId]
      );

      const currentDay = userProgress?.last_studied_day || 0;
      console.log('🔍 [Daily Progress] Current day from user_progress:', currentDay);

      // goal_met 계산: (현재 Day - start_day + 1) >= daily_goal
      const result = await db.one(
        `UPDATE daily_progress
         SET days_completed = days_completed + 1,
             goal_met = ($2 - start_day + 1) >= (SELECT daily_goal FROM users WHERE uid = $1)
         WHERE user_id = $1 AND date = CURRENT_DATE
         RETURNING user_id, date, start_day, days_completed, goal_met`,
        [userId, currentDay]
      );

      console.log('✅ [Daily Progress] Updated AFTER:', {
        userId: result.user_id,
        date: result.date,
        startDay: result.start_day,
        currentDay,
        daysCompleted: result.days_completed,
        goalMet: result.goal_met,
        calculation: `(${currentDay} - ${result.start_day} + 1) >= daily_goal = ${result.goal_met}`
      });

      return {
        success: true,
        daysCompleted: result.days_completed,
        goalMet: result.goal_met
      };
    } catch (error) {
      console.error('❌ [Daily Progress] Update error:', error);
      throw new Error('Failed to update daily progress');
    }
  }

  /**
   * additional_days +1 업데이트 - 추가 학습 선택 시 호출
   * @param {string} userId - 사용자 ID
   * @returns {Object} { success: true, additionalDays: number }
   */
  async updateAdditionalDays(userId) {
    try {
      const result = await db.one(
        `UPDATE daily_progress
         SET additional_days = additional_days + 1
         WHERE user_id = $1 AND date = CURRENT_DATE
         RETURNING additional_days`,
        [userId]
      );

      console.log('✅ [Additional Days] Updated:', {
        userId,
        additionalDays: result.additional_days
      });

      return {
        success: true,
        additionalDays: result.additional_days
      };
    } catch (error) {
      console.error('updateAdditionalDays query error:', error);
      throw new Error('Failed to update additional days');
    }
  }
}

module.exports = new ProgressQueries();
