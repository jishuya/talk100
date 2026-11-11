const express = require('express');
const cors = require('cors');
const { getAllowedFrontendOrigins } = require('./config/frontendOrigins');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cookieParser = require('cookie-parser');

// require('dotenv').config();
// ▶ 운영에서 dotenv가 값을 덮어쓰지 않도록 (개발일 때만 로드)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// 데이터베이스 연결
const { db, testConnection } = require('./config/database');

// Passport 설정
const passport = require('./config/passport');

// 라우트 import
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const quizRoutes = require('./routes/quiz');
const progressRoutes = require('./routes/progress');
const avatarRoutes = require('./routes/avatar');
const settingsRoutes = require('./routes/settings');
const mypageRoutes = require('./routes/mypage');
const backupRoutes = require('./routes/backup');

const app = express();



// 보안 미들웨어
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:5173'], // 음원 파일 로드 허용
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }, // 음원 파일 cross-origin 로드 허용
}));

// CORS 설정
app.use(cors({
  origin: getAllowedFrontendOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
}));

// 기본 미들웨어
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 세션 설정 (PostgreSQL 저장)
app.use(session({
  store: new pgSession({
    pool: db.$pool, // pg-promise 풀 사용
    tableName: 'session' // 세션 테이블명 (자동 생성됨)
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30일
  }
}));

// Passport 미들웨어
app.use(passport.initialize());
app.use(passport.session());

// 정적 파일 서빙 (음원 파일)
const path = require('path');
app.use('/audio', express.static(path.join(__dirname, 'public/audio'), {
  maxAge: '7d',        // 7일간 브라우저 캐싱
  etag: true,          // ETag 헤더 활성화 (파일 변경 감지)
  lastModified: true,  // Last-Modified 헤더 활성화
  immutable: true,     // 캐시 불변성 (음원은 변경되지 않음)
  setHeaders: (res, filePath) => {
    // Use the global CORS middleware for both API and audio responses.
    // 음원 파일용 Content-Type (자동 설정되지만 명시)
    if (filePath.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
    }
  }
}));

// 루트 경로 응답
app.get('/', (req, res) => {
  res.json({
    name: 'talk100 API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api/*'
    }
  });
});

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API 라우트
app.use('/auth', authRoutes);
app.use('/api/mypage', mypageRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/avatar', avatarRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/backup', backupRoutes);
// app.use('/api/questions', questionRoutes);
// app.use('/api/review', reviewRoutes);
// app.use('/api/wrong-answers', wrongAnswersRoutes);
// app.use('/api/favorites', favoritesRoutes);

// 404 처리
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// 전역 에러 핸들러
app.use((error, req, res, next) => {
  console.error('서버 에러:', error);

  // 개발 환경에서는 상세 에러 정보 제공
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(error.status || 500).json({
    error: error.message || 'Internal Server Error',
    ...(isDevelopment && { stack: error.stack }),
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 talk100 백엔드 서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log(`📍 헬스 체크: http://localhost:${PORT}/health`);
  console.log(`🌍 환경: ${process.env.NODE_ENV || 'development'}`);

  // OAuth 설정 확인 로그
  console.log('\n=== OAuth 설정 확인 ===');
  console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID ? '✓ 설정됨' : '✗ 없음');
  console.log('Naver Client ID:', process.env.NAVER_CLIENT_ID ? '✓ 설정됨' : '✗ 없음');
  console.log('Kakao Client ID:', process.env.KAKAO_CLIENT_ID ? '✓ 설정됨' : '✗ 없음');
  console.log('Kakao Client ID 값:', process.env.KAKAO_CLIENT_ID);
  console.log('Kakao Client Secret:', process.env.KAKAO_CLIENT_SECRET ? '✓ 설정됨' : '✗ 없음');
  console.log('Kakao Callback URL:', process.env.KAKAO_CALLBACK_URL);
  console.log('======================\n');
});

module.exports = app;