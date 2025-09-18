const {
  getTodayProgress,
  updateOrCreateDailyProgress,
  updateStreakData,
  updateWeeklyAttendance,
  getDailyHistory,
  getOverallStats,
  getUpcomingReviews,
  getTodayActivity,
  getLearningPattern,
  getWeeklyTrend
} = require('../queries/dailyProgressQueries');

/**
 * Daily Progress Controller
 * 일일 학습 진행상황 관리 관련 API 핸들러
 * 홈 화면 대시보드 및 MyPage 상세 통계 제공
 */

// 오늘의 학습 현황 조회 (홈 화면용)
async function getTodayProgressHandler(req, res) {
  try {
    const { userId } = req.params;
    const requestUserId = req.user.uid;

    // 본인 데이터만 조회 가능
    if (userId && userId !== requestUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own daily progress'
      });
    }

    const targetUserId = userId || requestUserId;
    const { date } = req.query; // 특정 날짜 조회 (선택사항)

    const progress = await getTodayProgress(targetUserId, date);
    const upcomingReviews = await getUpcomingReviews(targetUserId);
    const todayActivity = await getTodayActivity(targetUserId);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 요일별 출석 패턴 가공
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const weeklyPattern = progress.weekly_attendance.map((count, index) => ({
      day: dayNames[index],
      dayIndex: index,
      count
    }));

    res.json({
      success: true,
      data: {
        userId: targetUserId,
        date: progress.progress_date || date || new Date().toISOString().split('T')[0],
        // 📅 오늘의 핵심 정보
        todayLearning: {
          daysCompleted: progress.days_completed,
          dailyGoal: progress.daily_goal,
          goalMet: progress.goal_met,
          additionalDays: progress.additional_days,
          progressPercentage: progress.progress_percentage
        },
        // 🔥 동기부여 지표
        motivation: {
          currentStreak: progress.current_streak,
          longestStreak: progress.longest_streak,
          totalDaysStudied: progress.total_days_studied
        },
        // 📊 주간 출석 패턴
        weeklyPattern,
        // ⏰ 다가오는 복습
        upcomingReviews,
        // 📈 오늘의 활동
        todayActivity: {
          newWrongAnswers: todayActivity.today_wrong_answers,
          newFavorites: todayActivity.today_favorites
        }
      }
    });

  } catch (error) {
    console.error('Get today progress error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get today progress',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 일일 진행상황 업데이트 (Day 완료시 호출)
async function updateDailyProgressHandler(req, res) {
  try {
    const { daysCompleted } = req.body;
    const userId = req.user.uid;

    if (typeof daysCompleted !== 'number' || daysCompleted < 0) {
      return res.status(400).json({
        success: false,
        message: 'Days completed must be a non-negative number'
      });
    }

    // 일일 진행상황 업데이트
    const progress = await updateOrCreateDailyProgress(userId, daysCompleted);

    // 연속일 데이터 업데이트
    const streakData = await updateStreakData(userId);

    // 주간 출석 업데이트 (오늘 요일)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=일, 1=월, ..., 6=토
    const weeklyAttendance = await updateWeeklyAttendance(userId, dayOfWeek);

    res.json({
      success: true,
      data: {
        userId,
        progress,
        streakData,
        weeklyAttendance,
        message: progress.goal_met
          ? `🎉 Daily goal achieved! ${daysCompleted}/${progress.days_completed} Days completed`
          : `📚 Progress updated: ${daysCompleted} Days completed`
      }
    });

  } catch (error) {
    console.error('Update daily progress error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update daily progress',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 학습 히스토리 조회 (달력 뷰용)
async function getDailyHistoryHandler(req, res) {
  try {
    const { userId } = req.params;
    const requestUserId = req.user.uid;

    // 본인 데이터만 조회 가능
    if (userId && userId !== requestUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own history'
      });
    }

    const targetUserId = userId || requestUserId;
    const { days = 30 } = req.query;
    const daysNum = parseInt(days);

    if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
      return res.status(400).json({
        success: false,
        message: 'Days must be between 1 and 365'
      });
    }

    const history = await getDailyHistory(targetUserId, daysNum);
    const weeklyTrend = await getWeeklyTrend(targetUserId);

    // 달력 데이터 가공
    const calendarData = history.reduce((acc, day) => {
      acc[day.date] = {
        daysCompleted: day.days_completed,
        goalMet: day.goal_met,
        additionalDays: day.additional_days,
        progressPercentage: day.progress_percentage
      };
      return acc;
    }, {});

    // 주간 트렌드 가공 (최근 7일)
    const weeklyTrendFormatted = weeklyTrend.map(day => ({
      date: day.date,
      dayOfWeek: ['일', '월', '화', '수', '목', '금', '토'][day.day_of_week],
      daysCompleted: day.days_completed,
      goalMet: day.goal_met,
      dailyGoal: day.daily_goal
    }));

    res.json({
      success: true,
      data: {
        userId: targetUserId,
        period: `${daysNum} days`,
        history,
        calendarData,
        weeklyTrend: weeklyTrendFormatted,
        summary: {
          totalDays: history.length,
          studiedDays: history.filter(d => d.days_completed > 0).length,
          goalMetDays: history.filter(d => d.goal_met).length,
          averageCompletion: history.length > 0
            ? Math.round(history.reduce((sum, d) => sum + d.days_completed, 0) / history.length * 10) / 10
            : 0
        }
      }
    });

  } catch (error) {
    console.error('Get daily history error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get daily history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 종합 학습 통계 조회 (MyPage용)
async function getOverallStatsHandler(req, res) {
  try {
    const { userId } = req.params;
    const requestUserId = req.user.uid;

    // 본인 데이터만 조회 가능
    if (userId && userId !== requestUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own stats'
      });
    }

    const targetUserId = userId || requestUserId;
    const stats = await getOverallStats(targetUserId);
    const learningPattern = await getLearningPattern(targetUserId);

    if (!stats) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 학습 시작 이후 경과 일수
    const daysSinceStart = Math.ceil(
      (new Date() - new Date(stats.created_at)) / (1000 * 60 * 60 * 24)
    );

    // 요일별 출석 패턴 분석
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const weeklyAnalysis = stats.weekly_attendance.map((count, index) => ({
      day: dayNames[index],
      count,
      percentage: stats.total_days_studied > 0
        ? Math.round((count / stats.total_days_studied) * 100)
        : 0
    }));

    const mostActiveDay = dayNames[learningPattern?.most_active_day] || '데이터 없음';

    res.json({
      success: true,
      data: {
        userId: targetUserId,
        // 🏆 전체 성취도
        achievements: {
          totalDaysStudied: stats.total_days_studied,
          currentStreak: stats.current_streak,
          longestStreak: stats.longest_streak,
          daysSinceStart,
          studyConsistency: stats.total_days_studied > 0
            ? Math.round((stats.total_days_studied / daysSinceStart) * 100)
            : 0
        },
        // 📊 학습 통계
        learningStats: {
          totalQuestionsAttempted: stats.total_questions_attempted,
          totalCorrectAnswers: stats.total_correct_answers,
          overallAccuracy: stats.overall_accuracy,
          dailyGoal: stats.daily_goal,
          avgDailyCompletion: stats.avg_daily_completion || 0
        },
        // 📅 이번 달 성과
        monthlyPerformance: {
          studiedDays: stats.this_month_studied_days,
          goalsMetCount: stats.this_month_goals_met,
          goalAchievementRate: stats.this_month_studied_days > 0
            ? Math.round((stats.this_month_goals_met / stats.this_month_studied_days) * 100)
            : 0,
          monthlyGoalAchievementRate: learningPattern?.monthly_goal_achievement_rate || 0
        },
        // 🎯 학습 패턴 분석
        learningPattern: {
          mostActiveDay,
          weeklyAnalysis,
          avgAdditionalLearning: learningPattern?.avg_additional_learning || 0,
          learningStyle: stats.avg_daily_completion > stats.daily_goal
            ? '적극적 학습자'
            : stats.avg_daily_completion >= stats.daily_goal * 0.8
            ? '꾸준한 학습자'
            : '집중 필요'
        }
      }
    });

  } catch (error) {
    console.error('Get overall stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get overall stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 홈 화면 대시보드 정보 (통합 API)
async function getDashboardHandler(req, res) {
  try {
    const userId = req.user.uid;

    // 병렬로 모든 필요한 데이터 조회
    const [
      todayProgress,
      upcomingReviews,
      todayActivity,
      weeklyTrend
    ] = await Promise.all([
      getTodayProgress(userId),
      getUpcomingReviews(userId),
      getTodayActivity(userId),
      getWeeklyTrend(userId)
    ]);

    if (!todayProgress) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 홈 화면 맞춤형 메시지 생성
    let motivationMessage = '';
    if (todayProgress.goal_met) {
      motivationMessage = `🎉 오늘 목표 달성! ${todayProgress.days_completed}/${todayProgress.daily_goal} Days 완료`;
    } else if (todayProgress.days_completed > 0) {
      motivationMessage = `📚 좋은 시작! ${todayProgress.days_completed}/${todayProgress.daily_goal} Days 진행중`;
    } else {
      motivationMessage = `💪 오늘도 화이팅! ${todayProgress.daily_goal} Days 목표`;
    }

    res.json({
      success: true,
      data: {
        userId,
        // 🏠 홈 대시보드 핵심 정보
        dashboard: {
          todayProgress: {
            completed: todayProgress.days_completed,
            goal: todayProgress.daily_goal,
            percentage: todayProgress.progress_percentage,
            goalMet: todayProgress.goal_met,
            additional: todayProgress.additional_days
          },
          streak: {
            current: todayProgress.current_streak,
            longest: todayProgress.longest_streak
          },
          weeklyPattern: todayProgress.weekly_attendance,
          motivationMessage
        },
        // ⏰ 복습 & 활동 정보
        activities: {
          reviews: {
            today: upcomingReviews.today_reviews,
            tomorrow: upcomingReviews.tomorrow_reviews,
            thisWeek: upcomingReviews.week_reviews
          },
          todayActivity: {
            wrongAnswers: todayActivity.today_wrong_answers,
            favorites: todayActivity.today_favorites
          }
        },
        // 📊 주간 트렌드 (7일)
        weeklyTrend: weeklyTrend.map(day => ({
          date: day.date,
          completed: day.days_completed,
          goalMet: day.goal_met
        }))
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = {
  getTodayProgressHandler,
  updateDailyProgressHandler,
  getDailyHistoryHandler,
  getOverallStatsHandler,
  getDashboardHandler
};