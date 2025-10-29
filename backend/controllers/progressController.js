const progressQueries = require('../queries/progressQueries');

class ProgressController {
  /**
   * POST /api/progress/update
   * 정답 맞춤 시 user_progress 업데이트 (모든 카테고리 공통)
   * Body: { categoryId: number, day: number, questionId: number }
   */
  async updateProgress(req, res) {
    try {
      const uid = req.user?.uid;
      const { categoryId, day, questionId } = req.body;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to update progress'
        });
      }

      // 유효성 검증
      if (!categoryId || !day || !questionId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request: categoryId, day, and questionId are required'
        });
      }

      // categoryId 유효성 검증 (1~6)
      if (categoryId < 1 || categoryId > 6) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID. Must be between 1 and 6'
        });
      }

      // user_progress 업데이트
      const result = await progressQueries.updateUserProgress(uid, categoryId, day, questionId);

      res.json({
        success: true,
        data: result.data  // result.data에 실제 데이터가 있음 (goalAchieved, streak 포함)
      });

    } catch (error) {
      console.error('updateProgress controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update progress'
      });
    }
  }

  /**
   * POST /api/progress/reset-solved-count
   * 추가 학습 시작 시 solved_count 리셋
   */
  async resetSolvedCount(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // solved_count 리셋
      const result = await progressQueries.resetSolvedCount(uid);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('resetSolvedCount controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset solved count'
      });
    }
  }
}

module.exports = new ProgressController();
