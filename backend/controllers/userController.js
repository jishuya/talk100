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
          level: userProfile.level,
          custom_avatar: userProfile.custom_avatar
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

        // 시간 차이 계산 (timestamp가 null이면 "학습 기록 없음")
        let time = '학습 기록 없음';

        if (item.timestamp) {
          const now = new Date();
          const timestamp = new Date(item.timestamp);
          const diffMs = now - timestamp;
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);
          const diffWeeks = Math.floor(diffMs / (86400000 * 7));
          const diffMonths = Math.floor(diffMs / (86400000 * 30));
          const diffYears = Math.floor(diffMs / (86400000 * 365));

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
        }

        return {
          id: item.id,
          time: time,
          percent: percent,
          last_day: item.last_studied_day,
          last_qestion_id: item.last_studied_question_id,
          last_question_number: parseInt(item.completed_question_number) || 0,
          category_completed: parseInt(item.category_completed) || 0,
          category_total: parseInt(item.category_total) || 0
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

  // GET /api/users/category-progress
  async getCategoryProgress(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const categoryProgress = await userQueries.getCategoryProgress(uid);

      res.json({
        success: true,
        data: categoryProgress
      });

    } catch (error) {
      console.error('getCategoryProgress controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category progress'
      });
    }
  }

  // GET /api/users/learning-pattern?period=week
  async getLearningPattern(req, res) {
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

      const learningPattern = await userQueries.getLearningPattern(uid, period);

      res.json({
        success: true,
        data: learningPattern
      });

    } catch (error) {
      console.error('getLearningPattern controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch learning pattern'
      });
    }
  }

  // PUT /api/users/goals
  async updateGoals(req, res) {
    try {
      const uid = req.user?.uid;
      const { dailyGoal, weeklyAttendance, weeklyTotalQuiz } = req.body;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // 입력값 검증
      if (dailyGoal !== undefined && (dailyGoal < 1 || dailyGoal > 10)) {
        return res.status(400).json({
          success: false,
          message: 'dailyGoal must be between 1 and 10'
        });
      }

      if (weeklyAttendance !== undefined && (weeklyAttendance < 1 || weeklyAttendance > 7)) {
        return res.status(400).json({
          success: false,
          message: 'weeklyAttendance must be between 1 and 7'
        });
      }

      if (weeklyTotalQuiz !== undefined && (weeklyTotalQuiz < 1 || weeklyTotalQuiz > 100)) {
        return res.status(400).json({
          success: false,
          message: 'weeklyTotalQuiz must be between 1 and 100'
        });
      }

      // 목표 업데이트
      await userQueries.updateGoals(uid, {
        dailyGoal,
        weeklyAttendance,
        weeklyTotalQuiz
      });

      res.json({
        success: true,
        message: '학습 목표가 업데이트되었습니다.'
      });

    } catch (error) {
      console.error('updateGoals controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update goals'
      });
    }
  }

  // PUT /api/users/profile
  async updateProfile(req, res) {
    try {
      const uid = req.user?.uid;
      const { name, email } = req.body;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // 입력값 검증
      if (name !== undefined) {
        if (!name.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Name cannot be empty'
          });
        }
        if (name.length < 2 || name.length > 20) {
          return res.status(400).json({
            success: false,
            message: 'Name must be between 2 and 20 characters'
          });
        }
      }

      if (email !== undefined) {
        if (!email.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Email cannot be empty'
          });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid email format'
          });
        }
      }

      // 프로필 업데이트
      await userQueries.updateProfile(uid, { name, email });

      res.json({
        success: true,
        message: '프로필이 업데이트되었습니다.'
      });

    } catch (error) {
      console.error('updateProfile controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }

  // GET /api/users/quiz-mode
  async getQuizMode(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const quizMode = await userQueries.getQuizMode(uid);

      res.json({
        success: true,
        data: { quizMode }
      });

    } catch (error) {
      console.error('getQuizMode controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quiz mode'
      });
    }
  }

  // PUT /api/users/quiz-mode
  async updateQuizMode(req, res) {
    try {
      const uid = req.user?.uid;
      const { quizMode } = req.body;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // 입력값 검증
      if (!quizMode || !['voice', 'keyboard'].includes(quizMode)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid quiz mode. Must be "voice" or "keyboard"'
        });
      }

      await userQueries.updateQuizMode(uid, quizMode);

      res.json({
        success: true,
        message: '퀴즈 모드가 업데이트되었습니다.',
        data: { quizMode }
      });

    } catch (error) {
      console.error('updateQuizMode controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update quiz mode'
      });
    }
  }
}

module.exports = new UserController();