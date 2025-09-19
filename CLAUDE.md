# CLAUDE.md - talk100 프로젝트 가이드

## 🎯 프로젝트 개요

**talk100**: 영어문장 암기 학습 어플리케이션
- **목적**: 영어 문장 암기 및 영작 실력 향상을 위한 맞춤형 학습 환경
- **대상**: '김재우의 영어회화' 수강생
- **단계**: 프로토타입 (MVP)

**기술 스택**:
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- Auth: Passport.js (Google/Naver OAuth)

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

## 🎨 React 프론트엔드 마이그레이션 계획

### 📋 **프로젝트 현황**
- **기존**: HTML/CSS/JS 프로토타입 (5개 페이지)
- **목표**: React 18 + Tailwind CSS 4 + Vite 기반 SPA
- **상태**: 백엔드 API 완료, 프론트엔드 마이그레이션 단계

### 🔍 **기존 HTML 분석 결과**
- 일관된 민트그린 색상 팔레트 (`--primary-color: #55AD9B`)
- Mobile-first 반응형 디자인
- 공통 패턴: Header + Bottom Navigation + Modal
- CSS 변수 시스템으로 테마 통일성 확보
- 터치 피드백 및 애니메이션 일관성

### 🏗️ **아키텍처 설계**

#### **폴더 구조**
```
frontend/src/
├── components/
│   ├── common/          # 재사용 가능한 공통 컴포넌트
│   │   ├── Button.jsx   # 터치 피드백 포함
│   │   ├── Card.jsx     # quiz-card, summary-card
│   │   ├── Modal.jsx    # 공통 모달 베이스
│   │   ├── ToggleSwitch.jsx
│   │   ├── ProgressBar.jsx
│   │   └── Badge.jsx
│   ├── layout/          # 레이아웃 컴포넌트
│   │   ├── AppLayout.jsx
│   │   ├── MobileHeader.jsx
│   │   └── BottomNavigation.jsx
│   ├── quiz/            # 퀴즈 관련 컴포넌트
│   ├── stats/           # 통계 관련 컴포넌트
│   └── forms/           # 폼 관련 컴포넌트
├── pages/               # 라우트 페이지 컴포넌트
│   ├── HomePage.jsx     # 홈화면
│   ├── QuizPage.jsx     # 퀴즈 진행
│   ├── StatusPage.jsx   # 학습 통계
│   ├── MyPage.jsx       # 마이페이지
│   └── SettingsPage.jsx # 설정
├── hooks/               # 커스텀 훅
│   ├── useAuth.js       # 인증 상태 관리
│   ├── useTheme.js      # 테마 변경 로직
│   ├── useApi.js        # API 호출 로직 추상화
│   ├── useLocalStorage.js # 로컬 스토리지 상태 관리
│   ├── useDebounce.js   # 입력 디바운싱
│   ├── usePagination.js # 페이지네이션 로직
│   └── useModal.js      # 모달 상태 관리
├── services/            # API 통신 로직
├── contexts/            # Context API 관련
│   ├── AppContext.jsx   # 전역 상태
│   ├── AuthContext.jsx  # 인증 상태 (기존)
│   └── ThemeContext.jsx # 테마 상태
├── utils/               # 유틸리티 함수
└── styles/              # 전역 스타일
    └── globals.css      # CSS 변수 + Tailwind
```

### 🎯 **Phase별 구현 계획**

#### **Phase 1: 프로젝트 기반 설정 (1-2일)**
1. **Tailwind CSS 설정 & 테마 시스템**
   ```css
   /* CSS 변수를 Tailwind 테마로 통합 */
   :root {
     --primary-color: #55AD9B;
     --primary-dark: #428A7B;
     --primary-light: #95D2B3;
     --accent-mint: #D8EFD3;
     --accent-pale: #F1F8E8;
   }
   ```

2. **라우팅 설정**
   ```jsx
   <BrowserRouter>
     <Routes>
       <Route path="/" element={<HomePage />} />
       <Route path="/quiz" element={<QuizPage />} />
       <Route path="/status" element={<StatusPage />} />
       <Route path="/mypage" element={<MyPage />} />
       <Route path="/settings" element={<SettingsPage />} />
     </Routes>
   </BrowserRouter>
   ```

3. **상태 관리 구조 설계**

#### **Phase 2: 공통 컴포넌트 & 레이아웃 (2-3일)**
1. **Layout 컴포넌트**
   - AppLayout (전체 앱 구조)
   - MobileHeader (상단 헤더)
   - BottomNavigation (하단 네비게이션)

2. **재사용 가능한 UI 컴포넌트**
   - Button (touchable 효과)
   - Card (다양한 카드 타입)
   - Modal (공통 모달)
   - Form 요소들

#### **Phase 3: 페이지별 컴포넌트 구현 (3-4일)**
1. **HomePage 변환**
   - CharacterSection (프로필 + 진행률)
   - QuizCategorySection (카테고리별 퀴즈)
   - QuizPersonalSection (나만의 퀴즈)
   - StudyHistorySection (최근 학습)

2. **QuizPage 변환**
   - QuizHeader (프로그레스 바)
   - QuizContent (문제 표시)
   - UserAnswerBox (답변 입력)
   - QuizControls (하단 컨트롤)

3. **기타 페이지들 변환**

#### **Phase 4: 기능 통합 & 상태 관리 (2-3일)**
1. **API 연동**
2. **상태 관리 구현**
3. **로컬 스토리지 관리**

#### **Phase 5: 최적화 & 테스팅 (1-2일)**
1. **성능 최적화** (React.memo, useMemo, 코드 스플리팅)
2. **접근성 & UX**
3. **에러 처리**

### 📊 **구현 우선순위**

| 우선순위 | 컴포넌트 | 복잡도 | 기간 |
|---------|---------|--------|------|
| 🔥 **High** | Layout + Navigation | 중 | 1일 |
| 🔥 **High** | HomePage | 중 | 1일 |
| 🔴 **Medium** | QuizPage | 고 | 2일 |
| 🔴 **Medium** | StatusPage | 중 | 1일 |
| 🟡 **Low** | MyPage | 저 | 1일 |
| 🟡 **Low** | SettingsPage | 중 | 1일 |

### 🔧 **기술적 세부사항**

#### **스타일링 전략**
- HTML의 CSS 변수를 Tailwind 테마로 변환
- 컴포넌트별 스타일 모듈화
- 다크모드 지원을 위한 CSS 변수 활용
- 반응형 디자인 우선 (mobile-first)

#### **상태 관리 전략**
- Context API: 전역 상태 (테마, 인증)
- Local State: 컴포넌트 상태
- React Query: 서버 상태 (기존 설치됨)
- LocalStorage: 설정 영속성

#### **성능 최적화**
- React.memo를 활용한 불필요한 리렌더링 방지
- useMemo, useCallback 적절 활용
- Code splitting (lazy loading) 구현
- 이미지 최적화 (lazy loading, WebP 형식)

### 🚀 **즉시 시작 가능한 작업**
1. CSS 변수 → Tailwind 테마 변환
2. 공통 Layout 컴포넌트 생성
3. 재사용 UI 컴포넌트 라이브러리 구축
4. HomePage 우선 구현 (가장 복잡하고 핵심적)