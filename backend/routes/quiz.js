const express = require('express');
const { verifyToken } = require('../middleware/auth');
const quizController = require('../controllers/quizController');

const router = express.Router();

// GET /api/quiz/daily - 오늘의 퀴즈 조회 (인증 필요)
router.get('/daily', verifyToken, quizController.getDailyQuiz);

module.exports = router;
