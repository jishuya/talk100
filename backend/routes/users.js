const express = require('express');
const { verifyToken } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// GET /api/users/profile - 사용자 프로필 조회
router.get('/profile', verifyToken, userController.getUserProfile);

module.exports = router;