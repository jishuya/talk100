const express = require('express');
const { verifyToken } = require('../middleware/auth');
const progressController = require('../controllers/progressController');

const router = express.Router();

// POST /api/progress/update - user_progress 업데이트 (인증 필요)
router.post('/update', verifyToken, progressController.updateProgress);

// GET /api/progress/completed-days/:categoryId - 완료된 Day 목록 조회
router.get('/completed-days/:categoryId', verifyToken, progressController.getCompletedDays);

// POST /api/progress/complete-day - Day 완료 기록
router.post('/complete-day', verifyToken, progressController.markDayCompleted);

// POST /api/progress/reset-solved-count - solved_count 리셋 (추가 학습 시작 시)
router.post('/reset-solved-count', verifyToken, progressController.resetSolvedCount);

module.exports = router;
