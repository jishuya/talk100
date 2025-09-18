const express = require('express');
const {
  getWrongAnswersHandler,
  addWrongAnswerHandler,
  toggleStarHandler,
  removeWrongAnswerHandler,
  getWrongAnswersQuizHandler,
  getWrongAnswersStatsHandler,
  unstarAllHandler
} = require('../controllers/wrongAnswersController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Wrong Answers API Routes
 * Base URL: /api/wrong-answers
 * 모든 엔드포인트는 인증 필요
 *
 * 기능:
 * - 틀린 문제 관리 (⭐ 버튼)
 * - 난이도별 통과 점수 미달시 자동 추가
 * - 틀린 문제 퀴즈 제공
 */

// 틀린 문제 목록 조회
// GET /api/wrong-answers/:userId?starred=true
// GET /api/wrong-answers (본인 데이터 조회)
router.get('/:userId', verifyToken, getWrongAnswersHandler);
router.get('/', verifyToken, getWrongAnswersHandler);

// 틀린 문제 추가 (답변 제출시 자동 호출)
// POST /api/wrong-answers/add
// Body: { questionId: string }
router.post('/add', verifyToken, addWrongAnswerHandler);

// ⭐ 버튼 토글 (틀린 문제 표시/숨김)
// PUT /api/wrong-answers/toggle-star
// Body: { questionId: string }
router.put('/toggle-star', verifyToken, toggleStarHandler);

// 틀린 문제 완전 삭제
// DELETE /api/wrong-answers/:questionId
router.delete('/:questionId', verifyToken, removeWrongAnswerHandler);

// 틀린 문제 퀴즈용 랜덤 문제 조회
// GET /api/wrong-answers/quiz/:userId?limit=10
// GET /api/wrong-answers/quiz (본인 데이터 조회)
router.get('/quiz/:userId', verifyToken, getWrongAnswersQuizHandler);
router.get('/quiz', verifyToken, getWrongAnswersQuizHandler);

// 틀린 문제 통계 조회
// GET /api/wrong-answers/stats/:userId
// GET /api/wrong-answers/stats (본인 데이터 조회)
router.get('/stats/:userId', verifyToken, getWrongAnswersStatsHandler);
router.get('/stats', verifyToken, getWrongAnswersStatsHandler);

// 모든 ⭐ 해제 (대량 관리 기능)
// PUT /api/wrong-answers/unstar-all
router.put('/unstar-all', verifyToken, unstarAllHandler);

module.exports = router;