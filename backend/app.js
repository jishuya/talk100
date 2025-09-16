const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

// 라우트 import (추후 생성)
// const authRoutes = require('./routes/auth');
// const questionRoutes = require('./routes/questions');

const app = express();

// 보안 미들웨어
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS 설정
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 기본 미들웨어
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API 라우트 (추후 활성화)
// app.use('/auth', authRoutes);
// app.use('/api/questions', questionRoutes);

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
});

module.exports = app;