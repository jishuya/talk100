const express = require('express');
const passport = require('passport');
const { generateToken, revokeToken, verifyToken } = require('../middleware/auth');

const router = express.Router();

// Google OAuth 로그인 시작
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google OAuth 콜백 처리
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // JWT 토큰 생성
      const token = generateToken(req.user);

      // 쿠키에 토큰 설정
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
      });

      // 프론트엔드로 리디렉트 (사용자 정보 포함)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const userParam = encodeURIComponent(JSON.stringify(req.user));
      res.redirect(`${frontendUrl}?token=${token}&user=${userParam}&login=success`);

    } catch (error) {
      console.error('Google OAuth callback error:', error.message);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}?login=error`);
    }
  }
);

// Naver OAuth 로그인 시작
router.get('/naver', passport.authenticate('naver'));

// Naver OAuth 콜백 처리
router.get('/naver/callback',
  passport.authenticate('naver', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // JWT 토큰 생성
      const token = generateToken(req.user);

      // 쿠키에 토큰 설정
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
      });

      // 프론트엔드로 리디렉트 (사용자 정보 포함)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const userParam = encodeURIComponent(JSON.stringify(req.user));
      res.redirect(`${frontendUrl}?token=${token}&user=${userParam}&login=success`);

    } catch (error) {
      console.error('Naver OAuth callback error:', error.message);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}?login=error`);
    }
  }
);

// 로그아웃
router.post('/logout', verifyToken, (req, res) => {
  try {
    // 토큰 블랙리스트에 추가
    if (req.token) {
      revokeToken(req.token);
    }

    // 쿠키 제거
    res.clearCookie('token');

    // Passport 세션 제거
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err.message);
      }
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// 현재 사용자 정보 조회
router.get('/me', verifyToken, (req, res) => {
  try {
    const { uid, name, email, profile_image, voice_gender, default_difficulty,
            total_days_studied, current_streak, longest_streak,
            total_questions_attempted, total_correct_answers, weekly_attendance } = req.user;

    res.json({
      success: true,
      user: {
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
    console.error('Get user info error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
});

// 토큰 유효성 검증
router.get('/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: {
      uid: req.user.uid,
      name: req.user.name,
      email: req.user.email
    }
  });
});

// 토큰 갱신
router.post('/refresh', verifyToken, (req, res) => {
  try {
    // 새 토큰 생성
    const newToken = generateToken(req.user);

    // 기존 토큰 블랙리스트에 추가
    if (req.token) {
      revokeToken(req.token);
    }

    // 쿠키 업데이트
    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
    });

    res.json({
      success: true,
      token: newToken,
      message: 'Token refreshed successfully'
    });

  } catch (error) {
    console.error('Token refresh error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token'
    });
  }
});

// 로그인 상태 확인 (프론트엔드용)
router.get('/status', (req, res) => {
  let token = null;

  // Authorization 헤더에서 토큰 추출
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  // 쿠키에서 토큰 추출
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.json({
      success: false,
      authenticated: false,
      message: 'No token provided'
    });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      success: true,
      authenticated: true,
      user: {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name
      }
    });

  } catch (error) {
    res.json({
      success: false,
      authenticated: false,
      message: 'Invalid or expired token'
    });
  }
});

// 에러 처리 미들웨어
router.use((error, req, res, next) => {
  console.error('Auth route error:', error.message);

  if (error.message.includes('OAuth')) {
    return res.status(401).json({
      success: false,
      message: 'OAuth authentication failed'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Authentication service error'
  });
});

module.exports = router;