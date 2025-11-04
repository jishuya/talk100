const { db } = require('../config/database');

class BackupQueries {
  // 사용자의 모든 학습 기록 백업 데이터 조회
  async getUserBackupData(userId) {
    try {
      const backupData = {
        exportDate: new Date().toISOString(),
        userId: userId
      };

      // 1. 사용자 프로필 정보
      backupData.userProfile = await db.one(
        `SELECT uid, name, email, profile_image, level, daily_goal,
                total_questions_attempted, total_correct_answers,
                total_days_studied, current_streak, longest_streak,
                created_at, last_login_at
         FROM users
         WHERE uid = $1`,
        [userId]
      );

      // 2. 학습 진행률 (모든 카테고리)
      backupData.userProgress = await db.any(
        `SELECT category_id, last_studied_day, last_studied_question_id,
                last_studied_timestamp, solved_count
         FROM user_progress
         WHERE user_id = $1
         ORDER BY category_id`,
        [userId]
      );

      // 3. 문제 시도 기록 (최근 1000개)
      backupData.questionAttempts = await db.any(
        `SELECT qa.question_id, qa.date, qa.attempted_at,
                q.korean, q.english, q.category_id, q.day
         FROM question_attempts qa
         JOIN questions q ON qa.question_id = q.question_id
         WHERE qa.user_id = $1
         ORDER BY qa.attempted_at DESC
         LIMIT 1000`,
        [userId]
      );

      // 4. 틀린 문제 목록
      backupData.wrongAnswers = await db.any(
        `SELECT wa.question_id, wa.wrong_count, wa.added_at,
                q.korean, q.english, q.category_id, q.day
         FROM wrong_answers wa
         JOIN questions q ON wa.question_id = q.question_id
         WHERE wa.user_id = $1
         ORDER BY wa.added_at DESC`,
        [userId]
      );

      // 5. 즐겨찾기 목록
      backupData.favorites = await db.any(
        `SELECT f.question_id, f.added_at,
                q.korean, q.english, q.category_id, q.day
         FROM favorites f
         JOIN questions q ON f.question_id = q.question_id
         WHERE f.user_id = $1
         ORDER BY f.added_at DESC`,
        [userId]
      );

      // 6. 일일 통계 (최근 365일)
      backupData.dailySummary = await db.any(
        `SELECT date, questions_attempted, days_completed, goal_met
         FROM daily_summary
         WHERE user_id = $1
         AND date >= CURRENT_DATE - INTERVAL '365 days'
         ORDER BY date DESC`,
        [userId]
      );

      // 7. 복습 큐
      backupData.reviewQueue = await db.any(
        `SELECT source_day, interval_days, scheduled_for, last_reviewed, review_count
         FROM review_queue
         WHERE user_id = $1
         ORDER BY scheduled_for`,
        [userId]
      );

      // 8. 앱 설정 (테이블이 없으면 null)
      try {
        backupData.settings = await db.oneOrNone(
          `SELECT difficulty, voice_speed, review_count, auto_play,
                  learning_reminder, reminder_time, review_reminder, weekly_report,
                  theme, font_size
           FROM settings
           WHERE user_id = $1`,
          [userId]
        );
      } catch (error) {
        console.warn('Settings table does not exist, using null:', error.message);
        backupData.settings = null;
      }

      // 9. 통계 요약
      const stats = await db.one(
        `SELECT
          COUNT(DISTINCT qa.question_id) as total_unique_questions,
          COUNT(*) as total_attempts,
          COUNT(DISTINCT DATE(qa.attempted_at)) as study_days
         FROM question_attempts qa
         WHERE qa.user_id = $1`,
        [userId]
      );
      backupData.statistics = stats;

      return backupData;

    } catch (error) {
      console.error('getUserBackupData query error:', error);
      throw error;
    }
  }

  // 데이터 내보내기용 통계 데이터 조회
  async getExportStatistics(userId) {
    try {
      // 1. 카테고리별 통계
      const categoryStats = await db.any(
        `SELECT
          q.category_id,
          c.name as category_name,
          COUNT(DISTINCT qa.question_id) as attempted_questions,
          COUNT(*) as total_attempts
         FROM question_attempts qa
         JOIN questions q ON qa.question_id = q.question_id
         JOIN category c ON q.category_id = c.category_id
         WHERE qa.user_id = $1
         GROUP BY q.category_id, c.name
         ORDER BY q.category_id`,
        [userId]
      );

      // 2. Day별 통계
      const dayStats = await db.any(
        `SELECT
          q.category_id,
          q.day,
          COUNT(DISTINCT qa.question_id) as attempted_questions,
          COUNT(*) as total_attempts
         FROM question_attempts qa
         JOIN questions q ON qa.question_id = q.question_id
         WHERE qa.user_id = $1
         GROUP BY q.category_id, q.day
         ORDER BY q.category_id, q.day`,
        [userId]
      );

      // 3. 일별 학습 기록 (최근 30일)
      const dailyStudy = await db.any(
        `SELECT
          date,
          questions_attempted,
          days_completed,
          goal_met
         FROM daily_summary
         WHERE user_id = $1
         AND date >= CURRENT_DATE - INTERVAL '30 days'
         ORDER BY date DESC`,
        [userId]
      );

      // 4. 문제별 상세 기록
      const questionDetails = await db.any(
        `SELECT
          q.question_id,
          q.korean,
          q.english,
          q.category_id,
          q.day,
          q.question_number,
          COUNT(qa.question_id) as attempt_count,
          MAX(qa.attempted_at) as last_attempted,
          CASE WHEN f.question_id IS NOT NULL THEN true ELSE false END as is_favorite,
          CASE WHEN wa.question_id IS NOT NULL THEN true ELSE false END as is_wrong_answer,
          wa.wrong_count
         FROM questions q
         LEFT JOIN question_attempts qa ON q.question_id = qa.question_id AND qa.user_id = $1
         LEFT JOIN favorites f ON q.question_id = f.question_id AND f.user_id = $1
         LEFT JOIN wrong_answers wa ON q.question_id = wa.question_id AND wa.user_id = $1
         WHERE qa.user_id = $1
         GROUP BY q.question_id, q.korean, q.english, q.category_id, q.day,
                  q.question_number, f.question_id, wa.question_id, wa.wrong_count
         ORDER BY q.category_id, q.day, q.question_number`,
        [userId]
      );

      return {
        categoryStats,
        dayStats,
        dailyStudy,
        questionDetails
      };

    } catch (error) {
      console.error('getExportStatistics query error:', error);
      throw error;
    }
  }

  // 사용자 학습 기록 초기화
  async resetUserLearningData(userId) {
    try {
      await db.tx(async t => {
        // 1. 학습 기록 테이블 삭제
        await t.none('DELETE FROM question_attempts WHERE user_id = $1', [userId]);
        await t.none('DELETE FROM user_progress WHERE user_id = $1', [userId]);
        await t.none('DELETE FROM wrong_answers WHERE user_id = $1', [userId]);
        await t.none('DELETE FROM favorites WHERE user_id = $1', [userId]);
        await t.none('DELETE FROM daily_summary WHERE user_id = $1', [userId]);
        await t.none('DELETE FROM review_queue WHERE user_id = $1', [userId]);

        // 2. users 테이블의 통계 필드만 초기화
        await t.none(`
          UPDATE users SET
            total_questions_attempted = 0,
            total_correct_answers = 0,
            total_days_studied = 0,
            current_streak = 0,
            longest_streak = 0,
            level = 1,
            weekly_attendance = ARRAY[0,0,0,0,0,0,0],
            earned_badges = '[]'::jsonb
          WHERE uid = $1
        `, [userId]);
      });

      return { success: true };
    } catch (error) {
      console.error('resetUserLearningData query error:', error);
      throw error;
    }
  }

  // 사용자 계정 완전 삭제
  async deleteUserAccount(userId) {
    try {
      await db.tx(async t => {
        // 1. 학습 기록 테이블 삭제 (CASCADE로 자동 삭제되지만 명시적으로 삭제)
        await t.none('DELETE FROM question_attempts WHERE user_id = $1', [userId]);
        await t.none('DELETE FROM user_progress WHERE user_id = $1', [userId]);
        await t.none('DELETE FROM wrong_answers WHERE user_id = $1', [userId]);
        await t.none('DELETE FROM favorites WHERE user_id = $1', [userId]);
        await t.none('DELETE FROM daily_summary WHERE user_id = $1', [userId]);
        await t.none('DELETE FROM review_queue WHERE user_id = $1', [userId]);

        // 2. 사용자 설정 삭제 (user_settings 테이블이 존재하면)
        try {
          await t.none('DELETE FROM user_settings WHERE user_id = $1', [userId]);
        } catch (error) {
          console.warn('user_settings table does not exist or already deleted:', error.message);
        }

        // 3. 세션 삭제 (session 테이블에서 해당 사용자의 세션 제거)
        // session 테이블의 sess 컬럼은 JSON 타입이며, passport.user 필드에 uid가 저장됨
        await t.none(`DELETE FROM session WHERE sess::jsonb->'passport'->>'user' = $1`, [userId]);

        // 4. 사용자 계정 삭제 (users 테이블)
        // CASCADE 설정으로 인해 연관된 모든 데이터가 자동 삭제됨
        await t.none('DELETE FROM users WHERE uid = $1', [userId]);
      });

      return { success: true };
    } catch (error) {
      console.error('deleteUserAccount query error:', error);
      throw error;
    }
  }
}

module.exports = new BackupQueries();
