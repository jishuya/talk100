const express = require('express');
const { verifyToken } = require('../middleware/auth');
const quizController = require('../controllers/quizController');

const router = express.Router();

// POST /api/quiz/session - 퀴즈 세션 생성 (인증 필요)
router.post('/session', verifyToken, quizController.createSession);

// GET /api/quiz/questions?category={id}&day={num} - Day별 전체 문제 조회
router.get('/questions', quizController.getQuestions);

// GET /api/quiz/question/:id - 특정 문제 조회
router.get('/question/:id', quizController.getQuestion);

// GET /api/quiz/day-range?category={id} - 카테고리별 Day 범위 조회
router.get('/day-range', quizController.getDayRange);

// GET /api/quiz/favorites - 즐겨찾기 문제 조회 (인증 필요)
router.get('/favorites', verifyToken, quizController.getFavorites);

// GET /api/quiz/wrong-answers - 틀린 문제 조회 (인증 필요)
router.get('/wrong-answers', verifyToken, quizController.getWrongAnswers);

module.exports = router;
