# 🚀 talk100 배포 가이드 (Vercel + Railway)

## 📋 배포 전 준비사항

### 필요한 계정
- [ ] GitHub 계정
- [ ] Vercel 계정 (GitHub로 가입 권장)
- [ ] Railway 계정 (GitHub로 가입 권장)
- [ ] Google Cloud Console 계정
- [ ] Naver Developers 계정
- [ ] Kakao Developers 계정

### 로컬 환경 확인
```bash
# Git 설정 확인
git remote -v

# 코드 커밋 확인
git status

# 모든 변경사항 커밋
git add .
git commit -m "🚀 Ready for deployment"
git push origin master
```

---

## 1️⃣ Railway 배포 (Backend + PostgreSQL)

### Step 1: Railway 프로젝트 생성

1. **Railway 로그인**
   - https://railway.app 접속
   - "Login with GitHub" 클릭

2. **새 프로젝트 생성**
   - "New Project" 클릭
   - "Deploy from GitHub repo" 선택
   - `talk100` 저장소 선택
   - "Deploy Now" 클릭

### Step 2: PostgreSQL 데이터베이스 추가

1. **데이터베이스 생성**
   - 프로젝트 대시보드에서 "+ New" 클릭
   - "Database" → "Add PostgreSQL" 선택
   - 자동으로 생성 완료

2. **데이터베이스 연결 정보 확인**
   - PostgreSQL 서비스 클릭
   - "Connect" 탭에서 연결 정보 확인
   ```
   DATABASE_URL=postgresql://postgres:...
   ```

### Step 3: Backend 서비스 설정

1. **Root Directory 설정**
   - Backend 서비스 클릭
   - "Settings" 탭
   - "Root Directory" → `backend` 입력
   - "Save" 클릭

2. **Build Command 설정**
   - "Build Command" → 비워두기 (npm install 자동)
   - "Start Command" → `node app.js`

3. **환경변수 설정**
   - "Variables" 탭 클릭
   - 아래 환경변수 추가:

```env
# 데이터베이스 (PostgreSQL 서비스에서 자동 연결)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# 또는 개별 설정
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_NAME=${{Postgres.PGDATABASE}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}

# Node.js 환경
NODE_ENV=production
PORT=5000

# 세션 & JWT (랜덤 문자열 생성 필요)
SESSION_SECRET=your-super-secret-session-key-change-this
JWT_SECRET=your-super-secret-jwt-key-change-this

# Frontend URL (나중에 Vercel URL로 업데이트)
FRONTEND_URL=https://talk100.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-url.up.railway.app/auth/google/callback

# Naver OAuth
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret
NAVER_CALLBACK_URL=https://your-backend-url.up.railway.app/auth/naver/callback

# Kakao OAuth
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
KAKAO_CALLBACK_URL=https://your-backend-url.up.railway.app/auth/kakao/callback
```

4. **공개 도메인 생성**
   - "Settings" 탭
   - "Networking" 섹션
   - "Generate Domain" 클릭
   - 생성된 URL 기록: `https://talk100-backend-production.up.railway.app`

### Step 4: 데이터베이스 초기화

1. **Railway CLI 설치**
```bash
npm install -g @railway/cli
```

2. **Railway 로그인**
```bash
railway login
```

3. **프로젝트 연결**
```bash
railway link
```

4. **데이터베이스 연결 및 초기화**
```bash
# PostgreSQL 접속
railway connect postgres

# 또는 로컬에서 psql 사용
psql "postgresql://postgres:...@...railway.app:5432/railway"

# SQL 파일 실행
\i /path/to/talk100_postgresql.sql

# 또는 직접 복사 붙여넣기
```

5. **데이터 확인**
```sql
-- 테이블 목록 확인
\dt

-- 사용자 수 확인
SELECT COUNT(*) FROM users;

-- 문제 수 확인
SELECT COUNT(*) FROM questions;
```

---

## 2️⃣ Vercel 배포 (Frontend)

### Step 1: Vercel 프로젝트 생성

1. **Vercel 로그인**
   - https://vercel.com 접속
   - "Login with GitHub" 클릭

2. **새 프로젝트 생성**
   - "Add New..." → "Project" 클릭
   - GitHub 저장소 `talk100` 선택
   - "Import" 클릭

### Step 2: 빌드 설정

1. **Framework Preset**: Vite 자동 감지

2. **Root Directory**: `frontend` 입력

3. **Build Command**: 자동 (vite build)

4. **Output Directory**: `dist` (자동)

5. **Install Command**: 자동 (npm install)

### Step 3: 환경변수 설정

1. **Environment Variables** 섹션에서 추가:

```env
# Backend API URL (Railway에서 생성된 URL)
VITE_API_BASE_URL=https://talk100-backend-production.up.railway.app

# Mock 데이터 사용 여부
VITE_USE_MOCK_DATA=false
```

2. **"Deploy" 클릭**

3. **배포 완료 후 URL 확인**
   - `https://talk100.vercel.app` (예시)

---

## 3️⃣ 음원 파일 업로드

Railway는 파일 시스템을 제공하므로 음원 파일을 Git에 포함해야 합니다.

### Option 1: Git에 포함 (간단)

```bash
# .gitignore에서 audio 제외 확인
# backend/.gitignore에 public/audio가 없는지 확인

# 커밋 및 푸시
git add backend/public/audio
git commit -m "📦 Add audio files"
git push origin master
```

### Option 2: Railway Volumes (추천)

1. **Railway Volume 생성**
   - Backend 서비스 → "Settings"
   - "Volumes" → "New Volume"
   - Mount Path: `/app/backend/public/audio`
   - Size: 1GB

2. **파일 업로드**
```bash
# Railway CLI로 파일 복사
railway run --service backend cp -r backend/public/audio /app/backend/public/audio
```

---

## 4️⃣ OAuth 콜백 URL 업데이트

### Google Cloud Console

1. https://console.cloud.google.com 접속
2. "APIs & Services" → "Credentials"
3. OAuth 2.0 클라이언트 ID 선택
4. "승인된 리디렉션 URI" 수정:
```
https://talk100-backend-production.up.railway.app/auth/google/callback
```

### Naver Developers

1. https://developers.naver.com/apps 접속
2. 애플리케이션 선택
3. "API 설정" → "서비스 URL" 및 "Callback URL" 수정:
```
Callback URL: https://talk100-backend-production.up.railway.app/auth/naver/callback
```

### Kakao Developers

1. https://developers.kakao.com/console/app 접속
2. 애플리케이션 선택
3. "카카오 로그인" → "Redirect URI" 수정:
```
https://talk100-backend-production.up.railway.app/auth/kakao/callback
```

---

## 5️⃣ 환경변수 업데이트

### Railway Backend 환경변수 업데이트

실제 URL로 콜백 URL 수정:

```env
FRONTEND_URL=https://talk100.vercel.app
GOOGLE_CALLBACK_URL=https://talk100-backend-production.up.railway.app/auth/google/callback
NAVER_CALLBACK_URL=https://talk100-backend-production.up.railway.app/auth/naver/callback
KAKAO_CALLBACK_URL=https://talk100-backend-production.up.railway.app/auth/kakao/callback
```

### Vercel Frontend 환경변수 확인

```env
VITE_API_BASE_URL=https://talk100-backend-production.up.railway.app
```

---

## 6️⃣ CORS 설정 확인

`backend/app.js`에서 CORS 설정 확인:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

환경변수 `FRONTEND_URL`이 올바르게 설정되었는지 확인!

---

## 7️⃣ 배포 테스트

### Backend 헬스 체크

```bash
curl https://talk100-backend-production.up.railway.app/health
```

예상 응답:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

### Frontend 접속

1. https://talk100.vercel.app 접속
2. 로그인 버튼 클릭
3. Google/Naver/Kakao 로그인 테스트
4. 퀴즈 시작 및 음원 재생 테스트

---

## 8️⃣ 로그 및 모니터링

### Railway 로그 확인

1. Backend 서비스 클릭
2. "Deployments" 탭
3. 최신 배포 클릭
4. "View Logs" 버튼

### Vercel 로그 확인

1. 프로젝트 대시보드
2. "Deployments" 탭
3. 최신 배포 클릭
4. "Build Logs" 및 "Function Logs" 확인

---

## 9️⃣ 성능 최적화 (선택)

### Railway

1. **Healthcheck 설정**
   - "Settings" → "Healthcheck"
   - Path: `/health`
   - Interval: 60초

2. **리소스 모니터링**
   - "Metrics" 탭에서 CPU/메모리 사용량 확인

### Vercel

1. **Analytics 활성화**
   - "Analytics" 탭에서 활성화
   - 사용자 통계 및 성능 모니터링

2. **Speed Insights**
   - Lighthouse 점수 자동 측정

---

## 🔟 배포 후 체크리스트

- [ ] Backend 헬스 체크 성공
- [ ] Frontend 정상 접속
- [ ] Google OAuth 로그인 성공
- [ ] Naver OAuth 로그인 성공
- [ ] Kakao OAuth 로그인 성공
- [ ] 퀴즈 문제 로드 성공
- [ ] 음원 재생 성공
- [ ] 음성 인식 작동 (HTTPS 필수)
- [ ] 진행률 저장 성공
- [ ] 즐겨찾기/틀린문제 기능 작동

---

## 🚨 트러블슈팅

### 1. CORS 에러

**증상**: `Access-Control-Allow-Origin` 에러

**해결**:
```bash
# Railway 환경변수 확인
FRONTEND_URL=https://talk100.vercel.app (정확한 URL)
```

### 2. OAuth 리디렉션 실패

**증상**: 로그인 후 에러 페이지

**해결**:
- OAuth 제공자의 콜백 URL이 정확한지 확인
- HTTPS 사용 확인
- Railway 환경변수의 콜백 URL 확인

### 3. 음원 재생 안 됨

**증상**: 오디오 파일 404 에러

**해결**:
```bash
# 파일 경로 확인
ls backend/public/audio/

# Railway 재배포
git push origin master
```

### 4. 데이터베이스 연결 실패

**증상**: Database connection error

**해결**:
```bash
# Railway PostgreSQL 상태 확인
railway status

# 환경변수 확인
railway variables
```

### 5. 세션 유지 안 됨

**증상**: 로그인 후 새로고침하면 로그아웃

**해결**:
```env
# Railway 환경변수 확인
SESSION_SECRET=... (설정 필수)

# CORS credentials 확인
credentials: true
```

---

## 📊 예상 비용

### 무료 시작 (개발/테스트)
- Vercel: 무료
- Railway: $5 크레딧/월 (500시간)
- **총: $0~5/월**

### 프로덕션 (실사용)
- Vercel: 무료 (충분)
- Railway Hobby: $5/월
- Railway DB: $5/월
- **총: $10/월**

---

## 🎉 배포 완료!

배포가 완료되었습니다! 🚀

**프로덕션 URL**:
- Frontend: https://talk100.vercel.app
- Backend: https://talk100-backend-production.up.railway.app

**다음 단계**:
1. 실제 사용자 초대 및 테스트
2. 피드백 수집 및 버그 수정
3. 성능 모니터링
4. 기능 개선

---

## 📞 지원

문제가 발생하면:
1. Railway 로그 확인
2. Vercel 로그 확인
3. Browser DevTools Console 확인
4. GitHub Issues 생성
