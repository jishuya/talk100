#!/bin/bash

# ===========================================
# 로컬 DB 데이터 확인 스크립트
# ===========================================

echo "🔍 로컬 PostgreSQL 데이터 확인"
echo "======================================"

DB_NAME="talk100"
DB_USER="postgres"

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "📊 데이터베이스 연결 확인 중..."

# DB 연결 테스트
if ! psql -U $DB_USER -d $DB_NAME -c "\q" 2>/dev/null; then
    echo -e "${RED}✗ 로컬 PostgreSQL 연결 실패${NC}"
    echo ""
    echo "원인:"
    echo "1. PostgreSQL이 설치되지 않았거나"
    echo "2. talk100 데이터베이스가 없거나"
    echo "3. PostgreSQL 서비스가 중지됨"
    echo ""
    echo -e "${GREEN}➡️  덤프 불필요! Railway에서 talk100_postgresql.sql만 실행하세요.${NC}"
    exit 0
fi

echo -e "${GREEN}✓ 로컬 PostgreSQL 연결 성공${NC}"
echo ""

# 사용자 수 확인
echo "👥 사용자 데이터 확인"
echo "--------------------------------------"
USER_COUNT=$(psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM users WHERE uid NOT LIKE 'test_%';" 2>/dev/null | xargs)
echo "실제 사용자 수: ${USER_COUNT}명"

if [ "$USER_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  실제 사용자 없음 (테스트 계정만 있음)${NC}"
else
    echo -e "${BLUE}ℹ️  실제 사용자 발견!${NC}"
    psql -U $DB_USER -d $DB_NAME -c "SELECT uid, name, email, last_login_at FROM users WHERE uid NOT LIKE 'test_%' ORDER BY last_login_at DESC LIMIT 5;"
fi

echo ""

# 퀴즈 시도 기록 확인
echo "📝 퀴즈 시도 기록 확인"
echo "--------------------------------------"
ATTEMPT_COUNT=$(psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM question_attempts;" 2>/dev/null | xargs)
echo "총 시도 횟수: ${ATTEMPT_COUNT}회"

if [ "$ATTEMPT_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  퀴즈 시도 기록 없음${NC}"
else
    echo -e "${BLUE}ℹ️  퀴즈 시도 기록 발견!${NC}"
fi

echo ""

# 진행률 데이터 확인
echo "📊 진행률 데이터 확인"
echo "--------------------------------------"
PROGRESS_COUNT=$(psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM user_progress;" 2>/dev/null | xargs)
echo "진행률 레코드: ${PROGRESS_COUNT}개"

if [ "$PROGRESS_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  진행률 데이터 없음${NC}"
else
    echo -e "${BLUE}ℹ️  진행률 데이터 발견!${NC}"
fi

echo ""

# 즐겨찾기/틀린문제 확인
echo "⭐ 개인 데이터 확인"
echo "--------------------------------------"
FAVORITE_COUNT=$(psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM favorites;" 2>/dev/null | xargs)
WRONG_COUNT=$(psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM wrong_answers;" 2>/dev/null | xargs)
echo "즐겨찾기: ${FAVORITE_COUNT}개"
echo "틀린 문제: ${WRONG_COUNT}개"

echo ""
echo "======================================"

# 결론
TOTAL_DATA=$((USER_COUNT + ATTEMPT_COUNT + PROGRESS_COUNT + FAVORITE_COUNT + WRONG_COUNT))

if [ "$TOTAL_DATA" -eq 0 ]; then
    echo -e "${GREEN}✅ 결론: 중요한 데이터 없음${NC}"
    echo ""
    echo "➡️  Railway에서 talk100_postgresql.sql만 실행하세요."
    echo ""
    echo "명령어:"
    echo "  railway connect postgres"
    echo "  \i talk100_postgresql.sql"
else
    echo -e "${YELLOW}⚠️  결론: 중요한 데이터 발견!${NC}"
    echo ""
    echo "➡️  로컬 DB를 덤프해서 Railway로 이동하세요."
    echo ""
    echo "덤프 명령어:"
    echo "  pg_dump -U postgres -d talk100 -F c -f talk100_dump.backup"
    echo ""
    echo "또는 SQL 파일로:"
    echo "  pg_dump -U postgres -d talk100 -f talk100_dump.sql"
    echo ""
    echo "Railway 복원:"
    echo "  railway connect postgres"
    echo "  \i talk100_dump.sql"
fi

echo "======================================"
