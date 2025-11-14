// backend/config/database.js

const pgp = require('pg-promise')({
  // PostgreSQL 최적화 설정
  capSQL: true,

  // 쿼리 로그 (개발 환경에서만)
  query: (e) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒QUERY:', e.query);
      if (e.params) {
        console.log('🔑PARAMS:', e.params);
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

// ✅ 개발에서만 .env 사용 (Railway에서는 안 씀)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const isProduction = process.env.NODE_ENV === 'production';

// 디버깅용 로그 (지금 문제 파악에 중요)
console.log('NODE_ENV at startup:', process.env.NODE_ENV);
console.log(
  'DATABASE_URL present?',
  process.env.DATABASE_URL ? 'YES' : 'NO'
);

let dbConfig;

// ✅ 1순위: DATABASE_URL 있으면 무조건 이걸 사용
if (process.env.DATABASE_URL) {
  dbConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: isProduction ? { rejectUnauthorized: false } : false
  };

  console.log('📦 Using DATABASE_URL for PostgreSQL.');
} else {
  // 🔁 fallback: 로컬 개발용 설정
  dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'talk100',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: isProduction ? { rejectUnauthorized: false } : false
  };

  console.log(
    `📦 Using local DB config: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`
  );
}

// DB 인스턴스
const db = pgp(dbConfig);

// 연결 테스트
async function testConnection() {
  try {
    await db.any('SELECT version()');
    const label = dbConfig.connectionString
      ? 'DATABASE_URL'
      : `${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`;
    console.log(`✅ Database connected successfully: ${label}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// 트랜잭션 헬퍼
async function withTransaction(callback) {
  return db.tx(async (t) => {
    return await callback(t);
  });
}

// 배치 인서트 헬퍼
async function batchInsert(table, columns, data, options = {}) {
  if (!data || data.length === 0) {
    return { success: true, rowsAffected: 0 };
  }

  try {
    const cs = new pgp.helpers.ColumnSet(columns, { table });
    let query = pgp.helpers.insert(data, cs);

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

// 안전 쿼리 헬퍼
async function safeQuery(query, params = null) {
  try {
    return await db.any(query, params);
  } catch (error) {
    console.error('Safe query error:', error.message);
    throw error;
  }
}

async function safeQueryOneOrNone(query, params = null) {
  try {
    return await db.oneOrNone(query, params);
  } catch (error) {
    console.error('Safe query one or none error:', error.message);
    throw error;
  }
}

// 시작 시 한 번 연결 테스트
testConnection();

module.exports = {
  db,
  pgp,
  testConnection,
  withTransaction,
  batchInsert,
  safeQuery,
  safeQueryOneOrNone,
  helpers: pgp.helpers,
  as: pgp.as
};
