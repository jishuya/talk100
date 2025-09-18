const express = require('express');
const {
  getNextReviewHandler,
  getReviewQuestionsHandler,
  completeReviewHandler,
  getReviewScheduleHandler
} = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Review API Routes (Day 번호 기반 복습 시스템)
 * Base URL: /api/review
 * 모든 엔드포인트는 인증 필요
 */

// 다음 복습할 Day 번호 조회
// GET /api/review/next/:userId
// GET /api/review/next (본인 데이터 조회)
router.get('/next/:userId', verifyToken, getNextReviewHandler);
router.get('/next', verifyToken, getNextReviewHandler);

// Day 번호로 복습 문제 동적 선택
// GET /api/review/questions/:day
router.get('/questions/:day', verifyToken, getReviewQuestionsHandler);

// 복습 완료 & 다음 주기 설정
// POST /api/review/complete
// Body: { queueId: number, isCorrect: boolean }
router.post('/complete', verifyToken, completeReviewHandler);

// 복습 스케줄 조회
// GET /api/review/schedule/:userId
// GET /api/review/schedule (본인 데이터 조회)
router.get('/schedule/:userId', verifyToken, getReviewScheduleHandler);
router.get('/schedule', verifyToken, getReviewScheduleHandler);

module.exports = router;