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
           -- 오늘 공부해야 할 DAY 번호 (마지막 학습 Day + 1)
           COALESCE(
             (SELECT MAX(last_studied_day) + 1 FROM user_progress WHERE user_id = $1),
             1
           ) as today_day,

           -- 해당 DAY의 총 문제 수
           (SELECT COUNT(*)
            FROM questions q
            WHERE q.day = COALESCE(
              (SELECT MAX(last_studied_day) + 1 FROM user_progress WHERE user_id = $1),
              1
            )
           ) as day_total_questions,

           -- 사용자 일일 목표
           u.daily_goal,

           -- 해당 DAY에서 푼 문제 수 (정답 여부 상관없이)
           COALESCE(
             (SELECT COUNT(*)
              FROM user_progress up
              JOIN questions q ON up.question_id = q.question_id
              WHERE up.user_id = $1
              AND q.day = COALESCE(
                (SELECT MAX(last_studied_day) + 1 FROM user_progress WHERE user_id = $1),
                1
              )
              AND up.total_attempts > 0
             ), 0
           ) as day_solved_questions

         FROM users u
         WHERE u.uid = $1`,
        [uid]
      );

      if (!result) {
        return null;
      }

      // total = daily_goal × 해당 DAY의 문제 수
      const total = (result.daily_goal || 1) * (result.day_total_questions || 0);

      // current = 해당 DAY에서 푼 문제 수
      const current = result.day_solved_questions || 0;

      // percentage 계산
      const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

      return {
        current,
        total,
        percentage
      };
    } catch (error) {
      console.error('getUserProgress query error:', error);
      throw new Error('Failed to fetch user progress');
    }
  }
}

module.exports = new UserQueries();