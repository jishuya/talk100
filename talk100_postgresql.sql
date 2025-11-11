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
DROP TABLE IF EXISTS review_queue CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS session CASCADE;
DROP TABLE IF EXISTS daily_summary CASCADE;
DROP TABLE IF EXISTS question_attempts CASCADE;

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
    profile_image VARCHAR(500) DEFAULT '🦊',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,  -- 마지막 로그인 시간
    
    -- 설정
    voice_gender VARCHAR(20) DEFAULT 'us_female'
        CHECK (voice_gender IN ('us_male', 'us_female', 'uk_male', 'uk_female')),
    audio_speed NUMERIC(2,1) DEFAULT 1.0
        CHECK (audio_speed IN (0.5, 1.0, 1.5, 2.0)),
    default_difficulty INTEGER DEFAULT 2 CHECK (default_difficulty BETWEEN 1 AND 3),
    daily_goal INTEGER DEFAULT 10 CHECK (daily_goal >= 1),  -- Quiz Set (Day 개수) - 일일 학습목표 10문제
    attendance_goal int4 DEFAULT 3 NULL,   -- 주간 목표 출석일 - 주 3일
    quiz_count_goal int4 DEFAULT 30 NULL,   -- 주간 목표 문제수 - 주 30문제
    quiz_mode VARCHAR(20) DEFAULT 'keyboard' NOT NULL CHECK (quiz_mode IN ('voice', 'keyboard')),  -- 퀴즈 입력 모드
    
    -- 통계
    total_questions_attempted INTEGER DEFAULT 0,
    total_correct_answers INTEGER DEFAULT 0,
    total_days_studied INTEGER DEFAULT 0,  -- 총 학습일수
    current_streak INTEGER DEFAULT 0,      -- 현재 연속 학습일
    longest_streak INTEGER DEFAULT 0,      -- 최장 연속 학습일
    level INTEGER DEFAULT 1,
    
    -- PostgreSQL 배열 타입
    weekly_attendance INTEGER[] DEFAULT ARRAY[0,0,0,0,0,0,0],  -- 주간 출석 [월,화,수,목,금,토,일]
    earned_badges JSONB DEFAULT '[]'::jsonb
);


-- ================================================
-- 3. category 테이블
-- 목적: 카테고리 정보 관리
-- ================================================
CREATE TABLE category (
    category_id INTEGER PRIMARY KEY,
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
    question_id INTEGER NOT NULL PRIMARY KEY,

    -- 분류 정보
    category_id INTEGER REFERENCES category(category_id),
    day INTEGER NOT NULL,
    question_number INTEGER NOT NULL,

    -- 문제 타입
    question_type VARCHAR(20) CHECK (question_type IN ('short', 'dialogue', 'long')),
    
    -- 단일 문제용 필드
    korean TEXT,
    english TEXT,

    -- 대화형 문제용 필드
    korean_a TEXT,
    english_a TEXT,
    korean_b TEXT,
    english_b TEXT,

    -- 음성 파일 경로
    audio_us_male VARCHAR(500),
    audio_us_female VARCHAR(500),
    audio_uk_male VARCHAR(500),
    audio_uk_female VARCHAR(500),

    -- 채점용
    keywords TEXT[],  -- 핵심 단어 배열

    -- 유니크 제약
    UNIQUE(question_id, category_id, day)
);
-- ================================================
-- 5. USER_PROGRESS 테이블
-- 목적: 사용자별 문제 학습 진행상황
-- ================================================
CREATE TABLE user_progress (
    progress_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE,
    category_id INTEGER REFERENCES category(category_id) ON DELETE CASCADE,

    -- 마지막 학습 정보
    last_studied_day INTEGER DEFAULT 1,
    last_studied_question_id INTEGER REFERENCES questions(question_id) ON DELETE CASCADE,
    last_studied_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 일일 진행률 추적
    solved_count INTEGER DEFAULT 0,          -- 오늘 푼 문제 수 (자정 리셋)

    -- 사용자+카테고리별 하나의 레코드만 유지
    UNIQUE(user_id, category_id)
);

-- ================================================
-- 6. REVIEW_QUEUE 테이블
-- 목적: 복습 대기열 관리 (Day 번호만 저장)
-- 핵심 원칙: Day 번호만 저장하여 복습 시점에 문제 동적 선택
-- ================================================
CREATE TABLE review_queue (
    queue_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE,
    day INTEGER NOT NULL REFERENCES questions(day),        -- 복습할 questions의 day
    interval_days INTEGER DEFAULT 1,    -- 1,3,7,14,30,60,90,120
    scheduled_for TIMESTAMP,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_reviewed TIMESTAMP,
    review_count INTEGER DEFAULT 0,

    UNIQUE(user_id, day)
);

-- ================================================
-- 7. FAVORITES 테이블
-- 목적: 즐겨찾기 문제 관리 (❤️)
-- ================================================
CREATE TABLE favorites (
    user_id VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(question_id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, question_id)
);

-- ================================================
-- 8. WRONG_ANSWERS 테이블
-- 목적: 틀린 문제 관리 (⭐)
-- ================================================
CREATE TABLE wrong_answers (
    user_id VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(question_id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	wrong_count INTEGER DEFAULT 1,
    last_viewed_at TIMESTAMP,

    PRIMARY KEY (user_id, question_id)
);

-- ================================================
-- 9. DAILY_SUMMARY 테이블
-- 목적: 하루 단위 학습 활동을 집계하여 빠른 통계 조회를 위한 요약 테이블
-- ================================================

-- 업데이트 트리거 함수 생성
CREATE OR REPLACE FUNCTION set_timestamp()
	RETURNS TRIGGER AS $$
	BEGIN
		NEW.updated_at = NOW();
		RETURN NEW;
	END;
	$$ LANGUAGE plpgsql;

CREATE TABLE daily_summary (
    summary_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    questions_attempted INTEGER DEFAULT 0,
    days_completed INTEGER DEFAULT 0,
    goal_met BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- 자동 업데이트 트리거
CREATE TRIGGER set_daily_summary_timestamp
    BEFORE UPDATE ON daily_summary
    FOR EACH ROW
    EXECUTE FUNCTION set_timestamp();

-- ================================================
-- 10. QUESTION_ATTEMPTS 테이블
-- 목적: 사용자가 시도한 문제 추적 (정답 여부 무관)
-- ================================================
CREATE TABLE question_attempts (
    user_id VARCHAR(255) NOT NULL,
    question_id INTEGER NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 외래키
    CONSTRAINT fk_qa_user FOREIGN KEY (user_id) 
        REFERENCES users(uid) ON DELETE CASCADE,
    CONSTRAINT fk_qa_question FOREIGN KEY (question_id) 
        REFERENCES questions(question_id) ON DELETE CASCADE,
    
    -- 기본키: 같은 날 같은 문제는 한 번만 기록
    PRIMARY KEY (user_id, question_id, date)
);

-- 인덱스: 날짜별 조회 최적화
CREATE INDEX idx_qa_user_date ON question_attempts(user_id, date DESC);

COMMENT ON TABLE question_attempts IS '사용자별 문제 시도 기록 (정답 여부 무관)';
COMMENT ON COLUMN question_attempts.attempted_at IS '시도 시각 (학습 패턴 분석용 - 몇 시에 주로 학습하는지)';

-- ================================================
-- 11. USER_SETTING 테이블
-- 목적: 사용자 설정 정보 저장
-- ================================================
CREATE TABLE user_settings (
  user_id VARCHAR(255) PRIMARY KEY REFERENCES users(uid) ON DELETE CASCADE,
  notifications_enabled BOOLEAN DEFAULT true,
  notification_time TIME DEFAULT '20:00:00',
  autoplay_enabled BOOLEAN DEFAULT false,
  voice_speed DECIMAL(3,2) DEFAULT 1.0,
  voice_gender VARCHAR(10) DEFAULT 'male',
  theme VARCHAR(20) DEFAULT 'light',
  font_size VARCHAR(20) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ================================================
-- 인덱스 생성
-- 자주 사용되는 쿼리 최적화
-- ================================================
CREATE INDEX idx_questions_category_day ON questions(category_id, day, question_number);
CREATE INDEX idx_user_progress_user ON user_progress(user_id, category_id);
CREATE INDEX idx_review_queue_user_scheduled ON review_queue(user_id, scheduled_for);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_wrong_answers_user ON wrong_answers(user_id);
CREATE INDEX idx_daily_summary_user_date ON daily_summary(user_id, date DESC);
CREATE INDEX idx_question_attempts_user_date ON question_attempts(user_id, date);

-- ================================================
-- 샘플 데이터 입력
-- ================================================

--daily_summary 데이터
-- 오늘: 6문제 시도, 1 Day 완료, 목표 달성
INSERT INTO daily_summary (user_id, date, questions_attempted, days_completed, goal_met) 
VALUES ('user001', CURRENT_DATE, 6, 1, true);
-- 어제: 8문제 시도, 1 Day 완료, 목표 달성
INSERT INTO daily_summary (user_id, date, questions_attempted, days_completed, goal_met) 
VALUES ('user001', CURRENT_DATE - INTERVAL '1 day', 8, 1, true);
-- 2일 전: 5문제 시도, 0 Day 완료, 목표 미달성
INSERT INTO daily_summary (user_id, date, questions_attempted, days_completed, goal_met) 
VALUES ('user001', CURRENT_DATE - INTERVAL '2 days', 5, 0, false);


-- category 데이터
INSERT INTO category (category_id, name, display_name, order_num) VALUES
(1, 'Model Example', '모범 예문', 1),
(2, 'Small Talk', '스몰 토크', 2),
(3, 'Cases in Point', '사례 연구', 3),
(4, 'Today Quiz', '오늘의 퀴즈', 4),
(5, 'Wrong Answer', '틀린문제', 5),
(6, 'Favorites', '즐겨찾기', 6);

-- ================================================
-- Questions 테이블 - MODEL EXAMPLE (Day 1~4)
-- ================================================
-- Day 1 Questions (question_id: 1-13)
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean,english,korean_a,english_a,korean_b,english_b,audio_male,audio_female,audio_male_a,audio_female_a,audio_male_b,audio_female_b,keywords) VALUES
	 (1,1,1,1,'short','재택근무는 저랑 안 맞아요.','Working from home isn''t for me.',NULL,NULL,NULL,NULL,'/audio/day01/q1_male.mp3','/audio/day01/q1_female.mp3',NULL,NULL,NULL,NULL,'{working,home}'),
	 (2,1,1,2,'short','저는 재택근무 체질이 아니예요. 늘 딴짓하게 되거든요.','Working from home isn''t for me. I always get distracted.',NULL,NULL,NULL,NULL,'/audio/day01/q2_male.mp3','/audio/day01/q2_female.mp3',NULL,NULL,NULL,NULL,'{for,distracted}'),
	 (3,1,1,3,'short','소개팅은 저랑 안 맞아요.','Going on a date isn''t for me.',NULL,NULL,NULL,NULL,'/audio/day01/q3_male.mp3','/audio/day01/q3_female.mp3',NULL,NULL,NULL,NULL,'{going,date}'),
	 (4,1,1,4,'short','노트북은 저랑 좀 안 맞아요','Laptops aren''t really for me. Something about the keyboard is super uncomfortable.',NULL,NULL,NULL,NULL,'/audio/day01/q4_male.mp3','/audio/day01/q4_female.mp3',NULL,NULL,NULL,NULL,'{laptops,uncomfortable}'),
	 (5,1,1,5,'short','전기차는 좀 별로예요. 충전소는 요즘 늘었지만, 여전히 엄청 귀찮게 느껴져요.','Electronic cars aren''t for me. We have more charging stations around now, but it still feels like too much of hassle.',NULL,NULL,NULL,NULL,'/audio/day01/q5_male.mp3','/audio/day01/q5_female.mp3',NULL,NULL,NULL,NULL,'{electronic,hassle}'),
	 (6,1,1,6,'short','그 사람 직업이 좋은 건 아는데, 그런 남자는 나는 별로야.','I know he has a decent job, but guys like him aren''t really for me.',NULL,NULL,NULL,NULL,'/audio/day01/q6_male.mp3','/audio/day01/q6_female.mp3',NULL,NULL,NULL,NULL,'{decent,aren''t}'),
	 (7,2,1,7,'dialogue',NULL,NULL,'우리 나가서 맛난 회 먹을까?','Why don''t we go out and get some nice sashimi? My treat!',NULL,NULL,NULL,NULL,'/audio/day01/q1_male_a.mp3','/audio/day01/q1_female_a.mp3',NULL,NULL,'{sashimi,treat}'),
	 (8,2,1,8,'dialogue',NULL,NULL,'너무 고맙긴 한데. 난 회를 별로 안 좋아해. 식감이 적응이 안 돼.','','너무 고맙긴 한데. 난 회를 별로 안 좋아해. 식감이 적응이 안 돼.','It''s kind of you to offer, but raw fish just isn''t for me. I can''t get used to the texture.',NULL,NULL,'/audio/day01/q2_male_b.mp3','/audio/day01/q2_female_b.mp3',NULL,NULL,'{raw,texture}'),
	 (9,2,1,9,'dialogue',NULL,NULL,'청취 연습을 위해 <기묘한 이야기>를 시청할 것을 추천합니다.','I recommend watching Stranger Things to practice listening.',NULL,NULL,NULL,NULL,'/audio/day01/q3_male_a.mp3','/audio/day01/q3_female_a.mp3',NULL,NULL,'{Stranger,listening}'),
	 (10,2,1,10,'dialogue',NULL,NULL,NULL,NULL,'좋은 생각이긴 한데, 저는 미국 프로그램이 체질에 안 맞아요. 스토리에 재미가 안 붙어요.','It''s a good idea, but American shows aren''t for me. I can''t really get into the stories.',NULL,NULL,'/audio/day01/q4_male_b.mp3','/audio/day01/q4_female_b.mp3',NULL,NULL,'{American,stories}'),
	 (11,2,1,11,'dialogue',NULL,NULL,'애들하고 정말 잘 노는군요. 선생님 할 생각은 해보셨나요?','You''re really great around kids. Have you ever thought of being a teacher?',NULL,NULL,NULL,NULL,'/audio/day01/q5_male_a.mp3','/audio/day01/q5_female_a.mp3',NULL,NULL,'{great,teacher}'),
	 (12,2,1,12,'dialogue',NULL,NULL,NULL,NULL,'아니요. 저는 가르치는 거랑 잘 안 맞아요. 애들이랑 노는 건 좋은데, 공부시키는 게 너무 힘들 듯해요.','No, no. Teaching isn''t really for me. I like to play with them but trying to make them study seems like hard work.',NULL,NULL,'/audio/day01/q6_male_b.mp3','/audio/day01/q6_female_b.mp3',NULL,NULL,'{teaching,hard}'),
	 (13,3,1,13,'long','안녕, Greg. 내가 생일 선물로 받은 로잉 머신 기억하지? 혹시 관심있어? 나랑은 별로 안맞더라고.','Hey, Greg. Do you remember that rowing machine I got for my birthday? Are you interested in it? Turns out it''s not really for me.',NULL,NULL,NULL,NULL,'/audio/day01/q1_male.mp3','/audio/day01/q1_female.mp3',NULL,NULL,NULL,NULL,'{rowing,birthday}');

-- Day 2 Questions (question_id: 14-25)
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean,english,korean_a,english_a,korean_b,english_b,audio_male,audio_female,audio_male_a,audio_female_a,audio_male_b,audio_female_b,keywords) VALUES
	 (14,1,2,1,'short','하루빨리 새 집으로 이사 가고 싶어요.','I can''t wait to move into new house.',NULL,NULL,NULL,NULL,'/audio/day02/q1_male.mp3','/audio/day02/q1_female.mp3',NULL,NULL,NULL,NULL,'{can''t,wait}'),
	 (15,1,2,2,'short','다음 에피소드는 어떤 내용인지 궁금해 미치겠어.','I can''t wait to see what the next episode will bring.',NULL,NULL,NULL,NULL,'/audio/day02/q2_male.mp3','/audio/day02/q2_female.mp3',NULL,NULL,NULL,NULL,'{see,episode}'),
	 (16,1,2,3,'short','아내가 제 선물을 개봉할 때 어떤 표정일지 궁금해 죽겠습니다.','I can''t wait to see the look on my wife''s face when she opens my gift.',NULL,NULL,NULL,NULL,'/audio/day02/q3_male.mp3','/audio/day02/q3_female.mp3',NULL,NULL,NULL,NULL,'{look,face}'),
	 (17,1,2,4,'short','이 프로젝트가 빨리 끝났으면 좋겠어요. 너무 오래 걸립니다.','I can''t wait to be done with this project. It''s takes forever.',NULL,NULL,NULL,NULL,'/audio/day02/q4_male.mp3','/audio/day02/q4_female.mp3',NULL,NULL,NULL,NULL,'{done,forever}'),
	 (18,1,2,5,'short','여보, 저녁 식사가 너무 맛있는 냄새가 나네. 어서 먹고 싶어.','That dinner smells delicious, honey. I can''t wait.',NULL,NULL,NULL,NULL,'/audio/day02/q5_male.mp3','/audio/day02/q5_female.mp3',NULL,NULL,NULL,NULL,'{dinner,delicious}'),
	 (19,1,2,6,'short','<베이비 드라이버>가 미국에서는 몇 달 전에 개봉했어. 이곳에서도 어서 개봉했으면 좋겠다.','Baby Driver was released months ago in the United States. I can''t wait for it to come out here.',NULL,NULL,NULL,NULL,'/audio/day02/q6_male.mp3','/audio/day02/q6_female.mp3',NULL,NULL,NULL,NULL,'{released,come}'),
	 (20,2,2,7,'dialogue',NULL,NULL,'그 책 드디어 영화로 만들었다며?','Did you here they finally made that book into a movie?',NULL,NULL,NULL,NULL,'/audio/day02/q1_male_a.mp3','/audio/day02/q1_female_a.mp3',NULL,NULL,'{book,movie}'),
	 (21,2,2,8,'dialogue',NULL,NULL,'','','응! 어서 보고 싶어. 내가 제일 좋아하는 장면들이 다 포함되어 있기를.','Yes! I can''t wait to see it. I hope they included all my favorite scenes.',NULL,NULL,NULL,NULL,'/audio/day02/q2_male_b.mp3','/audio/day02/q2_female_b.mp3','{favorite,scenes}'),
	 (22,2,2,9,'dialogue',NULL,NULL,'프로젝트는 잘 되어 가나요? 한동안 매달려 있으신 것 같던데.','How''s that project going? It seems like you''ve been working on it for a while.',NULL,NULL,NULL,NULL,'/audio/day02/q3_male_a.mp3','/audio/day02/q3_female_a.mp3',NULL,NULL,'{project,working}'),
	 (23,2,2,10,'dialogue',NULL,NULL,NULL,NULL,'네 일주일 내내 이것을 하고 있습니다. 어서 끝내고 뭔가 다른 걸로 넘어가고 싶어요.','Yeah, I''ve been working on it all week. I can''t wait to finish it and finally move on to something else.',NULL,NULL,NULL,NULL,'/audio/day02/q4_male_b.mp3','/audio/day02/q4_female_b.mp3','{working,move}'),
	 (24,2,2,11,'dialogue',NULL,NULL,'네가 뜨개질할 수 있는 걸 몰랐네. 뭐 만들고 있니?','I didn''t know you could knit. What are you making?',NULL,NULL,NULL,NULL,'/audio/day02/q5_male_a.mp3','/audio/day02/q5_female_a.mp3',NULL,NULL,'{knit,making}'),
	 (25,2,2,12,'dialogue',NULL,NULL,NULL,NULL,'여동생에게 줄 스카프를 만들고 있어. 내가 자기 주려고 이걸 만든 걸 알면 어떤 표정일까 궁금해 죽겠어.','I''m making a scarf for my little sister. I can''t wait to see the look on her face when she realizes I made it for her.',NULL,NULL,NULL,NULL,'/audio/day02/q6_male_b.mp3','/audio/day02/q6_female_b.mp3','{scarf,look}');

-- Day 3 Questions (question_id: 27-39)
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean,english,korean_a,english_a,korean_b,english_b,audio_male,audio_female,audio_male_a,audio_female_a,audio_male_b,audio_female_b,keywords) VALUES
	 (27,1,3,1,'short','(사내 발표 상황)죄송한데 조금 짧게 해주시겠어요?','Do you mind keeping it a bit short?',NULL,NULL,NULL,NULL,'/audio/day03/q1_male.mp3','/audio/day03/q1_female.mp3',NULL,NULL,NULL,NULL,'{keeping,short}'),
	 (28,1,3,2,'short','제가 마지막 남은 피자 한 조각 먹어도 될까요?','Do you mind if I finish off the last piece of pizza?',NULL,NULL,NULL,NULL,'/audio/day03/q2_male.mp3','/audio/day03/q2_female.mp3',NULL,NULL,NULL,NULL,'{mind,piece}'),
	 (29,1,3,3,'short','미안한데, 오는 길에 커피 좀 사다 줄 수 있어요?','Do you mind grabbing me some coffee on your way?',NULL,NULL,NULL,NULL,'/audio/day03/q3_male.mp3','/audio/day03/q3_female.mp3',NULL,NULL,NULL,NULL,'{grabbing,way}'),
	 (30,1,3,4,'short','제가 여유 시간이 겨우 5분 있어요. 짧게 해 주실 수 있을까요?','I''ve got only five minutes to spare. Do you mind keeping it short?',NULL,NULL,NULL,NULL,'/audio/day03/q4_male.mp3','/audio/day03/q4_female.mp3',NULL,NULL,NULL,NULL,'{five,spare}'),
	 (31,1,3,5,'short','에어컨을 좀 줄이면 안 될까요? 좀 추워서요.','Do you mind turning down the air-conditioning? I feel a bit cold.',NULL,NULL,NULL,NULL,'/audio/day03/q5_male.mp3','/audio/day03/q5_female.mp3',NULL,NULL,NULL,NULL,'{turning,cold}'),
	 (32,1,3,6,'short','개인적인 질문 하나 해도 될까요?','Do you mind if I ask you personal question?',NULL,NULL,NULL,NULL,'/audio/day03/q6_male.mp3','/audio/day03/q6_female.mp3',NULL,NULL,NULL,NULL,'{ask,question}'),
	 (33,2,3,7,'dialogue',NULL,NULL,'죄송한데, 회의를 금요일로 옮겨도 될까요?','Do you mind if we move the meeting for Friday?',NULL,NULL,NULL,NULL,'/audio/day03/q1_male_a.mp3','/audio/day03/q1_female_a.mp3',NULL,NULL,'{move,Friday}'),
	 (34,2,3,8,'dialogue',NULL,NULL,NULL,NULL,'네, 괜찮습니다. 사실 저희에겐 금요일이 더 좋아요.','Sure, Friday works better for us, actually.',NULL,NULL,NULL,NULL,'/audio/day03/q2_male_b.mp3','/audio/day03/q2_female_b.mp3','{works,better}'),
	 (35,2,3,9,'dialogue',NULL,NULL,'죄송한데, 꼭대기 선반에 있는 저 시리얼 상자들 중 하나를 내려 줄 수 있을까요?','Excuse me, do you mind grabbing me one of those cereal boxes on the top shelf?',NULL,NULL,NULL,NULL,'/audio/day03/q3_male_a.mp3','/audio/day03/q3_female_a.mp3',NULL,NULL,'{grabbing,shelf}'),
	 (36,2,3,10,'dialogue',NULL,NULL,NULL,NULL,'당연하죠. 얼마든지요!','Sure, Always happy to help!',NULL,NULL,NULL,NULL,'/audio/day03/q4_male_b.mp3','/audio/day03/q4_female_b.mp3','{happy,help}'),
	 (37,2,3,11,'dialogue',NULL,NULL,'어디서 만나면 될까요?','Where would you like to meet?',NULL,NULL,NULL,NULL,'/audio/day03/q5_male_a.mp3','/audio/day03/q5_female_a.mp3',NULL,NULL,'{where,meet}'),
	 (38,2,3,12,'dialogue',NULL,NULL,NULL,NULL,'제가 그쪽 사무실로 가도 상관없습니다.','I don''t mind coming over to your office.',NULL,NULL,NULL,NULL,'/audio/day03/q6_male_b.mp3','/audio/day03/q6_female_b.mp3','{coming,office}'),
	 (39,3,3,13,'long','안녕하세요, Smith씨,
저는 항상 화요일 오후 2시 콘퍼런스 콜이 기다려집니다. 그런데, 이번 주에는 유감스럽게도 1시 반에 다른 회의가 잡혀 있고 (2시에 맞춰) 저때 끝날지 확실하지 않습니다. 괜찮으시면 혹시 모르니까 이번에는 2시 30분에 시작해도 될까요?','Good afternoon, Mr. Smith,
I always look forward to our 2 p.m. Tuesday conference call. However, this week, I''m afraid I have another meeting scheduled for 1:30, and I''m not sure if it will be over in time. If you don''t mind, could we start at 2:30 this time, just to be safe?',NULL,NULL,NULL,NULL,'/audio/day03/q1_male.mp3','/audio/day03/q1_female.mp3',NULL,NULL,NULL,NULL,'{scheduled,safe}');

-- Day 4 Questions (question_id: 40-52)
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean,english,korean_a,english_a,korean_b,english_b,audio_male,audio_female,audio_male_a,audio_female_a,audio_male_b,audio_female_b,keywords) VALUES
	 (40,1,4,1,'short','물가가 올라도 너무 올라요.','Everything is getting super expensive.',NULL,NULL,NULL,NULL,'/audio/day04/q1_male.mp3','/audio/day04/q1_female.mp3',NULL,NULL,NULL,NULL,'{getting,expensive}'),
	 (41,1,4,2,'short','그 여자분 키 엄청 커요.','She is super tall.',NULL,NULL,NULL,NULL,'/audio/day04/q2_male.mp3','/audio/day04/q2_female.mp3',NULL,NULL,NULL,NULL,'{super,tall}'),
	 (42,1,4,3,'short','그 사람이 무지 바쁘거나, 아니면 저에 대한 관심이 식고 있는 거겠죠.','I''ve been super busy, or he is losing interest in me.',NULL,NULL,NULL,NULL,'/audio/day04/q3_male.mp3','/audio/day04/q3_female.mp3',NULL,NULL,NULL,NULL,'{super,interest}'),
	 (43,1,4,4,'short','제가 요즘 이사 준비 때문에 엄청 바빴어요.','I''ve been super busy with my upcoming move.',NULL,NULL,NULL,NULL,'/audio/day04/q4_male.mp3','/audio/day04/q4_female.mp3',NULL,NULL,NULL,NULL,'{super,upcoming}'),
	 (44,1,4,5,'short','우와. 연세 있으신 분치고는 몸매가 너무 좋으시네요.','Wow. You''re in super good shape for an old guy.',NULL,NULL,NULL,NULL,'/audio/day04/q5_male.mp3','/audio/day04/q5_female.mp3',NULL,NULL,NULL,NULL,'{super,shape}'),
	 (45,1,4,6,'short','제가 지난 20년간 시간을 들여 만든 회사 웹사이트가 새랑 아무 느낌이네요. 지금 엄청 창피해요.','The company website I spent like 20 years building looks super janky compared to this new one. I''m super embarrassed now.',NULL,NULL,NULL,NULL,'/audio/day04/q6_male.mp3','/audio/day04/q6_female.mp3',NULL,NULL,NULL,NULL,'{janky,embarrassed}'),
	 (46,2,4,7,'dialogue',NULL,NULL,'무슨 점심값이 만 원이 넘는 거야.','I never thought I''d have to pay over 10,000 won for lunch.',NULL,NULL,NULL,NULL,'/audio/day04/q1_male_a.mp3','/audio/day04/q1_female_a.mp3',NULL,NULL,'{pay,lunch}'),
	 (47,2,4,8,'dialogue',NULL,NULL,NULL,NULL,'그러게 요새 물가가 너무너무 비싸.','Yeah. Everything is getting super expensive.',NULL,NULL,NULL,NULL,'/audio/day04/q2_male_b.mp3','/audio/day04/q2_female_b.mp3','{getting,expensive}'),
	 (48,2,4,9,'dialogue',NULL,NULL,'제주도에서 선물 사 갈까?','Want me to get you a souvenir from Jeju?',NULL,NULL,NULL,NULL,'/audio/day04/q3_male_a.mp3','/audio/day04/q3_female_a.mp3',NULL,NULL,'{souvenir,Jeju}'),
	 (49,2,4,10,'dialogue',NULL,NULL,NULL,NULL,'오! 그럼 귤 한 박스 사다 줄래? 지금 제철이니 엄청 쌀 거야.','Oh! How about a box of tangerines? They should be super cheap since they''re in season.',NULL,NULL,NULL,NULL,'/audio/day04/q4_male_b.mp3','/audio/day04/q4_female_b.mp3','{tangerines,season}'),
	 (50,2,4,11,'dialogue',NULL,NULL,'11월 말치고는 너무 따뜻하다. 지금쯤이면 보통은 훨씬 더 추운데.','It''s unusually warm for late November. It''s usually much colder by now.',NULL,NULL,NULL,NULL,'/audio/day04/q5_male_a.mp3','/audio/day04/q5_female_a.mp3',NULL,NULL,'{November,colder}'),
	 (51,2,4,12,'dialogue',NULL,NULL,NULL,NULL,'맞아. 가을이 점점 짧아지고는 있는데 올해는 엄청 길다','Right. Autumn has been getting shorter, but this year, it''s been super long.',NULL,NULL,NULL,NULL,'/audio/day04/q6_male_b.mp3','/audio/day04/q6_female_b.mp3','{Autumn,shorter}'),
	 (52,3,4,13,'long','저는 보통은 설명서대로 잘 못하는데, 이번 침대 프레임 조립은 정말 쉽더군요. 조립하는 데 한 시간도 안 걸렸습니다. 동봉된 육각 렌치 이외엔 별도의 도구도 필요 없었어요. 튼튼해 보이기까지 합니다. 이케아 가구가 좀 약하다는 평이 있는데, 이번 침대 프레임 보고는 많이 놀랐습니다.','I''m normally really bad at following instructions, but this bed frame was super easy to put together. It took me less than an hour. I didn''t need any extra tools, besides the included hex key. It looks sturdy too. The furniture from IKEA has a reputation for breaking easily, but this bed frame surprised me.',NULL,NULL,NULL,NULL,'/audio/day04/q1_male.mp3','/audio/day04/q1_female.mp3',NULL,NULL,NULL,NULL,'{frame,reputation}');

-- 단문
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean,english) VALUES
 	(53,1,5,1,'short','중고차 같은 중고 물품 사는 거 어떻게 생각하세요?','How do you feel about buying something second-hand, like a used car?'),
 	(54,1,5,2,'short','중매업체에 등록해 보는 게 어때요?','How do you feel about signing up for a matchmaking service?'),
	(55,1,5,3,'short','교회에 가 보는 게 어때요?','How do you feel about going to church?'),
	(56,1,5,4,'short','등산 모임에 가입해 보는 게 어때요?','How do you feel about joining a hiking club?'),
	(57,1,5,5,'short','성형수술 하는 거 어떻게 생각하세요?','How do you feel about plastic surgery?');
-- 대화문
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_a,english_a) VALUES	
	 (58,2,5,6,'dialogue','코치가 전 동료였는데, 그런 팀에 합류하는 기분이 어떠신가요?','How do you feel about joining a team when the coach is your ex-teammate?');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_b,english_b) VALUES	
	 (59,2,5,7,'dialogue','전혀 문제없습니다. 좋은 코치가 될 자질을 갖춘 분이라 믿어 의심하지 않습니다.','I don''t mind at all. I totally believe he has what it takes to be a good coach.');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_a,english_a) VALUES	
	 (60,2,5,8,'dialogue','저녁 먹고 우리 집에 가서 <컨저링> 볼까 하는데. 공포 영화 어때?','After dinner, I was thinking we could go to my place and watch The Conjuring. How do you feel about horror movies?');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_b,english_b) VALUES	
	 (61,2,5,9,'dialogue','싫어, 공포 영화는 못 보겠어. 무서운 거 보는 게 뭐가 재밌다고.','No, I can''t stand horror movies! Watching something scary isn''t my idea of fun.');
-- 장문
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean,english) VALUES
 	(63,3,5,10,'long','Greg Cho님께\n 안녕하세요. 회계팀 Harold입니다. 그쪽 팀장님인 Frank가 제게 연락해서 자기네 팀으로 오면 어떨까 하는 제안을 하더군요. Frank 팀장님 밑에서 일하니까 어떤가요? 그 팀으로의 이동 제안을 진지하게 고민해보기 전에 우선 당신의 경험을 듣고 싶습니다.','Dear Greg Cho\n This is Harold over in Accounting. I''m writing because your manager, Frank, contacted me and asked me to move to your team. How do you feel about working under Frank? I want to hear about your experience before I really consider his transfer offer.');

-- 단문
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean,english) VALUES
 	(64,1,6,1,'short','재충전에는 캠핑만 한 게 없죠.','There is nothing like camping to recharge your batteries.'),
 	(65,1,6,2,'short','안 좋았던 한 주를 날려 버리려면 친구들과 맛있는 식사를 하는 게 최고지.','There''s nothing like a nice meal with friends to turn a bad week around.'),
	(66,1,6,3,'short','주말 내내 넷플릭스 드라마 보는 게 최고야.','There''s nothing like binging a show on Netflix all weekend.'),
	(67,1,6,4,'short','크리스마스에는 칠면조 저녁 식사와 풍미 좋은 와인만 한 게 없지.','There is nothing like a turkey dinner and spiced wine for Christmas.'),
	(68,1,6,5,'short','다시 콘서트에 갈 수 있어서 너무 좋아. 가장 좋아하는 밴드의 라이브 공연을 보는 것만큼 좋은 것은 없지.','I''m so glad we can go to concerts again. There''s nothing like seeing your favorite band live.'),
	(69,1,6,6,'short','팬케이크에는 진짜 메이플 시럽을 얹어 먹어야 제맛이야.','There''s nothing like real maple syrup on pancakes.');
-- 대화문
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_a,english_a) VALUES	
	 (70,2,6,7,'dialogue','회사에서 힘든 하루를 보내고 나면 시원한 맥주가 최고지. 퇴근하고 한잔 하러 갈래?','There''s nothing like a cold beer after a long day of work. How about we go grab one when we get off?');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_b,english_b) VALUES	
	 (71,2,6,8,'dialogue','좋지! 네가 산다면.','Sure! As long as you''re buying.');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_a,english_a) VALUES	
	 (72,2,6,9,'dialogue','내가 좀 지쳐 보인다면 미안. 남자친구랑 잠시 안 보기로 했거든. 근데 정말 보고 싶어.','Sorry if I seem a little depressed. My boyfriend and I decided to take a little break. I really miss him.');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_b,english_b) VALUES	
	 (73,2,6,10,'dialogue','아, 그랬구나. 그럼 쇼핑하러 가자. 내가 널 알잖아. 기분 전환에는 옷 사는 게 최고야.','Aww, I''m sorry. Come on, let''s go shopping. I know you. There''s nothing like buying clothes to cheer you up.');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_a,english_a) VALUES	
	 (74,2,6,11,'dialogue','어서 집에 가고 싶어. 남편이 특별한 음식을 해 준다고 했거든.','I can''t wait to get home. My husband said he would cook something special for me.');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_b,english_b) VALUES	
	 (75,2,6,12,'dialogue','오, 멋지다! 힘든 하루를 보낸 후에는 기운을 차리는 데 집밥만 한 게 없지.','Oh, that''s perfect then! There''s nothing like a home-cooked meal to lift your spirits after a long day.');
-- 장문
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean,english) VALUES
 	(76,3,6,13,'long','바디프랜드 매장에 오셔서 새로 출시된 프로마사지 X7 의자를 체험해 보세요. 일주일에 세 번 전문 마사지사를 집에 부른다고 해도 저희 의자로 받는 안마가 최고라는 점을 인정할 수밖에 없을 겁니다.','Come to a Bodyfriend store and try out our new line of Pro Massage X7 chairs. Even if you have a professional masseur come to your house three times a week, you''ll have to admit there''s nothing like a massage from one of our chairs.');
 	
-- 단문
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean,english) VALUES
 	(77,1,7,1,'short','너무 매운 것만 아니면 뭐든 다 좋아요.','I''m up for anything, as long as it''s not too spicy.'),
 	(78,1,7,2,'short','미슐랭 스타를 받은 음식이라면 뭐든 좋아.','I''m up for anything with a Michelin star.'),
	(79,1,7,3,'short','뭐 하고 싶어? 난 뭐든 다 좋아.','What do you feel like doing? I''d be up for just about anything.'),
	(80,1,7,4,'short','나 비어퐁 파트너 찾고 있는데. 관심 있어?','I''m looking for a beer pong partner. Are you down?'),
	(81,1,7,5,'short','나 프라이드 치킨이 무지 먹고 싶어. 오늘 밤에 같이 먹을 사람?','I''ve been craving fried chicken. Is anyone down for some tonight?'),
	(82,1,7,6,'short','토요일 아침에 북한산 등산 갈까 하는데 같이 갈 사람이 필요해. 관심 있을까?','I was thinking of hiking Bukhan Mountain on Saturday morning, and I need a buddy.');
-- 대화문
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_a,english_a) VALUES
	(83,2,7,7,'dialogue','오늘 저녁에 뭐 먹고 싶어?','What do you want to have tonight?');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_b,english_b) VALUES
	(84,2,7,8,'dialogue','뭐라도 좋아. 너무 매운 것만 아니면.','I am up for anything, as long as it''s not too spicy.');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_a,english_a) VALUES
	(85,2,7,9,'dialogue','안녕 애들아, 나랑 고든 램지 버거 먹으러 갈 사람 있을까?','Hey guys, anyone want to go with me to try Gordon Ramsay''s burger place?');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_b,english_b) VALUES
	(86,2,7,10,'dialogue','나 갈게! 네가 산다면 말이야.','I''m down as long as you''re paying.');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_a,english_a) VALUES
	(87,2,7,11,'dialogue','얘들아, 오늘 밤에 애들 집에 불러서 게임할까 하는데 같이 할 사람?','Guys, I was thinking about having people over for a game night. Who''s in?');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_b,english_b) VALUES
	(88,2,7,12,'dialogue','음, 이따가 약속이 있긴 한데, 얼굴 정도는 비출 수 있어.','Well, I have plans later, but I am down to stop by at least to say hello.');
-- 장문
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean,english) VALUES
 	(89,3,7,13,'long','일생일대의 모험을 즐기고 싶으신가요? 에베레스트 등반을 원하신다면 네팔 어드밴처를 선택해 주세요. 이번 한 달 동안만 신규 고객을 위한 특별 행사가 준비되어 있습니다. 선착순 50인은 무료로 여행 보험에 가입할 수 있습니다. 다른 고객이 채 가기 전에 지금 예약하세요.','Are you down for the adventure of a lifetime? Choose Nepal Adventures for your Everest climb. We have a special offer for new customers available only this month. The first fifty hikers who sign up will receive free travel insurance. Act now, before someone else takes your spot.');
	
 -- 단문
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean,english) VALUES
 	(90,1,8,1,'short','오늘 몸이 좀 안 좋아요.','I don''t feel quite right today.'),
 	(91,1,8,2,'short','나도 가고는 싶은데, 오늘 몸이 좀 안 좋아.','I wish I could come, but I don''t feel quite right today.'),
	(92,1,8,3,'short','저녁을 같이 못할 것 같습니다. 오늘 몸이 좀 안 좋네요.','I''m afraid I can''t join you for dinner. I don''t feel quite right today.'),
	(93,1,8,4,'short','여보, 나 오늘은 몸이 좀 안 좋아. 수진이 학교에서 좀 데려와 줄래?','Honey, I don''t feel quite right today. Can you pick up Sujin from school?'),
	(94,1,8,5,'short','오늘은 저녁 안 먹을래. 오늘 속이 좀 안 좋아서.','I think I''ll skip dinner. My stomach doesn''t feel quite right today.'),
	(95,1,8,6,'short','너희 딸 파티에 나는 안 가는 게 좋을 것 같아. 오늘 몸이 좀 안 좋네.','I don''t think it''s a good idea for me to come to your daughter''s party. I don''t feel quite right today.');
-- 대화문
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_a,english_a) VALUES	
	 (96,2,8,7,'dialogue','뭔지는 모르겠는데, 오늘 몸이 좀 안 좋아.','I''m not sure what it is, but I don''t feel quite right today.');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_b,english_b) VALUES	
	 (97,2,8,8,'dialogue','아침에 먹는 국에 문제가 있었을지도. 좀 심한 냄새가 났거든.','Maybe there was something wrong with that soup you had for breakfast. It smelled a little funny.');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_a,english_a) VALUES	
	 (98,2,8,9,'dialogue','Sam, 우리 점심 약속 유효한 거지?','Sam, are you still able to meet for lunch?');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_b,english_b) VALUES	
	 (99,2,8,10,'dialogue','미안해, 사실 오늘 몸이 좀 안 좋아. 집에 있어야 할 것 같아. 다음에 먹어도 될까?','Sorry, actually I don''t feel quite right today. I think I need to');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_a,english_a) VALUES	
	 (100,2,8,11,'dialogue','오늘 밤에 우리 밖에 나가 놀기로 한 건 아는데, 오늘 뭔가 몸이 좀 이상해.','I know we''re supposed to go out tonight, but I don''t feel quite right today.');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_b,english_b) VALUES	
	 (101,2,8,12,'dialogue','이런, 괜찮은 거야? 그냥 음식 포장해 와서 집에서 영화 보면서 쉬는 건 어때?','Oh, no. Are you okay? How about we get takeout and rest at home with a movie instead?');
-- 장문
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean,english) VALUES
 	(102,3,8,13,'long','안녕하세요, Brian. 샌프란시스코 사무실은 요즘 어때요? 지난주에 코로나 걸렸다고 들었는데, 안부 확인차 연락드렸어요. 사실 저도 어제 몸이 안 좋아서 검사를 했는데 다행히 음성으로 나왔습니다.','Hi, Brian. How are things going over there in the San Francisco office? I heard that you caught COVID last week, and so I wanted to check in and ask how you''re doing. Actually, I wasn''t feeling quite right myself yesterday. I got tested and thankfully, it turned out negative.');

 -- 단문
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean,english) VALUES
 	(103,1,9,1,'short','저 지금 스타벅스인데 커피 사다 드릴까요?','Would you like me to grab you some coffee while I''m at Starbucks?'),
 	(104,1,9,2,'short','제가 첫 번째 문장을 읽을까요?','Would you like me to read the first sentence?'),
	(105,1,9,3,'short','제가 일어난 김에 물 좀 가져다드릴까요?','Would you like me to get you some water while I''m up?'),
	(106,1,9,4,'short','수정본 보내드릴까요?','Would you like me to send you the reviced version?'),
	(107,1,9,5,'short','내가 따라가 줄까?','Do you want me to come along with you?'),
	(108,1,9,6,'short','내가 너희 둘 자리 마련해 줄까?','Do you want me to set you two up on a date?');
-- 대화문
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_a,english_a) VALUES	
	 (109,2,9,7,'dialogue','지금 역에서 걸어가고 있는데요. 커피 사다 드릴까요?','I''m walking from the station. Would you like me to pick up any coffee?');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_b,english_b) VALUES	
	 (110,2,9,8,'dialogue','좋습니다. 고마워요.','That would be great. Thanks!');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_a,english_a) VALUES	
	 (111,2,9,9,'dialogue','아직 다 하지는 못했는데, 지금까지 작업한 거 보내 드릴까요?.','I''m not done yet, but would you like me to send you what I have so far?');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_b,english_b) VALUES	
	 (112,2,9,10,'dialogue','고마워요. 그러면 언제까지 완성할 수 있을 것 같아요?','Thanks. So, when do you think you will be able to complete the materials?');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_a,english_a) VALUES	
	 (113,2,9,11,'dialogue','방금 인천에 도착했어요! 그나저나 면세점에 들를까 하는데요. 아빠랑 엄마 뭐 사다 드릴까요?','I just landed at Incheon! By the way, I think I''ll go by a duty-free shop. Do you want me to get you or Mom anything?');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_b,english_b) VALUES	
	 (114,2,9,12,'dialogue','말만이라도 고맙다, 내 딸.','Thanks for offering, Sweetie.');
--장문
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean,english) VALUES
 	(115,3,9,13,'long','안녕하세요. 다름이 아니라 저희 수요일에 회의하는 거 맞는지 확인차 연락드립니다. 그리고 용산 본사에 회의실 잡을까요? (잠시 후) 근데 보니까 본사 회의실은 예약이 꽉 찼네요. 장소를 변경하든지, 날짜를 바꾸든지 해야 할 것 같습니다.','I just wanted to make sure the meeting is still on for Wed. And would you like me to arrange a room at the headquaters in Youngsan? (pause) I just found out that headquaters is all booked up. We''ll have to change something, either the location or date.');
 	
 -- 단문
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean,english) VALUES
 	(116,1,10,1,'short','가격대는 어느 정도 생각하세요?','What price range do you have in mind?'),
 	(117,1,10,2,'short','주연 배우로 생각하고 있는 분 있으신지요?','Do you have any actor in mind for the lead role?'),
	(118,1,10,3,'short','괜찮은 소고깃집 생각해 둔 데 있어?','Do you have any good beef place in mind?'),
	(119,1,10,4,'short','딱히 염두해 둔 차는 없습니다. 상태만 좋으면 뭐라도 사겠습니다.','I don''t really have any car in mind. I will go with pretty much anything as long as it''s in good shape.'),
	(120,1,10,5,'short','틀별히 염두해 둔 건 없습니다.','I have nothing particular in mind.'),
	(121,1,10,6,'short','다른 안이 없으시면 제가 제안을 하고 싶습니다.','I''d like to make a suggestionm, unless you have something in mind.');
-- 대화문
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_a,english_a) VALUES	
	 (122,2,10,7,'dialogue','가격대는 어느 정도 생각하세요?','What price range do you have in mind?');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_b,english_b) VALUES	
	 (123,2,10,8,'dialogue','십만 원 미만이면 다 괜찮아요.','Anything under 100,000 won would be fine.');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_a,english_a) VALUES	
	 (124,2,10,9,'dialogue','포르쉐를 받으려면 2년을 기다리셔야 합니다. 그것도 보증금으로 오백만 원을 걸 때 이야기고요.','You will have to wait two years to get a Porsche. And that''s only if you put down five million won as a deposit.');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_b,english_b) VALUES	
	 (125,2,10,10,'dialogue','그건 문제가 되지 않아요. 전 포르쉐 외에는 살 생각이 없거든요.','It really doesn''t matter. A Porsche is the only car I have in mind.');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_a,english_a) VALUES	
	 (126,2,10,11,'dialogue','올해 여름휴가는 어디로 가고 싶어?','Where do you want to go for our summer vacation this year?');
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean_b,english_b) VALUES	
	 (127,2,10,12,'dialogue','몇 군데 생각하고 있는 곳이 있는데, 장시간 비행기 타고 괜찮아?','I have a few places in mind. Are you okey taking a long flight?');
--장문
INSERT INTO public.questions (question_id,category_id,"day",question_number,question_type,korean,english) VALUES
 	(128,3,10,13,'long','워크숍 장소로 다음 두 곳을 생각하고 있습니다. 하지만 더 나은 곳이 있으면 알려 주십시오. 꼭 고려해 보겠습니다. 그나저나 조 인사팀장이 기조연설을 못 하게 되었다면서요. 팀 내네서 대신할 분 누구 염두해두고 계신가요?','We have the following two places in mind as possible sites for the workshop. However, if you have any suggestions for places that would be more suitable, please let me know. We''ll definitely take them into consideration. By the way, I heard that your HR manager, Ms. Cho is no longer available to deliver the keynote speech. Does your team have anyone in mind to replace her?');
 	

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

-- ================================================
-- 샘플 틀린 문제 데이터
-- ================================================
-- user001이 question_id 1번을 3번 틀림 (정답보기 3번)
INSERT INTO wrong_answers (user_id, question_id, added_at, wrong_count, last_viewed_at) 
VALUES ('naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc', 12, CURRENT_TIMESTAMP - INTERVAL '5 days', 3, CURRENT_TIMESTAMP - INTERVAL '1 day');

-- user001이 question_id 5번을 1번 틀림 (정답보기 1번)
INSERT INTO wrong_answers (user_id, question_id, added_at, wrong_count, last_viewed_at) 
VALUES ('naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc', 14, CURRENT_TIMESTAMP - INTERVAL '3 days', 1, CURRENT_TIMESTAMP - INTERVAL '3 days');

-- user001이 question_id 12번을 2번 틀림 (정답보기 2번)
INSERT INTO wrong_answers (user_id, question_id, added_at, wrong_count, last_viewed_at) 
VALUES ('naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc', 16, CURRENT_TIMESTAMP - INTERVAL '4 days', 2, CURRENT_TIMESTAMP - INTERVAL '2 days');

-- user001이 question_id 27번을 1번 틀림 (최근)
INSERT INTO wrong_answers (user_id, question_id, added_at, wrong_count, last_viewed_at) 
VALUES ('naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc', 18, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP);

-- user001이 question_id 40번을 4번 틀림 (자주 틀리는 문제)
INSERT INTO wrong_answers (user_id, question_id, added_at, wrong_count, last_viewed_at) 
VALUES ('naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc', 20, CURRENT_TIMESTAMP - INTERVAL '7 days', 4, CURRENT_TIMESTAMP - INTERVAL '1 day');

-- ================================================
-- 샘플 즐겨찾기 데이터
-- ================================================
INSERT INTO favorites (user_id, question_id) VALUES
('user001', 1),
('user001', 2);

-- ================================================
-- 샘플 복습 큐 데이터 (Day 번호 기반)
-- ================================================
INSERT INTO review_queue (user_id, day, interval_days, scheduled_for) VALUES
('user001', 1, 1, NOW() + INTERVAL '1 day'),
('user001', 2, 3, NOW() + INTERVAL '3 days'),
('user002', 1, 1, NOW() + INTERVAL '1 day');

-- ================================================
-- 데이터 확인 쿼리
-- ================================================
SELECT 'Session:' as table_name, COUNT(*) as count FROM session
UNION ALL
SELECT 'Users:', COUNT(*) FROM users
UNION ALL
SELECT 'Category:', COUNT(*) FROM category
UNION ALL
SELECT 'Questions:', COUNT(*) FROM questions
UNION ALL
SELECT 'User Progress:', COUNT(*) FROM user_progress
UNION ALL
SELECT 'Wrong Answers:', COUNT(*) FROM wrong_answers
UNION ALL
SELECT 'Favorites:', COUNT(*) FROM favorites
UNION ALL
SELECT 'Review Queue:', COUNT(*) FROM review_queue
UNION ALL
SELECT 'Daily Summary:', COUNT(*) FROM daily_summary
UNION ALL
SELECT 'Question Attempts:', COUNT(*) FROM question_attempts;
