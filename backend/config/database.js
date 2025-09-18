const pgp = require('pg-promise')({
  // PostgreSQL 최적화 설정
  capSQL: true,

  // 연결 해제시 로그
  disconnect: (dc) => {
    const cp = dc.client.connectionParameters;
    console.log(`Disconnected from database: ${cp.database}@${cp.host}:${cp.port}`);
  },

  // 쿼리 로그 (개발 환경에서만)
  query: (e) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('QUERY:', e.query);
      if (e.params) {
        console.log('PARAMS:', e.params);
      }
    }
  },

  // 에러 로그
  error: (err, e) => {
    if (e.cn) {
      console.error('Database connection error:', err.message || err);
    }
    if (e.query) {
      console.error('Query error:', e.query);
      if (e.params) {
        console.error('Params:', e.params);
      }
    }
  }
});

require('dotenv').config();

// 데이터베이스 연결 설정
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'talk100',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',

  // 연결 풀 설정
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000, // 유휴 연결 타임아웃
  connectionTimeoutMillis: 2000, // 연결 타임아웃

  // SSL 설정 (프로덕션에서는 true로 변경)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// 데이터베이스 연결 생성
const db = pgp(dbConfig);

// 연결 테스트 함수
async function testConnection() {
  try {
    await db.any('SELECT version()');
    console.log(`✅ Database connected successfully: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// 트랜잭션 헬퍼 함수
async function withTransaction(callback) {
  return db.tx(async (t) => {
    return await callback(t);
  });
}

// 배치 처리 헬퍼 함수
async function batchInsert(table, columns, data, options = {}) {
  if (!data || data.length === 0) {
    return { success: true, rowsAffected: 0 };
  }

  try {
    const cs = new pgp.helpers.ColumnSet(columns, { table });
    const query = pgp.helpers.insert(data, cs);

    if (options.onConflict) {
      query += ` ON CONFLICT ${options.onConflict}`;
    }

    const result = await db.result(query);
    return { success: true, rowsAffected: result.rowCount };
  } catch (error) {
    console.error(`Batch insert error for table ${table}:`, error.message);
    throw error;
  }
}

// 안전한 쿼리 실행 함수
async function safeQuery(query, params = null) {
  try {
    return await db.any(query, params);
  } catch (error) {
    console.error('Safe query error:', error.message);
    throw error;
  }
}

// 선택적 단일 결과 조회 함수
async function safeQueryOneOrNone(query, params = null) {
  try {
    return await db.oneOrNone(query, params);
  } catch (error) {
    console.error('Safe query one or none error:', error.message);
    throw error;
  }
}

// 초기화 시 연결 테스트
testConnection();

module.exports = {
  db,
  pgp,
  testConnection,
  withTransaction,
  batchInsert,
  safeQuery,
  safeQueryOneOrNone,

  // 유틸리티 함수들
  helpers: pgp.helpers,
  as: pgp.as
};