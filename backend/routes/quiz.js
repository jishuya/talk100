const express = require('express');
const { verifyToken } = require('../middleware/auth');
const quizController = require('../controllers/quizController');

const router = express.Router();

// GET /api/quiz/daily - 오늘의 퀴즈 조회 (인증 필요)
router.get('/daily', verifyToken, quizController.getDailyQuiz);

// GET /api/quiz/category/:categoryId - 카테고리별 퀴즈 조회 (인증 필요)
router.get('/category/:categoryId', verifyToken, quizController.getCategoryQuiz);

module.exports = router;
