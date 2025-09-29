const jwt = require('jsonwebtoken');
const userQueries = require('../queries/userQueries');

require('dotenv').config();

// JWT 토큰 생성
function generateToken(user) {
  const payload = {
    uid: user.uid,
    email: user.email,
    name: user.name
  };

  const options = {
    expiresIn: '7d', // 7일 만료
    issuer: 'talk100-app',
    audience: 'talk100-users'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
}

// JWT 토큰 검증 미들웨어
async function verifyToken(req, res, next) {
  try {
    let token = null;

    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    // 쿠키에서 토큰 추출 (fallback)
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token not provided'
      });
    }

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // req.user에 토큰의 사용자 정보 추가
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name
    };
    req.token = token;

    next();
  } catch (error) {
    console.error('Token verification error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
}

// 선택적 인증 미들웨어 (토큰이 있으면 검증, 없으면 통과)
async function optionalAuth(req, res, next) {
  try {
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
      // 토큰이 없으면 그냥 통과
      req.user = null;
      return next();
    }

    // 토큰이 있으면 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name
    };
    req.token = token;

    next();
  } catch (error) {
    // 토큰 검증 실패해도 통과 (선택적이므로)
    req.user = null;
    next();
  }
}

// 관리자 권한 확인 미들웨어
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // 관리자 이메일 목록 (환경변수에서 관리)
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim());

  if (!adminEmails.includes(req.user.email)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
}

// 사용자 소유권 확인 미들웨어
function requireOwnership(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // URL 파라미터에서 userId 추출
  const requestedUserId = req.params.userId || req.params.uid;

  if (requestedUserId && requestedUserId !== req.user.uid) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: You can only access your own data'
    });
  }

  next();
}

// 토큰 갱신 미들웨어
async function refreshToken(req, res, next) {
  try {
    if (!req.user || !req.token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // 토큰 만료 시간 확인
    const decoded = jwt.decode(req.token);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - currentTime;

    // 만료 1일 전이면 새 토큰 발급
    if (timeUntilExpiry < 24 * 60 * 60) {
      const newToken = generateToken(req.user);

      // 응답 헤더에 새 토큰 포함
      res.setHeader('X-New-Token', newToken);

      // 쿠키로도 설정
      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7일
      });
    }

    next();
  } catch (error) {
    console.error('Token refresh error:', error.message);
    next(); // 에러가 있어도 계속 진행
  }
}

// 로그아웃 토큰 블랙리스트 (간단한 메모리 저장)
// 실제 운영에서는 Redis 등 사용 권장
const tokenBlacklist = new Set();

// 토큰 블랙리스트 확인
function checkBlacklist(req, res, next) {
  if (req.token && tokenBlacklist.has(req.token)) {
    return res.status(401).json({
      success: false,
      message: 'Token has been revoked'
    });
  }

  next();
}

// 토큰을 블랙리스트에 추가 (로그아웃 시)
function revokeToken(token) {
  tokenBlacklist.add(token);

  // 메모리 누수 방지를 위해 주기적으로 만료된 토큰 제거
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 7 * 24 * 60 * 60 * 1000); // 7일 후 제거
}

// API 키 인증 (관리자 도구용)
function verifyApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Invalid API key'
    });
  }

  next();
}

module.exports = {
  generateToken,
  verifyToken,
  optionalAuth,
  requireAdmin,
  requireOwnership,
  refreshToken,
  checkBlacklist,
  revokeToken,
  verifyApiKey
};