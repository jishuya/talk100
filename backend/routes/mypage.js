const express = require('express');
const { verifyToken } = require('../middleware/auth');
const mypageController = require('../controllers/mypageController');

const router = express.Router();

// GET /api/mypage - 마이페이지 전체 데이터 조회
router.get('/', verifyToken, mypageController.getMypageData);

module.exports = router;
