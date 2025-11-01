# CLAUDE.md - talk100 프로젝트 가이드

## 🎯 프로젝트 개요

**talk100**: 영어문장 암기 학습 어플리케이션
- **목적**: 영어 문장 암기 및 영작 실력 향상을 위한 맞춤형 학습 환경
- **대상**: '김재우의 영어회화' 수강생
- **단계**: 프로토타입 (MVP)

**기술 스택**:
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (pg-promise)
- **Auth**: Passport.js (Google/Naver OAuth) + JWT
- **세션**: express-session + connect-pg-simple
- **상태관리**: React Query (@tanstack/react-query)
- **아이콘**: @iconify/react
- **UI**: Headless UI (@headlessui/react)

---

## 📚 퀴즈 시스템

### 홈 화면 - 4가지 퀴즈 모드

**1. 📅 오늘의 퀴즈 (Daily Quiz / Category ID: 4)**
- Quiz Set: 사용자 설정 일일 학습량 (예시: users.daily_goal = 20문제)
- 목표 달성 후 추가 학습 가능

**2. 📂 카테고리별 퀴즈(Category ID: 1~3)**
- Model Example (Category ID: 1): 단문 예제 (question_type: 'short')
- Small Talk (Category ID: 2): 대화형 예제 (question_type: 'dialogue')
- Cases in Point (Category ID: 3): 장문 예제 (question_type: 'long')

**3. ❌ 틀린 문제 퀴즈 (Category ID: 5)**
- '정답보기'를 누른 후에 정답을 입력하면 자동으로 wrong_answers 테이블에 추가
- ⭐ 버튼으로 관리
- wrong_count로 틀린 횟수 추적

**4. ❤️ 즐겨찾기 퀴즈 (Category ID: 6)**
- ❤️ 버튼으로 추가/제거
- favorites 테이블에 저장

---

## 🗄️ 데이터베이스 스키마
root 위치의 talk100_postgresql.sql 참고

---

## 🚀 API 엔드포인트

### 인증 (`/auth`)
- `GET /auth/google` - Google OAuth 로그인 시작
- `GET /auth/google/callback` - Google OAuth 콜백
- `GET /auth/naver` - Naver OAuth 로그인 시작
- `GET /auth/naver/callback` - Naver OAuth 콜백
- `POST /auth/logout` - 로그아웃 (JWT 블랙리스트 추가)
- `GET /auth/me` - 현재 사용자 정보 조회
- `GET /auth/verify` - JWT 토큰 유효성 검증
- `POST /auth/refresh` - JWT 토큰 갱신
- `GET /auth/status` - 로그인 상태 확인
- `POST /auth/test-token` - 테스트용 토큰 생성 (개발 환경만)

### 사용자 (`/api/users`)
- `GET /api/users/profile` - 사용자 프로필 (name, goal, level)
- `GET /api/users/badges` - 뱃지 정보 (days, questions)
- `GET /api/users/progress` - 진행률 (current, total, percentage)
- `GET /api/users/personal-quizzes` - 개인 퀴즈 데이터 (즐겨찾기, 틀린문제 개수)
- `GET /api/users/history` - 최근 학습 기록

### 퀴즈 (`/api/quiz`)
- `GET /api/quiz/daily` - 오늘의 퀴즈 조회 (진행률 + 남은 문제들)
- `POST /api/quiz/record-attempt` - 문제 시도 기록 (question_attempts INSERT)
- `POST /api/quiz/toggle-favorite` - 즐겨찾기 토글
- `GET /api/quiz/favorites` - 즐겨찾기 문제 조회 (TODO)
- `GET /api/quiz/wrong-answers` - 틀린 문제 조회 (TODO)

### 진행률 (`/api/progress`)
- `POST /api/progress/update` - user_progress 업데이트 (Day 완료 체크 포함)
- `POST /api/progress/reset-solved-count` - solved_count 리셋 (추가 학습 시작 시)


---

## 🔧 핵심 기능

### 1. 문제 시도 및 통계 추적 (`backend/queries/quizQueries.js`)

**recordQuestionAttempt** - 문제 시도 기록 및 자동 업데이트
```javascript
async recordQuestionAttempt(userId, questionId) {
  // 1. question_attempts INSERT
  // 2. daily_summary.questions_attempted +1
  // 3. goal_met 체크 및 업데이트
  // 4. 오늘 첫 학습이면 streak 업데이트
  //    - 어제 학습했으면 current_streak +1
  //    - 아니면 1로 초기화
  //    - longest_streak 갱신
}
```

**데이터 흐름**:
```
QuizPage.jsx (문제 완료)
  ↓
api.recordQuestionAttempt(questionId)
  ↓
1. question_attempts INSERT
2. daily_summary.questions_attempted +1
3. daily_summary.goal_met = true (조건 충족시)
4. users.current_streak, longest_streak 업데이트 (첫 학습시)
```

### 2. Day 완료 추적 (`backend/queries/progressQueries.js`)

**updateUserProgress** - 진행률 업데이트 및 Day 완료 체크
```javascript
async updateUserProgress(userId, categoryId, day, questionId) {
  // 1. user_progress 업데이트 (last_studied_day, solved_count 등)
  // 2. Day 완료 체크:
  //    - 방금 푼 문제가 해당 Day의 마지막 문제인지 확인
  //    - 마지막 문제면 daily_summary.days_completed +1
}
```

### 3. 세션 관리 (`frontend/src/utils/sessionStorage.js`)
**LocalStorage 기반 퀴즈 세션 관리**
```javascript
// 세션 생성
createSession(category, day, questionIds)
// → quiz_session_${sessionId} 생성

// 세션 데이터 구조
{
  sessionId: "uuid",
  category: 4,  // Today Quiz
  day: 1,
  questionIds: [1, 2, 3, 4, 5, 6],
  currentQuestionIndex: 0,
  completedQuestionIds: [],
  inputMode: 'keyboard',  // 'keyboard' | 'voice'
  createdAt: timestamp,
  userPreferences: {
    favoriteIds: [],
    starredIds: []
  }
}

// 세션 관리 함수들
getSession(sessionId)
moveToNextQuestion(sessionId)
markQuestionCompleted(sessionId, questionId)
isQuizCompleted(sessionId)
toggleFavorite(sessionId)
toggleStar(sessionId)
updateInputMode(sessionId, mode)
deleteSession(sessionId)
```

---

## 🏗️ 프런트엔드 아키텍처

### 데이터 흐름: 3계층 아키텍처

**Pages ➝ Hooks ➝ Services**

#### 1. **Pages 계층** (`src/pages/`)
페이지 컴포넌트에서 여러 커스텀 훅 조합하여 UI 구성
```javascript
// HomePage.jsx 예시
const { data: userData } = useUserData();
const { data: progressData } = useProgressData();
const { data: badgesData } = useBadgesData();
const { data: personalQuizzesData } = usePersonalQuizzesData();
const { data: historyData } = useHistoryData();
```

#### 2. **Hooks 계층** (`src/hooks/useApi.js`)
**React Query 기반**: 서버 상태 관리 & 자동 캐싱
```javascript
// 사용자 데이터 훅
export const useUserData = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => api.getUser(),
    staleTime: 5 * 60 * 1000, // 5분
    retry: 2
  });
};

// 퀴즈 데이터 훅
export const useQuizQuestions = (category, day) => {
  return useQuery({
    queryKey: ['quiz', 'questions', category, day],
    queryFn: () => api.getQuestions(category, day),
    enabled: !!category && !!day,
    retry: 2
  });
};

// 문제 시도 기록 훅 (Mutation)
export const useRecordAttempt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId) => api.recordQuestionAttempt(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries(['daily-summary']);
      queryClient.invalidateQueries(['user', 'profile']);
    }
  });
};

// 진행률 업데이트 훅 (Mutation)
export const useUpdateProgress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.updateProgress(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['user', 'progress']);
    }
  });
};
```

#### 3. **Services 계층** (`src/services/apiService.js`)
**통합 API 서비스 - Mock/Real API 자동 전환**
```javascript
class ApiService {
  // Mock/실제 API 전환 로직 (서버 통신 실패 시 자동 fallback)
  async request(endpoint, mockKey, options = {}) {
    // 1. Mock 모드: VITE_USE_MOCK_DATA=true
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      return this.simulateNetworkDelay(mockData, 500);
    }

    // 2. 실제 API 호출 시도
    try {
      return await this.apiCall(endpoint, options);
    } catch (error) {
      // 3. API 실패시 Mock 데이터로 자동 fallback
      if (mockData) {
        return this.simulateNetworkDelay(mockData, 300);
      }
      throw this.handleError(error);
    }
  }

  // 실제 API 호출 (JWT 토큰 자동 첨부)
  async apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('jwt_token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      credentials: 'include',
      ...options
    });

    // 백엔드 응답 { success: true, data: {...} }에서 data만 추출
    const jsonResponse = await response.json();
    if (jsonResponse.success && jsonResponse.data) {
      return jsonResponse.data;
    }
    return jsonResponse;
  }
}

export const api = new ApiService();
```

**주요 API 메서드**
```javascript
// 홈페이지용
api.getUser()              // /api/users/profile
api.getBadges()            // /api/users/badges
api.getProgress()          // /api/users/progress
api.getPersonalQuizzes()   // /api/users/personal-quizzes
api.getHistory()           // /api/users/history

// 퀴즈용
api.getDailyQuiz()                  // /api/quiz/daily
api.recordQuestionAttempt(qId)      // /api/quiz/record-attempt (POST)
api.updateProgress(data)            // /api/progress/update (POST)
api.toggleFavorite(qId)             // /api/quiz/toggle-favorite (POST)

// 마이페이지용 (TODO)
api.getMypageData()        // /api/mypage
api.updateGoals(data)      // /api/mypage/goals (PUT)

// 설정용 (TODO)
api.getSettings()          // /api/settings
api.updateSettings(data)   // /api/settings (PUT)

// 통계용 (TODO)
api.getStatistics(period)  // /api/stats?period=7days
```

### 상태 관리 전략
- **React Query**: 서버 상태 (API 데이터, 캐싱)
  - staleTime: 데이터 신선도 관리
  - retry: 자동 재시도
  - invalidateQueries: 캐시 무효화
- **Context API**: 전역 상태 (인증, 테마)
  - AuthContext: 사용자 인증 상태
  - ThemeContext: 다크모드 설정
- **Local State**: 컴포넌트별 UI 상태
- **LocalStorage**:
  - JWT 토큰 (`jwt_token`)
  - 사용자 설정 영속성
  - 퀴즈 세션 (`quiz_session_${sessionId}`)

---

## 🎨 스타일링 시스템

### Tailwind CSS + 디자인 시스템

#### 1. **디자인 토큰** (`src/styles/globals.css`)
```css
:root {
  --primary-color: #55AD9B;     /* 메인 민트그린 */
  --primary-dark: #428A7B;      /* 다크 버전 */
  --primary-light: #95D2B3;     /* 라이트 버전 */
  --accent-mint: #D8EFD3;       /* 연한 민트 */
  --accent-pale: #F1F8E8;       /* 연한 그린 */
}
```

#### 2. **Tailwind 통합** (`tailwind.config.js`)
- CSS 변수를 Tailwind 테마로 매핑
- 커스텀 유틸리티 클래스 (touchable, animations)
- 반응형 breakpoint 정의

#### 3. **컴포넌트 시스템**
- **@layer components**: 재사용 가능한 컴포넌트 클래스
- **Variants 패턴**: UI 컴포넌트별 스타일 옵션 관리

#### 4. **특징**
- **일관된 디자인**: CSS 변수 기반 디자인 토큰
- **다크테마 지원**: `[data-theme="dark"]` 선택자
- **터치 피드백**: `.touchable` 클래스로 모바일 UX
- **애니메이션**: 커스텀 keyframes (slide-up, fade-in)

---

## 📁 프로젝트 구조

```
talk100/
├── backend/
│   ├── app.js                  # Express 앱 설정
│   ├── config/
│   │   ├── database.js        # PostgreSQL (pg-promise) 설정
│   │   └── passport.js        # Passport OAuth 설정
│   ├── controllers/
│   │   ├── quizController.js  # 퀴즈 컨트롤러
│   │   ├── userController.js  # 사용자 컨트롤러
│   │   └── progressController.js  # 진행률 컨트롤러
│   ├── queries/
│   │   ├── quizQueries.js     # 퀴즈 관련 SQL 쿼리
│   │   ├── userQueries.js     # 사용자 관련 SQL 쿼리
│   │   └── progressQueries.js # 진행률 관련 SQL 쿼리
│   ├── routes/
│   │   ├── auth.js            # 인증 라우트
│   │   ├── quiz.js            # 퀴즈 라우트
│   │   ├── users.js           # 사용자 라우트
│   │   └── progress.js        # 진행률 라우트
│   ├── services/              # 비즈니스 로직 (복습 시스템 등)
│   └── middleware/
│       └── auth.js            # JWT 인증 미들웨어
│
├── frontend/
│   └── src/
│       ├── components/        # UI 컴포넌트
│       │   ├── ui/           # 기본 UI (Button, Card, Modal 등)
│       │   ├── home/         # 홈 페이지 섹션
│       │   ├── quiz/         # 퀴즈 관련
│       │   ├── mypage/       # 마이페이지
│       │   ├── settings/     # 설정
│       │   ├── stats/        # 통계
│       │   ├── auth/         # 인증
│       │   └── layout/       # 레이아웃 (Header, Navigation 등)
│       │
│       ├── pages/            # 페이지 컴포넌트
│       │   ├── HomePage.jsx
│       │   ├── QuizPage.jsx
│       │   ├── MyPage.jsx
│       │   ├── StatusPage.jsx
│       │   ├── SettingsPage.jsx
│       │   └── LoginPage.jsx
│       │
│       ├── hooks/            # 커스텀 훅
│       │   └── useApi.js    # React Query 기반 API 훅
│       │
│       ├── services/         # API 서비스 계층
│       │   └── apiService.js # 통합 API 서비스 (Mock/Real 전환)
│       │
│       ├── contexts/         # React Context
│       │   ├── AuthContext.jsx
│       │   ├── ThemeContext.jsx
│       │   └── AppContext.jsx
│       │
│       ├── mocks/            # Mock 데이터
│       │   ├── homePageData.js
│       │   ├── quizPageData.js
│       │   ├── mypageData.js
│       │   ├── settingsData.js
│       │   └── statisticsData.js
│       │
│       ├── utils/            # 유틸리티 함수
│       │   └── sessionStorage.js  # 퀴즈 세션 관리
│       │
│       ├── styles/           # 스타일
│       │   └── globals.css  # 디자인 시스템 & CSS 변수
│       │
│       ├── config/
│       │   └── environment.js  # 환경 설정
│       │
│       ├── App.jsx
│       └── main.jsx
│
└── talk100_postgresql.sql  # DB 스키마 & 샘플 데이터
```

---

## ⚠️ 주의사항

### 보안
- **JWT 토큰**:
  - 로그인시 발급, 쿠키 + Authorization 헤더로 전송
  - 7일 유효기간
  - 블랙리스트로 로그아웃 관리
- **OAuth**: Google/Naver provider ID를 `uid`로 사용
- **CASCADE**: 모든 외래키에 ON DELETE CASCADE 설정
- **세션**: PostgreSQL 테이블에 저장 (connect-pg-simple)

### 성능
- **인덱스**:
  - `(category_id, day, question_number)` - 문제 조회 최적화
  - `(user_id, scheduled_for)` - 복습 큐 조회 최적화
  - `(user_id, category_id)` - 진행률 조회 최적화
  - `(user_id, date)` - 일일 통계 조회 최적화
- **React Query 캐싱**:
  - USER_DATA: 5분
  - QUIZ_SESSION: 10분
  - PROGRESS: 1분
  - CATEGORIES: 30분
  - HISTORY: 2분

---

## 🎯 현재 구현 상태

### ✅ **완료된 부분**

**백엔드**
- ✅ Express 서버 설정 (CORS, Helmet, Session, Passport)
- ✅ PostgreSQL 데이터베이스 연결 (pg-promise)
- ✅ Google/Naver OAuth 인증 (JWT 토큰 발급)
- ✅ 사용자 관리 API (프로필, 뱃지, 진행률, 히스토리)
- ✅ 오늘의 퀴즈 API (진행률 + 남은 문제 조회)
- ✅ 문제 시도 기록 API (question_attempts, daily_summary 자동 업데이트)
- ✅ 진행률 업데이트 API (user_progress, days_completed 자동 업데이트)
- ✅ Streak 추적 시스템 (users.current_streak, longest_streak)
- ✅ 즐겨찾기 토글 API

**프론트엔드**
- ✅ React + Vite + Tailwind 설정
- ✅ 3계층 아키텍처 (Pages ➝ Hooks ➝ Services)
- ✅ React Query 기반 상태 관리
- ✅ Mock/Real API 자동 전환 시스템
- ✅ 디자인 시스템 구축 (CSS 변수 + Tailwind)
- ✅ UI 컴포넌트 라이브러리
- ✅ HomePage 완성 (CharacterSection, QuizSections, History)
- ✅ QuizPage 완성 (키워드 입력, 힌트 시스템, 세션 관리)
- ✅ LocalStorage 기반 세션 관리
- ✅ MyPage, StatusPage, SettingsPage UI 구현

### 🚧 **진행 중인 작업**
- 🚧 API 연동: 프론트엔드 ↔ 백엔드 실제 연결
- 🚧 복습 시스템 API 엔드포인트 구현
- 🚧 카테고리별 퀴즈 API 구현
- 🚧 틀린문제 퀴즈 API 구현

### 📋 **다음 우선순위 작업**

#### Phase 1: 백엔드 API 완성
1. **퀴즈 API 확장**
   - `GET /api/quiz/questions?category={id}&day={num}` - 카테고리별 문제 조회
   - `GET /api/quiz/favorites` - 즐겨찾기 문제 조회
   - `GET /api/quiz/wrong-answers` - 틀린 문제 조회

3. **통계 API**
   - `GET /api/stats?period=7days` - 기간별 통계
   - `GET /api/stats/weekly` - 주간 차트 데이터
   - `GET /api/stats/categories` - 카테고리별 진행률

#### Phase 2: 프론트엔드 통합
1. **API 연동 완성**
   - Mock 모드에서 실제 API로 전환 테스트
   - 에러 핸들링 강화
   - 로딩 상태 최적화

2. **진행률 동기화**
   - user_progress 실시간 동기화
   - daily_summary 업데이트
   - React Query 캐시 무효화 최적화

#### Phase 3: 고급 기능
1. **복습 알고리즘 완성**
   - 8단계 간격 복습 스케줄링 완전 구현
   - Review Queue UI 구현
   - 복습 알림 기능

2. **통계 대시보드**
   - StatusPage 실제 데이터 연동
   - 주간/월간 학습 패턴 분석
   - 카테고리별 진행률 차트

3. **사용자 설정**
   - SettingsPage API 연동
   - 알림 설정
   - 데이터 내보내기/가져오기

#### Phase 4: 최적화 & 배포
1. **성능 최적화**
   - React.memo, useMemo 적용
   - 코드 스플리팅
   - 이미지 최적화

2. **접근성**
   - ARIA 레이블 추가
   - 키보드 네비게이션 개선
   - 스크린 리더 지원

3. **배포 준비**
   - 환경 변수 설정
   - Docker 컨테이너화
   - CI/CD 파이프라인

---

## 📝 개발 가이드

### 환경 설정
```bash
# 백엔드
cd backend
npm install
cp .env.example .env  # 환경 변수 설정
npm run dev

# 프론트엔드
cd frontend
npm install
cp .env.example .env  # VITE_USE_MOCK_DATA=false 설정
npm run dev
```

### 주요 환경 변수
**백엔드 (.env)**
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/talk100
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NAVER_CLIENT_ID=...
NAVER_CLIENT_SECRET=...
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**프론트엔드 (.env)**
```
VITE_API_BASE_URL=http://localhost:5000
VITE_USE_MOCK_DATA=false  # true: Mock 모드, false: 실제 API
```

### 데이터베이스 초기화
```bash
psql -U postgres
CREATE DATABASE talk100;
\c talk100
\i talk100_postgresql.sql
```

### API 테스트
```bash
# 헬스 체크
curl http://localhost:5000/health

# 로그인 상태 확인
curl http://localhost:5000/auth/status

# 테스트 토큰 생성 (개발 환경)
curl -X POST http://localhost:5000/auth/test-token
```

---

## 🐛 트러블슈팅

### 문제: Mock 데이터가 로드되지 않음
**해결**: `VITE_USE_MOCK_DATA=true` 확인 및 서버 재시작

### 문제: JWT 토큰 만료
**해결**: `/auth/refresh` 엔드포인트로 토큰 갱신 또는 재로그인

### 문제: CORS 에러
**해결**: 백엔드 `FRONTEND_URL` 환경 변수 확인

### 문제: PostgreSQL 연결 실패
**해결**: `DATABASE_URL` 확인 및 PostgreSQL 서비스 상태 점검

---

## 📚 참고 자료
- [React Query 공식 문서](https://tanstack.com/query/latest)
- [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [Passport.js 공식 문서](http://www.passportjs.org/docs/)
- [pg-promise 공식 문서](https://vitaly-t.github.io/pg-promise/)
