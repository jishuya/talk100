const { db } = require('../config/database');

class QuizQueries {
  /**
   * 오늘의 퀴즈 - 진행률 + 남은 문제들 조회
   * @param {string} userId - 사용자 ID
   * @returns {Object} { quiz_type, day, progress, questions }
   */
  async getTodayQuizQuestions(userId) {
    try {
      const result = await db.task(async t => {
        // 1. 사용자 진행 상황 조회
        const progressInfo = await t.oneOrNone(
          `SELECT
            up.last_studied_day,
            up.last_studied_question_id,
            -- 완료한 문제 번호
            (SELECT question_number
             FROM questions
             WHERE question_id = up.last_studied_question_id) as completed,
            -- 해당 Day의 총 문제 수
            (SELECT MAX(question_number)
             FROM questions
             WHERE day = up.last_studied_day) as total
          FROM user_progress up
          WHERE up.user_id = $1 AND up.category_id = 4`,
          [userId]
        );

        // 신규 사용자인 경우 기본값
        let targetDay = 1;
        let startQuestionNumber = 1;
        let completed = 0;
        let total = 13; // 기본값

        if (progressInfo && progressInfo.last_studied_day) {
          targetDay = progressInfo.last_studied_day;
          completed = progressInfo.completed || 0;
          total = progressInfo.total || 0;
          startQuestionNumber = (progressInfo.completed || 0) + 1;

          // 현재 Day 완료 여부 확인
          if (startQuestionNumber > total) {
            // 다음 Day로 이동
            targetDay = targetDay + 1;
            startQuestionNumber = 1;
            completed = 0;

            // 다음 Day의 총 문제 수 조회
            const nextDayTotal = await t.oneOrNone(
              `SELECT MAX(question_number) as max_num
               FROM questions
               WHERE day = $1`,
              [targetDay]
            );
            total = nextDayTotal?.max_num || 0;
          }
        } else {
          // 신규 사용자: Day 1의 총 문제 수 조회
          const firstDayTotal = await t.oneOrNone(
            `SELECT MAX(question_number) as max_num
             FROM questions
             WHERE day = 1`,
            []
          );
          total = firstDayTotal?.max_num || 0;
        }

        // 2. 남은 문제들 조회 (startQuestionNumber부터 끝까지)
        // 즐겨찾기(favorites), 틀린문제(wrong_answers) 여부 포함
        const questions = await t.manyOrNone(
          `SELECT
            q.question_id,
            q.category_id,
            q.day,
            q.question_number,
            q.question_type,
            q.korean,
            q.english,
            q.korean_a,
            q.english_a,
            q.korean_b,
            q.english_b,
            q.audio_male,
            q.audio_female,
            q.audio_male_a,
            q.audio_female_a,
            q.audio_male_b,
            q.audio_female_b,
            q.keywords,
            -- 즐겨찾기 여부
            CASE WHEN f.question_id IS NOT NULL THEN true ELSE false END as is_favorite,
            -- 틀린문제 여부
            CASE WHEN w.question_id IS NOT NULL THEN true ELSE false END as is_wrong_answer
          FROM questions q
          LEFT JOIN favorites f ON f.question_id = q.question_id AND f.user_id = $3
          LEFT JOIN wrong_answers w ON w.question_id = q.question_id AND w.user_id = $3
          WHERE q.day = $1 AND q.question_number >= $2
          ORDER BY q.question_number ASC`,
          [targetDay, startQuestionNumber, userId]
        );

        // 3. Progress 계산
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          quiz_type: 'daily',
          day: targetDay,
          progress: {
            completed,
            total,
            percentage
          },
          questions: questions || []
        };
      });

      return result;
    } catch (error) {
      console.error('getTodayQuizQuestions query error:', error);
      throw new Error('Failed to get today quiz with progress');
    }
  }

}

module.exports = new QuizQueries();
