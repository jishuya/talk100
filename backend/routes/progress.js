const express = require('express');
const { verifyToken } = require('../middleware/auth');
const progressController = require('../controllers/progressController');

const router = express.Router();

// POST /api/progress/update - user_progress 업데이트 (인증 필요)
router.post('/update', verifyToken, progressController.updateProgress);

// POST /api/progress/day-complete - daily_progress 업데이트 (인증 필요)
router.post('/day-complete', verifyToken, progressController.completeDayProgress);

module.exports = router;
