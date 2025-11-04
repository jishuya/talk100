const express = require('express');
const { verifyToken } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

const router = express.Router();

// GET /api/settings - 사용자 설정 조회
router.get('/', verifyToken, settingsController.getSettings);

// PUT /api/settings - 사용자 설정 업데이트
router.put('/', verifyToken, settingsController.updateSettings);

module.exports = router;
