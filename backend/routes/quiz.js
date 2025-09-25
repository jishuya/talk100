const express = require('express');
const {
  getQuizSessionHandler,
  updateQuizSessionHandler,
  completeQuizSessionHandler
} = require('../controllers/quizController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Quiz API Routes
 * Base URL: /api/quiz
 * 프론트엔드 호환성을 위한 새로운 퀴즈 API들
 */

// 퀴즈 세션 생성/조회
// GET /api/quiz/session/:categoryId?day=1&type=category
router.get('/session/:categoryId', verifyToken, getQuizSessionHandler);

// 퀴즈 세션 업데이트 (진행률 등)
// PUT /api/quiz/session/:sessionId
router.put('/session/:sessionId', verifyToken, updateQuizSessionHandler);

// 퀴즈 세션 완료
// POST /api/quiz/session/:sessionId/complete
router.post('/session/:sessionId/complete', verifyToken, completeQuizSessionHandler);

// 답변 제출 (progress 컨트롤러의 submitAnswerHandler 사용)
// POST /api/quiz/answer
const { submitAnswerHandler } = require('../controllers/progressController');
router.post('/answer', verifyToken, submitAnswerHandler);

module.exports = router;