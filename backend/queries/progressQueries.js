const { db } = require('../config/database');
const streakQueries = require('./streakQueries');

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
      // 참고: solved_count는 getTodayQuizQuestions에서 이미 자정 리셋 처리됨
      await db.none(
        `INSERT INTO user_progress (user_id, category_id, last_studied_day, last_studied_question_id, last_studied_timestamp, solved_count)
         VALUES ($1, $2, $3, $4, NOW(), 1)
         ON CONFLICT (user_id, category_id)
         DO UPDATE SET
           last_studied_day = $3,
           last_studied_question_id = $4,
           last_studied_timestamp = NOW(),
           solved_count = user_progress.solved_count + 1`,
        [userId, categoryId, day, questionId]
      );

      // 업데이트 후 확인
      const updated = await db.oneOrNone(
        `SELECT last_studied_day, last_studied_question_id, last_studied_timestamp, solved_count
         FROM user_progress
         WHERE user_id = $1 AND category_id = $2`,
        [userId, categoryId]
      );

      // 🎯 목표 달성 체크 (category_id = 4: 오늘의 퀴즈만)
      let goalAchieved = false;
      let streakInfo = null;

      if (categoryId === 4 && updated?.solved_count) {
        // daily_goal 조회
        const userSettings = await db.oneOrNone(
          `SELECT daily_goal FROM users WHERE uid = $1`,
          [userId]
        );

        const dailyGoal = userSettings?.daily_goal || 20;

        // 목표 달성 시 streak 업데이트 (정확히 달성한 순간에만)
        if (updated.solved_count === dailyGoal) {
          goalAchieved = true;

          try {
            const streakResult = await streakQueries.updateStreak(userId);
            streakInfo = streakResult;
          } catch (streakError) {
            console.error('⚠️ [Streak] Update failed (non-critical):', streakError);
            // streak 업데이트 실패해도 진행률 업데이트는 성공으로 처리
          }
        }
      }

      return {
        success: true,
        message: 'User progress updated successfully',
        data: {
          ...updated,
          goalAchieved,
          streak: streakInfo
        }
      };
    } catch (error) {
      console.error('❌ [User Progress] Update failed:', error);
      throw new Error('Failed to update user progress');
    }
  }

  /**
   * solved_count 리셋 - 추가 학습 시작 시 호출
   * @param {string} userId - 사용자 ID
   * @returns {Object} { success: boolean }
   */
  async resetSolvedCount(userId) {
    try {
      await db.none(
        `UPDATE user_progress
         SET solved_count = 0
         WHERE user_id = $1 AND category_id = 4`,
        [userId]
      );

      return {
        success: true,
        message: 'Solved count reset successfully'
      };
    } catch (error) {
      console.error('❌ [Reset Solved Count] Failed:', error);
      throw new Error('Failed to reset solved count');
    }
  }

}

module.exports = new ProgressQueries();
