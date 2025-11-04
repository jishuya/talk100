const backupQueries = require('../queries/backupQueries');

class BackupController {
  // GET /api/backup - 사용자 학습 기록 백업 데이터 조회
  async getBackupData(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // 백업 데이터 조회
      const backupData = await backupQueries.getUserBackupData(uid);

      res.json({
        success: true,
        data: backupData
      });

    } catch (error) {
      console.error('getBackupData controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch backup data'
      });
    }
  }

  // GET /api/export - 데이터 내보내기용 통계 조회
  async getExportData(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // 내보내기 데이터 조회
      const exportData = await backupQueries.getExportStatistics(uid);

      res.json({
        success: true,
        data: exportData
      });

    } catch (error) {
      console.error('getExportData controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch export data'
      });
    }
  }

  // DELETE /api/backup/reset - 학습 기록 초기화
  async resetLearningData(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // 학습 기록 초기화
      await backupQueries.resetUserLearningData(uid);

      res.json({
        success: true,
        message: 'Learning data reset successfully'
      });

    } catch (error) {
      console.error('resetLearningData controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset learning data'
      });
    }
  }

  // DELETE /api/backup/account - 계정 완전 삭제
  async deleteAccount(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // 계정 완전 삭제
      await backupQueries.deleteUserAccount(uid);

      // 세션 삭제 (쿠키 제거)
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
        }
      });

      // 응답 헤더에서 쿠키 삭제
      res.clearCookie('connect.sid');

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });

    } catch (error) {
      console.error('deleteAccount controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete account'
      });
    }
  }
}

module.exports = new BackupController();
