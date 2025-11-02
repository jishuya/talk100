const userQueries = require('../queries/userQueries');
const badgeService = require('../services/badgeService');

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

  // GET /api/users/personal-quizzes
  async getPersonalQuizzes(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const personalQuizzes = await userQueries.getPersonalQuizzes(uid);

      if (!personalQuizzes) {
        return res.status(404).json({
          success: false,
          message: 'Personal quizzes not found'
        });
      }

      res.json({
        success: true,
        data: personalQuizzes
      });

    } catch (error) {
      console.error('getPersonalQuizzes controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch personal quizzes'
      });
    }
  }

  // GET /api/users/history
  async getHistory(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const historyData = await userQueries.getUserHistory(uid);

      // 시간 계산 및 퍼센트 계산
      const processedHistory = historyData.map(item => {

        // percent 계산: question_number / total_questions * 100
        // question_number는 이미 Day 내에서 몇 번째 문제인지를 나타냄
        const totalQuestions = parseInt(item.total_questions) || 1;
        const completedQuestionNumber = parseInt(item.completed_question_number) || 0;
        const percent = Math.round((completedQuestionNumber / totalQuestions) * 100);

        // 시간 차이 계산 (1분 미만은 "방금 전")
        const now = new Date();
        const timestamp = new Date(item.timestamp);
        const diffMs = now - timestamp;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        const diffWeeks = Math.floor(diffMs / (86400000 * 7));
        const diffMonths = Math.floor(diffMs / (86400000 * 30));
        const diffYears = Math.floor(diffMs / (86400000 * 365));

        let time;
        if (diffMins < 1) {
          time = '방금 전';
        } else if (diffMins < 60) {
          time = `${diffMins}분 전`;
        } else if (diffHours < 24) {
          time = `${diffHours}시간 전`;
        } else if (diffDays < 14) {
          time = diffDays === 1 ? '어제' : `${diffDays}일 전`;
        } else if (diffWeeks < 4) {
          time = `${diffWeeks}주 전`;
        } else if (diffMonths < 12) {
          time = `${diffMonths}달 전`;
        } else {
          time = `${diffYears}년 전`;
        }

        return {
          id: item.id,
          time: time,
          percent: percent,
          last_day: item.last_studied_day,
          last_qestion_id: item.last_studied_question_id
        };
      });

      res.json({
        success: true,
        data: processedHistory
      });

    } catch (error) {
      console.error('getHistory controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user history'
      });
    }
  }

  // GET /api/users/badges-achievements
  async getBadgesAchievements(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const badges = await badgeService.getUserBadges(uid);

      res.json({
        success: true,
        data: badges
      });

    } catch (error) {
      console.error('getBadgesAchievements controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch badges'
      });
    }
  }

  // POST /api/users/check-badges
  async checkBadges(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const result = await badgeService.checkAndUpdateBadges(uid);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('checkBadges controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check badges'
      });
    }
  }

  // GET /api/users/summary-stats?period=week
  async getSummaryStats(req, res) {
    try {
      const uid = req.user?.uid;
      const period = req.query.period || 'week'; // week, month, all

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // period 유효성 검증
      if (!['week', 'month', 'all'].includes(period)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid period. Must be one of: week, month, all'
        });
      }

      const summaryStats = await userQueries.getSummaryStats(uid, period);

      res.json({
        success: true,
        data: summaryStats
      });

    } catch (error) {
      console.error('getSummaryStats controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch summary stats'
      });
    }
  }

  // GET /api/users/streak-data
  async getStreakData(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const streakData = await userQueries.getStreakData(uid);

      res.json({
        success: true,
        data: streakData
      });

    } catch (error) {
      console.error('getStreakData controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch streak data'
      });
    }
  }

  // GET /api/users/weekly-chart?period=week
  async getWeeklyChart(req, res) {
    try {
      const uid = req.user?.uid;
      const period = req.query.period || 'week'; // week, month, all

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // period 유효성 검증
      if (!['week', 'month', 'all'].includes(period)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid period. Must be one of: week, month, all'
        });
      }

      const weeklyChart = await userQueries.getWeeklyChart(uid, period);

      res.json({
        success: true,
        data: weeklyChart
      });

    } catch (error) {
      console.error('getWeeklyChart controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch weekly chart'
      });
    }
  }
}

module.exports = new UserController();