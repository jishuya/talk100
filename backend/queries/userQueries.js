const { db } = require('../config/database');

class UserQueries {
  // 사용자 프로필 조회 (name, goal, level)
  async getUserProfile(uid) {
    try {
      const result = await db.oneOrNone(
        `SELECT
           name,
           daily_goal as goal,
           level
         FROM users
         WHERE uid = $1`,
        [uid]
      );

      return result;
    } catch (error) {
      console.error('getUserProfile query error:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  // 인증 미들웨어용 사용자 조회
  async findUserByUid(uid) {
    try {
      const result = await db.oneOrNone(
        `SELECT * FROM users WHERE uid = $1`,
        [uid]
      );

      return result;
    } catch (error) {
      console.error('findUserByUid query error:', error);
      throw new Error('Failed to find user');
    }
  }

  // 사용자 뱃지 정보 조회 (days, questions)
  async getUserBadges(uid) {

    try {
      const result = await db.oneOrNone(
        `SELECT
           total_days_studied as days,
           total_questions_attempted as questions

         FROM users
         WHERE uid = $1`,
        [uid]
      );

      return result;
    } catch (error) {
      console.error('getUserBadges query error:', error);
      throw new Error('Failed to fetch user badges');
    }
  }

  // OAuth 로그인용 사용자 생성 또는 조회
  async findOrCreateUser(userData) {
    try {
      // 기존 사용자 확인
      let user = await db.oneOrNone(
        `SELECT * FROM users WHERE uid = $1`,
        [userData.uid]
      );

      if (user) {
        // 기존 사용자의 정보 업데이트 (이름, 이메일, 프로필 이미지, 마지막 로그인 시간)
        user = await db.one(
          `UPDATE users
           SET name = $2, email = $3, profile_image = $4, last_login_at = NOW()
           WHERE uid = $1
           RETURNING *`,
          [userData.uid, userData.name, userData.email, userData.profile_image]
        );
      } else {
        // 새 사용자 생성
        user = await db.one(
          `INSERT INTO users (
             uid, name, email, profile_image, voice_gender,
             default_difficulty, daily_goal, level, created_at, last_login_at
           ) VALUES ($1, $2, $3, $4, $5, $6, 1, 1, NOW(), NOW())
           RETURNING *`,
          [
            userData.uid,
            userData.name,
            userData.email,
            userData.profile_image,
            userData.voice_gender || 'male',
            userData.default_difficulty || 2
          ]
        );
      }

      return user;
    } catch (error) {
      console.error('findOrCreateUser query error:', error);
      throw new Error('Failed to find or create user');
    }
  }

  // 사용자 진행률 정보 조회 (current, total, percentage)
  async getUserProgress(uid) {
    try {
      const result = await db.oneOrNone(
        `SELECT
          u.daily_goal,
          COALESCE(up.last_studied_day, 1) as current_day,
          COALESCE(up.last_studied_question_id, 0) as last_question_id,
          (SELECT COUNT(*) FROM questions WHERE day = COALESCE(up.last_studied_day, 1) AND category IN (1,2,3)) * u.daily_goal as total,
          (SELECT COUNT(*) FROM questions WHERE day = COALESCE(up.last_studied_day, 1) AND category IN (1,2,3) AND question_id <= COALESCE(up.last_studied_question_id, 0)) as current
        FROM users u
        LEFT JOIN user_progress up ON u.uid = up.user_id
        WHERE u.uid = $1`,
        [uid]
      );

      if (result) {
        const percentage = result.total > 0 ? Math.round((result.current / result.total) * 100) : 0;
        return {
          current: result.current,
          total: result.total,
          percentage: percentage
        };
      }

      return { current: 0, total: 0, percentage: 0 };
    } catch (error) {
      console.error('getUserProgress query error:', error);
      throw new Error('Failed to fetch user progress');
    }
  }

  // 개인 퀴즈 데이터 조회 (즐겨찾기, 틀린문제 개수)
  async getPersonalQuizzes(uid) {
    try {
      const result = await db.oneOrNone(
        `SELECT
          (SELECT COUNT(*) FROM favorites WHERE user_id = $1) as favorites_count,
          (SELECT COUNT(*) FROM wrong_answers WHERE user_id = $1 AND is_starred = true) as wrong_answers_count`,
        [uid]
      );

      if (result) {
        return [
          {
            id: 'wrong-answers',
            count: parseInt(result.wrong_answers_count) || 0
          },
          {
            id: 'favorites',
            count: parseInt(result.favorites_count) || 0
          }
        ];
      }

      return [
        { id: 'wrong-answers', count: 0 },
        { id: 'favorites', count: 0 }
      ];
    } catch (error) {
      console.error('getPersonalQuizzes query error:', error);
      throw new Error('Failed to fetch personal quizzes');
    }
  }
}

module.exports = new UserQueries();