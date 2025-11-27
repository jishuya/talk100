#!/usr/bin/env node

/**
 * Vercel 빌드 후 HTML 파일에 환경 변수를 런타임에 주입하는 스크립트
 *
 * 사용법:
 * - package.json의 "postbuild" 스크립트로 실행됨
 * - dist/index.html의 %VITE_API_BASE_URL% 플레이스홀더를 실제 환경 변수로 치환
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '../dist/index.html');

// 환경 변수 가져오기
const VITE_API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://talk100-production.up.railway.app';

console.log('\n🔧 [inject-env] 환경 변수 주입 시작...');
console.log(`📍 Target file: ${distPath}`);
console.log(`🌐 VITE_API_BASE_URL: ${VITE_API_BASE_URL}`);

try {
  // index.html 파일 읽기
  let html = fs.readFileSync(distPath, 'utf8');

  // 플레이스홀더를 실제 환경 변수로 치환
  html = html.replace('%VITE_API_BASE_URL%', VITE_API_BASE_URL);

  // 파일 다시 쓰기
  fs.writeFileSync(distPath, html, 'utf8');

  console.log('✅ [inject-env] 환경 변수 주입 완료!\n');
} catch (error) {
  console.error('❌ [inject-env] 환경 변수 주입 실패:', error.message);
  process.exit(1);
}
