const progressQueries = require('../queries/progressQueries');

class ProgressController {
  /**
   * POST /api/progress/day-complete
   * Day 완료 시 daily_progress 업데이트 (프론트엔드에서 Day 변경 감지 시 호출)
   * Body: { day: number }
   */
  async completeDayProgress(req, res) {
    try {
      const uid = req.user?.uid;
      const { day } = req.body;

      console.log('🎉 [Day Complete] Request received:', {
        uid,
        day,
        body: req.body
      });

      if (!uid) {
        console.log('❌ [Day Complete] No uid found');
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!day) {
        console.log('❌ [Day Complete] Missing day field');
        return res.status(400).json({
          success: false,
          message: 'Invalid request: day is required'
        });
      }

      // daily_progress 업데이트
      const result = await progressQueries.updateDailyProgress(uid);

      console.log('✅ [Day Complete] Success:', result);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('completeDayProgress controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete day progress'
      });
    }
  }

  /**
   * POST /api/progress/update
   * 정답 맞춤 시 user_progress 업데이트 (모든 카테고리 공통)
   * Body: { categoryId: number, day: number, questionId: number }
   */
  async updateProgress(req, res) {
    try {
      const uid = req.user?.uid;
      const { categoryId, day, questionId } = req.body;

      console.log('📊 [Progress Update] Request received:', {
        uid,
        categoryId,
        day,
        questionId,
        body: req.body
      });

      if (!uid) {
        console.log('❌ [Progress Update] No uid found');
        return res.status(401).json({
          success: false,
          message: 'Authentication required to update progress'
        });
      }

      // 유효성 검증
      if (!categoryId || !day || !questionId) {
        console.log('❌ [Progress Update] Missing required fields');
        return res.status(400).json({
          success: false,
          message: 'Invalid request: categoryId, day, and questionId are required'
        });
      }

      // categoryId 유효성 검증 (1~6)
      if (categoryId < 1 || categoryId > 6) {
        console.log('❌ [Progress Update] Invalid categoryId:', categoryId);
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID. Must be between 1 and 6'
        });
      }

      // user_progress 업데이트
      const result = await progressQueries.updateUserProgress(uid, categoryId, day, questionId);

      console.log('✅ [Progress Update] Success:', result);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('updateProgress controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update progress'
      });
    }
  }
}

module.exports = new ProgressController();
