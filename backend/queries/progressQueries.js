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

      // 업데이트 후 확인 및 목표 달성 체크
      const updated = await db.oneOrNone(
        `SELECT last_studied_day, last_studied_question_id, last_studied_timestamp, solved_count
         FROM user_progress
         WHERE user_id = $1 AND category_id = $2`,
        [userId, categoryId]
      );

      // 🎯 목표 달성 체크 (오늘의 퀴즈만)
      let goalAchieved = false;
      let streakInfo = null;

      if (categoryId === 4) {
        // 사용자 목표 조회
        const userGoal = await db.oneOrNone(
          `SELECT daily_goal, current_streak, longest_streak
           FROM users
           WHERE uid = $1`,
          [userId]
        );

        // 목표 달성 여부 확인
        if (userGoal && updated.solved_count >= userGoal.daily_goal) {
          goalAchieved = true;
          streakInfo = {
            current_streak: userGoal.current_streak || 0,
            best_streak: userGoal.longest_streak || 0
          };
        }
      }

      // 📅 Day 완료 체크 - daily_summary.days_completed 업데이트
      // 방금 푼 문제가 해당 Day의 마지막 문제인지 확인
      try {
        // 1. 해당 Day의 총 문제 수 조회
        const dayInfo = await db.oneOrNone(
          `SELECT MAX(question_number) as total_questions
           FROM questions
           WHERE day = $1 AND (category_id = $2 OR $2 = 4)`,
          [day, categoryId]
        );

        // 2. 방금 푼 문제의 question_number 조회
        const currentQuestion = await db.oneOrNone(
          `SELECT question_number FROM questions WHERE question_id = $1`,
          [questionId]
        );

        // 3. Day 완료 조건: 마지막 문제를 방금 풀었을 때
        if (dayInfo?.total_questions && currentQuestion?.question_number === dayInfo.total_questions) {
          const today = new Date().toISOString().split('T')[0];

          // daily_summary.days_completed += 1
          await db.none(
            `INSERT INTO daily_summary (user_id, date, days_completed)
             VALUES ($1, $2, 1)
             ON CONFLICT (user_id, date)
             DO UPDATE SET
               days_completed = daily_summary.days_completed + 1,
               updated_at = CURRENT_TIMESTAMP`,
            [userId, today]
          );

          console.log(`✅ [Day Completed] User: ${userId}, Day: ${day}, Category: ${categoryId}`);
        }
      } catch (dayCompletionError) {
        console.error('⚠️ [Day Completion] Update failed (non-critical):', dayCompletionError);
        // Day 완료 추적 실패해도 진행률 업데이트는 성공으로 처리
      }

      return {
        success: true,
        message: 'User progress updated successfully',
        data: updated,
        goalAchieved,
        streak: streakInfo
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
