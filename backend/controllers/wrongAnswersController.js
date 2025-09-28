const {
  getUserWrongAnswers,
  addOrUpdateWrongAnswer,
  toggleStar,
  removeWrongAnswer,
  getWrongAnswersCount,
  getRandomWrongAnswers,
  getWrongAnswersStats,
  getMostWrongAnswers,
  unstarAllWrongAnswers
} = require('../queries/wrongAnswersQueries');

/**
 * Wrong Answers Controller
 * 틀린 문제 관리 관련 API 핸들러
 * ⭐ 버튼으로 틀린 문제 표시/숨김 기능 제공
 */

// 사용자의 틀린 문제 목록 조회 (⭐ 표시된 문제만)
async function getWrongAnswersHandler(req, res) {
  try {
    const { userId } = req.params;
    const requestUserId = req.user.uid;

    // 본인 데이터만 조회 가능
    if (userId && userId !== requestUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own wrong answers'
      });
    }

    const targetUserId = userId || requestUserId;
    const { starred = 'true' } = req.query; // 기본값: ⭐ 표시된 문제만
    const starredOnly = starred === 'true';

    const wrongAnswers = await getUserWrongAnswers(targetUserId, starredOnly);
    const count = await getWrongAnswersCount(targetUserId, starredOnly);

    // 카테고리별로 그룹화
    const byCategory = wrongAnswers.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        userId: targetUserId,
        totalCount: count,
        starredOnly,
        questions: wrongAnswers,
        byCategory,
        summary: {
          total: count,
          model_example: byCategory[1]?.length || 0,
          small_talk: byCategory[2]?.length || 0,
          cases_in_point: byCategory[3]?.length || 0
        }
      }
    });

  } catch (error) {
    console.error('Get wrong answers error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get wrong answers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 틀린 문제 추가 (답변 제출시 자동 호출)
async function addWrongAnswerHandler(req, res) {
  try {
    const { questionId } = req.body;
    const userId = req.user.uid;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: 'Question ID is required'
      });
    }

    const result = await addOrUpdateWrongAnswer(userId, questionId);

    res.json({
      success: true,
      data: {
        userId,
        questionId,
        action: result.action, // 'created' or 'updated'
        wrongCount: result.wrongAnswer.wrong_count,
        isStarred: result.wrongAnswer.is_starred,
        message: result.message
      }
    });

  } catch (error) {
    console.error('Add wrong answer error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to add wrong answer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// ⭐ 버튼 토글 (틀린 문제 표시/숨김)
async function toggleStarHandler(req, res) {
  try {
    const { questionId } = req.body;
    const userId = req.user.uid;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: 'Question ID is required'
      });
    }

    const result = await toggleStar(userId, questionId);

    res.json({
      success: true,
      data: {
        userId,
        questionId,
        action: result.action, // 'added' or 'toggled'
        isStarred: result.isStarred,
        message: result.isStarred ? 'Added to wrong answers list' : 'Hidden from wrong answers list'
      }
    });

  } catch (error) {
    console.error('Toggle star error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle star',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 틀린 문제 완전 삭제
async function removeWrongAnswerHandler(req, res) {
  try {
    const { questionId } = req.params;
    const userId = req.user.uid;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: 'Question ID is required'
      });
    }

    const result = await removeWrongAnswer(userId, questionId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Wrong answer record not found'
      });
    }

    res.json({
      success: true,
      data: {
        userId,
        questionId: result.question_id,
        message: 'Wrong answer removed successfully'
      }
    });

  } catch (error) {
    console.error('Remove wrong answer error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to remove wrong answer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 틀린 문제 퀴즈용 랜덤 문제 조회
async function getWrongAnswersQuizHandler(req, res) {
  try {
    const { userId } = req.params;
    const requestUserId = req.user.uid;

    // 본인 데이터만 조회 가능
    if (userId && userId !== requestUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own quiz data'
      });
    }

    const targetUserId = userId || requestUserId;
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit);

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 50'
      });
    }

    const questions = await getRandomWrongAnswers(targetUserId, limitNum, true);

    if (questions.length === 0) {
      return res.json({
        success: true,
        data: {
          hasQuestions: false,
          message: 'No starred wrong answers available for quiz',
          questions: [],
          count: 0
        }
      });
    }

    res.json({
      success: true,
      data: {
        userId: targetUserId,
        hasQuestions: true,
        questions,
        count: questions.length,
        message: `${questions.length} wrong answer questions selected for quiz`
      }
    });

  } catch (error) {
    console.error('Get wrong answers quiz error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get wrong answers quiz',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 틀린 문제 통계 조회
async function getWrongAnswersStatsHandler(req, res) {
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
    const stats = await getWrongAnswersStats(targetUserId);
    const mostWrong = await getMostWrongAnswers(targetUserId, 5, true);

    res.json({
      success: true,
      data: {
        userId: targetUserId,
        stats,
        mostWrongQuestions: mostWrong,
        insights: {
          hasWrongAnswers: stats.total_wrong_answers > 0,
          activeCount: stats.starred_count,
          hiddenCount: stats.unstarred_count,
          averageWrongCount: parseFloat(stats.avg_wrong_count) || 0,
          mostDifficultCount: stats.max_wrong_count || 0
        }
      }
    });

  } catch (error) {
    console.error('Get wrong answers stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get wrong answers stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 모든 ⭐ 해제 (대량 관리 기능)
async function unstarAllHandler(req, res) {
  try {
    const userId = req.user.uid;
    const unstarredCount = await unstarAllWrongAnswers(userId);

    res.json({
      success: true,
      data: {
        userId,
        unstarredCount,
        message: `${unstarredCount} wrong answers hidden from list`
      }
    });

  } catch (error) {
    console.error('Unstar all error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to unstar all wrong answers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = {
  getWrongAnswersHandler,
  addWrongAnswerHandler,
  toggleStarHandler,
  removeWrongAnswerHandler,
  getWrongAnswersQuizHandler,
  getWrongAnswersStatsHandler,
  unstarAllHandler
};