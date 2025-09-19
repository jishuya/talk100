-- ================================================
-- talk100 Database Setup for PostgreSQL (Simplified Version v2)
-- 영어 학습 앱 프로토타입 데이터베이스 스키마
-- 
-- 설계 원칙:
-- 1. MVP 중심: 핵심 기능만 구현
-- 2. 단순함: 불필요한 복잡도 제거
-- 3. 확장성: 나중에 기능 추가 가능한 구조
-- 4. PostgreSQL 기본 기능 활용
-- ================================================

-- 데이터베이스 생성 (별도로 실행 필요)
-- CREATE DATABASE talk100;

-- 데이터베이스 연결
\c talk100;

-- ================================================
-- 테이블 삭제 (초기화용)
-- 의존 관계 순서대로 삭제
-- ================================================
DROP TABLE IF EXISTS wrong_answers CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS daily_progress CASCADE;
DROP TABLE IF EXISTS review_queue CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS session CASCADE;

-- ================================================
-- 1. SESSION 테이블
-- 목적: Express 세션 저장 (connect-pg-simple 용)
-- ================================================
CREATE TABLE session (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);

-- 세션 만료 시간 인덱스 (자동 정리용)
CREATE INDEX idx_session_expire ON session(expire);

-- ================================================
-- 2. USERS 테이블
-- 목적: 사용자 기본 정보 및 설정 저장
-- ================================================
CREATE TABLE users (
    -- Primary Key: OAuth provider ID
    uid VARCHAR(255) PRIMARY KEY,
    
    -- 기본 정보
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    profile_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,  -- 마지막 로그인 시간
    
    -- 설정
    voice_gender VARCHAR(10) DEFAULT 'male' CHECK (voice_gender IN ('male', 'female')),
    default_difficulty INTEGER DEFAULT 2 CHECK (default_difficulty BETWEEN 1 AND 3),
    daily_goal INTEGER DEFAULT 1 CHECK (daily_goal >= 1),  -- Quiz Set (Day 개수)
    
    -- 통계
    total_questions_attempted INTEGER DEFAULT 0,
    total_correct_answers INTEGER DEFAULT 0,
    total_days_studied INTEGER DEFAULT 0,  -- 총 학습일수
    current_streak INTEGER DEFAULT 0,      -- 현재 연속 학습일
    longest_streak INTEGER DEFAULT 0,      -- 최장 연속 학습일
    
    -- PostgreSQL 배열 타입
    weekly_attendance INTEGER[] DEFAULT ARRAY[0,0,0,0,0,0,0]  -- 주간 출석 [월,화,수,목,금,토,일]
);

-- ================================================
-- 3. CATEGORIES 테이블
-- 목적: 카테고리 정보 관리
-- ================================================
CREATE TABLE categories (
    category_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),
    order_num INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- ================================================
-- 4. QUESTIONS 테이블
-- 목적: 모든 학습 문제 저장
-- ================================================
CREATE TABLE questions (
    -- Primary Key
    question_id VARCHAR(100) PRIMARY KEY,
    
    -- 분류 정보
    category VARCHAR(50) REFERENCES categories(category_id),
    day INTEGER NOT NULL,
    question_number INTEGER NOT NULL,
    
    -- 문제 타입
    question_type VARCHAR(20) CHECK (question_type IN ('single', 'dialogue')),
    
    -- 단일 문제용 필드
    korean_content TEXT,
    english_content TEXT,
    
    -- 대화형 문제용 필드
    person_a_korean TEXT,
    person_a_english TEXT,
    person_b_korean TEXT,
    person_b_english TEXT,
    
    -- 음성 파일 경로
    audio_male_full VARCHAR(500),
    audio_female_full VARCHAR(500),
    audio_male_person_a VARCHAR(500),
    audio_female_person_a VARCHAR(500),
    audio_male_person_b VARCHAR(500),
    audio_female_person_b VARCHAR(500),
    
    -- 채점용
    keywords TEXT[],  -- 핵심 단어 배열
    
    -- 유니크 제약
    UNIQUE(category, day, question_number)
);

-- ================================================
-- 5. USER_PROGRESS 테이블
-- 목적: 사용자별 문제 학습 진행상황
-- ================================================
CREATE TABLE user_progress (
    progress_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE,
    question_id VARCHAR(100) REFERENCES questions(question_id) ON DELETE CASCADE,
    
    -- 학습 통계
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    last_attempt_timestamp TIMESTAMP,
    last_is_correct BOOLEAN,
    
    -- 상태
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'learning', 'mastered')),
    
    -- 유니크 제약
    UNIQUE(user_id, question_id)
);

-- ================================================
-- 6. REVIEW_QUEUE 테이블
-- 목적: 복습 대기열 관리 (Day 번호만 저장)
-- 핵심 원칙: Day 번호만 저장하여 복습 시점에 문제 동적 선택
-- ================================================
CREATE TABLE review_queue (
    queue_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE,
    source_day INTEGER NOT NULL,        -- 복습할 Day 번호만 저장

    interval_days INTEGER DEFAULT 1,    -- 1,3,7,14,30,60,90,120
    scheduled_for TIMESTAMP,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_reviewed TIMESTAMP,
    review_count INTEGER DEFAULT 0,

    UNIQUE(user_id, source_day)
);

-- ================================================
-- 7. DAILY_PROGRESS 테이블
-- 목적: 일일 학습 진행 추적
-- ================================================
CREATE TABLE daily_progress (
    user_id VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    days_completed INTEGER DEFAULT 0,  -- 오늘 완료한 Day 수
    goal_met BOOLEAN DEFAULT false,    -- 일일 목표 달성 여부
    additional_days INTEGER DEFAULT 0,  -- 목표 달성 후 추가 학습
    
    PRIMARY KEY (user_id, date)
);

-- ================================================
-- 8. FAVORITES 테이블
-- 목적: 즐겨찾기 문제 관리 (❤️)
-- ================================================
CREATE TABLE favorites (
    user_id VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE,
    question_id VARCHAR(100) REFERENCES questions(question_id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, question_id)
);

-- ================================================
-- 9. WRONG_ANSWERS 테이블
-- 목적: 틀린 문제 관리 (⭐)
-- ================================================
CREATE TABLE wrong_answers (
    user_id VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE,
    question_id VARCHAR(100) REFERENCES questions(question_id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    wrong_count INTEGER DEFAULT 1,
    is_starred BOOLEAN DEFAULT true,  -- ⭐ 버튼 활성화 상태
    
    PRIMARY KEY (user_id, question_id)
);

-- ================================================
-- 인덱스 생성
-- 자주 사용되는 쿼리 최적화
-- ================================================
CREATE INDEX idx_questions_category_day ON questions(category, day, question_number);
CREATE INDEX idx_user_progress_user ON user_progress(user_id, status);
CREATE INDEX idx_review_queue_user_scheduled ON review_queue(user_id, scheduled_for);
CREATE INDEX idx_daily_progress_user_date ON daily_progress(user_id, date);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_wrong_answers_user ON wrong_answers(user_id);

-- ================================================
-- 샘플 데이터 입력
-- ================================================

-- Categories 데이터
INSERT INTO categories (category_id, name, display_name, order_num) VALUES
('model_example', 'Model Example', '모범 예문', 1),
('small_talk', 'Small Talk', '스몰 토크', 2),
('cases_in_point', 'Cases in Point', '사례 연구', 3);

-- ================================================
-- Questions 테이블 - MODEL EXAMPLE (Day 14)
-- ================================================
INSERT INTO questions (
    question_id, category, day, question_number, question_type,
    korean_content, english_content,
    audio_male_full, audio_female_full,
    keywords
) VALUES
('model_example_14_1', 'model_example', 14, 1, 'single',
 'BTS는 뭔가 좀 달라.',
 'There is something different about BTS.',
 '/audio/model_example/day14/1_male.mp3', 
 '/audio/model_example/day14/1_female.mp3',
 ARRAY['something', 'different', 'BTS']),

('model_example_14_2', 'model_example', 14, 2, 'single',
 '이번에 면접 봤는데 뭔가 이상했어요.',
 'There was something weird about the interview.',
 '/audio/model_example/day14/2_male.mp3',
 '/audio/model_example/day14/2_female.mp3',
 ARRAY['something', 'weird', 'interview']),

('model_example_14_3', 'model_example', 14, 3, 'single',
 '이 브랜드에 사람들이 열광하는 이유가 있지.',
 'There is something about this brand people are crazy about.',
 '/audio/model_example/day14/3_male.mp3',
 '/audio/model_example/day14/3_female.mp3',
 ARRAY['something', 'brand', 'people', 'crazy']),

('model_example_14_4', 'model_example', 14, 4, 'single',
 '그 사람에게는 뭔가 끌리는 점이 있어요.',
 'There is something about him that I attracted to.',
 '/audio/model_example/day14/4_male.mp3',
 '/audio/model_example/day14/4_female.mp3',
 ARRAY['something', 'him', 'attracted']),

('model_example_14_5', 'model_example', 14, 5, 'single',
 '유재석은 뭔가 사람을 편하게 해 주는 게 있어.',
 'There is something about Yu Jae-seok that puts people at ease.',
 '/audio/model_example/day14/5_male.mp3',
 '/audio/model_example/day14/5_female.mp3',
 ARRAY['something', 'Yu Jae-seok', 'puts', 'people', 'ease']),

('model_example_14_6', 'model_example', 14, 6, 'single',
 '그 코치에게는 선수들의 잠재력을 이끌어내는 뭔가가 있어.',
 'There is something about the coach that brings out the best in players.',
 '/audio/model_example/day14/6_male.mp3',
 '/audio/model_example/day14/6_female.mp3',
 ARRAY['something', 'coach', 'brings', 'best', 'players']);

-- ================================================
-- Questions 테이블 - MODEL EXAMPLE (Day 15)
-- ================================================
INSERT INTO questions (
    question_id, category, day, question_number, question_type,
    korean_content, english_content,
    audio_male_full, audio_female_full,
    keywords
) VALUES
('model_example_15_1', 'model_example', 15, 1, 'single',
 '다 먹은거니?',
 'Are you done with your plate?',
 '/audio/model_example/day15/1_male.mp3',
 '/audio/model_example/day15/1_female.mp3',
 ARRAY['done', 'plate']),

('model_example_15_2', 'model_example', 15, 2, 'single',
 '이 스쾃 기구 다 쓰신 거죠? 제가 써도 될까요?',
 'Are you done with this squat rack? Is it alright if I use it?',
 '/audio/model_example/day15/2_male.mp3',
 '/audio/model_example/day15/2_female.mp3',
 ARRAY['done', 'squat rack', 'alright', 'use']),

('model_example_15_3', 'model_example', 15, 3, 'single',
 '샌드위치 그만 먹을래. 너무 커.',
 'I think I''m done with my sandwich. It''s just way too big.',
 '/audio/model_example/day15/3_male.mp3',
 '/audio/model_example/day15/3_female.mp3',
 ARRAY['done', 'sandwich', 'way', 'too', 'big']),

('model_example_15_4', 'model_example', 15, 4, 'single',
 '제가 빌려준 책 다 읽은 거죠? 그럼 돌려주세요.',
 'Are you done with the book I lent you? I''d like to have it back.',
 '/audio/model_example/day15/4_male.mp3',
 '/audio/model_example/day15/4_female.mp3',
 ARRAY['done', 'book', 'lent', 'have', 'back']),

('model_example_15_5', 'model_example', 15, 5, 'single',
 '차량 점검 마쳤습니다. 어디가 고장인지 말씀드릴게요.',
 'I''m done taking a look at your car. I''ll tell you what you''ve got here.',
 '/audio/model_example/day15/5_male.mp3',
 '/audio/model_example/day15/5_female.mp3',
 ARRAY['done', 'taking', 'look', 'car', 'tell']),

('model_example_15_6', 'model_example', 15, 6, 'single',
 '들어오지 마! 나 아직 옷 덜 갈아입었다고.',
 'Don''t come in! I''m not done changing.',
 '/audio/model_example/day15/6_male.mp3',
 '/audio/model_example/day15/6_female.mp3',
 ARRAY['Don''t', 'come', 'not', 'done', 'changing']);

-- ================================================
-- Questions 테이블 - SMALL TALK (Day 14) - 대화형
-- ================================================
INSERT INTO questions (
    question_id, category, day, question_number, question_type,
    person_a_korean, person_a_english,
    person_b_korean, person_b_english,
    audio_male_person_a, audio_female_person_a,
    audio_male_person_b, audio_female_person_b,
    keywords
) VALUES
('small_talk_14_1', 'small_talk', 14, 1, 'dialogue',
 '요즘 차 알아보고 있는데, 포르쉐에는 거부할 수 없는 뭔가가 있어.',
 'I''ve been shopping around for a car and, there''s something about Porches that I can''t resist.',
 '스포츠카에 그렇게 큰돈을 쓸 생각을 하다니. 돈 모으고 투자해서 빨리 은퇴해야지.',
 'I can''t believe you''re thinking about spending so much money on a sports car. You should just save, invest and retire early.',
 '/audio/small_talk/day14/1_A_male.mp3',
 '/audio/small_talk/day14/1_A_female.mp3',
 '/audio/small_talk/day14/1_B_male.mp3',
 '/audio/small_talk/day14/1_B_female.mp3',
 ARRAY['shopping', 'car', 'Porches', 'resist', 'sports car', 'save', 'invest', 'retire']),

('small_talk_14_2', 'small_talk', 14, 2, 'dialogue',
 '터치스크린이 딸린 기기에는 익숙하지 않은 것 같네, 그렇지?',
 'It looks like you''re not used to devices with a touch screen, right?',
 '응. 실물 마우스랑 키보드가 뭔가 더 편해.',
 'Yes. There''s something about a real mouse and keyboard that make me more comfortable.',
 '/audio/small_talk/day14/2_A_male.mp3',
 '/audio/small_talk/day14/2_A_female.mp3',
 '/audio/small_talk/day14/2_B_male.mp3',
 '/audio/small_talk/day14/2_B_female.mp3',
 ARRAY['looks', 'used', 'devices', 'touch screen', 'something', 'mouse', 'keyboard', 'comfortable']),

('small_talk_14_3', 'small_talk', 14, 3, 'dialogue',
 '그 사람은 뭔가 달라. 내가 만난 다른 남자들이랑 달라.',
 'There is something different about him. He is not like other guys I have met.',
 '그렇긴 하지만 이제 겨우 한 번 만난 거잖아. 좀 천천히 시간을 가진 다음에 공식적으로 만나.',
 'Sure, but It was only one date. Take it more time before you become official.',
 '/audio/small_talk/day14/3_A_male.mp3',
 '/audio/small_talk/day14/3_A_female.mp3',
 '/audio/small_talk/day14/3_B_male.mp3',
 '/audio/small_talk/day14/3_B_female.mp3',
 ARRAY['something', 'different', 'like', 'other', 'guys', 'only', 'date', 'take', 'time', 'official']);

-- ================================================
-- Questions 테이블 - SMALL TALK (Day 15) - 대화형
-- ================================================
INSERT INTO questions (
    question_id, category, day, question_number, question_type,
    person_a_korean, person_a_english,
    person_b_korean, person_b_english,
    audio_male_person_a, audio_female_person_a,
    audio_male_person_b, audio_female_person_b,
    keywords
) VALUES
('small_talk_15_1', 'small_talk', 15, 1, 'dialogue',
 '컴퓨터는 다 쓴 거야? 내 회사 이메일 확인해야 하는데.',
 'Are you done with the computer? I need to check my work emails.',
 '근데 이 게임 너무 재미있어. 당신 전화기로 확인하면 안 돼?',
 'I''m really into this game, though. Can''t you just check them on your phone?',
 '/audio/small_talk/day15/1_A_male.mp3',
 '/audio/small_talk/day15/1_A_female.mp3',
 '/audio/small_talk/day15/1_B_male.mp3',
 '/audio/small_talk/day15/1_B_female.mp3',
 ARRAY['done', 'computer', 'need', 'check', 'work', 'emails', 'really', 'game', 'phone']),

('small_talk_15_2', 'small_talk', 15, 2, 'dialogue',
 '옷은 다 입어 본 거야? 여기 너한테 어울리는 옷이 없는 것 같아.',
 'Are you done trying on clothes? I don''t think anything here really suits you.',
 '응, 거의 다 입어 봤어. 잠깐만! 이 스커트 너무 귀엽다!',
 'Yeah, just about. Wait! Look at this cute skirt.',
 '/audio/small_talk/day15/2_A_male.mp3',
 '/audio/small_talk/day15/2_A_female.mp3',
 '/audio/small_talk/day15/2_B_male.mp3',
 '/audio/small_talk/day15/2_B_female.mp3',
 ARRAY['done', 'trying', 'clothes', 'think', 'anything', 'suits', 'Yeah', 'Wait', 'cute', 'skirt']),

('small_talk_15_3', 'small_talk', 15, 3, 'dialogue',
 '신규 환자분들이 작성해야 하는 양식 세 장 여기 있습니다. 다 작성하시면 말해 주세요.',
 'Here are three forms what we ask all new patients to fill out. Please let me know when you are done.',
 '네. 근데 펜이 있을까요?',
 'Alright. Oh, do you have a pen I could use?',
 '/audio/small_talk/day15/3_A_male.mp3',
 '/audio/small_talk/day15/3_A_female.mp3',
 '/audio/small_talk/day15/3_B_male.mp3',
 '/audio/small_talk/day15/3_B_female.mp3',
 ARRAY['three', 'forms', 'new', 'patients', 'fill', 'let', 'know', 'done', 'pen', 'use']);

-- ================================================
-- Questions 테이블 - CASES IN POINT (Day 14)
-- ================================================
INSERT INTO questions (
    question_id, category, day, question_number, question_type,
    korean_content, english_content,
    audio_male_full, audio_female_full,
    keywords
) VALUES
('cases_in_point_14_1', 'cases_in_point', 14, 1, 'single',
 '남성분들은 이해를 못 합니다. 저희 차가 너무 비싸다거나 너무 작다거나 장거리 운행에는 별로라는 말을 합니다. 미니 쿠퍼에는 여성들이 거부할 수 없는 무언가가 있습니다. 누가 봐도 귀여운 건 당연하고, 운전의 재미도 있으며 좁은 공간에서 주차하기도 더 편합니다.',
 'Guys just don''t get it. They say our cars are overpriced, or too small, or impractical for long distances. There is something about Mini Coopers that women find irresistible. And besides obviously looking cute, our cars are fun to drive, and also easier to park in cramped spaces.',
 '/audio/cases_in_point/day14/1_male.mp3',
 '/audio/cases_in_point/day14/1_female.mp3',
 ARRAY['don''t', 'get', 'overpriced', 'small', 'impractical', 'Mini Coopers', 'women', 'irresistible', 'cute', 'fun', 'drive', 'easier', 'park', 'cramped']);

-- ================================================
-- Questions 테이블 - CASES IN POINT (Day 15)
-- ================================================
INSERT INTO questions (
    question_id, category, day, question_number, question_type,
    korean_content, english_content,
    audio_male_full, audio_female_full,
    keywords
) VALUES
('cases_in_point_15_1', 'cases_in_point', 15, 1, 'single',
 '기구를 다 쓴 뒤에는 꼭 제자리에 놔두실 것을 당부드립니다. 아무렇게나 놔두면 다른 사람들이 찾을 수가 없습니다. 1회 위반자는 경고 조치하며 2회 위반자는 일주일간 헬스장 출입이 금지됩니다. 모두가 즐길 수 있는 헬스장을 만드는 데 협조해 주시면 감사하겠습니다.',
 'Please make sure to put away the weights when you''re done. If you leave them out, others can''t find what they need. Violators will be warned the first time, and then suspended for a week the second time. We appreciate your cooperation in making the gym a place everyone can enjoy.',
 '/audio/cases_in_point/day15/1_male.mp3',
 '/audio/cases_in_point/day15/1_female.mp3',
 ARRAY['make sure', 'put away', 'weights', 'done', 'leave', 'others', 'can''t', 'find', 'Violators', 'warned', 'suspended', 'week', 'cooperation', 'gym', 'everyone', 'enjoy']);

-- ================================================
-- 샘플 사용자 데이터
-- ================================================
INSERT INTO users (uid, name, email, voice_gender, default_difficulty, daily_goal, weekly_attendance) VALUES
('user001', '김재우', 'jaewoo@example.com', 'male', 2, 1, ARRAY[1,1,0,1,1,0,0]),
('user002', '이민지', 'minji@example.com', 'female', 1, 2, ARRAY[1,0,1,0,1,1,0]),
('user003', '박준호', 'junho@example.com', 'male', 3, 1, ARRAY[0,1,1,1,0,0,0]);

-- ================================================
-- 샘플 학습 진행 데이터
-- ================================================
INSERT INTO user_progress (user_id, question_id, total_attempts, correct_attempts, status) VALUES
('user001', 'model_example_14_1', 3, 2, 'learning'),
('user001', 'model_example_14_2', 5, 5, 'mastered'),
('user001', 'small_talk_14_1', 2, 1, 'learning');

-- ================================================
-- 샘플 틀린 문제 데이터
-- ================================================
INSERT INTO wrong_answers (user_id, question_id, wrong_count) VALUES
('user001', 'model_example_14_1', 1),
('user001', 'small_talk_14_1', 1);

-- ================================================
-- 샘플 즐겨찾기 데이터
-- ================================================
INSERT INTO favorites (user_id, question_id) VALUES
('user001', 'model_example_14_2'),
('user001', 'cases_in_point_14_1');

-- ================================================
-- 샘플 일일 진행 데이터
-- ================================================
INSERT INTO daily_progress (user_id, date, days_completed, goal_met) VALUES
('user001', '2024-01-15', 1, true),
('user001', '2024-01-16', 2, true),
('user002', '2024-01-15', 1, false);

-- ================================================
-- 샘플 복습 큐 데이터 (Day 번호 기반)
-- ================================================
INSERT INTO review_queue (user_id, source_day, interval_days, scheduled_for) VALUES
('user001', 14, 1, NOW() + INTERVAL '1 day'),
('user001', 15, 3, NOW() + INTERVAL '3 days'),
('user002', 14, 1, NOW() + INTERVAL '1 day');

-- ================================================
-- 데이터 확인 쿼리
-- ================================================
SELECT 'Session:' as table_name, COUNT(*) as count FROM session
UNION ALL
SELECT 'Users:', COUNT(*) FROM users
UNION ALL
SELECT 'Categories:', COUNT(*) FROM categories
UNION ALL
SELECT 'Questions:', COUNT(*) FROM questions
UNION ALL
SELECT 'User Progress:', COUNT(*) FROM user_progress
UNION ALL
SELECT 'Wrong Answers:', COUNT(*) FROM wrong_answers
UNION ALL
SELECT 'Favorites:', COUNT(*) FROM favorites
UNION ALL
SELECT 'Daily Progress:', COUNT(*) FROM daily_progress
UNION ALL
SELECT 'Review Queue:', COUNT(*) FROM review_queue;

-- ================================================
-- 유용한 쿼리 예시
-- ================================================

-- 1. 사용자의 오늘 진행상황 조회
-- SELECT 
--     u.name,
--     u.daily_goal,
--     u.current_streak,
--     u.weekly_attendance,
--     COALESCE(dp.days_completed, 0) as completed,
--     COALESCE(dp.goal_met, false) as goal_met
-- FROM users u
-- LEFT JOIN daily_progress dp 
--     ON u.uid = dp.user_id 
--     AND dp.date = CURRENT_DATE
-- WHERE u.uid = 'user001';

-- 2. 틀린 문제 리스트 조회
-- SELECT 
--     wa.question_id,
--     q.korean_content,
--     q.english_content,
--     wa.wrong_count,
--     wa.is_starred
-- FROM wrong_answers wa
-- JOIN questions q ON wa.question_id = q.question_id
-- WHERE wa.user_id = 'user001' AND wa.is_starred = true
-- ORDER BY wa.wrong_count DESC;

-- 3. 즐겨찾기 문제 조회
-- SELECT 
--     f.question_id,
--     q.category,
--     q.korean_content,
--     q.english_content
-- FROM favorites f
-- JOIN questions q ON f.question_id = q.question_id
-- WHERE f.user_id = 'user001'
-- ORDER BY f.added_at DESC;

-- 4. 복습 대기 Day 조회 (Day 번호만)
-- SELECT
--     rq.source_day,
--     rq.interval_days,
--     rq.scheduled_for,
--     rq.review_count
-- FROM review_queue rq
-- WHERE rq.user_id = 'user001'
--     AND rq.scheduled_for <= CURRENT_TIMESTAMP
-- ORDER BY rq.scheduled_for;

-- 5. 카테고리별 진행률
-- SELECT 
--     q.category,
--     COUNT(DISTINCT q.question_id) as total,
--     COUNT(DISTINCT CASE WHEN up.status = 'mastered' THEN up.question_id END) as mastered,
--     ROUND(100.0 * COUNT(DISTINCT CASE WHEN up.status = 'mastered' THEN up.question_id END) / COUNT(DISTINCT q.question_id), 2) as progress_rate
-- FROM questions q
-- LEFT JOIN user_progress up 
--     ON q.question_id = up.question_id 
--     AND up.user_id = 'user001'
-- GROUP BY q.category;

-- 6. 주간 출석 현황 확인
-- SELECT 
--     uid,
--     name,
--     weekly_attendance,
--     weekly_attendance[1] as monday,
--     weekly_attendance[2] as tuesday,
--     weekly_attendance[3] as wednesday,
--     weekly_attendance[4] as thursday,
--     weekly_attendance[5] as friday,
--     weekly_attendance[6] as saturday,
--     weekly_attendance[7] as sunday
-- FROM users
-- WHERE uid = 'user001';

-- 7. 세션 정리 (30일 이상 된 세션 삭제)
-- DELETE FROM session 
-- WHERE expire < NOW() - INTERVAL '30 days';
