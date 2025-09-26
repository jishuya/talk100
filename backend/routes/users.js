const express = require('express');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

/**
 * Users API Routes
 * Base URL: /api/users
 * 프론트엔드 호환성을 위한 사용자 관련 API
 */

// 사용자 프로필 조회 (프론트엔드 호환: /api/users/profile)
// GET /api/users/profile -> /auth/me와 동일한 응답
router.get('/profile', verifyToken, (req, res) => {
  try {
    const { uid, name, email, profile_image, voice_gender, default_difficulty,
            total_days_studied, current_streak, longest_streak,
            total_questions_attempted, total_correct_answers, weekly_attendance } = req.user;

    res.json({
      success: true,
      data: {
        uid, name, email, profile_image,
        voice_gender, default_difficulty,
        stats: {
          total_days_studied,
          current_streak,
          longest_streak,
          total_questions_attempted,
          total_correct_answers,
          weekly_attendance
        }
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

// 사용자 뱃지 조회 (향후 구현)
// GET /api/users/badges
router.get('/badges', verifyToken, (req, res) => {
  // 임시 응답 - 나중에 실제 뱃지 시스템 구현
  res.json({
    success: true,
    data: {
      trophy: 182,
      star: 4203,
      newBadges: ['7일 연속 학습'],
      totalEarned: 15
    }
  });
});

// 사용자 프로필 업데이트
// PUT /api/users/profile
router.put('/profile', verifyToken, (req, res) => {
  // 임시 응답 - 나중에 실제 업데이트 로직 구현
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: req.body
  });
});

module.exports = router;