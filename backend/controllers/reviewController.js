const {
  getNextReviewDay,
  getReviewQuestions,
  updateReviewSchedule,
  getReviewSchedule,
  getReviewStats
} = require('../services/dayReview');

/**
 * Review Controller
 * 복습 시스템 관련 API 핸들러 (Day 번호 기반)
 */

// 오늘 복습할 Day가 있는지 확인
async function getNextReviewHandler(req, res) {
  try {
    const { userId } = req.params;
    const requestUserId = req.user.uid;

    // 본인 데이터만 조회 가능
    if (userId && userId !== requestUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own review data'
      });
    }

    //  1. 복습 큐에서 오늘 날짜 이전의 가장 오래된 Day 조회 / 2. 있으면 → Day 번호, 간격 단계 반환  / 3. 없으면 → "복습 없음" 메시지
    const targetUserId = userId || requestUserId;
    const nextReview = await getNextReviewDay(targetUserId);

    if (!nextReview) {
      return res.json({
        success: true,
        data: {
          hasReview: false,
          message: 'No reviews pending'
        }
      });
    }

    res.json({
      success: true,
      data: {
        hasReview: true,
        reviewDay: nextReview.source_day,
        queueId: nextReview.queue_id,
        intervalDays: nextReview.interval_days,
        scheduledFor: nextReview.scheduled_for
      }
    });

  } catch (error) {
    console.error('Get next review error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get next review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Day 번호로 복습 문제를 실시간 랜덤 선택 (Model Example: 3문제, Small Talk: 2세트, Cases in Point: 1문제)
async function getReviewQuestionsHandler(req, res) {
  try {
    const { day } = req.params;
    const dayNumber = parseInt(day);

    if (isNaN(dayNumber) || dayNumber < 1) {
      return res.status(400).json({
        success: false,
        message: 'Day must be a positive number'
      });
    }

    const questions = await getReviewQuestions(dayNumber);

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No questions found for Day ${dayNumber}`
      });
    }

    res.json({
      success: true,
      data: {
        day: dayNumber,
        questions,
        totalQuestions: questions.length,
        composition: {
          model_example: questions.filter(q => q.category === 'model_example').length,
          small_talk: questions.filter(q => q.category === 'small_talk').length,
          cases_in_point: questions.filter(q => q.category === 'cases_in_point').length
        }
      }
    });

  } catch (error) {
    console.error('Get review questions error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get review questions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 복습 완료 후 지능적 스케줄링
// - 정답시: 다음 단계로 진급(1일 → 3일 → 7일 ..) / 오답시: 1일로 초기화 / 120일 완료: 영구 마스터 (삭제)
async function completeReviewHandler(req, res) {
  try {
    const { queueId, isCorrect } = req.body;
    const userId = req.user.uid;

    if (!queueId || typeof isCorrect !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Queue ID and isCorrect (boolean) are required'
      });
    }

    const result = await updateReviewSchedule(queueId, isCorrect);

    res.json({
      success: true,
      data: {
        userId,
        queueId,
        isCorrect,
        action: result.action,
        nextInterval: result.nextInterval,
        message: getActionMessage(result.action, result.nextInterval)
      }
    });

  } catch (error) {
    console.error('Complete review error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to complete review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 복습 스케줄 조회(사용자의 전체 복습 달력 제공)
// - 대기 중인 Day들의 스케줄, 각 Day의 현재 간격 단계, 통계 (총 복습 수, 오늘 할 것, 완료 임박)
async function getReviewScheduleHandler(req, res) {
  try {
    const { userId } = req.params;
    const requestUserId = req.user.uid;

    // 본인 데이터만 조회 가능
    if (userId && userId !== requestUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own review schedule'
      });
    }

    const targetUserId = userId || requestUserId;
    const schedule = await getReviewSchedule(targetUserId);
    const stats = await getReviewStats(targetUserId);

    res.json({
      success: true,
      data: {
        userId: targetUserId,
        stats,
        schedule: schedule.map(item => ({
          day: item.source_day,
          intervalDays: item.interval_days,
          scheduledFor: item.scheduled_for,
          reviewCount: item.review_count,
          addedAt: item.added_at,
          isDue: new Date(item.scheduled_for) <= new Date()
        }))
      }
    });

  } catch (error) {
    console.error('Get review schedule error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get review schedule',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Helper function
function getActionMessage(action, nextInterval) {
  switch (action) {
    case 'advanced':
      return `Great! Next review in ${nextInterval} days`;
    case 'completed':
      return 'Congratulations! Review cycle completed';
    case 'reset':
      return 'Don\'t worry! Review reset to 1 day';
    default:
      return 'Review processed';
  }
}

module.exports = {
  getNextReviewHandler,
  getReviewQuestionsHandler,
  completeReviewHandler,
  getReviewScheduleHandler
};