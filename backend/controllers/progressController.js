const {
  getAllUserProgress,
  getUserProgress,
  updateOrCreateProgress,
  getDailyProgress,
  updateOrCreateDailyProgress
} = require('../queries/progressQueries');
const { gradeAnswer } = require('../utils/grading');
const { getQuestionById } = require('../queries/questionQueries');
const { createDayReview } = require('../services/dayReview');

/**
 * Progress Controller
 * 학습 진행상황 관련 API 핸들러
 */

// ** 답변 제출 및 채점: 사용자가 문제에 답변했을 때 자동 채점하고 진행도 업데이트
async function submitAnswerHandler(req, res) {
  try {
    const { questionId, userAnswer, difficulty = 2 } = req.body;
    const userId = req.user.uid;

    // 입력 검증
    if (!questionId || !userAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Question ID and user answer are required'
      });
    }

    // a. 문제 정보 조회
    const question = await getQuestionById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // b. Keywords 기반 답변 채점
    const gradingResult = gradeAnswer(userAnswer, question, difficulty);

    // c. 진행상황 업데이트
    const progressResult = await updateOrCreateProgress(
      userId,
      questionId,
      gradingResult.isCorrect
    );

    // 결과: 채점 결과 + 진행 통계 반환
    res.json({
      success: true,
      data: {
        questionId,
        userAnswer,
        grading: gradingResult,
        progress: progressResult,
        question: {
          korean_content: question.korean_content,
          english_content: question.english_content,
          keywords: question.keywords
        }
      }
    });

  } catch (error) {
    console.error('Submit answer error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// ** 사용자 진행상황 조회: 사용자의 전체 학습 현황을 카테고리별로 정리해서 제공
async function getUserProgressHandler(req, res) {
  try {
    const { userId } = req.params;
    const requestUserId = req.user.uid;

    // 보완: 본인 데이터만 조회 가능
    if (userId && userId !== requestUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own progress'
      });
    }

    const targetUserId = userId || requestUserId;
    const progress = await getAllUserProgress(targetUserId);

    // 카테고리별로 그룹화
    const progressByCategory = progress.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = {
          category,
          total_questions: 0,
          attempted_questions: 0,
          correct_answers: 0,
          accuracy_rate: 0,
          questions: []
        };
      }

      acc[category].total_questions++;
      if (item.total_attempts > 0) {
        acc[category].attempted_questions++;
        acc[category].correct_answers += item.correct_attempts;
      }
      acc[category].questions.push(item);

      return acc;
    }, {});

    // 정확도 계산
    Object.values(progressByCategory).forEach(categoryData => {
      if (categoryData.attempted_questions > 0) {
        categoryData.accuracy_rate = Math.round(
          (categoryData.correct_answers / categoryData.attempted_questions) * 100
        );
      }
    });

    // 결과: 카테고리별 정확도, 시도 횟수, 전체 통계 - MyPage 대시보드, 진행률 표시
    res.json({
      success: true,
      data: {
        userId: targetUserId,
        summary: {
          total_categories: Object.keys(progressByCategory).length,
          total_questions: progress.length,
          attempted_questions: progress.filter(p => p.total_attempts > 0).length,
          overall_accuracy: progress.length > 0
            ? Math.round((progress.reduce((sum, p) => sum + p.correct_attempts, 0) /
                        progress.filter(p => p.total_attempts > 0).length) * 100) || 0
            : 0
        },
        categories: progressByCategory
      }
    });

  } catch (error) {
    console.error('Get user progress error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get user progress',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// ** Day 완료 처리 (복습 생성): 하루 학습(Day) 완료시 복습 예약 + 일일 진행도 업데이트
async function dayCompleteHandler(req, res) {
  try {
    const { day } = req.body;
    const userId = req.user.uid;

    // 입력 검증
    if (!day) {
      return res.status(400).json({
        success: false,
        message: 'Day number is required'
      });
    }

    const dayNumber = parseInt(day);
    if (isNaN(dayNumber) || dayNumber < 1) {
      return res.status(400).json({
        success: false,
        message: 'Day must be a positive number'
      });
    }

    // a. Day 완료시 복습 큐에 Day 번호만 추가
    const reviewResult = await createDayReview(userId, dayNumber);

    // b. 일일 진행상황 업데이트(일일 완료 카운트 +1)
    const currentDaily = await getDailyProgress(userId);
    const newDaysCompleted = (currentDaily ? currentDaily.days_completed : 0) + 1;
    const dailyResult = await updateOrCreateDailyProgress(userId, newDaysCompleted);

    res.json({
      success: true,
      data: {
        userId,
        day: dayNumber,
        completedAt: new Date().toISOString(),
        message: `Day ${dayNumber} completed successfully`,
        reviewScheduled: reviewResult.success,
        dailyProgress: dailyResult
      }
    });

  } catch (error) {
    console.error('Day complete error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to complete day',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// ** 일일 진행상황 조회: 오늘 하루 학습 현황 (완료한 Day 수, 목표 달성 여부)
async function getDailyProgressHandler(req, res) {
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
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const dailyProgress = await getDailyProgress(targetUserId, today);

    // 사용자의 daily_goal 조회
    const userGoal = req.user.daily_goal || 1;

    // 일일 목표 달성률, 추가 학습 현황 - 홈 화면 진행률 바, 동기부여
    const result = {
      userId: targetUserId,
      date: today,
      daily_goal: userGoal,
      days_completed: dailyProgress ? dailyProgress.days_completed : 0,
      goal_met: dailyProgress ? dailyProgress.goal_met : false,
      additional_days: dailyProgress ? dailyProgress.additional_days : 0,
      progress_percentage: Math.round(((dailyProgress ? dailyProgress.days_completed : 0) / userGoal) * 100)
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get daily progress error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get daily progress',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// ** 일일 진행상황 업데이트: 일일 완료 Day 수를 수동으로 조정 (관리자/디버깅용)
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

    const result = await updateOrCreateDailyProgress(userId, daysCompleted);

    res.json({
      success: true,
      data: result
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

// ** 특정 문제의 진행상황 조회: 개별 문제의 상세 학습 이력 조회
async function getQuestionProgressHandler(req, res) {
  try {
    const { questionId } = req.params;
    const userId = req.user.uid;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: 'Question ID is required'
      });
    }

    const progress = await getUserProgress(userId, questionId);

    // 결과: 시도 횟수, 정답률, 마지막 시도 결과, 학습 상태 -문제별 난이도 분석, 개인 맞춤 추천
    if (!progress || progress.length === 0) {
      return res.json({
        success: true,
        data: {
          questionId,
          userId,
          status: 'new',
          total_attempts: 0,
          correct_attempts: 0,
          last_attempt_timestamp: null,
          last_is_correct: null
        }
      });
    }

    res.json({
      success: true,
      data: progress[0]
    });

  } catch (error) {
    console.error('Get question progress error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get question progress',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = {
  submitAnswerHandler,
  getUserProgressHandler,
  dayCompleteHandler,
  getDailyProgressHandler,
  updateDailyProgressHandler,
  getQuestionProgressHandler
};