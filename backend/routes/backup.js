const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const { verifyToken } = require('../middleware/auth');

// GET /api/backup - 학습 기록 백업 데이터 조회
router.get('/', verifyToken, backupController.getBackupData);

// GET /api/backup/export - 데이터 내보내기용 통계 조회
router.get('/export', verifyToken, backupController.getExportData);

// DELETE /api/backup/reset - 학습 기록 초기화
router.delete('/reset', verifyToken, backupController.resetLearningData);

// DELETE /api/backup/account - 계정 완전 삭제
router.delete('/account', verifyToken, backupController.deleteAccount);

module.exports = router;
