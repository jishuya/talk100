const { db } = require('../config/database');

class ProgressQueries {
  /**
   * user_progress 조회 - Day 변경 감지를 위해 이전 진행 상황 조회
   * @param {string} userId - 사용자 ID
   * @param {number} categoryId - 카테고리 ID
   * @returns {Object|null} { last_studied_day, last_studied_question_id } or null
   */
  async getUserProgress(userId, categoryId) {
    try {
      const result = await db.oneOrNone(
        `SELECT last_studied_day, last_studied_question_id
         FROM user_progress
         WHERE user_id = $1 AND category_id = $2`,
        [userId, categoryId]
      );
      return result;
    } catch (error) {
      console.error('getUserProgress query error:', error);
      throw new Error('Failed to get user progress');
    }
  }

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

      return {
        success: true,
        message: 'User progress updated successfully'
      };
    } catch (error) {
      console.error('updateUserProgress query error:', error);
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
      // daily_progress 테이블에 UPSERT (단일 쿼리로 효율적 처리)
      const result = await db.one(
        `INSERT INTO daily_progress (user_id, date, days_completed, goal_met)
         VALUES (
           $1,
           CURRENT_DATE,
           1,
           (SELECT 1 >= daily_goal FROM users WHERE uid = $1)
         )
         ON CONFLICT (user_id, date)
         DO UPDATE SET
           days_completed = daily_progress.days_completed + 1,
           goal_met = (daily_progress.days_completed + 1) >=
             (SELECT daily_goal FROM users WHERE uid = $1)
         RETURNING days_completed, goal_met`,
        [userId]
      );

      console.log('✅ [Daily Progress] Updated:', {
        userId,
        daysCompleted: result.days_completed,
        goalMet: result.goal_met
      });

      return {
        success: true,
        daysCompleted: result.days_completed,
        goalMet: result.goal_met
      };
    } catch (error) {
      console.error('updateDailyProgress query error:', error);
      throw new Error('Failed to update daily progress');
    }
  }
}

module.exports = new ProgressQueries();
