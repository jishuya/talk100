const avatarQueries = require('../queries/avatarQueries');

class AvatarController {
  /**
   * GET /api/avatar/system
   * 아바타 시스템 정보 조회 (현재 아바타, 레벨, 해금된 아바타 목록)
   */
  async getAvatarSystem(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const avatarSystem = await avatarQueries.getAvatarSystem(uid);

      res.json({
        success: true,
        data: avatarSystem
      });

    } catch (error) {
      console.error('getAvatarSystem controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch avatar system'
      });
    }
  }

  /**
   * PUT /api/avatar/select
   * 아바타 변경
   */
  async updateAvatar(req, res) {
    try {
      const uid = req.user?.uid;
      const { avatar } = req.body;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      if (!avatar) {
        return res.status(400).json({
          success: false,
          message: 'Avatar emoji is required'
        });
      }

      const result = await avatarQueries.updateAvatar(uid, avatar);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('updateAvatar controller error:', error);

      // 잠긴 아바타 선택 시도
      if (error.message.includes('locked')) {
        return res.status(403).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update avatar'
      });
    }
  }
}

module.exports = new AvatarController();
