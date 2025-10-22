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
  // CharacterSection용: 전체 누적 진행률 계산 (daily_goal 반영)
  async getUserProgress(uid) {
    try {
      // pg-promise의 task를 사용하여 여러 쿼리를 순차 실행
      const result = await db.task(async t => {
        // 1. 기본 정보 조회
        const baseInfo = await t.oneOrNone(
          `SELECT
            u.daily_goal,
            COALESCE(up.last_studied_day, 1) as current_day,
            COALESCE(up.last_studied_question_id, 0) as last_question_id,
            COALESCE(q.question_number, 0) as current_question_number
          FROM users u
          LEFT JOIN user_progress up ON u.uid = up.user_id AND up.category_id = 4
          LEFT JOIN questions q ON q.question_id = up.last_studied_question_id
          WHERE u.uid = $1`,
          [uid]
        );

        if (!baseInfo) {
          return { current: 0, total: 0, percentage: 0 };
        }

        const { daily_goal, current_day, current_question_number } = baseInfo;

        // 2. 시작 Day 계산 (daily_goal 고려)
        // 예: daily_goal=2이고 current_day=2이면, 시작 Day는 1
        const startDay = Math.max(1, current_day - daily_goal + 1);

        // 3. 누적 current 계산: 시작 Day부터 현재 Day까지의 모든 문제 수
        let cumulativeCurrent = 0;

        // 시작 Day부터 현재 Day 이전까지의 모든 문제 수 합산
        for (let day = startDay; day < current_day; day++) {
          const dayResult = await t.oneOrNone(
            `SELECT MAX(question_number) as total
             FROM questions
             WHERE day = $1`,
            [day]
          );
          cumulativeCurrent += (dayResult?.total || 0);
        }

        // 현재 Day의 완료한 문제 수 추가
        cumulativeCurrent += current_question_number;

        // 4. daily_goal만큼의 Day들의 총 문제 수 계산
        let totalQuestionsForGoal = 0;
        for (let i = 0; i < daily_goal; i++) {
          const dayResult = await t.oneOrNone(
            `SELECT MAX(question_number) as total
             FROM questions
             WHERE day = $1`,
            [startDay + i]
          );
          totalQuestionsForGoal += (dayResult?.total || 0);
        }

        // 5. percentage 계산
        const percentage = totalQuestionsForGoal > 0
          ? Math.round((cumulativeCurrent / totalQuestionsForGoal) * 100)
          : 0;

        return {
          current: cumulativeCurrent,
          total: totalQuestionsForGoal,
          percentage
        };
      });

      return result;
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
          (SELECT COUNT(*) FROM wrong_answers WHERE user_id = $1 ) as wrong_answers_count`,
        [uid]
      );

      if (result) {
        return [
          {
            category_id: 5,
            count: parseInt(result.wrong_answers_count) || 0,
          },
          {
            category_id: 6,
            count: parseInt(result.favorites_count) || 0
          }
        ];
      }

      return [
        { category_id: 5, count: 0 },
        { category_id: 6, count: 0 }
      ];
    } catch (error) {
      console.error('getPersonalQuizzes query error:', error);
      throw new Error('Failed to fetch personal quizzes');
    }
  }

  // 최근 학습 기록 조회 (Model Example, Small Talk, Cases in Point만)
  async getUserHistory(uid) {
    try {
      const result = await db.manyOrNone(
        `SELECT
          up.category_id as id,
          up.last_studied_day,
          up.last_studied_question_id,
          up.last_studied_timestamp as timestamp,
          -- Day 내 총 문제 수
          (SELECT COUNT(*)
           FROM questions
           WHERE category_id = up.category_id AND day = up.last_studied_day) as total_questions,
          -- 마지막으로 푼 문제의 question_number (Day 내 순서)
          (SELECT question_number
           FROM questions
           WHERE question_id = up.last_studied_question_id) as completed_question_number
        FROM user_progress up
        WHERE up.user_id = $1
          AND up.category_id IN (1, 2, 3)
          AND up.last_studied_timestamp IS NOT NULL
        ORDER BY up.last_studied_timestamp DESC`,
        [uid]
      );

      return result || [];
    } catch (error) {
      console.error('getUserHistory query error:', error);
      throw new Error('Failed to fetch user history');
    }
  }
}

module.exports = new UserQueries();