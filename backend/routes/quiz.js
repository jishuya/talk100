const express = require('express');
const { verifyToken } = require('../middleware/auth');
const quizController = require('../controllers/quizController');

const router = express.Router();

// GET /api/quiz/daily - 오늘의 퀴즈 조회 (인증 필요)
router.get('/daily', verifyToken, quizController.getDailyQuiz);

// GET /api/quiz/category/:categoryId - 카테고리별 퀴즈 조회 (인증 필요)
router.get('/category/:categoryId', verifyToken, quizController.getCategoryQuiz);

// GET /api/quiz/wrong-answers - 틀린 문제 퀴즈 조회 (인증 필요)
router.get('/wrong-answers', verifyToken, quizController.getWrongAnswersQuiz);

// GET /api/quiz/favorites - 즐겨찾기 퀴즈 조회 (인증 필요)
router.get('/favorites', verifyToken, quizController.getFavoritesQuiz);

// POST /api/quiz/wrong-answers/toggle - 틀린 문제 토글 (인증 필요)
router.post('/wrong-answers/toggle', verifyToken, quizController.toggleWrongAnswer);

// POST /api/quiz/favorites/toggle - 즐겨찾기 토글 (인증 필요)
router.post('/favorites/toggle', verifyToken, quizController.toggleFavorite);

module.exports = router;
