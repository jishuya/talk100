const express = require('express');
const router = express.Router();
const avatarController = require('../controllers/avatarController');
const { verifyToken } = require('../middleware/auth');

// 모든 라우트에 JWT 인증 적용
router.use(verifyToken);

// GET /api/avatar/system - 아바타 시스템 정보 조회
router.get('/system', avatarController.getAvatarSystem);

// PUT /api/avatar/select - 아바타 변경
router.put('/select', avatarController.updateAvatar);

module.exports = router;
