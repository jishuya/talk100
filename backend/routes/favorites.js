const express = require('express');
const {
  getFavoritesHandler,
  toggleFavoriteHandler,
  getFavoritesQuizHandler,
  getFavoritesStatsHandler,
  removeAllFavoritesHandler,
  getFavoritesCountHandler
} = require('../controllers/favoritesController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Favorites API Routes
 * Base URL: /api/favorites
 * 모든 엔드포인트는 인증 필요
 *
 * 기능:
 * - 즐겨찾기 관리 (❤️ 버튼)
 * - 사용자가 직접 선택한 좋아하는 문제들
 * - 즐겨찾기 퀴즈 제공
 */

// 즐겨찾기 목록 조회
// GET /api/favorites/:userId?category=model_example
// GET /api/favorites (본인 데이터 조회)
router.get('/:userId', verifyToken, getFavoritesHandler);
router.get('/', verifyToken, getFavoritesHandler);

// ❤️ 버튼 토글 (즐겨찾기 추가/제거)
// POST /api/favorites/toggle
// Body: { questionId: string }
router.post('/toggle', verifyToken, toggleFavoriteHandler);

// 즐겨찾기 퀴즈용 랜덤 문제 조회
// GET /api/favorites/quiz/:userId?limit=10
// GET /api/favorites/quiz (본인 데이터 조회)
router.get('/quiz/:userId', verifyToken, getFavoritesQuizHandler);
router.get('/quiz', verifyToken, getFavoritesQuizHandler);

// 즐겨찾기 통계 조회
// GET /api/favorites/stats/:userId
// GET /api/favorites/stats (본인 데이터 조회)
router.get('/stats/:userId', verifyToken, getFavoritesStatsHandler);
router.get('/stats', verifyToken, getFavoritesStatsHandler);

// 즐겨찾기 개수 조회 (홈 화면용)
// GET /api/favorites/count/:userId
// GET /api/favorites/count (본인 데이터 조회)
router.get('/count/:userId', verifyToken, getFavoritesCountHandler);
router.get('/count', verifyToken, getFavoritesCountHandler);

// 모든 즐겨찾기 삭제 (대량 관리 기능)
// DELETE /api/favorites/all
router.delete('/all', verifyToken, removeAllFavoritesHandler);

module.exports = router;