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
DROP TABLE IF EXISTS category CASCADE;
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
    level INTEGER DEFAULT 1,
    
    -- PostgreSQL 배열 타입
    weekly_attendance INTEGER[] DEFAULT ARRAY[0,0,0,0,0,0,0]  -- 주간 출석 [월,화,수,목,금,토,일]
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
    audio_male VARCHAR(500),
    audio_female VARCHAR(500),
    audio_male_a VARCHAR(500),
    audio_female_a VARCHAR(500),
    audio_male_b VARCHAR(500),
    audio_female_b VARCHAR(500),

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
-- 7. DAILY_PROGRESS 테이블
-- 목적: 일일 학습 진행 추적
-- ================================================
CREATE TABLE daily_progress (
    user_id VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    days_completed INTEGER DEFAULT 0,  -- 오늘 완료한 Day 수
    goal_met BOOLEAN DEFAULT false,    -- 일일 목표 달성 여부
    
    PRIMARY KEY (user_id, date)
);

-- ================================================
-- 8. FAVORITES 테이블
-- 목적: 즐겨찾기 문제 관리 (❤️)
-- ================================================
CREATE TABLE favorites (
    user_id VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(question_id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, question_id)
);

-- ================================================
-- 9. WRONG_ANSWERS 테이블
-- 목적: 틀린 문제 관리 (⭐)
-- ================================================
CREATE TABLE wrong_answers (
    user_id VARCHAR(255) REFERENCES users(uid) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(question_id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, question_id)
);

-- ================================================
-- 인덱스 생성
-- 자주 사용되는 쿼리 최적화
-- ================================================
CREATE INDEX idx_questions_category_day ON questions(category_id, day, question_number);
CREATE INDEX idx_user_progress_user ON user_progress(user_id, category_id);
CREATE INDEX idx_review_queue_user_scheduled ON review_queue(user_id, scheduled_for);
CREATE INDEX idx_daily_progress_user_date ON daily_progress(user_id, date);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_wrong_answers_user ON wrong_answers(user_id);

-- ================================================
-- 샘플 데이터 입력
-- ================================================

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
INSERT INTO user_progress (user_id, category_id, last_studied_day, last_studied_question_id) VALUES
('google_116458393760270019201', 1, 1, 1), 
('google_116458393760270019201', 2, 1, 1),
('google_116458393760270019201', 3, 1, 1),
('google_116458393760270019201', 4, 3, 1),
('google_116458393760270019201', 5, 3, 2),
('user001', 1, 3, 1),   
('user001', 2, 1, 1),
('user001', 3, 1, 1); 


-- ================================================
-- 샘플 틀린 문제 데이터
-- ================================================
INSERT INTO wrong_answers (user_id, question_id) VALUES
('user003', 1),
('user003', 2);

-- ================================================
-- 샘플 즐겨찾기 데이터
-- ================================================
INSERT INTO favorites (user_id, question_id) VALUES
('user001', 1),
('user001', 2);

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
SELECT 'Daily Progress:', COUNT(*) FROM daily_progress
UNION ALL
SELECT 'Review Queue:', COUNT(*) FROM review_queue;
