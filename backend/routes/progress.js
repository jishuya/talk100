const express = require('express');
const { verifyToken } = require('../middleware/auth');
const progressController = require('../controllers/progressController');

const router = express.Router();

// POST /api/progress/update - user_progress 업데이트 (인증 필요)
router.post('/update', verifyToken, progressController.updateProgress);

module.exports = router;
