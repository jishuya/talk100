# CLAUDE.md - talk100 프로젝트 가이드

## 🎯 프로젝트 개요

**talk100**: 영어문장 암기 학습 어플리케이션
- **목적**: 영어 문장 암기 및 영작 실력 향상을 위한 맞춤형 학습 환경
- **대상**: '김재우의 영어회화' 수강생
- **단계**: 프로토타입 (MVP)

**기술 스택**:
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Auth**: Passport.js (Google/Naver OAuth)
- **상태관리**: React Query (@tanstack/react-query)
- **아이콘**: React Icons + Heroicons
- **UI**: Headless UI (@headlessui/react)

---

## 📚 퀴즈 시스템

### 홈 화면 - 4가지 퀴즈 모드

**1. 📅 오늘의 퀴즈 (Daily Quiz)**
- Quiz Set: 사용자 설정 일일 학습량 (기본값: 1 Day)
- 목표 달성 후 추가 학습 가능
- Day 완료시 자동 복습 생성

**2. 📂 카테고리별 퀴즈**
- Model Example / Small Talk / Cases in Point
- 1 Day씩 순차 진행

**3. ❌ 틀린 문제 퀴즈**
- 난이도별 통과 점수 미달시 자동 추가
- ⭐ 버튼으로 관리

**4. ❤️ 즐겨찾기 퀴즈**
- ❤️ 버튼으로 추가/제거

---

## 🔄 복습 시스템 (핵심)

### 설계 원칙
- **Day 번호만 저장**: review_queue에는 source_day만 기록
- **동적 문제 선택**: 복습 시점에 실시간 랜덤 선택
- **매번 다른 조합**: 지루함 방지, 암기 차단
- **8단계 주기**: 1→3→7→14→30→60→90→120일

### 복습 구성 (매번 랜덤)
- Model Example: 3문제
- Small Talk: 2세트
- Cases in Point: 1문제

---

## 🗄️ 핵심 데이터베이스

### review_queue (복습 대기열)
```sql
CREATE TABLE review_queue (
    queue_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(uid),
    source_day INTEGER NOT NULL,        -- 복습할 Day 번호
    interval_days INTEGER DEFAULT 1,    -- 현재 복습 간격
    scheduled_for TIMESTAMP,            -- 다음 복습 예정일
    review_count INTEGER DEFAULT 0,     -- 복습 완료 횟수
    UNIQUE(user_id, source_day)
);
```

### 기타 테이블
- **users**: 사용자 정보 + 설정
- **questions**: 문제 데이터 (keywords 배열 포함)
- **user_progress**: 개별 문제 진행도
- **daily_progress**: 일일 학습 현황
- **favorites / wrong_answers**: 즐겨찾기 / 틀린 문제

---

## 🔧 핵심 기능

### 1. 채점 시스템 (Keywords 기반)
```javascript
// 난이도별 통과 기준
1: 50%  // 초급
2: 70%  // 중급
3: 90%  // 고급

// 점수 = (매칭 키워드 / 전체 키워드) × 100
```

### 2. Day 완료 플로우
```javascript
// Day 학습 완료 → review_queue에 Day 번호만 추가
await createDayReview(userId, dayNumber);

// 다음 학습시 복습 확인 → 해당 Day에서 문제 동적 선택
const reviewDay = await getNextReviewDay(userId);
const questions = await getReviewQuestions(reviewDay.source_day);
```

### 3. 복습 주기 관리
- **정답시**: 다음 단계 진급
- **오답시**: 1일로 초기화
- **120일 완료**: 영구 마스터 (삭제)

---

## 🚀 API 엔드포인트

### 인증
- `GET /auth/google` - Google 로그인
- `POST /auth/logout` - 로그아웃

### 학습 진행
- `POST /api/progress/submit` - 답변 제출 및 채점
- `POST /api/progress/day-complete` - Day 완료 처리
- `GET /api/progress/user` - 진행상황 조회

### 복습 시스템
- `GET /api/review/next` - 다음 복습 Day 조회
- `GET /api/review/questions/:day` - Day별 복습 문제 선택
- `POST /api/review/complete` - 복습 완료 & 다음 주기 설정
- `GET /api/review/schedule` - 복습 스케줄 조회

### 문제 & 기타
- `GET /api/questions/:category/:day` - Day별 문제 조회
- `POST /api/favorites/toggle` - 즐겨찾기 토글
- `GET /api/wrong-answers` - 틀린 문제 리스트

---

## 🏗️ 프런트엔드 아키텍처

### 데이터 흐름: 3계층 아키텍처

**Pages ➝ Hooks ➝ Services**

#### 1. **Pages 계층** (`src/pages/`)
- 페이지 컴포넌트에서 여러 커스텀 훅 조합
- UI 로직과 비즈니스 로직 분리
```javascript
// HomePage.jsx 예시
const { user: userData, isLoading: userLoading } = useUserData();
const { progress: progressData } = useProgressData();
const { badges: badgesData } = useBadgesData();
```

#### 2. **Hooks 계층** (`src/hooks/api/`)
- **React Query 기반**: 서버 상태 관리 & 자동 캐싱
- **데이터별 분리**: useUserData, useProgressData, useQuizData
- **에러 처리**: 통합된 에러 핸들링 및 재시도 로직
```javascript
// useUserData.js 예시
export const useUserData = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => userService.getProfile(),
    staleTime: ENV.CACHE_TIMES.USER_DATA,
    retry: 2
  });
};
```

#### 3. **Services 계층** (`src/services/`)
- **BaseService**: Mock/Real API 전환 로직
- **환경별 데이터**: 개발시 Mock, 프로덕션시 실제 API
- **Fallback 지원**: API 실패시 Mock 데이터로 대체
```javascript
// userService.js 예시
class UserService extends BaseService {
  async getProfile() {
    return this.request(
      () => this.apiCall('/api/users/profile'),
      'user'  // Mock 데이터 키
    );
  }
}
```

### 상태 관리 전략
- **React Query**: 서버 상태 (API 데이터, 캐싱)
- **Context API**: 전역 상태 (인증, 테마)
- **Local State**: 컴포넌트별 UI 상태
- **LocalStorage**: 사용자 설정 영속성

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
// Button.jsx 예시 - Variants 패턴
const buttonVariants = {
  variant: {
    primary: 'btn-primary',
    secondary: 'bg-white text-primary border border-primary',
    ghost: 'bg-transparent text-text-primary hover:bg-gray-light'
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
│   ├── controllers/     # API 핸들러
│   ├── services/       # 비즈니스 로직 (dayReview.js)
│   ├── utils/          # 유틸리티 (grading.js)
│   ├── queries/        # DB 쿼리
│   └── routes/         # 라우팅
├── frontend/
│   └── src/
│       ├── components/  # 재사용 UI 컴포넌트
│       │   ├── ui/     # 기본 UI 컴포넌트 (Button, Card, Modal 등)
│       │   ├── home/   # 홈 페이지 섹션 컴포넌트
│       │   └── layout/ # 레이아웃 컴포넌트 (Header, Navigation 등)
│       ├── contexts/   # React Context (인증, 테마)
│       ├── hooks/      # 커스텀 훅
│       │   └── api/    # API 관련 훅 (React Query)
│       ├── services/   # API 서비스 계층
│       │   ├── baseService.js    # Mock/Real API 전환
│       │   ├── userService.js    # 사용자 관련 API
│       │   ├── progressService.js # 진행률 관련 API
│       │   └── quizService.js    # 퀴즈 관련 API
│       ├── pages/      # 페이지 컴포넌트
│       ├── styles/     # 스타일 파일
│       │   └── globals.css       # 디자인 시스템 & CSS 변수
│       ├── utils/      # 유틸리티 함수
│       └── mocks/      # Mock 데이터
└── database/
    └── talk100_postgresql.sql
```

---

## ⚠️ 주의사항

### 복습 시스템
- Day 번호만 저장하여 가벼운 구조 유지
- 매번 다른 문제로 학습 효과 극대화
- 8단계 간격 반복으로 장기 기억 강화

### 보안
- JWT 토큰 필수, 본인 데이터만 접근
- OAuth provider ID를 uid로 사용
- 모든 외래키에 CASCADE 설정

### 성능
- Keywords 배열 필수, 정규화된 텍스트 매칭
- 인덱스: category+day, user+scheduled_for
- PostgreSQL 고유 기능 활용 (ARRAY, SERIAL)

---

## 🎮 QuizPage 시스템 (완료)

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
    className="bg-yellow-200 px-2 py-1 rounded font-semibold text-center border-2 border-yellow-300 focus:border-primary focus:outline-none"
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
- **QuizProgressBar**: QuizHeader 대신 단순한 진행률 표시
- **메인 액션 버튼**: 1.5배 크기 확대 (py-6, text-lg, text-2xl 아이콘)
- **키워드 입력 영역**: textarea 삭제하고 키워드 박스 직접 클릭 입력
- **모드별 버튼 제어**: 조건부 렌더링으로 적절한 버튼만 표시

---

## 🎯 현재 구현 상태

### ✅ **완료된 부분**
- **아키텍처**: 3계층 데이터 흐름 구조 완성
- **스타일링**: Tailwind + 디자인 시스템 구축 완료
- **UI 컴포넌트**: Button, Card, Modal 등 기본 컴포넌트 완성
- **홈페이지**: CharacterSection, QuizSections 구현
- **QuizPage**: 완전한 퀴즈 인터페이스 구현 완료
  - 두 가지 모드 (문제풀이/채점) 구현
  - 키워드 기반 입력 시스템 구현
  - 실시간 채점 및 자동 진행 구현
  - 힌트/정답 표시 시스템 구현
- **Mock 시스템**: 개발용 Mock 데이터 및 서비스 완성

### 🚧 **진행 중인 작업**
- **API 연동**: 실제 백엔드 API 연결 및 테스트
- **상태 관리**: 전역 상태 최적화

### 🚀 **다음 우선순위 작업**

#### Phase 1: 백엔드 연동
1. **API 연결**: Mock에서 실제 API로 전환
2. **채점 로직**: 백엔드 키워드 기반 채점 구현
3. **진행률 동기화**: 사용자 학습 진행도 실시간 동기화

#### Phase 2: 복습 시스템
1. **복습 알고리즘**: 8단계 간격 복습 스케줄링
2. **Review Queue**: 복습 대기열 관리 시스템
3. **동적 문제 선택**: 복습 시점 랜덤 문제 추출

#### Phase 3: 고급 기능
1. **통계 대시보드**: StatusPage 구현
2. **사용자 설정**: SettingsPage 고도화
3. **성능 최적화**: React.memo, 코드 스플리팅 적용

### 🔧 **기술적 고려사항**
- **성능**: React Query 캐싱 전략 최적화
- **접근성**: ARIA 레이블 및 키보드 네비게이션
- **모바일**: 터치 피드백 및 반응형 디자인
- **PWA**: 오프라인 지원 고려 (향후)