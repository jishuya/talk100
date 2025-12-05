# talk100

영어문장 암기 학습 앱 (MVP)

## 기술 스택

- **Frontend**: React 19 + Vite + Tailwind CSS + React Query
- **Backend**: Node.js + Express 5 + PostgreSQL (pg-promise)
- **Auth**: Passport.js (Google/Naver/Kakao OAuth) + JWT

## 프로젝트 구조

```
talk100/
├── backend/
│   ├── app.js              # Express 앱 진입점
│   ├── config/             # DB, Passport 설정
│   ├── routes/             # API 라우트 (auth, quiz, users, progress, settings, mypage, avatar, backup)
│   ├── controllers/        # 요청 처리 로직
│   ├── queries/            # SQL 쿼리 (pg-promise)
│   ├── services/           # 비즈니스 로직 (badge, avatar, dayReview)
│   ├── middleware/         # JWT 인증
│   └── public/audio/       # 음성 파일 (265MB)
│
├── frontend/src/
│   ├── pages/              # 페이지 컴포넌트 (Home, Quiz, MyPage, Status, Settings, Login)
│   ├── components/         # UI 컴포넌트 (ui/, home/, quiz/, mypage/, settings/, stats/, layout/)
│   ├── hooks/              # React Query 훅 (useApi.js), useVoiceInput, useQuizGrading
│   ├── services/           # API 서비스 (apiService.js - Mock/Real 자동 전환)
│   ├── contexts/           # Auth, Theme, App Context
│   ├── mocks/              # Mock 데이터
│   └── styles/             # CSS 변수 기반 디자인 시스템
│
└── talk100_postgresql.sql  # DB 스키마
```

## 개발 환경

```bash
# 백엔드 (포트 5000)
cd backend && npm install && npm run dev

# 프론트엔드 (포트 5173)
cd frontend && npm install && npm run dev

# DB 초기화
psql -U postgres -c "CREATE DATABASE talk100;"
psql -U postgres -d talk100 -f talk100_postgresql.sql
```

### 환경 변수

**backend/.env**
```
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/talk100
JWT_SECRET=xxx
SESSION_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
NAVER_CLIENT_ID=xxx
NAVER_CLIENT_SECRET=xxx
KAKAO_CLIENT_ID=xxx
KAKAO_CLIENT_SECRET=xxx
FRONTEND_URL=http://localhost:5173
```

**frontend/.env**
```
VITE_API_BASE_URL=http://localhost:5000
VITE_USE_MOCK_DATA=false
```

## 아키텍처 패턴

### 프론트엔드: Pages → Hooks → Services

```javascript
// Pages: 여러 훅 조합
const { data } = useUserData();
const { mutate } = useRecordAttempt();

// Hooks: React Query 래퍼 (src/hooks/useApi.js)
export const useUserData = () => useQuery({
  queryKey: ['user', 'profile'],
  queryFn: () => api.getUser()
});

// Services: API 호출 + Mock fallback (src/services/apiService.js)
api.getUser()  // Mock 모드면 mock 데이터, 아니면 실제 API
```

### 백엔드: Routes → Controllers → Queries

```javascript
// Routes: 엔드포인트 정의
router.get('/daily', quizController.getDailyQuiz);

// Controllers: 요청/응답 처리
exports.getDailyQuiz = async (req, res) => {
  const data = await quizQueries.getDailyQuiz(req.user.id);
  res.json({ success: true, data });
};

// Queries: SQL 실행 (pg-promise)
async getDailyQuiz(userId) {
  return db.any('SELECT ... FROM questions ...');
}
```

## 주요 API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/quiz/daily | 오늘의 퀴즈 |
| GET | /api/quiz/category/:id | 카테고리별 퀴즈 |
| GET | /api/quiz/wrong-answers | 틀린 문제 |
| GET | /api/quiz/favorites | 즐겨찾기 |
| POST | /api/quiz/attempt | 문제 시도 기록 |
| POST | /api/quiz/wrong-answers/toggle | 틀린문제 토글 |
| POST | /api/quiz/favorites/toggle | 즐겨찾기 토글 |
| GET | /api/users/profile | 프로필 |
| GET | /api/users/badges | 뱃지 |
| GET | /api/users/progress | 진행률 |
| POST | /api/progress/update | 진행률 업데이트 |

## 퀴즈 시스템

**카테고리**:
- 1: Model Example (단문)
- 2: Small Talk (대화)
- 3: Cases in Point (장문)
- 4: Daily Quiz (일일 목표)
- 5: Wrong Answers (틀린 문제)
- 6: Favorites (즐겨찾기)

**세션 관리**: LocalStorage (`quiz_session_${id}`)에 진행 상태 저장

## 스타일링

CSS 변수 기반 디자인 토큰 (`frontend/src/styles/globals.css`):

```css
:root {
  --primary-color: #55AD9B;
  --primary-dark: #428A7B;
  --primary-light: #95D2B3;
}
```

Tailwind에서 `bg-primary`, `text-primary-dark` 등으로 사용.

## 개발 규칙

1. **API 응답 형식**: `{ success: true, data: {...} }` 또는 `{ success: false, error: "..." }`
2. **에러 처리**: Controllers에서 try-catch, 클라이언트는 React Query의 error 상태 활용
3. **인증**: JWT 토큰은 Authorization 헤더 + httpOnly 쿠키 이중 전송
4. **캐싱**: React Query staleTime 활용 (profile: 5분, progress: 1분)

## 배포

- **Frontend**: Vercel (https://talk100.work)
- **Backend**: Cloudflare Tunnel을 통해 로컬 PC에서 서빙
- **가이드**: `DEPLOYMENT.md` 참고
