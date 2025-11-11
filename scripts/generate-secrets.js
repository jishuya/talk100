#!/usr/bin/env node

/**
 * 배포용 랜덤 SECRET 생성 스크립트
 *
 * 사용법:
 * node scripts/generate-secrets.js
 */

const crypto = require('crypto');

console.log('\n🔐 talk100 배포용 SECRET 키 생성\n');
console.log('='.repeat(60));

// SESSION_SECRET 생성 (64자)
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('\n📌 SESSION_SECRET:');
console.log(sessionSecret);

// JWT_SECRET 생성 (64자)
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('\n📌 JWT_SECRET:');
console.log(jwtSecret);

console.log('\n' + '='.repeat(60));
console.log('\n✅ Railway 환경변수에 위 값들을 복사하여 붙여넣으세요!\n');
console.log('⚠️  주의: 이 값들은 절대 Git에 커밋하지 마세요!\n');
