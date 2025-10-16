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
  

}

module.exports = new QuizController();
