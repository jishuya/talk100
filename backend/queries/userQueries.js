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
      console.log('📊 [Get User Progress] Fetching for uid:', uid);

      const result = await db.oneOrNone(
        `SELECT
          up.solved_count,
          up.last_studied_timestamp,
          u.daily_goal as total,
          CASE
            WHEN DATE(up.last_studied_timestamp) = CURRENT_DATE THEN up.solved_count
            ELSE 0
          END as current
        FROM users u
        LEFT JOIN user_progress up ON up.user_id = u.uid AND up.category_id = 4
        WHERE u.uid = $1`,
        [uid]
      );

      // 데이터가 없으면 기본값 반환
      if (!result) {
        return { current: 0, total: 20, percentage: 0 };
      }

      const current = result.current || 0;
      const total = result.total || 20;
      const percentage = Math.round((current / total) * 100);

      console.log('✅ [Get User Progress] Result:', { current, total, percentage });

      return {
        current,
        total,
        percentage
      };
    } catch (error) {
      console.error('❌ [Get User Progress] Query error:', error);
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

  // 통계 - StreakSection 데이터 조회
  async getStreakData(uid) {
    try {
      console.log('🔥 [Get Streak Data] Fetching for uid:', uid);

      const result = await db.one(
        `SELECT
          current_streak as current,
          longest_streak as best
         FROM users
         WHERE uid = $1`,
        [uid]
      );

      console.log('✅ [Get Streak Data] Result:', result);

      return {
        current: parseInt(result.current) || 0,
        best: parseInt(result.best) || 0
      };

    } catch (error) {
      console.error('❌ [Get Streak Data] Query error:', error);
      throw new Error('Failed to fetch streak data');
    }
  }

  // 통계 - WeeklyChart 데이터 조회 (요일별 학습 문제 수)
  async getWeeklyChart(uid, period = 'week') {
    try {
      console.log('📊 [Get Weekly Chart] Fetching for uid:', uid, 'period:', period);

      // 기간 계산
      let startDate;

      switch(period) {
        case 'week':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
          break;
        case 'all':
          startDate = new Date('1970-01-01');
          break;
        default:
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
      }

      // 요일별 학습 문제 수 조회 (0=일요일, 1=월요일, ..., 6=토요일)
      let results;

      if (period === 'week') {
        // 주간: 각 요일에 푼 총 문제 수
        results = await db.any(
          `SELECT
            EXTRACT(DOW FROM date) as day_of_week,
            SUM(questions_attempted) as question_count
           FROM daily_summary
           WHERE user_id = $1
             AND date >= $2
             AND date <= CURRENT_DATE
             AND questions_attempted > 0
           GROUP BY EXTRACT(DOW FROM date)
           ORDER BY day_of_week`,
          [uid, startDate.toISOString().split('T')[0]]
        );
      } else {
        // 월간/전체: 각 요일의 평균 문제 수
        results = await db.any(
          `SELECT
            EXTRACT(DOW FROM date) as day_of_week,
            ROUND(AVG(questions_attempted)) as question_count
           FROM daily_summary
           WHERE user_id = $1
             AND date >= $2
             AND date <= CURRENT_DATE
             AND questions_attempted > 0
           GROUP BY EXTRACT(DOW FROM date)
           ORDER BY day_of_week`,
          [uid, startDate.toISOString().split('T')[0]]
        );
      }

      // 요일 이름 매핑 (한글)
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

      // 7일 배열 초기화 (일~토)
      const weeklyData = dayNames.map((day, index) => ({
        day: day,
        count: 0
      }));

      // DB 결과를 배열에 매핑
      results.forEach(row => {
        const dayIndex = parseInt(row.day_of_week);
        weeklyData[dayIndex].count = parseInt(row.question_count) || 0;
      });

      console.log('✅ [Get Weekly Chart] Result:', weeklyData);

      return weeklyData;

    } catch (error) {
      console.error('❌ [Get Weekly Chart] Query error:', error);
      throw new Error('Failed to fetch weekly chart data');
    }
  }

  // 통계 - SummaryCard 데이터 조회 (기간별)
  async getSummaryStats(uid, period = 'week') {
    try {
      console.log('📊 [Get Summary Stats] Fetching for uid:', uid, 'period:', period);

      // 기간 계산
      let startDate;

      switch(period) {
        case 'week':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
          break;
        case 'all':
          startDate = new Date('1970-01-01');
          break;
        default:
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
      }

      const result = await db.one(
        `SELECT
          -- 1. 총 학습일수 (기간 내)
          COUNT(DISTINCT ds.date) as total_days,

          -- 2. 학습한 문제 수 (기간 내, DISTINCT로 중복 제거)
          (
            SELECT COUNT(DISTINCT qa.question_id)
            FROM question_attempts qa
            WHERE qa.user_id = $1
              AND qa.date >= $2
              AND qa.date <= CURRENT_DATE
          ) as studied_questions,

          -- 3. 일평균 학습 문제 수 (학습한 날 기준)
          CASE
            WHEN COUNT(DISTINCT ds.date) > 0 THEN
              ROUND(
                (
                  SELECT COUNT(DISTINCT qa.question_id)
                  FROM question_attempts qa
                  WHERE qa.user_id = $1
                    AND qa.date >= $2
                    AND qa.date <= CURRENT_DATE
                )::numeric / COUNT(DISTINCT ds.date)::numeric,
                1
              )
            ELSE 0
          END as daily_average,

          -- 4. 복습 표시 문제 수 (wrong_answers 테이블)
          (
            SELECT COUNT(*)
            FROM wrong_answers wa
            WHERE wa.user_id = $1
          ) as review_count

        FROM daily_summary ds
        WHERE ds.user_id = $1
          AND ds.date >= $2
          AND ds.date <= CURRENT_DATE
          AND ds.questions_attempted > 0`,
        [uid, startDate.toISOString().split('T')[0]]
      );

      console.log('✅ [Get Summary Stats] Result:', result);

      return {
        totalDays: parseInt(result.total_days) || 0,
        studiedQuestions: parseInt(result.studied_questions) || 0,
        dailyAverage: parseFloat(result.daily_average) || 0,
        reviewCount: parseInt(result.review_count) || 0
      };

    } catch (error) {
      console.error('❌ [Get Summary Stats] Query error:', error);
      throw new Error('Failed to fetch summary stats');
    }
  }
}

module.exports = new UserQueries();