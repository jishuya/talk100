const express = require('express');
const { verifyToken } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// GET /api/users/profile - 사용자 프로필 조회
router.get('/profile', verifyToken, userController.getUserProfile);

// GET /api/users/badges - 사용자 뱃지 정보 조회
router.get('/badges', verifyToken, userController.getBadges);

// GET /api/users/progress - 사용자 진행률 조회
router.get('/progress', verifyToken, userController.getProgress);

// GET /api/users/personal-quizzes - 개인 퀴즈 데이터 조회 (즐겨찾기, 틀린문제 개수)
router.get('/personal-quizzes', verifyToken, userController.getPersonalQuizzes);

// GET /api/users/history - 최근 학습 기록 조회
router.get('/history', verifyToken, userController.getHistory);

// GET /api/users/badges-achievements - 성취 뱃지 조회
router.get('/badges-achievements', verifyToken, userController.getBadgesAchievements);

// POST /api/users/check-badges - 뱃지 체크 (강제 실행)
router.post('/check-badges', verifyToken, userController.checkBadges);

// GET /api/users/summary-stats - 통계 요약 정보 조회
router.get('/summary-stats', verifyToken, userController.getSummaryStats);

// GET /api/users/streak-data - 연속 학습 일수 조회
router.get('/streak-data', verifyToken, userController.getStreakData);

// GET /api/users/weekly-chart - 요일별 학습 패턴 조회
router.get('/weekly-chart', verifyToken, userController.getWeeklyChart);

// GET /api/users/category-progress - 카테고리별 진행률 조회
router.get('/category-progress', verifyToken, userController.getCategoryProgress);

// GET /api/users/learning-pattern - 학습 패턴 분석 조회
router.get('/learning-pattern', verifyToken, userController.getLearningPattern);

// PUT /api/users/goals - 학습 목표 업데이트
router.put('/goals', verifyToken, userController.updateGoals);

// PUT /api/users/profile - 프로필 업데이트 (이름, 이메일)
router.put('/profile', verifyToken, userController.updateProfile);

// GET /api/users/quiz-mode - 퀴즈 모드 조회
router.get('/quiz-mode', verifyToken, userController.getQuizMode);

// PUT /api/users/quiz-mode - 퀴즈 모드 업데이트
router.put('/quiz-mode', verifyToken, userController.updateQuizMode);

module.exports = router;