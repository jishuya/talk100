const pgp = require('pg-promise')();
require('dotenv').config();

// PostgreSQL 연결 설정
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5434,
  database: process.env.DB_NAME || 'talk100',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 30, // 최대 연결 수
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// 데이터베이스 연결 인스턴스 생성
const db = pgp(dbConfig);

// 연결 테스트
db.connect()
  .then(obj => {
    console.log('✅ PostgreSQL 데이터베이스 연결 성공:', process.env.DB_NAME);
    obj.done(); // 테스트 연결 해제
  })
  .catch(error => {
    console.error('❌ PostgreSQL 데이터베이스 연결 실패:', error.message);
  });

module.exports = db;