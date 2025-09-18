const express = require('express');
const {
  submitAnswerHandler,
  getUserProgressHandler,
  dayCompleteHandler,
  getDailyProgressHandler,
  updateDailyProgressHandler,
  getQuestionProgressHandler
} = require('../controllers/progressController');
const {
  getTodayProgressHandler,
  updateDailyProgressHandler: updateDailyProgressHandlerV2,
  getDailyHistoryHandler,
  getOverallStatsHandler,
  getDashboardHandler
} = require('../controllers/dailyProgressController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Progress API Routes
 * Base URL: /api/progress
 * 모든 엔드포인트는 인증 필요
 */

// 답변 제출 및 채점
// POST /api/progress/submit
router.post('/submit', verifyToken, submitAnswerHandler);

// Day 완료 처리
// POST /api/progress/day-complete
router.post('/day-complete', verifyToken, dayCompleteHandler);

// 사용자 진행상황 조회
// GET /api/progress/user/:userId
// GET /api/progress/user (본인 데이터 조회)
router.get('/user/:userId', verifyToken, getUserProgressHandler);
router.get('/user', verifyToken, getUserProgressHandler);

// 일일 진행상황 조회
// GET /api/progress/daily/:userId
// GET /api/progress/daily (본인 데이터 조회)
router.get('/daily/:userId', verifyToken, getDailyProgressHandler);
router.get('/daily', verifyToken, getDailyProgressHandler);

// 일일 진행상황 업데이트
// PUT /api/progress/daily
router.put('/daily', verifyToken, updateDailyProgressHandler);

// 특정 문제의 진행상황 조회
// GET /api/progress/question/:questionId
router.get('/question/:questionId', verifyToken, getQuestionProgressHandler);

// =============================================================================
// Daily Progress API (새로운 상세 진행상황 API)
// =============================================================================

// 오늘의 학습 현황 조회 (홈 화면용)
// GET /api/progress/today/:userId?date=2023-12-01
// GET /api/progress/today (본인 데이터 조회)
router.get('/today/:userId', verifyToken, getTodayProgressHandler);
router.get('/today', verifyToken, getTodayProgressHandler);

// 일일 진행상황 업데이트 V2 (Day 완료시 호출)
// POST /api/progress/update-v2
// Body: { daysCompleted: number }
router.post('/update-v2', verifyToken, updateDailyProgressHandlerV2);

// 학습 히스토리 조회 (달력 뷰용)
// GET /api/progress/history/:userId?days=30
// GET /api/progress/history (본인 데이터 조회)
router.get('/history/:userId', verifyToken, getDailyHistoryHandler);
router.get('/history', verifyToken, getDailyHistoryHandler);

// 종합 학습 통계 조회 (MyPage용)
// GET /api/progress/stats/:userId
// GET /api/progress/stats (본인 데이터 조회 - MyPage용 종합 통계 (성취도, 학습 패턴))
router.get('/stats/:userId', verifyToken, getOverallStatsHandler);
router.get('/stats', verifyToken, getOverallStatsHandler);

// 홈 화면 대시보드 정보 (통합 API)
// GET /api/progress/dashboard
router.get('/dashboard', verifyToken, getDashboardHandler);

module.exports = router;