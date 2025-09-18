const express = require('express');
const {
  submitAnswerHandler,
  getUserProgressHandler,
  dayCompleteHandler,
  getDailyProgressHandler,
  updateDailyProgressHandler,
  getQuestionProgressHandler
} = require('../controllers/progressController');
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

module.exports = router;