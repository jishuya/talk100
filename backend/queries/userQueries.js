const { db } = require('../config/database');

class UserQueries {
  // 사용자 프로필 조회 (MyPage용)
  async getUserProfile(uid) {
    try {
      const result = await db.oneOrNone(
        `SELECT
           name,
           email,
           profile_image,
           level,
           voice_gender,
           profile_image as custom_avatar,
           total_questions_attempted,
           total_correct_answers,
           total_days_studied,
           current_streak,
           longest_streak
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
        // 기존 사용자의 정보 업데이트 (이름, 이메일, 마지막 로그인 시간)
        user = await db.one(
          `UPDATE users
           SET name = $2, email = $3, last_login_at = NOW()
           WHERE uid = $1
           RETURNING *`,
          [userData.uid, userData.name, userData.email]
        );
      } else {
        // 새 사용자 생성
        user = await db.one(
          `INSERT INTO users (
             uid, name, email, profile_image, voice_gender,
             default_difficulty, daily_goal, level, created_at, last_login_at
           ) VALUES ($1, $2, $3, $4, $5, $6, 10, 1, NOW(), NOW())
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

      // 모든 카테고리(1,2,3)를 반환하되, user_progress가 없어도 기본 정보는 제공
      const result = await db.manyOrNone(
        `SELECT
          c.category_id as id,
          c.display_name as category_name,
          up.last_studied_day,
          up.last_studied_question_id,
          up.last_studied_timestamp as timestamp,
          -- Day 내 총 문제 수
          (SELECT COUNT(*)
           FROM questions
           WHERE category_id = c.category_id AND day = COALESCE(up.last_studied_day, 1)) as total_questions,
          -- 마지막으로 푼 문제의 question_number (Day 내 순서)
          (SELECT question_number
           FROM questions
           WHERE question_id = up.last_studied_question_id) as completed_question_number,
          -- 카테고리 전체 완료 문제 수
          (SELECT COUNT(DISTINCT qa.question_id)
           FROM question_attempts qa
           JOIN questions q ON qa.question_id = q.question_id
           WHERE qa.user_id = $1 AND q.category_id = c.category_id) as category_completed,
          -- 카테고리 전체 문제 수
          (SELECT COUNT(*)
           FROM questions q
           WHERE q.category_id = c.category_id) as category_total
        FROM category c
        LEFT JOIN user_progress up ON c.category_id = up.category_id AND up.user_id = $1
        WHERE c.category_id IN (1, 2, 3)
        ORDER BY c.order_num`,
        [uid]
      );

      return result || [];
    } catch (error) {
      console.error('❌ [getUserHistory] Query error:', error);
      throw new Error('Failed to fetch user history');
    }
  }

  // 통계 - StreakSection 데이터 조회
  async getStreakData(uid) {
    try {

      const result = await db.one(
        `SELECT
          current_streak as current,
          longest_streak as best
         FROM users
         WHERE uid = $1`,
        [uid]
      );


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


      return weeklyData;

    } catch (error) {
      console.error('❌ [Get Weekly Chart] Query error:', error);
      throw new Error('Failed to fetch weekly chart data');
    }
  }

  // 통계 - SummaryCard 데이터 조회 (기간별)
  async getSummaryStats(uid, period = 'week') {
    try {

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

  // 통계 - CategoryProgress 데이터 조회 (카테고리별 진행률)
  async getCategoryProgress(uid) {
    try {

      const results = await db.any(
        `SELECT
          c.category_id,
          c.display_name as name,
          -- 실제 푼 문제 수 (DISTINCT로 중복 제거)
          COUNT(DISTINCT qa.question_id) as completed_questions,
          -- 해당 카테고리의 전체 문제 수
          (
            SELECT COUNT(*)
            FROM questions q2
            WHERE q2.category_id = c.category_id
          ) as total_questions,
          -- 완료한 Day 수 (completed_days 테이블에서)
          (
            SELECT COUNT(*)
            FROM completed_days cd
            WHERE cd.user_id = $1
              AND cd.category_id = c.category_id
          ) as completed_days
        FROM category c
        -- 전체 문제 수를 구하기 위해 questions와 LEFT JOIN
        LEFT JOIN questions q ON c.category_id = q.category_id
        -- 사용자가 실제 푼 문제만 가져오기 위해 LEFT JOIN
        LEFT JOIN question_attempts qa
          ON q.question_id = qa.question_id
          AND qa.user_id = $1
        WHERE c.category_id IN (1, 2, 3)  -- Model, Small Talk, Cases만
        GROUP BY c.category_id, c.display_name, c.order_num
        ORDER BY c.order_num`,
        [uid]
      );

      // 데이터 변환
      const categoryProgress = results.map(row => ({
        categoryId: parseInt(row.category_id),
        name: row.name,
        completed: parseInt(row.completed_questions) || 0,
        total: parseInt(row.total_questions) || 0,
        completedDays: parseInt(row.completed_days) || 0,
        totalDays: 100  // 각 카테고리는 100 Day로 구성
      }));


      return categoryProgress;

    } catch (error) {
      console.error('❌ [Get Category Progress] Query error:', error);
      throw new Error('Failed to fetch category progress');
    }
  }

  // 통계 - LearningPattern 데이터 조회 (학습 패턴 분석)
  async getLearningPattern(uid, period = 'week') {
    try {

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
          -- 1. 일평균 학습 문제 수 (기간별)
          COALESCE(ROUND(AVG(ds.questions_attempted), 1), 0) as daily_avg_questions,

          -- 2. 일일목표 완료 횟수 (기간별)
          COALESCE(SUM(CASE WHEN ds.goal_met = true THEN 1 ELSE 0 END), 0) as total_days_completed,

          -- 3. 복습 필요 문제 수 (전체 - 기간 무관)
          (SELECT COUNT(*) FROM wrong_answers WHERE user_id = $1) as review_questions,

          -- 4. 즐겨찾기 문제 수 (전체 - 기간 무관)
          (SELECT COUNT(*) FROM favorites WHERE user_id = $1) as favorites

        FROM daily_summary ds
        WHERE ds.user_id = $1
          AND ds.date >= $2
          AND ds.date <= CURRENT_DATE
          AND ds.questions_attempted > 0`,
        [uid, startDate.toISOString().split('T')[0]]
      );


      return {
        dailyAvgQuestions: parseFloat(result.daily_avg_questions) || 0,
        totalDaysCompleted: parseInt(result.total_days_completed) || 0,
        reviewQuestions: parseInt(result.review_questions) || 0,
        favorites: parseInt(result.favorites) || 0
      };

    } catch (error) {
      console.error('❌ [Get Learning Pattern] Query error:', error);
      throw new Error('Failed to fetch learning pattern');
    }
  }

  // MyPage - Summary 데이터 조회 (오늘 학습, 주간 출석, 주간 학습 문제)
  async getMypageSummary(uid) {
    try {

      // 주간 시작일 계산 (오늘 기준 7일 전)
      const weekStartDate = new Date();
      weekStartDate.setDate(weekStartDate.getDate() - 7);

      const result = await db.one(
        `SELECT
          -- 1. 오늘 학습한 문제 수
          (
            SELECT COUNT(DISTINCT qa.question_id)
            FROM question_attempts qa
            WHERE qa.user_id = $1
              AND qa.date = CURRENT_DATE
          ) as today_questions,

          -- 2. 주간 출석일 (최근 7일 중 학습한 일수)
          (
            SELECT COUNT(DISTINCT ds.date)
            FROM daily_summary ds
            WHERE ds.user_id = $1
              AND ds.date >= $2
              AND ds.date <= CURRENT_DATE
              AND ds.questions_attempted > 0
          ) as weekly_attendance,

          -- 3. 주간 학습한 문제 수 (최근 7일간 푼 고유 문제 수)
          (
            SELECT COUNT(DISTINCT qa.question_id)
            FROM question_attempts qa
            WHERE qa.user_id = $1
              AND qa.date >= $2
              AND qa.date <= CURRENT_DATE
          ) as weekly_questions`,
        [uid, weekStartDate.toISOString().split('T')[0]]
      );


      return {
        todayQuestions: parseInt(result.today_questions) || 0,
        weeklyAttendance: parseInt(result.weekly_attendance) || 0,
        weeklyQuestions: parseInt(result.weekly_questions) || 0
      };

    } catch (error) {
      console.error('❌ [Get MyPage Summary] Query error:', error);
      throw new Error('Failed to fetch mypage summary');
    }
  }

  // 학습 목표 조회
  async getGoals(uid) {
    try {

      const result = await db.oneOrNone(
        `SELECT
           daily_goal as "dailyGoal",
           attendance_goal as "weeklyAttendance",
           quiz_count_goal as "weeklyTotalQuiz"
         FROM users
         WHERE uid = $1`,
        [uid]
      );


      return result || {
        dailyGoal: 10,
        weeklyAttendance: 3,
        weeklyTotalQuiz: 30
      };

    } catch (error) {
      console.error('❌ [Get Goals] Query error:', error);
      throw new Error('Failed to fetch goals');
    }
  }

  // 학습 목표 업데이트
  async updateGoals(uid, goals) {
    try {

      const { dailyGoal, weeklyAttendance, weeklyTotalQuiz } = goals;

      // 동적 쿼리 빌드
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      if (dailyGoal !== undefined) {
        updateFields.push(`daily_goal = $${paramIndex++}`);
        values.push(dailyGoal);
      }

      if (weeklyAttendance !== undefined) {
        updateFields.push(`attendance_goal = $${paramIndex++}`);
        values.push(weeklyAttendance);
      }

      if (weeklyTotalQuiz !== undefined) {
        updateFields.push(`quiz_count_goal = $${paramIndex++}`);
        values.push(weeklyTotalQuiz);
      }

      // 업데이트할 필드가 없으면 리턴
      if (updateFields.length === 0) {
        return;
      }

      // uid를 마지막 파라미터로 추가
      values.push(uid);

      const query = `
        UPDATE users
        SET ${updateFields.join(', ')}
        WHERE uid = $${paramIndex}
      `;


      await db.none(query, values);


    } catch (error) {
      console.error('❌ [Update Goals] Query error:', error);
      throw new Error('Failed to update goals');
    }
  }

  // 프로필 업데이트 (이름, 이메일)
  async updateProfile(uid, profileData) {
    try {

      const { name, email } = profileData;

      // 동적 쿼리 빌드
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      if (name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        values.push(name);
      }

      if (email !== undefined) {
        updateFields.push(`email = $${paramIndex++}`);
        values.push(email);
      }

      // 업데이트할 필드가 없으면 리턴
      if (updateFields.length === 0) {
        return;
      }

      // uid를 마지막 파라미터로 추가
      values.push(uid);

      const query = `
        UPDATE users
        SET ${updateFields.join(', ')}
        WHERE uid = $${paramIndex}
      `;


      await db.none(query, values);


    } catch (error) {
      console.error('❌ [Update Profile] Query error:', error);
      throw new Error('Failed to update profile');
    }
  }

  // 퀴즈 모드 조회
  async getQuizMode(uid) {
    try {

      const result = await db.oneOrNone(
        `SELECT quiz_mode FROM users WHERE uid = $1`,
        [uid]
      );


      return result ? result.quiz_mode : 'voice';

    } catch (error) {
      console.error('❌ [Get Quiz Mode] Query error:', error);
      throw new Error('Failed to fetch quiz mode');
    }
  }

  // 퀴즈 모드 업데이트
  async updateQuizMode(uid, quizMode) {
    try {

      // 유효성 검사
      if (!['voice', 'keyboard'].includes(quizMode)) {
        throw new Error('Invalid quiz mode. Must be "voice" or "keyboard"');
      }

      await db.none(
        `UPDATE users SET quiz_mode = $1 WHERE uid = $2`,
        [quizMode, uid]
      );


    } catch (error) {
      console.error('❌ [Update Quiz Mode] Query error:', error);
      throw new Error('Failed to update quiz mode');
    }
  }

  // 음성 성별 업데이트
  async updateVoiceGender(uid, voiceGender) {
    try {

      // 유효성 검사
      const validVoices = ['us_male', 'us_female', 'uk_male', 'uk_female'];
      if (!validVoices.includes(voiceGender)) {
        throw new Error('Invalid voice gender. Must be one of: us_male, us_female, uk_male, uk_female');
      }

      await db.none(
        `UPDATE users SET voice_gender = $1 WHERE uid = $2`,
        [voiceGender, uid]
      );


    } catch (error) {
      console.error('❌ [Update Voice Gender] Query error:', error);
      throw new Error('Failed to update voice gender');
    }
  }

  // 파워암기모드 설정 조회
  async getPowerMemoryMode(uid) {
    try {
      const result = await db.oneOrNone(
        `SELECT power_memory_mode FROM users WHERE uid = $1`,
        [uid]
      );

      // 기본값
      const defaultSettings = {
        koreanVoice: 'female',
        answerTime: 3,
        englishVoices: ['male']
      };

      return result?.power_memory_mode || defaultSettings;
    } catch (error) {
      console.error('❌ [Get Power Memory Mode] Query error:', error);
      throw new Error('Failed to fetch power memory mode');
    }
  }

  // 파워암기모드 설정 업데이트
  async updatePowerMemoryMode(uid, settings) {
    try {
      await db.none(
        `UPDATE users SET power_memory_mode = $1 WHERE uid = $2`,
        [settings, uid]
      );
    } catch (error) {
      console.error('❌ [Update Power Memory Mode] Query error:', error);
      throw new Error('Failed to update power memory mode');
    }
  }
}

module.exports = new UserQueries();