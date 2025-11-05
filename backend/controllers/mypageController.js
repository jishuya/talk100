const userQueries = require('../queries/userQueries');
const settingsQueries = require('../queries/settingsQueries');

class MypageController {
  // GET /api/mypage
  async getMypageData(req, res) {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // 1. 사용자 프로필 조회
      const userProfile = await userQueries.getUserProfile(uid);

      if (!userProfile) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // 2. 학습 목표 조회
      const goals = await userQueries.getGoals(uid);

      // 3. 마이페이지 요약 통계 (오늘/주간 학습 데이터)
      const summaryStats = await userQueries.getMypageSummary(uid);

      // 4. 앱 설정 조회
      let settings;
      try {
        settings = await settingsQueries.getUserSettings(uid);
      } catch (error) {
        console.warn('⚠️ Failed to fetch user settings, using defaults:', error.message);
        // 앱 설정 조회 실패 시 기본값 사용
        settings = {
          notifications: {
            learningReminder: true,
            reminderTime: { hour: 20, minute: 0 },
            reviewReminder: true,
            weeklyReport: false
          },
          learning: {
            autoPlay: false,
            voiceSpeed: 1.0,
            voiceGender: 'male',
            difficulty: 2,
            reviewCount: 6
          },
          display: {
            theme: 'light',
            fontSize: 'medium'
          },
          account: {
            nickname: userProfile.name || '',
            email: userProfile.email || '',
            profileImage: userProfile.profile_image || null,
            connectedAccounts: []
          },
          data: {
            cacheSize: 0,
            lastBackup: null,
            totalData: 0
          }
        };
      }

      // 5. 레벨에 따른 등급명 결정
      let gradeName = '초급 학습자';
      if (userProfile.level >= 20) {
        gradeName = '고급 학습자';
      } else if (userProfile.level >= 10) {
        gradeName = '중급 학습자';
      }

      // 6. OAuth 제공자 판단 (uid 기반)
      let oauthProvider = 'Unknown';
      if (uid.startsWith('google_')) {
        oauthProvider = 'Google';
      } else if (uid.startsWith('naver_')) {
        oauthProvider = 'Naver';
      }

      // 7. 응답 데이터 구성
      res.json({
        success: true,
        data: {
          // 프로필 정보 (ProfileHeader용)
          userProfile: {
            nickname: userProfile.name,
            email: userProfile.email,
            avatar: userProfile.profile_image || '🦊',
            level: userProfile.level,
            gradeName: gradeName,
            oauthProvider: oauthProvider,
            totalQuestionsAttempted: userProfile.total_questions_attempted,
            totalCorrectAnswers: userProfile.total_correct_answers,
            totalDaysStudied: userProfile.total_days_studied,
            currentStreak: userProfile.current_streak,
            longestStreak: userProfile.longest_streak
          },

          // 학습 목표
          learningGoals: goals,

          // 요약 통계
          summaryStats: summaryStats,

          // 앱 설정
          appSettings: settings
        }
      });

    } catch (error) {
      console.error('getMypageData controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mypage data'
      });
    }
  }
}

module.exports = new MypageController();
