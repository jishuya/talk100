// backend/config/database.js

const pgp = require('pg-promise')({
  // PostgreSQL 최적화 설정
  capSQL: true
});

// ✅ 개발에서만 .env 사용 (Railway에서는 안 씀)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const isProduction = process.env.NODE_ENV === 'production';


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

}

// DB 인스턴스
const db = pgp(dbConfig);

// 연결 테스트
async function testConnection() {
  try {
    await db.any('SELECT version()');
    return true;
  } catch {
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
    throw error;
  }
}

// 안전 쿼리 헬퍼
async function safeQuery(query, params = null) {
  try {
    return await db.any(query, params);
  } catch (error) {
    throw error;
  }
}

async function safeQueryOneOrNone(query, params = null) {
  try {
    return await db.oneOrNone(query, params);
  } catch (error) {
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
