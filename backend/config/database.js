const pgp = require('pg-promise')({
  capSQL: true,
  query: (e) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒QUERY:', e.query);
      if (e.params) console.log('🔑PARAMS:', e.params);
    }
  },
  error: (err, e) => {
    if (e.cn) console.error('Database connection error:', err.message || err);
    if (e.query) {
      console.error('Query error:', e.query);
      if (e.params) console.error('Params:', e.params);
    }
  }
});

// 🔹 개발에서만 .env 사용
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const isProduction = process.env.NODE_ENV === 'production';

const baseConfig = {
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: isProduction ? { rejectUnauthorized: false } : false
};

let dbConfig;

// 🔹 Railway(운영)에서는 DATABASE_URL 사용
if (isProduction && process.env.DATABASE_URL) {
  dbConfig = {
    ...baseConfig,
    connectionString: process.env.DATABASE_URL
  };
  console.log('📦 Using DATABASE_URL for PostgreSQL (production).');
} else {
  // 🔹 로컬 개발용
  dbConfig = {
    ...baseConfig,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'talk100',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  };
  console.log(
    `📦 Using local DB config: ${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`
  );
}

const db = pgp(dbConfig);

async function testConnection() {
  try {
    await db.any('SELECT version()');
    const label = dbConfig.connectionString
      ? 'DATABASE_URL (production)'
      : `${dbConfig.database}@${dbConfig.host}:${dbConfig.port}`;
    console.log(`✅ Database connected successfully: ${label}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// 트랜잭션/헬퍼는 기존 그대로 유지
async function withTransaction(callback) {
  return db.tx(async (t) => {
    return await callback(t);
  });
}

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
  helpers: pgp.helpers,
  as: pgp.as
};
