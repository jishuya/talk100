const userQueries = require('../queries/userQueries');

class UserController {
  // GET /api/users/profile
  async getUserProfile(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const userProfile = await userQueries.getUserProfile(uid);

      if (!userProfile) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          name: userProfile.name,
          goal: userProfile.goal,
          level: userProfile.level
        }
      });

    } catch (error) {
      console.error('getUserProfile controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user profile'
      });
    }
  }

  // GET /api/users/badges
  async getBadges(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const badges = await userQueries.getUserBadges(uid);

      if (!badges) {
        return res.status(404).json({
          success: false,
          message: 'User badges not found'
        });
      }

      res.json({
        success: true,
        data: {
          days: badges.days || 0,
          questions: badges.questions || 0
        }
      });

    } catch (error) {
      console.error('getBadges controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user badges'
      });
    }
  }

  // GET /api/users/progress
  async getProgress(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const progress = await userQueries.getUserProgress(uid);

      if (!progress) {
        return res.status(404).json({
          success: false,
          message: 'User progress not found'
        });
      }

      res.json({
        success: true,
        data: {
          current: progress.current,
          total: progress.total,
          percentage: progress.percentage
        }
      });

    } catch (error) {
      console.error('getProgress controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user progress'
      });
    }
  }
}

module.exports = new UserController();