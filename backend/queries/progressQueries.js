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
}

module.exports = new ProgressQueries();
