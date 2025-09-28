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
}

module.exports = new UserController();