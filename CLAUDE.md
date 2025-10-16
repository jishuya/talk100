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
- **아이콘**: React Icons + Heroicons
- **UI**: Headless UI (@headlessui/react)

---

## 📚 퀴즈 시스템

### 홈 화면 - 4가지 퀴즈 모드

**1. 📅 오늘의 퀴즈 (Daily Quiz / Category ID: 4)**
- Quiz Set: 사용자 설정 일일 학습량 (기본값: 1 Day)
- 목표 달성 후 추가 학습 가능
- Day 완료시 자동 복습 생성
- user_progress 테이블에서 진행 상황 추적

**2. 📂 카테고리별 퀴즈**
- Model Example (Category ID: 1): 단문 예제 (question_type: 'short')
- Small Talk (Category ID: 2): 대화형 예제 (question_type: 'dialogue')
- Cases in Point (Category ID: 3): 장문 예제 (question_type: 'long')
- 1 Day씩 순차 진행

**3. ❌ 틀린 문제 퀴즈 (Category ID: 5)**
- '정답보기'를 누른 후에 정답을 입력하면 자동으로 wrong_answers 테이블에 추가
- ⭐ 버튼으로 관리
- wrong_count로 틀린 횟수 추적

**4. ❤️ 즐겨찾기 퀴즈 (Category ID: 6)**
- ❤️ 버튼으로 추가/제거
- favorites 테이블에 저장

---

## 🔄 복습 시스템 (핵심)

### 설계 원칙
- **Day 번호만 저장**: review_queue에는 day만 기록 (source_day 아님)
- **동적 문제 선택**: 복습 시점에 실시간 랜덤 선택
- **매번 다른 조합**: 지루함 방지, 암기 차단
- **8단계 주기**: 1→3→7→14→30→60→90→120일
- **복습우선주기 결정방식**: ORDER BY scheduled_for - 가장 오래 기다린 것부터

### 복습 구성 (매번 랜덤)
- Model Example: 3문제
- Small Talk: 2세트
- Cases in Point: 1문제

### 복습 로직 (`backend/services/dayReview.js`)
```javascript
// Day 완료시 복습 큐에 추가
createDayReview(userId, dayNumber)

// 다음 복습할 Day 조회
getNextReviewDay(userId)

// Day 번호로 복습 문제 동적 선택
getReviewQuestions(dayNumber)

// 복습 완료 후 다음 주기 설정
// - 정답: 다음 단계 진급
// - 오답: 1일로 초기화
// - 120일 완료: 삭제 (영구 마스터)
updateReviewSchedule(queueId, isCorrect)
```

---

## 🗄️ 데이터베이스 스키마

### 주요 테이블

**1. users** - 사용자 정보
```sql
uid VARCHAR(255) PRIMARY KEY  -- OAuth provider ID
name VARCHAR(255)
email VARCHAR(255) UNIQUE
profile_image VARCHAR(500)
voice_gender VARCHAR(10) DEFAULT 'male'  -- 'male' | 'female'
default_difficulty INTEGER DEFAULT 2  -- 1: 초급, 2: 중급, 3: 고급
daily_goal INTEGER DEFAULT 1  -- Quiz Set (Day 개수)
total_questions_attempted INTEGER DEFAULT 0
total_correct_answers INTEGER DEFAULT 0
total_days_studied INTEGER DEFAULT 0
current_streak INTEGER DEFAULT 0
longest_streak INTEGER DEFAULT 0
level INTEGER DEFAULT 1
weekly_attendance INTEGER[] DEFAULT ARRAY[0,0,0,0,0,0,0]
```

**2. questions** - 문제 데이터
```sql
question_id INTEGER PRIMARY KEY
category_id INTEGER  -- 1:Model, 2:Small Talk, 3:Cases, 4:Today, 5:Wrong, 6:Favorites
day INTEGER
question_number INTEGER
question_type VARCHAR(20)  -- 'short' | 'dialogue' | 'long'

-- 단일 문제용
korean TEXT
english TEXT

-- 대화형 문제용
korean_a TEXT, english_a TEXT
korean_b TEXT, english_b TEXT

-- 음성 파일
audio_male VARCHAR(500), audio_female VARCHAR(500)
audio_male_a, audio_female_a, audio_male_b, audio_female_b

keywords TEXT[]  -- 채점용 키워드 배열
```

**3. user_progress** - 사용자별 학습 진행상황
```sql
user_id VARCHAR(255) REFERENCES users(uid)
category_id INTEGER  -- 4: 오늘의 퀴즈
last_studied_day INTEGER
last_studied_question_id INTEGER
last_studied_timestamp TIMESTAMP
UNIQUE(user_id, category_id)
```

**4. review_queue** - 복습 대기열
```sql
queue_id SERIAL PRIMARY KEY
user_id VARCHAR(255)
day INTEGER  -- 복습할 Day 번호 (문제는 복습 시점에 동적 선택)
interval_days INTEGER DEFAULT 1  -- 1,3,7,14,30,60,90,120
scheduled_for TIMESTAMP
review_count INTEGER DEFAULT 0
UNIQUE(user_id, day)
```

**5. daily_progress** - 일일 학습 진행
```sql
user_id VARCHAR(255)
date DATE DEFAULT CURRENT_DATE
days_completed INTEGER DEFAULT 0
goal_met BOOLEAN DEFAULT false
additional_days INTEGER DEFAULT 0
PRIMARY KEY (user_id, date)
```

**6. favorites / wrong_answers** - 즐겨찾기 / 틀린 문제
```sql
-- favorites
user_id VARCHAR(255)
question_id INTEGER
added_at TIMESTAMP
PRIMARY KEY (user_id, question_id)

-- wrong_answers
user_id VARCHAR(255)
question_id INTEGER
added_at TIMESTAMP
wrong_count INTEGER DEFAULT 1
PRIMARY KEY (user_id, question_id)
```

**7. category** - 카테고리 정보
```sql
category_id INTEGER PRIMARY KEY
name VARCHAR(100)  -- 'Model Example', 'Small Talk', 'Cases in Point', etc.
display_name VARCHAR(100)  -- '모범 예문', '스몰 토크', '사례 연구', etc.
order_num INTEGER
is_active BOOLEAN DEFAULT true
```

**8. session** - Express 세션 (connect-pg-simple)
```sql
sid VARCHAR PRIMARY KEY
sess JSON
expire TIMESTAMP(6)
```

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

### 복습 시스템 (TODO - 아직 구현 안됨)
- `GET /api/review/next` - 다음 복습 Day 조회
- `GET /api/review/questions/:day` - Day별 복습 문제 선택
- `POST /api/review/complete` - 복습 완료 & 다음 주기 설정
- `GET /api/review/schedule` - 복습 스케줄 조회

### 문제 & 기타 (TODO - 아직 구현 안됨)
- `GET /api/questions/:category/:day` - Day별 문제 조회
- `POST /api/favorites/toggle` - 즐겨찾기 토글
- `GET /api/wrong-answers` - 틀린 문제 리스트

---

## 🔧 핵심 기능

### 1. 채점 시스템 (`backend/utils/grading.js`)
**Keywords 기반 부분 점수 채점**
```javascript
// 난이도별 통과 기준
PASSING_SCORES = {
  1: 50,   // 초급
  2: 70,   // 중급
  3: 90    // 고급
}

// 점수 = (매칭 키워드 / 전체 키워드) × 100
gradeAnswer(userAnswer, question, difficulty)

// 대화형 문제 채점 (A + B 답변 합쳐서 채점)
gradeDialogueAnswer(userAnswerA, userAnswerB, question, difficulty)
```

**텍스트 정규화**
- 소문자 변환
- 따옴표 통일 ('', "" → ', ")
- 구두점 제거
- 공백 정리

### 2. Day 완료 플로우
```javascript
// 1. Day 학습 완료
await createDayReview(userId, dayNumber)
// → review_queue에 Day 번호만 추가

// 2. 다음 학습시 복습 확인
const reviewDay = await getNextReviewDay(userId)
// → 복습할 Day가 있으면 해당 Day 반환

// 3. 복습 문제 동적 선택
const questions = await getReviewQuestions(reviewDay.day)
// → Model 3개, Small Talk 2개, Cases 1개 랜덤 선택
```

### 3. 복습 주기 관리
- **정답시**: 다음 단계 진급 (1→3→7→14→30→60→90→120)
- **오답시**: 1일로 초기화
- **120일 완료**: 영구 마스터 (review_queue에서 삭제)

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
    staleTime: ENV.CACHE_TIMES.USER_DATA,
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

// 답변 제출 훅 (Mutation)
export const useSubmitAnswer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.submitAnswer(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['quiz', 'history']);
      queryClient.invalidateQueries(['progress']);
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
api.getQuestions(category, day)  // /api/quiz/questions
api.submitAnswer(data)           // /api/quiz/answer (POST)
api.updateProgress(data)         // /api/progress (POST)

// 마이페이지용
api.getMypageData()        // /api/mypage
api.updateGoals(data)      // /api/mypage/goals (PUT)
api.updateAvatar(data)     // /api/mypage/avatar (PUT)

// 설정용
api.getSettings()          // /api/settings
api.updateSettings(data)   // /api/settings (PUT)

// 통계용
api.getStatistics(period)  // /api/stats?period=7days
api.getWeeklyChart()       // /api/stats/weekly
api.getCategoryProgress()  // /api/stats/categories
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

### 세션 관리 (`src/utils/sessionStorage.js`)
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
  questions: [...],  // 전체 문제 데이터
  progress: { completed: 0, total: 6, percentage: 0 },
  currentQuestionIndex: 0,
  completedQuestions: [],
  inputMode: 'keyboard',  // 'keyboard' | 'voice'
  createdAt: timestamp
}

// 세션 관리 함수들
getSession(sessionId)
moveToNextQuestion(sessionId)
markQuestionCompleted(sessionId, questionId, isCorrect)
isQuizCompleted(sessionId)
toggleFavorite(sessionId)
toggleStar(sessionId)
updateInputMode(sessionId, mode)
deleteSession(sessionId)
```

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
```javascript
// Button.jsx 예시
const buttonVariants = {
  variant: {
    primary: 'btn-primary',
    secondary: 'bg-white text-primary border border-primary',
    ghost: 'bg-transparent text-text-primary hover:bg-gray-light'
  },
  size: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
};
```

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
│   │   └── userController.js  # 사용자 컨트롤러
│   ├── queries/
│   │   ├── quizQueries.js     # 퀴즈 관련 SQL 쿼리
│   │   └── userQueries.js     # 사용자 관련 SQL 쿼리
│   ├── routes/
│   │   ├── auth.js            # 인증 라우트
│   │   ├── quiz.js            # 퀴즈 라우트
│   │   └── users.js           # 사용자 라우트
│   ├── services/
│   │   └── dayReview.js       # 복습 시스템 비즈니스 로직
│   ├── utils/
│   │   └── grading.js         # 키워드 기반 채점 엔진
│   └── middleware/
│       └── auth.js            # JWT 인증 미들웨어
│
├── frontend/
│   └── src/
│       ├── components/        # UI 컴포넌트
│       │   ├── ui/           # 기본 UI (Button, Card, Modal 등)
│       │   ├── home/         # 홈 페이지 섹션
│       │   │   ├── CharacterSection.jsx
│       │   │   ├── QuizCategorySection.jsx
│       │   │   ├── QuizPersonalSection.jsx
│       │   │   └── StudyHistorySection.jsx
│       │   ├── quiz/         # 퀴즈 관련
│       │   │   ├── QuizProgressBar.jsx
│       │   │   ├── QuizContent.jsx
│       │   │   └── QuizControls.jsx
│       │   ├── mypage/       # 마이페이지
│       │   ├── settings/     # 설정
│       │   ├── stats/        # 통계
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
│       │   ├── sessionStorage.js  # 퀴즈 세션 관리
│       │   └── iconMap.jsx
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
└── database/
    └── talk100_postgresql.sql  # DB 스키마 & 샘플 데이터
```

---

## ⚠️ 주의사항

### 복습 시스템
- Day 번호만 저장하여 가벼운 구조 유지
- 매번 다른 문제로 학습 효과 극대화
- 8단계 간격 반복으로 장기 기억 강화
- `review_queue` 테이블의 `day` 컬럼은 `questions.day`를 참조 (source_day 아님)

### 보안
- **JWT 토큰**:
  - 로그인시 발급, 쿠키 + Authorization 헤더로 전송
  - 7일 유효기간
  - 블랙리스트로 로그아웃 관리
- **OAuth**: Google/Naver provider ID를 `uid`로 사용
- **CASCADE**: 모든 외래키에 ON DELETE CASCADE 설정
- **세션**: PostgreSQL 테이블에 저장 (connect-pg-simple)

### 성능
- **Keywords 배열**: PostgreSQL ARRAY 타입으로 정규화된 텍스트 매칭
- **인덱스**:
  - `(category_id, day, question_number)` - 문제 조회 최적화
  - `(user_id, scheduled_for)` - 복습 큐 조회 최적화
  - `(user_id, category_id)` - 진행률 조회 최적화
- **React Query 캐싱**:
  - USER_DATA: 5분
  - QUIZ_SESSION: 10분
  - PROGRESS: 1분
  - CATEGORIES: 30분
  - HISTORY: 2분

---

## 🎮 QuizPage 시스템

### 두 가지 퀴즈 모드
**1. 문제풀이 모드 (`solving`)**
- 사용자가 답변을 입력하는 모드
- 힌트보기, 정답보기, 정답말하기/답변제출 버튼 표시
- 키워드 기반 실시간 입력 및 채점

**2. 채점모드 (`grading`)**
- 정답 확인 후 다음 문제로 이동하는 모드
- 다시듣기, 힌트보기, 다음문제 버튼만 표시
- 메인 액션 버튼 숨김

### 키워드 기반 입력 시스템
```javascript
// 키보드 모드에서 키워드 박스를 클릭 가능한 input field로 변경
{isKeyword && inputMode === 'keyboard' && quizMode === 'solving' && (
  <input
    type="text"
    value={keywordInputs[cleanWord.toLowerCase()] || ''}
    onChange={(e) => onKeywordInputChange?.(cleanWord.toLowerCase(), e.target.value)}
    onKeyDown={(e) => onKeywordKeyDown?.(cleanWord.toLowerCase(), keywordInputs[cleanWord.toLowerCase()] || '', e)}
    className="bg-yellow-200 px-2 py-1 rounded font-semibold"
    placeholder="___"
    data-keyword={cleanWord.toLowerCase()}
  />
)}
```

### 실시간 채점 시스템
- **개별 키워드 검증**: 정답 입력시 자동으로 다음 키워드로 포커스 이동
- **전체 완성 검증**: 모든 키워드 완성시 자동으로 다음 문제로 이동
- **답변 표시**: 스페이스/엔터 입력시 "내 답변"에 콤마로 구분하여 표시

### 힌트 시스템
```javascript
// 힌트보기: 키워드만 첫 글자로 표시, 나머지 단어는 그대로
if (isKeyword) {
  const hint = firstLetter + '_'.repeat(restLength);
  return <span className="bg-gray-200">{hint}{punctuation}</span>;
} else {
  return <span>{word}</span>; // 일반 단어는 그대로
}
```

### UI 개선사항
- **QuizProgressBar**: 간단한 진행률 표시
- **메인 액션 버튼**: 1.5배 크기 확대 (py-6, text-lg, text-2xl 아이콘)
- **키워드 입력 영역**: textarea 삭제하고 키워드 박스 직접 클릭 입력
- **모드별 버튼 제어**: 조건부 렌더링으로 적절한 버튼만 표시

---

## 🎯 현재 구현 상태

### ✅ **완료된 부분**

**백엔드**
- ✅ Express 서버 설정 (CORS, Helmet, Session, Passport)
- ✅ PostgreSQL 데이터베이스 연결 (pg-promise)
- ✅ Google/Naver OAuth 인증 (JWT 토큰 발급)
- ✅ 사용자 관리 API (프로필, 뱃지, 진행률, 히스토리)
- ✅ 오늘의 퀴즈 API (진행률 + 남은 문제 조회)
- ✅ Keywords 기반 채점 시스템 (grading.js)
- ✅ 복습 시스템 서비스 로직 (dayReview.js)

**프론트엔드**
- ✅ React + Vite + Tailwind 설정
- ✅ 3계층 아키텍처 (Pages ➝ Hooks ➝ Services)
- ✅ React Query 기반 상태 관리
- ✅ Mock/Real API 자동 전환 시스템
- ✅ 디자인 시스템 구축 (CSS 변수 + Tailwind)
- ✅ UI 컴포넌트 (Button, Card, Modal 등)
- ✅ 홈페이지 완성 (CharacterSection, QuizSections, History)
- ✅ QuizPage 완성 (키워드 입력, 실시간 채점, 힌트 시스템)
- ✅ LocalStorage 기반 세션 관리
- ✅ MyPage, StatusPage, SettingsPage UI 구현

### 🚧 **진행 중인 작업**
- 🚧 API 연동: 프론트엔드 ↔ 백엔드 실제 연결
- 🚧 복습 시스템 API 엔드포인트 구현
- 🚧 카테고리별 퀴즈 API 구현
- 🚧 즐겨찾기/틀린문제 API 구현

### 📋 **다음 우선순위 작업**

#### Phase 1: 백엔드 API 완성
1. **퀴즈 API 확장**
   - `GET /api/quiz/questions?category={id}&day={num}` - 카테고리별 문제 조회
   - `POST /api/quiz/answer` - 답변 제출 및 채점
   - `POST /api/quiz/favorite/toggle` - 즐겨찾기 토글
   - `GET /api/quiz/favorites` - 즐겨찾기 문제 조회
   - `GET /api/quiz/wrong-answers` - 틀린 문제 조회

2. **복습 시스템 API**
   - `GET /api/review/next` - 다음 복습 Day 조회
   - `GET /api/review/questions/:day` - Day별 복습 문제
   - `POST /api/review/complete` - 복습 완료 처리
   - `GET /api/review/schedule` - 복습 스케줄 조회

3. **진행률 업데이트 API**
   - `POST /api/progress/submit` - 답변 제출 시 진행률 업데이트
   - `POST /api/progress/day-complete` - Day 완료 처리

#### Phase 2: 프론트엔드 통합
1. **API 연동 완성**
   - Mock 모드에서 실제 API로 전환 테스트
   - 에러 핸들링 강화
   - 로딩 상태 최적화

2. **채점 시스템 통합**
   - QuizPage에서 서버 채점 API 호출
   - 채점 결과 피드백 UI 개선

3. **진행률 동기화**
   - user_progress 실시간 동기화
   - daily_progress 업데이트
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

### 🔧 **기술적 고려사항**
- **캐싱**: React Query staleTime 최적화
- **보안**: JWT 토큰 갱신 로직, HTTPS 강제
- **모바일**: 터치 최적화, PWA 기능 (향후)
- **테스트**: Jest + React Testing Library (향후)
- **모니터링**: Sentry 에러 추적 (향후)

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
\i database/talk100_postgresql.sql
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
