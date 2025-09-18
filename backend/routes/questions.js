const express = require('express');
const {
  getQuestionsByDayHandler,
  getQuestionsByCategoryHandler,
  getCategoriesHandler,
  getQuestionByIdHandler,
  getCategoryStatsHandler
} = require('../controllers/questionController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Question API Routes
 * Base URL: /api/questions
 */

// 카테고리 목록 조회
// GET /api/questions/categories
router.get('/categories', getCategoriesHandler);

// 특정 카테고리의 특정 Day 문제들 조회
// GET /api/questions/:category/:day
router.get('/:category/:day', verifyToken, getQuestionsByDayHandler);

// 특정 카테고리의 모든 문제 조회 (Day별 그룹화)
// GET /api/questions/:category
router.get('/:category', verifyToken, getQuestionsByCategoryHandler);

// 카테고리별 통계 조회
// GET /api/questions/:category/stats
router.get('/:category/stats', verifyToken, getCategoryStatsHandler);

// 특정 문제 조회 (ID로)
// GET /api/questions/question/:questionId
router.get('/question/:questionId', verifyToken, getQuestionByIdHandler);

module.exports = router;