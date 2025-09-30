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

module.exports = router;