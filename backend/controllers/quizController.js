const quizQueries = require('../queries/quizQueries');

class QuizController {
  /**
   * GET /api/quiz/questions?category={id}&day={num}
   * Day별 전체 문제 조회
   */
  async getQuestions(req, res) {
    try {
      const { category, day } = req.query;

      // 파라미터 검증
      if (!category || !day) {
        return res.status(400).json({
          success: false,
          message: 'Category and day parameters are required'
        });
      }

      const categoryId = parseInt(category);
      const dayNumber = parseInt(day);

      if (isNaN(categoryId) || isNaN(dayNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category or day parameter'
        });
      }

      // 문제 조회
      const questions = await quizQueries.getQuestionsByDay(categoryId, dayNumber);

      res.json({
        success: true,
        data: questions,
        meta: {
          category: categoryId,
          day: dayNumber,
          count: questions.length
        }
      });

    } catch (error) {
      console.error('getQuestions controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch questions'
      });
    }
  }

  /**
   * GET /api/quiz/question/:id
   * 특정 문제 조회
   */
  async getQuestion(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Question ID is required'
        });
      }

      const questionId = parseInt(id);

      if (isNaN(questionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid question ID'
        });
      }

      const question = await quizQueries.getQuestionById(questionId);

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      res.json({
        success: true,
        data: question
      });

    } catch (error) {
      console.error('getQuestion controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch question'
      });
    }
  }

  /**
   * GET /api/quiz/day-range?category={id}
   * 카테고리별 Day 범위 조회
   */
  async getDayRange(req, res) {
    try {
      const { category } = req.query;

      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category parameter is required'
        });
      }

      const categoryId = parseInt(category);

      if (isNaN(categoryId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category parameter'
        });
      }

      const dayRange = await quizQueries.getDayRange(categoryId);

      res.json({
        success: true,
        data: dayRange
      });

    } catch (error) {
      console.error('getDayRange controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch day range'
      });
    }
  }

  /**
   * GET /api/quiz/favorites
   * 즐겨찾기 문제 조회
   */
  async getFavorites(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const favorites = await quizQueries.getFavoriteQuestions(uid);

      res.json({
        success: true,
        data: favorites,
        meta: {
          count: favorites.length
        }
      });

    } catch (error) {
      console.error('getFavorites controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch favorite questions'
      });
    }
  }

  /**
   * GET /api/quiz/wrong-answers
   * 틀린 문제 조회
   */
  async getWrongAnswers(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const wrongAnswers = await quizQueries.getWrongAnswerQuestions(uid);

      res.json({
        success: true,
        data: wrongAnswers,
        meta: {
          count: wrongAnswers.length
        }
      });

    } catch (error) {
      console.error('getWrongAnswers controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch wrong answer questions'
      });
    }
  }

  /**
   * POST /api/quiz/session
   * 퀴즈 세션 생성 - 오늘의 퀴즈
   */
  async createSession(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { quiz_type } = req.body;

      // 현재는 오늘의 퀴즈(daily)만 지원
      if (quiz_type !== 'daily') {
        return res.status(400).json({
          success: false,
          message: 'Only daily quiz type is supported currently'
        });
      }

      // 오늘의 퀴즈 문제 조회
      const result = await quizQueries.getTodayQuizQuestions(uid);

      if (!result || !result.questions || result.questions.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No questions available for today\'s quiz'
        });
      }

      // 문제 데이터 전체 반환
      res.json({
        success: true,
        data: {
          quiz_type: 'daily',
          day: result.day,
          questions: result.questions,
          total_count: result.questions.length
        }
      });

    } catch (error) {
      console.error('createSession controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create quiz session'
      });
    }
  }
}

module.exports = new QuizController();
