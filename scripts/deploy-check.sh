#!/bin/bash

# ===========================================
# talk100 배포 전 체크리스트 스크립트
# ===========================================

echo "🚀 talk100 배포 전 체크리스트"
echo "======================================"

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 체크 함수
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo ""
echo "1️⃣  Git 상태 확인"
echo "--------------------------------------"

# Git 원격 저장소 확인
if git remote -v | grep -q "origin"; then
    check_pass "Git 원격 저장소 연결됨"
else
    check_fail "Git 원격 저장소 없음"
    exit 1
fi

# 커밋되지 않은 변경사항 확인
if [ -z "$(git status --porcelain)" ]; then
    check_pass "모든 변경사항 커밋됨"
else
    check_warn "커밋되지 않은 변경사항 있음"
    git status --short
fi

echo ""
echo "2️⃣  필수 파일 확인"
echo "--------------------------------------"

# Backend 필수 파일
if [ -f "backend/app.js" ]; then
    check_pass "backend/app.js 존재"
else
    check_fail "backend/app.js 없음"
fi

if [ -f "backend/package.json" ]; then
    check_pass "backend/package.json 존재"
else
    check_fail "backend/package.json 없음"
fi

# Frontend 필수 파일
if [ -f "frontend/package.json" ]; then
    check_pass "frontend/package.json 존재"
else
    check_fail "frontend/package.json 없음"
fi

if [ -f "frontend/vite.config.js" ]; then
    check_pass "frontend/vite.config.js 존재"
else
    check_fail "frontend/vite.config.js 없음"
fi

# SQL 파일
if [ -f "talk100_postgresql.sql" ]; then
    check_pass "talk100_postgresql.sql 존재"
else
    check_fail "talk100_postgresql.sql 없음"
fi

echo ""
echo "3️⃣  환경변수 템플릿 확인"
echo "--------------------------------------"

if [ -f ".env.production.example" ]; then
    check_pass ".env.production.example 존재"
else
    check_warn ".env.production.example 없음"
fi

echo ""
echo "4️⃣  음원 파일 확인"
echo "--------------------------------------"

if [ -d "backend/public/audio" ]; then
    audio_count=$(find backend/public/audio -name "*.mp3" | wc -l)
    if [ $audio_count -gt 0 ]; then
        check_pass "음원 파일 $audio_count 개 발견"
    else
        check_warn "음원 파일 없음"
    fi
else
    check_warn "backend/public/audio 폴더 없음"
fi

echo ""
echo "5️⃣  설정 파일 확인"
echo "--------------------------------------"

if [ -f "backend/railway.json" ]; then
    check_pass "backend/railway.json 존재"
else
    check_warn "backend/railway.json 없음 (선택사항)"
fi

if [ -f "frontend/vercel.json" ]; then
    check_pass "frontend/vercel.json 존재"
else
    check_warn "frontend/vercel.json 없음 (선택사항)"
fi

echo ""
echo "6️⃣  의존성 확인"
echo "--------------------------------------"

# Backend 의존성
if [ -f "backend/node_modules/.package-lock.json" ]; then
    check_pass "Backend 의존성 설치됨"
else
    check_warn "Backend 의존성 미설치 (npm install 필요)"
fi

# Frontend 의존성
if [ -f "frontend/node_modules/.package-lock.json" ]; then
    check_pass "Frontend 의존성 설치됨"
else
    check_warn "Frontend 의존성 미설치 (npm install 필요)"
fi

echo ""
echo "======================================"
echo "✅ 배포 전 체크 완료!"
echo ""
echo "다음 단계:"
echo "1. git push origin master (코드 푸시)"
echo "2. Railway에서 Backend 배포"
echo "3. Vercel에서 Frontend 배포"
echo "4. OAuth 콜백 URL 업데이트"
echo "5. 데이터베이스 초기화"
echo ""
echo "자세한 내용은 DEPLOYMENT.md 참고"
echo "======================================"
