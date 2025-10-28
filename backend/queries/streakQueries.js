const { db } = require('../config/database');

class StreakQueries {
  /**
   * user_streak 업데이트 - 목표 달성 시 자동 호출
   * @param {string} userId - 사용자 ID
   * @returns {Object} { current_streak, best_streak }
   */
  async updateStreak(userId) {
    try {
      const result = await db.one(
        `INSERT INTO user_streak (user_id, current_streak, last_completed_date, today_completed, best_streak)
         VALUES ($1, 1, CURRENT_DATE, true, 1)
         ON CONFLICT (user_id)
         DO UPDATE SET
           current_streak = CASE
             WHEN user_streak.last_completed_date = CURRENT_DATE THEN user_streak.current_streak
             WHEN user_streak.last_completed_date = CURRENT_DATE - INTERVAL '1 day' THEN user_streak.current_streak + 1
             ELSE 1
           END,
           last_completed_date = CURRENT_DATE,
           today_completed = true,
           best_streak = GREATEST(
             CASE
               WHEN user_streak.last_completed_date = CURRENT_DATE THEN user_streak.current_streak
               WHEN user_streak.last_completed_date = CURRENT_DATE - INTERVAL '1 day' THEN user_streak.current_streak + 1
               ELSE 1
             END,
             user_streak.best_streak
           )
         RETURNING current_streak, best_streak`,
        [userId]
      );

      console.log('🔥 [Streak] Updated:', result);
      return result;

    } catch (error) {
      console.error('❌ [Streak] Update error:', error);
      throw new Error('Failed to update streak');
    }
  }
}

module.exports = new StreakQueries();
