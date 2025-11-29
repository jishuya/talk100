const quizQueries = require('../queries/quizQueries');

class QuizController {
  /**
   * GET /api/quiz/daily
   * 오늘의 퀴즈 조회 (인증 필수)
   */
  async getDailyQuiz(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required for daily quiz'
        });
      }

      const result = await quizQueries.getTodayQuizQuestions(uid);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('getDailyQuiz controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch daily quiz'
      });
    }
  }

  /**
   * GET /api/quiz/category/:categoryId
   * 카테고리별 퀴즈 조회 (인증 필수)
   * Query params: day (optional) - 특정 Day 문제 조회
   */
  async getCategoryQuiz(req, res) {
    try {
      const uid = req.user?.uid;
      const categoryId = parseInt(req.params.categoryId);
      const day = req.query.day ? parseInt(req.query.day) : null;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required for category quiz'
        });
      }

      // categoryId 유효성 검증 (1: Model Example, 2: Small Talk, 3: Cases in Point)
      if (!categoryId || categoryId < 1 || categoryId > 3) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID. Must be 1, 2, or 3'
        });
      }

      // day 유효성 검증 (1~100)
      if (day !== null && (day < 1 || day > 100)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid day. Must be between 1 and 100'
        });
      }

      const result = await quizQueries.getCategoryQuizQuestions(uid, categoryId, day);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('getCategoryQuiz controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category quiz'
      });
    }
  }

  /**
   * GET /api/quiz/wrong-answers
   * 틀린 문제 퀴즈 조회 (인증 필수)
   */
  async getWrongAnswersQuiz(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required for wrong answers quiz'
        });
      }

      const result = await quizQueries.getWrongAnswersQuiz(uid);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('getWrongAnswersQuiz controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch wrong answers quiz'
      });
    }
  }

  /**
   * GET /api/quiz/favorites
   * 즐겨찾기 퀴즈 조회 (인증 필수)
   */
  async getFavoritesQuiz(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required for favorites quiz'
        });
      }

      const result = await quizQueries.getFavoritesQuiz(uid);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('getFavoritesQuiz controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch favorites quiz'
      });
    }
  }

  /**
   * POST /api/quiz/wrong-answers/toggle
   * 틀린 문제 토글 (인증 필수)
   * Body: { questionId: number, isStarred: boolean }
   */
  async toggleWrongAnswer(req, res) {
    try {
      const uid = req.user?.uid;
      const { questionId, isStarred } = req.body;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to toggle wrong answer'
        });
      }

      // 유효성 검증
      if (!questionId || typeof isStarred !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Invalid request: questionId and isStarred are required'
        });
      }

      const result = await quizQueries.toggleWrongAnswer(uid, questionId, isStarred);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('toggleWrongAnswer controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle wrong answer'
      });
    }
  }

  /**
   * POST /api/quiz/favorites/toggle
   * 즐겨찾기 토글 (인증 필수)
   * Body: { questionId: number, isFavorite: boolean }
   */
  async toggleFavorite(req, res) {
    try {
      const uid = req.user?.uid;
      const { questionId, isFavorite } = req.body;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to toggle favorite'
        });
      }

      // 유효성 검증
      if (!questionId || typeof isFavorite !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Invalid request: questionId and isFavorite are required'
        });
      }

      const result = await quizQueries.toggleFavorite(uid, questionId, isFavorite);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('toggleFavorite controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle favorite'
      });
    }
  }

  /**
   * POST /api/quiz/attempt
   * 문제 시도 기록 (인증 필수)
   * Body: { questionId: number }
   */
  async recordAttempt(req, res) {
    try {
      const uid = req.user?.uid;
      const { questionId } = req.body;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to record attempt'
        });
      }

      // 유효성 검증
      if (!questionId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request: questionId is required'
        });
      }

      // 뱃지 체크 포함된 버전 사용
      const result = await quizQueries.recordQuestionAttemptWithBadges(uid, questionId);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('recordAttempt controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record question attempt'
      });
    }
  }

}

module.exports = new QuizController();
