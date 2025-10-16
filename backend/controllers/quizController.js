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
   */
  async getCategoryQuiz(req, res) {
    try {
      const uid = req.user?.uid;
      const categoryId = parseInt(req.params.categoryId);

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

      const result = await quizQueries.getCategoryQuizQuestions(uid, categoryId);

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

}

module.exports = new QuizController();
