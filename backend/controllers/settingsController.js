const settingsQueries = require('../queries/settingsQueries');

class SettingsController {
  // GET /api/settings - 사용자 설정 조회
  async getSettings(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const settings = await settingsQueries.getUserSettings(uid);

      res.json({
        success: true,
        data: settings
      });

    } catch (error) {
      console.error('getSettings controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch settings'
      });
    }
  }

  // PUT /api/settings - 사용자 설정 업데이트
  async updateSettings(req, res) {
    try {
      const uid = req.user?.uid;
      const settings = req.body;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Invalid settings data'
        });
      }

      const updatedSettings = await settingsQueries.updateUserSettings(uid, settings);

      res.json({
        success: true,
        data: updatedSettings,
        message: 'Settings updated successfully'
      });

    } catch (error) {
      console.error('updateSettings controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update settings'
      });
    }
  }
}

module.exports = new SettingsController();
