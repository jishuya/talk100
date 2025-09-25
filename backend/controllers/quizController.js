const {
  getQuestionsByDay,
  getQuestionsByCategory,
  getAllCategories
} = require('../queries/questionQueries');

/**
 * Quiz Controller
 * 퀴즈 세션 관련 API 핸들러
 * 프론트엔드 호환성을 위한 새로운 엔드포인트들
 */

// 퀴즈 세션 생성 및 조회 (프론트엔드 호환)
async function getQuizSessionHandler(req, res) {
  try {
    const { categoryId } = req.params;
    const userId = req.user.uid;
    const { day, type = 'category' } = req.query;

    // 카테고리 검증
    const validCategories = ['model-example', 'small-talk', 'cases-in-point', 'daily', 'wrong-answers', 'favorites'];
    if (!validCategories.includes(categoryId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Valid categories: ' + validCategories.join(', ')
      });
    }

    // 세션 데이터 구성
    let sessionData = {
      id: `quiz_session_${Date.now()}`,
      userId,
      type: type, // 'daily' | 'category' | 'wrong' | 'favorites'
      category: categoryId,
      createdAt: new Date().toISOString(),
      settings: {
        inputMode: req.user.voice_gender ? 'voice' : 'keyboard', // 사용자 설정 기반
        autoNext: true,
        showHints: true,
        playAudio: true
      }
    };

    // 카테고리별 처리
    switch (categoryId) {
      case 'daily':
        // 오늘의 퀴즈 - 사용자 설정에 따른 일일 학습량
        sessionData.title = '오늘의 퀴즈';
        sessionData.totalQuestions = req.user.daily_goal * 5 || 20; // 기본 20문제
        sessionData.categories = ['model-example', 'small-talk', 'cases-in-point'];
        break;

      case 'wrong-answers':
        sessionData.title = '틀린 문제';
        sessionData.totalQuestions = 15; // 동적으로 계산해야 함
        break;

      case 'favorites':
        sessionData.title = '즐겨찾기';
        sessionData.totalQuestions = 8; // 동적으로 계산해야 함
        break;

      default:
        // 카테고리별 퀴즈
        const categoryTitles = {
          'model-example': 'Model Example',
          'small-talk': 'Small Talk',
          'cases-in-point': 'Cases in Point'
        };

        sessionData.title = categoryTitles[categoryId];

        if (day) {
          // 특정 Day의 문제들
          const dayNumber = parseInt(day);
          if (isNaN(dayNumber) || dayNumber < 1) {
            return res.status(400).json({
              success: false,
              message: 'Day must be a positive number'
            });
          }

          const questions = await getQuestionsByDay(categoryId, dayNumber);
          sessionData.day = dayNumber;
          sessionData.totalQuestions = questions ? questions.length : 0;
        } else {
          // 카테고리 전체 - 다음 학습할 Day 계산 필요
          sessionData.totalQuestions = 25; // 평균 문제 수
        }
    }

    // 세션 메타데이터 추가
    sessionData.currentQuestion = 1;
    sessionData.timeStarted = new Date().toISOString();
    sessionData.progress = {
      completed: 0,
      total: sessionData.totalQuestions,
      percentage: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      skippedQuestions: 0
    };

    res.json({
      success: true,
      data: sessionData
    });

  } catch (error) {
    console.error('Get quiz session error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 퀴즈 세션 업데이트 (진행률, 답변 기록 등)
async function updateQuizSessionHandler(req, res) {
  try {
    const { sessionId } = req.params;
    const {
      currentQuestion,
      progress,
      lastAnswer,
      timeElapsed
    } = req.body;
    const userId = req.user.uid;

    // 실제 구현시에는 세션 데이터를 Redis나 DB에 저장 필요
    // 현재는 클라이언트에서 관리하도록 응답만 제공

    res.json({
      success: true,
      data: {
        sessionId,
        userId,
        currentQuestion,
        progress,
        lastAnswer,
        timeElapsed,
        updatedAt: new Date().toISOString(),
        message: 'Quiz session updated successfully'
      }
    });

  } catch (error) {
    console.error('Update quiz session error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// 퀴즈 세션 완료 처리
async function completeQuizSessionHandler(req, res) {
  try {
    const { sessionId } = req.params;
    const {
      totalScore,
      correctAnswers,
      incorrectAnswers,
      timeSpent,
      answers
    } = req.body;
    const userId = req.user.uid;

    // 세션 완료 통계 계산
    const totalQuestions = correctAnswers + incorrectAnswers;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // 성과 분석
    let strengths = [];
    let weaknesses = [];
    let recommendedActions = [];

    if (accuracy >= 90) {
      strengths.push('높은 정확도', '문법 구조 이해');
      recommendedActions.push('다음 단계로 진행하세요!');
    } else if (accuracy >= 70) {
      strengths.push('기본기 탄탄', '꾸준한 학습');
      weaknesses.push('일부 키워드 놓침');
      recommendedActions.push('틀린 문제들을 즐겨찾기에 추가했습니다');
    } else {
      weaknesses.push('키워드 암기', '문장 구조');
      recommendedActions.push('복습이 필요합니다', '힌트를 활용해보세요');
    }

    // 뱃지 조건 확인 (나중에 뱃지 시스템 구현시 활용)
    const badges = [];
    if (accuracy >= 90) {
      badges.push({ id: 'accuracy_90', name: '정확도 90% 달성', icon: '🎯' });
    }
    if (correctAnswers >= 20) {
      badges.push({ id: 'questions_20', name: '20문제 정답', icon: '🏆' });
    }

    const result = {
      sessionId,
      userId,
      completedAt: new Date().toISOString(),
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions: Math.max(0, totalQuestions - correctAnswers - incorrectAnswers),
      totalScore,
      averageScore: totalQuestions > 0 ? Math.round(totalScore / totalQuestions) : 0,
      accuracy,
      timeSpent,
      strengths,
      weaknesses,
      recommendedActions,
      badges
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Complete quiz session error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to complete quiz session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = {
  getQuizSessionHandler,
  updateQuizSessionHandler,
  completeQuizSessionHandler
};