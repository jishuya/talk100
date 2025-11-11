--
-- PostgreSQL database dump
--

\restrict OiUjMU8CAXC7kmTdQlTy5hPoYfeeBw3RrxnEMPSpjJ8kaaAf49DGbTEOiaeDts8

-- Dumped from database version 14.19 (Ubuntu 14.19-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.19 (Ubuntu 14.19-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: set_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
	BEGIN
		NEW.updated_at = NOW();
		RETURN NEW;
	END;
	$$;


ALTER FUNCTION public.set_timestamp() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- Name: update_user_streak_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_user_streak_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_user_streak_timestamp() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category (
    category_id integer NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(100),
    order_num integer DEFAULT 0,
    is_active boolean DEFAULT true
);


ALTER TABLE public.category OWNER TO postgres;

--
-- Name: daily_summary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_summary (
    summary_id integer NOT NULL,
    user_id character varying(255),
    date date DEFAULT CURRENT_DATE NOT NULL,
    questions_attempted integer DEFAULT 0,
    days_completed integer DEFAULT 0,
    goal_met boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.daily_summary OWNER TO postgres;

--
-- Name: daily_summary_summary_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.daily_summary_summary_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.daily_summary_summary_id_seq OWNER TO postgres;

--
-- Name: daily_summary_summary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.daily_summary_summary_id_seq OWNED BY public.daily_summary.summary_id;


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favorites (
    user_id character varying(255) NOT NULL,
    question_id integer NOT NULL,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.favorites OWNER TO postgres;

--
-- Name: question_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_attempts (
    user_id character varying(255) NOT NULL,
    question_id integer NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    attempted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.question_attempts OWNER TO postgres;

--
-- Name: TABLE question_attempts; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.question_attempts IS '사용자별 문제 시도 기록 (정답 여부 무관)';


--
-- Name: COLUMN question_attempts.attempted_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.question_attempts.attempted_at IS '시도 시각 (학습 패턴 분석용 - 몇 시에 주로 학습하는지)';


--
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.questions (
    question_id integer NOT NULL,
    category_id integer,
    day integer NOT NULL,
    question_number integer NOT NULL,
    question_type character varying(20),
    korean text,
    english text,
    korean_a text,
    english_a text,
    korean_b text,
    english_b text,
    keywords text[],
    audio character varying(500),
    audio_us_male character varying(500),
    audio_us_female character varying(500),
    audio_uk_male character varying(500),
    audio_uk_female character varying(500),
    CONSTRAINT questions_question_type_check CHECK (((question_type)::text = ANY ((ARRAY['short'::character varying, 'dialogue'::character varying, 'long'::character varying])::text[])))
);


ALTER TABLE public.questions OWNER TO postgres;

--
-- Name: COLUMN questions.audio_us_male; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.questions.audio_us_male IS '미국 남성 음성 파일 경로/URL';


--
-- Name: COLUMN questions.audio_us_female; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.questions.audio_us_female IS '미국 여성 음성 파일 경로/URL';


--
-- Name: COLUMN questions.audio_uk_male; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.questions.audio_uk_male IS '영국 남성 음성 파일 경로/URL';


--
-- Name: COLUMN questions.audio_uk_female; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.questions.audio_uk_female IS '영국 여성 음성 파일 경로/URL';


--
-- Name: review_queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_queue (
    queue_id integer NOT NULL,
    user_id character varying(255),
    source_day integer NOT NULL,
    interval_days integer DEFAULT 1,
    scheduled_for timestamp without time zone,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_reviewed timestamp without time zone,
    review_count integer DEFAULT 0
);


ALTER TABLE public.review_queue OWNER TO postgres;

--
-- Name: COLUMN review_queue.user_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.review_queue.user_id IS '이 복습 항목의 소유자';


--
-- Name: COLUMN review_queue.source_day; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.review_queue.source_day IS '복습할 Day 번호';


--
-- Name: COLUMN review_queue.interval_days; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.review_queue.interval_days IS '현재 복습 간격';


--
-- Name: COLUMN review_queue.scheduled_for; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.review_queue.scheduled_for IS '다음 복습 예정 날짜/시간';


--
-- Name: COLUMN review_queue.added_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.review_queue.added_at IS 'review queue에 처음 추가된 시간';


--
-- Name: COLUMN review_queue.last_reviewed; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.review_queue.last_reviewed IS '마지막으로 복습한 시간';


--
-- Name: COLUMN review_queue.review_count; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.review_queue.review_count IS '몇 번 복습했는지 카운트';


--
-- Name: review_queue_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.review_queue_queue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.review_queue_queue_id_seq OWNER TO postgres;

--
-- Name: review_queue_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.review_queue_queue_id_seq OWNED BY public.review_queue.queue_id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: user_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_progress (
    progress_id integer NOT NULL,
    user_id character varying(255),
    category_id integer,
    last_studied_day integer DEFAULT 1,
    last_studied_question_id integer,
    last_studied_timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    solved_count integer DEFAULT 0
);


ALTER TABLE public.user_progress OWNER TO postgres;

--
-- Name: user_progress_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_progress_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_progress_progress_id_seq OWNER TO postgres;

--
-- Name: user_progress_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_progress_progress_id_seq OWNED BY public.user_progress.progress_id;


--
-- Name: user_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_settings (
    user_id character varying(255) NOT NULL,
    notifications_enabled boolean DEFAULT true,
    notification_time time without time zone DEFAULT '20:00:00'::time without time zone,
    autoplay_enabled boolean DEFAULT false,
    voice_speed numeric(3,2) DEFAULT 1.0,
    voice_gender character varying(10) DEFAULT 'male'::character varying,
    theme character varying(20) DEFAULT 'light'::character varying,
    font_size character varying(20) DEFAULT 'medium'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_settings OWNER TO postgres;

--
-- Name: user_streak; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_streak (
    user_id character varying(255) NOT NULL,
    current_streak integer DEFAULT 0,
    last_completed_date date,
    today_completed boolean DEFAULT false,
    best_streak integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_streak OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    uid character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    profile_image character varying(500) DEFAULT '🦊'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    voice_gender character varying(20) DEFAULT 'us_male'::character varying,
    default_difficulty integer DEFAULT 2,
    daily_goal integer DEFAULT 10,
    total_questions_attempted integer DEFAULT 0,
    total_correct_answers integer DEFAULT 0,
    current_streak integer DEFAULT 0,
    last_login_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    total_days_studied integer DEFAULT 0,
    longest_streak integer DEFAULT 0,
    weekly_attendance integer[] DEFAULT '{0,0,0,0,0,0,0}'::integer[],
    level integer DEFAULT 1 NOT NULL,
    last_completed_question_id character varying(100),
    earned_badges jsonb DEFAULT '[]'::jsonb,
    attendance_goal integer DEFAULT 3,
    quiz_count_goal integer DEFAULT 30,
    quiz_mode character varying(20) DEFAULT 'keyboard'::character varying NOT NULL,
    audio_speed numeric(2,1) DEFAULT 1.0,
    CONSTRAINT users_audio_speed_check CHECK ((audio_speed = ANY (ARRAY[0.5, 1.0, 1.5, 2.0]))),
    CONSTRAINT users_daily_goal_check CHECK ((daily_goal >= 1)),
    CONSTRAINT users_default_difficulty_check CHECK (((default_difficulty >= 1) AND (default_difficulty <= 3))),
    CONSTRAINT users_quiz_mode_check CHECK (((quiz_mode)::text = ANY ((ARRAY['voice'::character varying, 'keyboard'::character varying])::text[]))),
    CONSTRAINT users_voice_gender_check CHECK (((voice_gender)::text = ANY ((ARRAY['us_male'::character varying, 'us_female'::character varying, 'uk_male'::character varying, 'uk_female'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: COLUMN users.voice_gender; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.voice_gender IS 'us_male, us_female,uk_male, uk_female';


--
-- Name: COLUMN users.daily_goal; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.daily_goal IS '하루에 풀어야할 목표 문제수';


--
-- Name: COLUMN users.earned_badges; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.earned_badges IS '획득한 뱃지 ID 배열 (예: ["streak-7", "questions-100"])';


--
-- Name: wrong_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wrong_answers (
    user_id character varying(255) NOT NULL,
    question_id integer NOT NULL,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    wrong_count integer DEFAULT 1,
    last_viewed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.wrong_answers OWNER TO postgres;

--
-- Name: daily_summary summary_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_summary ALTER COLUMN summary_id SET DEFAULT nextval('public.daily_summary_summary_id_seq'::regclass);


--
-- Name: review_queue queue_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_queue ALTER COLUMN queue_id SET DEFAULT nextval('public.review_queue_queue_id_seq'::regclass);


--
-- Name: user_progress progress_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress ALTER COLUMN progress_id SET DEFAULT nextval('public.user_progress_progress_id_seq'::regclass);


--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.category (category_id, name, display_name, order_num, is_active) FROM stdin;
1	Model Example	모범 예문	1	t
2	Small Talk	스몰 토크	2	t
3	Cases in Point	사례 연구	3	t
4	Today Quiz	오늘의 퀴즈	4	t
5	Wrong Answer	틀린문제	5	t
6	Favorites	즐겨찾기	6	t
\.


--
-- Data for Name: daily_summary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_summary (summary_id, user_id, date, questions_attempted, days_completed, goal_met, created_at, updated_at) FROM stdin;
1	user001	2025-10-31	6	1	t	2025-10-31 17:22:47.135279	2025-10-31 17:22:47.135279
2	user001	2025-10-30	8	1	t	2025-10-31 17:22:47.139563	2025-10-31 17:22:47.139563
3	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2025-10-29	5	0	f	2025-10-31 17:22:47.142412	2025-10-31 17:22:47.142412
4	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2025-10-28	10	2	t	2025-10-31 17:22:47.145807	2025-10-31 17:22:47.145807
5	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2025-10-27	7	1	t	2025-10-31 17:22:47.150772	2025-10-31 17:22:47.150772
6	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2025-10-26	3	0	f	2025-10-31 17:22:47.154138	2025-10-31 17:22:47.154138
7	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2025-10-25	9	1	t	2025-10-31 17:22:47.157045	2025-10-31 17:22:47.157045
89	kakao_4538877331	2025-11-11	6	0	t	2025-11-11 22:07:47.250028	2025-11-11 22:12:58.589909
8	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2025-11-01	9	1	t	2025-11-01 23:03:25.739637	2025-11-01 23:39:04.93576
9	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2025-10-20	10	2	t	2025-10-20 17:22:47.157	2025-11-02 22:16:43.349815
19	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2025-10-01	3	2	t	2025-10-01 00:22:47.157	2025-10-01 22:16:43.349
20	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2025-10-02	4	0	t	2025-10-02 00:22:47.157	2025-11-02 22:49:44.270216
21	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2025-09-30	6	2	t	2025-09-30 06:22:47.157	2025-09-30 20:49:44.27
22	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2025-10-03	2	1	f	2025-10-03 07:22:47.157	2025-10-03 18:49:44.27
23	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2025-10-04	4	2	f	2025-10-04 08:22:47.157	2025-10-04 21:49:44.27
24	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2025-10-05	6	3	f	2025-10-05 10:10:10.157	2025-10-05 21:49:44.27
25	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2025-10-06	1	0	f	2025-10-06 08:32:47.157	2025-10-06 15:00:44.27
26	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2025-10-07	1	0	f	2025-10-07 05:00:47.157	2025-10-07 20:49:44.27
43	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2025-11-05	30	2	t	2025-11-05 15:10:26.017146	2025-11-05 23:00:02.812529
75	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2025-11-10	7	0	t	2025-11-10 21:27:51.629305	2025-11-11 01:20:26.181801
82	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2025-11-11	6	1	t	2025-11-11 11:23:41.12643	2025-11-11 21:48:44.362214
27	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2025-11-03	14	1	t	2025-11-03 14:41:39.56337	2025-11-03 15:12:17.303565
42	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2025-11-04	1	0	f	2025-11-04 14:38:57.154318	2025-11-04 14:38:57.154318
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favorites (user_id, question_id, added_at) FROM stdin;
google_116458393760270019201	3	2025-09-30 13:19:13.965609
google_116458393760270019201	5	2025-09-30 13:19:23.22885
google_116458393760270019201	7	2025-10-16 17:32:07.050823
google_116458393760270019201	9	2025-10-16 17:32:07.052757
google_116458393760270019201	10	2025-10-16 17:32:07.053889
google_116458393760270019201	11	2025-10-16 17:32:07.054615
google_116458393760270019201	13	2025-10-16 17:32:07.055282
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2	2025-11-03 15:24:24.852647
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	4	2025-11-03 15:24:24.85431
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	6	2025-11-03 15:24:24.855116
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	8	2025-11-03 15:24:24.85584
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	10	2025-11-03 15:24:24.8566
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	12	2025-11-03 15:24:24.857323
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	66	2025-11-03 15:24:24.858058
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	68	2025-11-03 15:24:24.858794
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	70	2025-11-03 15:24:24.859494
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	80	2025-11-03 15:24:24.860206
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	90	2025-11-03 15:24:24.861
kakao_4538877331	2	2025-11-11 22:09:39.040271
kakao_4538877331	5	2025-11-11 22:11:25.475267
kakao_4538877331	6	2025-11-11 22:12:23.921475
kakao_4538877331	1	2025-11-11 22:12:38.358354
kakao_4538877331	7	2025-11-11 22:12:57.155889
kakao_4538877331	8	2025-11-11 22:13:36.9027
\.


--
-- Data for Name: question_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.question_attempts (user_id, question_id, date, attempted_at) FROM stdin;
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	74	2025-11-01	2025-11-01 16:46:56.900837
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	75	2025-11-01	2025-11-01 16:52:02.367469
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	76	2025-11-01	2025-11-01 16:52:57.985834
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	77	2025-11-01	2025-11-01 16:53:32.204457
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	78	2025-11-01	2025-11-01 16:53:51.761019
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	79	2025-11-01	2025-11-01 16:54:10.067988
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	80	2025-11-01	2025-11-01 23:03:25.739637
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	81	2025-11-01	2025-11-01 23:04:26.193316
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	82	2025-11-01	2025-11-01 23:35:48.608955
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	83	2025-11-01	2025-11-01 23:35:58.122376
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	84	2025-11-01	2025-11-01 23:37:35.187547
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	85	2025-11-01	2025-11-01 23:37:46.052307
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	86	2025-11-01	2025-11-01 23:38:02.621957
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	87	2025-11-01	2025-11-01 23:38:33.000783
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	88	2025-11-01	2025-11-01 23:39:04.919376
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	89	2025-11-03	2025-11-03 14:41:39.56337
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	90	2025-11-03	2025-11-03 14:41:49.653507
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	91	2025-11-03	2025-11-03 14:42:14.842424
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	92	2025-11-03	2025-11-03 14:42:23.509055
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	93	2025-11-03	2025-11-03 14:51:32.022815
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	94	2025-11-03	2025-11-03 14:51:46.133264
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	95	2025-11-03	2025-11-03 14:54:47.366761
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	96	2025-11-03	2025-11-03 14:54:57.913697
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	97	2025-11-03	2025-11-03 15:00:59.991262
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	98	2025-11-03	2025-11-03 15:01:06.895776
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	99	2025-11-03	2025-11-03 15:04:22.211407
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	100	2025-11-03	2025-11-03 15:05:05.248664
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	101	2025-11-03	2025-11-03 15:12:03.83674
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	102	2025-11-03	2025-11-03 15:12:17.303565
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	103	2025-11-04	2025-11-04 14:38:57.154318
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	104	2025-11-05	2025-11-05 15:10:26.017146
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	105	2025-11-05	2025-11-05 15:22:00.976533
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	106	2025-11-05	2025-11-05 15:22:33.389128
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	107	2025-11-05	2025-11-05 15:44:08.740285
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	108	2025-11-05	2025-11-05 15:44:44.39362
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	109	2025-11-05	2025-11-05 15:44:54.644518
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	110	2025-11-05	2025-11-05 17:21:14.758016
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	111	2025-11-05	2025-11-05 17:42:54.61675
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	112	2025-11-05	2025-11-05 17:48:01.059522
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	113	2025-11-05	2025-11-05 17:48:25.028382
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	114	2025-11-05	2025-11-05 21:43:01.181932
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	115	2025-11-05	2025-11-05 21:43:28.800649
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	116	2025-11-05	2025-11-05 21:44:44.812407
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	117	2025-11-05	2025-11-05 21:47:57.912346
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	118	2025-11-05	2025-11-05 21:49:06.06663
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	119	2025-11-05	2025-11-05 21:49:20.184169
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	120	2025-11-05	2025-11-05 21:50:58.756412
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	121	2025-11-05	2025-11-05 21:51:06.290481
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	122	2025-11-05	2025-11-05 22:09:07.133342
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	123	2025-11-05	2025-11-05 22:14:22.592868
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	124	2025-11-05	2025-11-05 22:44:25.654886
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	125	2025-11-05	2025-11-05 22:44:49.376344
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	126	2025-11-05	2025-11-05 22:45:06.312588
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	127	2025-11-05	2025-11-05 22:45:49.720423
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	128	2025-11-05	2025-11-05 22:46:25.830387
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	129	2025-11-05	2025-11-05 22:46:38.551186
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	130	2025-11-05	2025-11-05 22:46:51.620832
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	131	2025-11-05	2025-11-05 22:59:19.783644
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	132	2025-11-05	2025-11-05 22:59:45.931887
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	133	2025-11-05	2025-11-05 23:00:02.812529
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	134	2025-11-10	2025-11-10 21:27:51.629305
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	135	2025-11-10	2025-11-10 22:28:32.137883
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	136	2025-11-10	2025-11-10 22:31:57.787232
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	137	2025-11-10	2025-11-10 22:37:57.299178
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	3	2025-11-10	2025-11-10 22:38:16.398947
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	4	2025-11-10	2025-11-10 22:38:33.170663
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	5	2025-11-10	2025-11-11 01:20:26.181801
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	138	2025-11-11	2025-11-11 11:23:41.12643
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	139	2025-11-11	2025-11-11 11:24:34.920762
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	140	2025-11-11	2025-11-11 12:29:12.4922
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	141	2025-11-11	2025-11-11 21:47:36.763334
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	142	2025-11-11	2025-11-11 21:48:27.004953
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	143	2025-11-11	2025-11-11 21:48:44.362214
kakao_4538877331	1	2025-11-11	2025-11-11 22:07:47.250028
kakao_4538877331	2	2025-11-11	2025-11-11 22:09:41.000407
kakao_4538877331	3	2025-11-11	2025-11-11 22:09:49.741163
kakao_4538877331	4	2025-11-11	2025-11-11 22:11:06.035012
kakao_4538877331	5	2025-11-11	2025-11-11 22:11:26.474633
kakao_4538877331	7	2025-11-11	2025-11-11 22:12:58.589909
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.questions (question_id, category_id, day, question_number, question_type, korean, english, korean_a, english_a, korean_b, english_b, keywords, audio, audio_us_male, audio_us_female, audio_uk_male, audio_uk_female) FROM stdin;
4	1	1	4	short	노트북은 저랑 좀 안 맞아요	Laptops aren't really for me. Something about the keyboard is super uncomfortable.	\N	\N	\N	\N	{laptops,uncomfortable}	001_04.mp3	001_04.mp3	001_04.mp3	001_04.mp3	001_04.mp3
5	1	1	5	short	전기차는 좀 별로예요. 충전소는 요즘 늘었지만, 여전히 엄청 귀찮게 느껴져요.	Electronic cars aren't for me. We have more charging stations around now, but it still feels like too much of hassle.	\N	\N	\N	\N	{electronic,hassle}	001_05.mp3	001_05.mp3	001_05.mp3	001_05.mp3	001_05.mp3
6	1	1	6	short	그 사람 직업이 좋은 건 아는데, 그런 남자는 나는 별로야.	I know he has a decent job, but guys like him aren't really for me.	\N	\N	\N	\N	{decent,aren't}	001_06.mp3	001_06.mp3	001_06.mp3	001_06.mp3	001_06.mp3
7	2	1	7	dialogue	\N	\N	우리 나가서 맛난 회 먹을까?	Why don't we go out and get some nice sashimi? My treat!	\N	\N	{sashimi,treat}	001_07.mp3	001_07.mp3	001_07.mp3	001_07.mp3	001_07.mp3
8	2	1	8	dialogue	\N	\N			너무 고맙긴 한데. 난 회를 별로 안 좋아해. 식감이 적응이 안 돼.	It's kind of you to offer, but raw fish just isn't for me. I can't get used to the texture.	{raw,texture}	001_08.mp3	001_08.mp3	001_08.mp3	001_08.mp3	001_08.mp3
9	2	1	9	dialogue	\N	\N	청취 연습을 위해 <기묘한 이야기>를 시청할 것을 추천합니다.	I recommend watching Stranger Things to practice listening.	\N	\N	{Stranger,listening}	001_09.mp3	001_09.mp3	001_09.mp3	001_09.mp3	001_09.mp3
48	2	4	9	dialogue	\N	\N	제주도에서 선물 사 갈까?	Want me to get you a souvenir from Jeju?	\N	\N	{souvenir,Jeju}	004_09.mp3	004_09.mp3	004_09.mp3	004_09.mp3	004_09.mp3
10	2	1	10	dialogue	\N	\N	\N	\N	좋은 생각이긴 한데, 저는 미국 프로그램이 체질에 안 맞아요. 스토리에 재미가 안 붙어요.	It's a good idea, but American shows aren't for me. I can't really get into the stories.	{American,stories}	001_10.mp3	001_10.mp3	001_10.mp3	001_10.mp3	001_10.mp3
11	2	1	11	dialogue	\N	\N	애들하고 정말 잘 노는군요. 선생님 할 생각은 해보셨나요?	You're really great around kids. Have you ever thought of being a teacher?	\N	\N	{great,teacher}	001_11.mp3	001_11.mp3	001_11.mp3	001_11.mp3	001_11.mp3
12	2	1	12	dialogue	\N	\N	\N	\N	아니요. 저는 가르치는 거랑 잘 안 맞아요. 애들이랑 노는 건 좋은데, 공부시키는 게 너무 힘들 듯해요.	No, no. Teaching isn't really for me. I like to play with them but trying to make them study seems like hard work.	{teaching,hard}	001_12.mp3	001_12.mp3	001_12.mp3	001_12.mp3	001_12.mp3
175	2	14	10	dialogue	\N	\N	\N	\N	응. 실물 마우스랑 키보드가 뭔가 더 편해.	Yes. There's something about a real mouse and keyboard that make me more comfortable.	{something,mouse,keyboard,comfortable}	014_10.mp3	014_10.mp3	014_10.mp3	014_10.mp3	014_10.mp3
13	3	1	13	long	안녕, Greg. 내가 생일 선물로 받은 로잉 머신 기억하지? 혹시 관심있어? 나랑은 별로 안맞더라고.	Hey, Greg. Do you remember that rowing machine I got for my birthday? Are you interested in it? Turns out it's not really for me.	\N	\N	\N	\N	{rowing,birthday}	001_13.mp3	001_13.mp3	001_13.mp3	001_13.mp3	001_13.mp3
14	1	2	1	short	하루빨리 새 집으로 이사 가고 싶어요.	I can't wait to move into new house.	\N	\N	\N	\N	{can't,wait}	002_01.mp3	002_01.mp3	002_01.mp3	002_01.mp3	002_01.mp3
15	1	2	2	short	다음 에피소드는 어떤 내용이지 궁금해 미치겠어.	I can't wait to see what the next episode will bring.	\N	\N	\N	\N	{see,episode}	002_02.mp3	002_02.mp3	002_02.mp3	002_02.mp3	002_02.mp3
16	1	2	3	short	아내가 제 선물을 개봉할 때 어떤 표정일지 궁금해 죽겠습니다.	I can't wait to see the look on my wife's face when she opens my gift.	\N	\N	\N	\N	{look,face}	002_03.mp3	002_03.mp3	002_03.mp3	002_03.mp3	002_03.mp3
17	1	2	4	short	이 프로젝트가 빨리 끝났으면 좋겠어요. 너무 오래 걸립니다.	I can't wait to be done with this project. It's takes forever.	\N	\N	\N	\N	{done,forever}	002_04.mp3	002_04.mp3	002_04.mp3	002_04.mp3	002_04.mp3
18	1	2	5	short	여보, 저녁 식사가 너무 맛있는 냄새가 나네. 어서 먹고 싶어.	That dinner smells delicious, honey. I can't wait.	\N	\N	\N	\N	{dinner,delicious}	002_05.mp3	002_05.mp3	002_05.mp3	002_05.mp3	002_05.mp3
83	2	7	8	dialogue	\N	\N	\N	\N	뭐라도 좋아. 너무 매운 것만 아니면.	I am up for anything, as long as it's not too spicy.	{up,anything,spicy,long}	007_08.mp3	007_08.mp3	007_08.mp3	007_08.mp3	007_08.mp3
97	2	8	9	dialogue	\N	\N	Sam, 우리 점심 약속 유효한 거지?	Sam, are you still able to meet for lunch?	\N	\N	{still,able,meet,lunch}	008_09.mp3	008_09.mp3	008_09.mp3	008_09.mp3	008_09.mp3
19	1	2	6	short	<베이비 드라이버>가 미국에서는 몇 달 전에 개봉했어. 이곳에서도 어서 개봉했으면 좋겠다.	Baby Driver was released months ago in the United States. I can't wait for it to come out here.	\N	\N	\N	\N	{released,come}	002_06.mp3	002_06.mp3	002_06.mp3	002_06.mp3	002_06.mp3
20	2	2	7	dialogue	\N	\N	그 책 드디어 영화로 만들었다며?	Did you here they finally made that book into a movie?	\N	\N	{book,movie}	002_07.mp3	002_07.mp3	002_07.mp3	002_07.mp3	002_07.mp3
105	1	9	4	short	수정본 보내드릴까요?	Would you like me to send you the reviced version?	\N	\N	\N	\N	{like,send,revised,version}	009_04.mp3	009_04.mp3	009_04.mp3	009_04.mp3	009_04.mp3
22	2	2	9	dialogue	\N	\N	프로젝트는 잘 되어 가나요? 한동안 매달려 있으신 것 같던데.	How's that project going? It seems like you've been working on it for a while.	\N	\N	{project,working}	002_09.mp3	002_09.mp3	002_09.mp3	002_09.mp3	002_09.mp3
226	1	19	1	short	나 내일 쉬어.	I'm taking tomorrow off.	\N	\N	\N	\N	{taking,tomorrow,off}	019_01.mp3	019_01.mp3	019_01.mp3	019_01.mp3	019_01.mp3
24	2	2	11	dialogue	\N	\N	네가 뜨개질할 수 있는 걸 몰랐네. 뭐 만들고 있니?	I didn't know you could knit. What are you making?	\N	\N	{knit,making}	002_11.mp3	002_11.mp3	002_11.mp3	002_11.mp3	002_11.mp3
135	2	11	8	dialogue	\N	\N	여보, 벌써 요리 시작했어? 저녁으로 피자를 먹을까 하는데.	Honey, have you already started cooking? I was thinking of pizza for dinner.	\N	\N	{started,cooking,thinking,pizza}	011_08.mp3	011_08.mp3	011_08.mp3	011_08.mp3	011_08.mp3
136	2	11	9	dialogue	\N	\N	\N	\N	안돼, 또 정크푸드 먹으면 안 된다고. 내가 살찌는 거 보고 싶어?	No, we shouldn't have junk food again. You don't want me getting fat.	{junk,food,getting,fat}	011_09.mp3	011_09.mp3	011_09.mp3	011_09.mp3	011_09.mp3
1	1	1	1	short	재택근무는 저랑 안 맞아요.	Working from home isn't for me.	\N	\N	\N	\N	{working,home}	001_01.mp3	001_01.mp3	001_01.mp3	001_01.mp3	001_01.mp3
2	1	1	2	short	저는 재택근무 체질이 아니예요. 늘 딴짓하게 되거든요.	Working from home isn't for me. I always get distracted.	\N	\N	\N	\N	{for,distracted}	001_02.mp3	001_02.mp3	001_02.mp3	001_02.mp3	001_02.mp3
29	1	3	3	short	미안한데, 오는 길에 커피 좀 사다 줄 수 있어요?	Do you mind grabbing me some coffee on your way?	\N	\N	\N	\N	{grabbing,way}	003_03.mp3	003_03.mp3	003_03.mp3	003_03.mp3	003_03.mp3
30	1	3	4	short	제가 여유 시간이 겨우 5분 있어요. 짧게 해 주실 수 있을까요?	I've got only five minutes to spare. Do you mind keeping it short?	\N	\N	\N	\N	{five,spare}	003_04.mp3	003_04.mp3	003_04.mp3	003_04.mp3	003_04.mp3
31	1	3	5	short	에어컨을 좀 줄이면 안 될까요? 좀 추워서요.	Do you mind turning down the air-conditioning? I feel a bit cold.	\N	\N	\N	\N	{turning,cold}	003_05.mp3	003_05.mp3	003_05.mp3	003_05.mp3	003_05.mp3
286	1	24	1	short	싼 게 비지떡이지.	You get what you pay for.	\N	\N	\N	\N	{get,pay}	024_01.mp3	024_01.mp3	024_01.mp3	024_01.mp3	024_01.mp3
32	1	3	6	short	개인적인 질문 하나 해도 될까요?	Do you mind if I ask you personal question?	\N	\N	\N	\N	{ask,question}	003_06.mp3	003_06.mp3	003_06.mp3	003_06.mp3	003_06.mp3
33	2	3	7	dialogue	\N	\N	죄송한데, 회의를 금요일로 옮겨도 될까요?	Do you mind if we move the meeting for Friday?	\N	\N	{move,Friday}	003_07.mp3	003_07.mp3	003_07.mp3	003_07.mp3	003_07.mp3
34	2	3	8	dialogue	\N	\N	\N	\N	네, 괜찮습니다. 사실 저희에겐 금요일이 더 좋아요.	Sure, Friday works better for us, actually.	{works,better}	003_08.mp3	003_08.mp3	003_08.mp3	003_08.mp3	003_08.mp3
35	2	3	9	dialogue	\N	\N	죄송한데, 꼭대기 선반에 있는 저 시리얼 상자들 중 하나를 내려 줄 수 있을까요?	Excuse me, do you mind grabbing me one of those cereal boxes on the top shelf?	\N	\N	{grabbing,shelf}	003_09.mp3	003_09.mp3	003_09.mp3	003_09.mp3	003_09.mp3
36	2	3	10	dialogue	\N	\N	\N	\N	당연하죠. 얼마든지요!	Sure, Always happy to help!	{happy,help}	003_10.mp3	003_10.mp3	003_10.mp3	003_10.mp3	003_10.mp3
37	2	3	11	dialogue	\N	\N	어디서 만나면 될까요?	Where would you like to meet?	\N	\N	{where,meet}	003_11.mp3	003_11.mp3	003_11.mp3	003_11.mp3	003_11.mp3
38	2	3	12	dialogue	\N	\N	\N	\N	제가 그쪽 사무실로 가도 상관없습니다.	I don't mind coming over to your office.	{coming,office}	003_12.mp3	003_12.mp3	003_12.mp3	003_12.mp3	003_12.mp3
40	1	4	1	short	물가가 올라도 너무 올라요.	Everything is getting super expensive.	\N	\N	\N	\N	{getting,expensive}	004_01.mp3	004_01.mp3	004_01.mp3	004_01.mp3	004_01.mp3
41	1	4	2	short	그 여자분 키 엄청 커요.	She is super tall.	\N	\N	\N	\N	{super,tall}	004_02.mp3	004_02.mp3	004_02.mp3	004_02.mp3	004_02.mp3
42	1	4	3	short	그 사람이 무지 바쁘거나, 아니면 저에 대한 관심이 식고 있는 거겠죠.	I've been super busy, or he is losing interest in me.	\N	\N	\N	\N	{super,interest}	004_03.mp3	004_03.mp3	004_03.mp3	004_03.mp3	004_03.mp3
43	1	4	4	short	제가 요즘 이사 준비 때문에 엄청 바빴어요.	I've been super busy with my upcoming move.	\N	\N	\N	\N	{super,upcoming}	004_04.mp3	004_04.mp3	004_04.mp3	004_04.mp3	004_04.mp3
44	1	4	5	short	우와. 연세 있으신 분치고는 몸매가 너무 좋으시네요.	Wow. You're in super good shape for an old guy.	\N	\N	\N	\N	{super,shape}	004_05.mp3	004_05.mp3	004_05.mp3	004_05.mp3	004_05.mp3
46	2	4	7	dialogue	\N	\N	무슨 점심값이 만 원이 넘는 거야.	I never thought I'd have to pay over 10,000 won for lunch.	\N	\N	{pay,lunch}	004_07.mp3	004_07.mp3	004_07.mp3	004_07.mp3	004_07.mp3
47	2	4	8	dialogue	\N	\N	\N	\N	그러게 요새 물가가 너무너무 비싸.	Yeah. Everything is getting super expensive.	{getting,expensive}	004_08.mp3	004_08.mp3	004_08.mp3	004_08.mp3	004_08.mp3
66	1	6	4	short	크리스마스에는 칠면조 저녁 식사와 풍미 좋은 와인만 한 게 없지.	There is nothing like a turkey dinner and spiced wine for Christmas.	\N	\N	\N	\N	{nothing,turkey,dinner,Christmas}	006_04.mp3	006_04.mp3	006_04.mp3	006_04.mp3	006_04.mp3
67	1	6	5	short	다시 콘서트에 갈 수 있어서 너무 좋아. 가장 좋아하는 밴드의 라이브 공연을 보는 것만큼 좋은 것은 없지.	I'm so glad we can go to concerts again. There's nothing like seeing your favorite band live.	\N	\N	\N	\N	{nothing,favorite,band,live}	006_05.mp3	006_05.mp3	006_05.mp3	006_05.mp3	006_05.mp3
93	1	8	5	short	오늘은 저녁 안 먹을래. 오늘 속이 좀 안 좋아서.	I think I'll skip dinner. My stomach doesn't feel quite right today.	\N	\N	\N	\N	{skip,stomach,feel,right}	008_05.mp3	008_05.mp3	008_05.mp3	008_05.mp3	008_05.mp3
94	1	8	6	short	너희 딸 파티에 나는 안 가는 게 좋을 것 같아. 오늘 몸이 좀 안 좋네.	I don't think it's a good idea for me to come to your daughter's party. I don't feel quite right today.	\N	\N	\N	\N	{party,feel,quite,right}	008_06.mp3	008_06.mp3	008_06.mp3	008_06.mp3	008_06.mp3
137	2	11	10	dialogue	\N	\N	토요일 밤에 약속 있어? 노원에 새로 생긴 초밥집에 가 볼까 하는데, 같이 갈 사람이 없네.	Do you have any plans for Saturday night? I was thinking of trying a new sushi place in Nowon and I need someone to go with me.	\N	\N	{plans,Saturday,thinking,place}	011_10.mp3	011_10.mp3	011_10.mp3	011_10.mp3	011_10.mp3
325	1	27	1	short	시간이 몇시인데 커피를 마셔?	Are you drinking coffee at this hour?	\N	\N	\N	\N	{drinking,coffee,hour}	027_01.mp3	027_01.mp3	027_01.mp3	027_01.mp3	027_01.mp3
28	1	3	2	short	제가 마지막 남은 피자 한 조각 먹어도 될까요?	Do you mind if I finish off the last piece of pizza?	\N	\N	\N	\N	{mind,piece}	003_02.mp3	003_02.mp3	003_02.mp3	003_02.mp3	003_02.mp3
25	2	2	12	dialogue	\N	\N	\N	\N	여동생에게 줄 스카프를 만들고 있어. 내가 자기 주려고 이걸 만든 걸 알면 어떤 표정일까 궁금해 죽겠어.	I'm making a scarf for my little sister. I can't wait to see the look on her face when she realizes I made it for her.	{scarf,look}	002_12.mp3	002_12.mp3	002_12.mp3	002_12.mp3	002_12.mp3
49	2	4	10	dialogue	\N	\N	\N	\N	오! 그럼 귤 한 박스 사다 줄래? 지금 제철이니 엄청 쌀 거야.	Oh! How about a box of tangerines? They should be super cheap since they're in season.	{tangerines,season}	004_10.mp3	004_10.mp3	004_10.mp3	004_10.mp3	004_10.mp3
50	2	4	11	dialogue	\N	\N	11월 말치고는 너무 따뜻하다. 지금쯤이면 보통은 훨씬 더 추운데.	It's unusually warm for late November. It's usually much colder by now.	\N	\N	{November,colder}	004_11.mp3	004_11.mp3	004_11.mp3	004_11.mp3	004_11.mp3
51	2	4	12	dialogue	\N	\N	\N	\N	맞아. 가을이 점점 짧아지고는 있는데 올해는 엄청 길다	Right. Autumn has been getting shorter, but this year, it's been super long.	{Autumn,shorter}	004_12.mp3	004_12.mp3	004_12.mp3	004_12.mp3	004_12.mp3
52	3	4	13	long	저는 보통은 설명서대로 잘 못하는데, 이번 침대 프레임 조립은 정말 쉽더군요. 조립하는 데 한 시간도 안 걸렸습니다. 동봉된 육각 렌치 이외엔 별도의 도구도 필요 없었어요. 튼튼해 보이기까지 합니다. 이케아 가구가 좀 약하다는 평이 있는데, 이번 침대 프레임 보고는 많이 놀랐습니다.	I'm normally really bad at following instructions, but this bed frame was super easy to put together. It took me less than an hour. I didn't need any extra tools, besides the included hex key. It looks sturdy too. The furniture from IKEA has a reputation for breaking easily, but this bed frame surprised me.	\N	\N	\N	\N	{frame,reputation}	004_13.mp3	004_13.mp3	004_13.mp3	004_13.mp3	004_13.mp3
101	3	8	13	long	안녕하세요, Brian. 샌프란시스코 사무실은 요즘 어때요? 지난주에 코로나 걸렸다고 들었는데, 안부 확인차 연락드렸어요. 사실 저도 어제 몸이 안 좋아서 검사를 했는데 다행히 음성으로 나왔습니다.	Hi, Brian. How are things going over there in the San Francisco office? I heard that you caught COVID last week, and so I wanted to check in and ask how you're doing. Actually, I wasn't feeling quite right myself yesterday. I got tested and thankfully, it turned out negative.	\N	\N	\N	\N	{COVID,feeling,right,negative}	008_13.mp3	008_13.mp3	008_13.mp3	008_13.mp3	008_13.mp3
139	3	11	12	long	너무 늦게 연락드려서 죄송합니다. 1월 첫째 주에 있을 한국 출장 일정을 검토하다가 본사 부사장님과 회의를 잡을 수 있을까 고민 중이었습니다. 혹시 부사장님 그 주 수요일에 시간이 되실까요?	I'm sorry for contacting you so late. We were going over the itinerary for our Korea trip during the first week of January, and we were thinking of setting up a meeting with your vice president at headquarters. By any chance, is she available that Wednesday?	\N	\N	\N	\N	{itinerary,thinking,meeting,available}	011_12.mp3	011_12.mp3	011_12.mp3	011_12.mp3	011_12.mp3
138	2	11	11	dialogue	\N	\N	\N	\N	좋아, 원래는 집에서 좀 쉴까 했는데. 초밥 먹는 게 훨씬 더 좋지.	Oh, sure. I was just planning on relaxing at home. Getting sushi sounds more fun	{planning,relaxing,sounds,fun}	011_11.mp3	011_11.mp3	011_11.mp3	011_11.mp3	011_11.mp3
39	3	3	13	long	안녕하세요, Smith씨,\n저는 항상 화요일 오후 2시 콘퍼런스 콜이 기다려집니다. 그런데, 이번 주에는 유감스럽게도 1시 반에 다른 회의가 잡혀 있고 (2시에 맞춰) 저때 끝날지 확실하지 않습니다. 괜찮으시면 혹시 모르니까 이번에는 2시 30분에 시작해도 될까요?	Good afternoon, Mr. Smith,\nI always look forward to our 2 p.m. Tuesday conference call. However, this week, I'm afraid I have another meeting scheduled for 1:30, and I'm not sure if it will be over in time. If you don't mind, could we start at 2:30 this time, just to be safe?	\N	\N	\N	\N	{scheduled,safe}	003_13.mp3	003_13.mp3	003_13.mp3	003_13.mp3	003_13.mp3
140	1	12	1	short	나도 그렇게 돈이 많으면 좋으련만.	I wish I had that much money.	\N	\N	\N	\N	{wish,had,much,money}	012_01.mp3	012_01.mp3	012_01.mp3	012_01.mp3	012_01.mp3
141	1	12	2	short	너의 자신감이 부럽다.	I wish I had your confidence.	\N	\N	\N	\N	{wish,had,your,confidence}	012_02.mp3	012_02.mp3	012_02.mp3	012_02.mp3	012_02.mp3
142	1	12	3	short	저도 같이 가고 싶긴 한데, 시간이 안 나네요.	I wish I could go with you, but I can't find the time.	\N	\N	\N	\N	{wish,could,go,time}	012_03.mp3	012_03.mp3	012_03.mp3	012_03.mp3	012_03.mp3
143	1	12	4	short	제가 해산물을 못 먹어서 너무 아쉽네요.	I wish I could eat seafood.	\N	\N	\N	\N	{wish,could,eat,seafood}	012_04.mp3	012_04.mp3	012_04.mp3	012_04.mp3	012_04.mp3
144	1	12	5	short	항상 가족들이랑 시간을 좀 더 많이 보내고 싶은데 그러질 못하네요.	I wish I could spend more time with my family.	\N	\N	\N	\N	{wish,could,spend,family}	012_05.mp3	012_05.mp3	012_05.mp3	012_05.mp3	012_05.mp3
145	1	12	6	short	내가 한 말을 주워 담을 수도 없고.	I wish I could take back what I said.	\N	\N	\N	\N	{wish,could,take,back}	012_06.mp3	012_06.mp3	012_06.mp3	012_06.mp3	012_06.mp3
146	2	12	7	dialogue	\N	\N	이번 주에 Jessica 뭐 하는지 들었니? 콘서트 두 군데 가고 일본 여행도 간대.	Did you hear what Jessica is doing this week? She's going to two concerts and taking a trip to Japan.	\N	\N	{hear,concerts,trip,Japan}	012_07.mp3	012_07.mp3	012_07.mp3	012_07.mp3	012_07.mp3
23	2	2	10	dialogue	\N	\N	\N	\N	네 일주일 내내 이것을 하고 있습니다. 어서 끝내고 뭔가 다른 걸로 넘어가고 싶어요.	Yeah, I've been working on it all week. I can't wait to finish it and finally move on to something else.	{working,move}	002_10.mp3	002_10.mp3	002_10.mp3	002_10.mp3	002_10.mp3
149	2	12	10	dialogue	\N	\N	\N	\N	언제라도 당근마켓에 되팔면 되지 뭐.	You can always resell it on Danggeun Market.	{always,resell,Danggeun,Market}	012_10.mp3	012_10.mp3	012_10.mp3	012_10.mp3	012_10.mp3
150	2	12	11	dialogue	\N	\N	날도 추워지고 하니 어릴 때 생각이 많이 나네. 혹시 후회되는 거 있어?	The weather's getting cold, and it makes me think about my childhood. Do you have any regrets?	\N	\N	{weather,cold,childhood,regrets}	012_11.mp3	012_11.mp3	012_11.mp3	012_11.mp3	012_11.mp3
151	2	12	12	dialogue	\N	\N	\N	\N	응, 어릴 때 1년을 더 기다렸다 대학에 갔었으면 좋았을 텐데.	Yeah, when I was younger, I wish I had waited a year before going to college.	{younger,wish,had,waited}	012_12.mp3	012_12.mp3	012_12.mp3	012_12.mp3	012_12.mp3
153	1	13	1	short	2시 30분 어때요?	How does 2:30 sound?	\N	\N	\N	\N	{how,does,sound,2:30}	013_01.mp3	013_01.mp3	013_01.mp3	013_01.mp3	013_01.mp3
154	1	13	2	short	요리하고 싶지 않아. 프라이드치킨 먹는 건 어때?	I don't feel like cooking. How does fried chicken sound?	\N	\N	\N	\N	{feel,cooking,chicken,sound}	013_02.mp3	013_02.mp3	013_02.mp3	013_02.mp3	013_02.mp3
155	1	13	3	short	오늘 저녁에는 인도 음식 먹을까 싶은데, 어때?	I was thinking about having Indian food tonight. How does that sound?	\N	\N	\N	\N	{thinking,Indian,food,sound}	013_03.mp3	013_03.mp3	013_03.mp3	013_03.mp3	013_03.mp3
156	1	13	4	short	월요일에 월차 못 내면 그냥 경기도 가서 휴가 보내야 할 듯해. 어때?	If I can't take Monday off, maybe we could just vacation in Gyeonggi-do. How does that sound?	\N	\N	\N	\N	{Monday,vacation,Gyeonggi-do,sound}	013_04.mp3	013_04.mp3	013_04.mp3	013_04.mp3	013_04.mp3
157	1	13	5	short	다음 주는 줌에서 만나면 어떨까 하는데요, 어떠세요?	I thought maybe we could meet on Zoom. How does that sound?	\N	\N	\N	\N	{thought,meet,Zoom,sound}	013_05.mp3	013_05.mp3	013_05.mp3	013_05.mp3	013_05.mp3
158	1	13	6	short	다음 주 크리스마스 때는 가게 문 닫을까 하는데. 당신 생각은 어때?	I was thinking of closing the store next week for Christmas. How does that sound to you?	\N	\N	\N	\N	{thinking,closing,Christmas,sound}	013_06.mp3	013_06.mp3	013_06.mp3	013_06.mp3	013_06.mp3
159	2	13	7	dialogue	\N	\N	죄송한데, 조개가 다 떨어졌어요. 그래도 주방장님이 특별 홍합 요리를 만들어 드릴 수 있습니다. 어떠세요?	I'm afraid we're out of clams, but the chef can cook a special mussel dish instead. How does that sound?	\N	\N	{clams,mussel,dish,sound}	013_07.mp3	013_07.mp3	013_07.mp3	013_07.mp3	013_07.mp3
160	2	13	8	dialogue	\N	\N	\N	\N	좋죠! 사실은 홍합이 더 좋아요.	That would be great! I actually prefer mussels.	{would,great,prefer,mussels}	013_08.mp3	013_08.mp3	013_08.mp3	013_08.mp3	013_08.mp3
161	2	13	9	dialogue	\N	\N	야간 비행기는 이백 달러 정도 싸대. 어때?	The overnight flight is about $200 cheaper. How does that sound?	\N	\N	{overnight,flight,cheaper,sound}	013_09.mp3	013_09.mp3	013_09.mp3	013_09.mp3	013_09.mp3
162	2	13	10	dialogue	\N	\N	\N	\N	아하. 난 밤 비행기 못 타. 더 이상 이삼십대가 아니잖아.	Ugh. I can't stand overnight flights. I'm not in my 20s or 30s anymore.	{stand,overnight,flights,anymore}	013_10.mp3	013_10.mp3	013_10.mp3	013_10.mp3	013_10.mp3
164	2	13	12	dialogue	\N	\N	\N	\N	좋아. 어차피 전망은 크게 상관없거든.	That sounds nice. I don't care much about the view anyway.	{sounds,nice,view,anyway}	013_12.mp3	013_12.mp3	013_12.mp3	013_12.mp3	013_12.mp3
165	3	13	13	long	안녕하세요. 당근마켓에 올리신 TV에 관심 있습니다. 삼십만 원을 원하시는 것 같은데, 혹시 이십오만 원은 어때요? 제가 그쪽으로 가서 제 차로 직접 픽업해 올 수 있습니다.	Hello, I'm interested in the TV you listed on Danggeun Market. I see you're asking for 300,000 won, but how does 250,000 won sound? I can come over and pick it up myself with my van.	\N	\N	\N	\N	{TV,Danggeun,Market,pick}	013_13.mp3	013_13.mp3	013_13.mp3	013_13.mp3	013_13.mp3
166	1	14	1	short	BTS는 뭔가 좀 달라.	There is something different about BTS.	\N	\N	\N	\N	{something,different,bts}	014_01.mp3	014_01.mp3	014_01.mp3	014_01.mp3	014_01.mp3
167	1	14	2	short	이번에 면접 봤는데 뭔가 이상했어요.	There was something weird about the interview.	\N	\N	\N	\N	{something,weird,interview}	014_02.mp3	014_02.mp3	014_02.mp3	014_02.mp3	014_02.mp3
168	1	14	3	short	이 브랜드에 사람들이 열광하는 이유가 있지.	There is something about this brand people are crazy about.	\N	\N	\N	\N	{something,brand,people,crazy}	014_03.mp3	014_03.mp3	014_03.mp3	014_03.mp3	014_03.mp3
169	1	14	4	short	그 사람에게는 뭔가 끌리는 점이 있어요.	There is something about him that I am attracted to.	\N	\N	\N	\N	{something,attracted}	014_04.mp3	014_04.mp3	014_04.mp3	014_04.mp3	014_04.mp3
170	1	14	5	short	유재석은 뭔가 사람을 편하게 해 주는 게 있어.	There is something about Yu Jae-seok that puts people at ease.	\N	\N	\N	\N	{something,yu,jae-seok,ease}	014_05.mp3	014_05.mp3	014_05.mp3	014_05.mp3	014_05.mp3
171	1	14	6	short	그 코치에게는 선수들의 잠재력을 이끌어내는 뭔가가 있어.	There is something about the coach that brings out the best in players.	\N	\N	\N	\N	{something,coach,brings,players}	014_06.mp3	014_06.mp3	014_06.mp3	014_06.mp3	014_06.mp3
172	2	14	7	dialogue	\N	\N	요즘 차 알아보고 있는데, 포르쉐에는 거부할 수 없는 뭔가가 있어.	I've been shopping around for a car, and there's something about Porsches that I can't resist.	\N	\N	{shopping,car,porsches,resist}	014_07.mp3	014_07.mp3	014_07.mp3	014_07.mp3	014_07.mp3
148	2	12	9	dialogue	\N	\N	이백만 원짜리 이 의자 상당히 실망스러워. 반품도 안 되니, 원.	I'm actually quite disappointed with this two-million-won chair. I wish I could take it back.	\N	\N	{disappointed,chair,wish,back}	012_09.mp3	012_09.mp3	012_09.mp3	012_09.mp3	012_09.mp3
176	2	14	11	dialogue	\N	\N	그 사람은 뭔가 달라. 내가 만난 다른 남자들이랑 달라.	There is something different about him. He is not like other guys I have met.	\N	\N	{something,different,guys,met}	014_11.mp3	014_11.mp3	014_11.mp3	014_11.mp3	014_11.mp3
177	2	14	12	dialogue	\N	\N	\N	\N	그렇긴 하지만 이제 겨우 한 번 만난 거잖아. 좀 천천히 시간을 가진 다음에 공식적으로 만나.	Sure, but it was only one date. Take more time before you become official.	{date,time,official}	014_12.mp3	014_12.mp3	014_12.mp3	014_12.mp3	014_12.mp3
179	1	15	1	short	다 먹은거니?	Are you done with your plate?	\N	\N	\N	\N	{done,plate}	015_01.mp3	015_01.mp3	015_01.mp3	015_01.mp3	015_01.mp3
180	1	15	2	short	이 스쿼트기구 다 쓰신 거죠? 제가 써도 될까요?	Are you done with this squat rack? Is it alright if I use it?	\N	\N	\N	\N	{done,squat,rack}	015_02.mp3	015_02.mp3	015_02.mp3	015_02.mp3	015_02.mp3
181	1	15	3	short	샌드위치 그만 먹을래. 너무 커.	I think I'm done with my sandwich. It's just way too big.	\N	\N	\N	\N	{done,sandwich,big}	015_03.mp3	015_03.mp3	015_03.mp3	015_03.mp3	015_03.mp3
182	1	15	4	short	제가 빌려준 책 다 읽은 거죠? 그럼 돌려주세요.	Are you done with the book I lent you? I'd like to have it back.	\N	\N	\N	\N	{done,book,lent,back}	015_04.mp3	015_04.mp3	015_04.mp3	015_04.mp3	015_04.mp3
183	1	15	5	short	차량 점검 마쳤습니다. 어디가 고장인지 말씀드릴게요.	I'm done taking a look at your car. I'll tell you what you've got here.	\N	\N	\N	\N	{done,taking,car,tell}	015_05.mp3	015_05.mp3	015_05.mp3	015_05.mp3	015_05.mp3
184	1	15	6	short	들어오지 마! 나 아직 옷 덜 갈아입었다고.	Don't come in! I'm not done changing.	\N	\N	\N	\N	{come,done,changing}	015_06.mp3	015_06.mp3	015_06.mp3	015_06.mp3	015_06.mp3
185	2	15	7	dialogue	\N	\N	컴퓨터는 다 쓴 거야? 내 회사 이메일 확인해야 하는데.	Are you done with the computer? I need to check my work emails.	\N	\N	{done,computer,check,emails}	015_07.mp3	015_07.mp3	015_07.mp3	015_07.mp3	015_07.mp3
186	2	15	8	dialogue	\N	\N	\N	\N	근데 이 게임 너무 재미있어. 당신 전화기로 확인하면 안 돼?	I'm really into this game, though. Can't you just check them on your phone?	{game,check,phone}	015_08.mp3	015_08.mp3	015_08.mp3	015_08.mp3	015_08.mp3
187	2	15	9	dialogue	\N	\N	옷은 다 입어 본 거야? 여기 너한테 어울리는 옷이 없는 것 같아.	Are you done trying on clothes? I don't think anything here works for you.	\N	\N	{done,trying,clothes,works}	015_09.mp3	015_09.mp3	015_09.mp3	015_09.mp3	015_09.mp3
188	2	15	10	dialogue	\N	\N	\N	\N	응, 거의 다 입어 봤어. 잠깐만! 이 스커트 너무 귀엽다!	Yeah, just about. Wait! Look at this cute skirt.	{wait,cute,skirt}	015_10.mp3	015_10.mp3	015_10.mp3	015_10.mp3	015_10.mp3
190	2	15	12	dialogue	\N	\N	\N	\N	네. 근데 펜이 있을까요?	Alright. Oh, do you have a pen I could use?	{pen,use}	015_12.mp3	015_12.mp3	015_12.mp3	015_12.mp3	015_12.mp3
106	1	9	5	short	내가 따라가 줄까?	Do you want me to come along with you?	\N	\N	\N	\N	{want,come,along,with}	009_05.mp3	009_05.mp3	009_05.mp3	009_05.mp3	009_05.mp3
107	1	9	6	short	내가 너희 둘 자리 마련해 줄까?	Do you want me to set you two up on a date?	\N	\N	\N	\N	{want,set,up,date}	009_06.mp3	009_06.mp3	009_06.mp3	009_06.mp3	009_06.mp3
108	2	9	7	dialogue	\N	\N	지금 역에서 걸어가고 있는데요. 커피 사다 드릴까요?	I'm walking from the station. Would you like me to pick up any coffee?	\N	\N	{walking,pick,up,coffee}	009_07.mp3	009_07.mp3	009_07.mp3	009_07.mp3	009_07.mp3
109	2	9	8	dialogue	\N	\N	\N	\N	좋습니다. 고마워요.	That would be great. Thanks!	{would,great,thanks}	009_08.mp3	009_08.mp3	009_08.mp3	009_08.mp3	009_08.mp3
110	2	9	9	dialogue	\N	\N	아직 다 하지는 못했는데, 지금까지 작업한 거 보내 드릴까요?.	I'm not done yet, but would you like me to send you what I have so far?	\N	\N	{done,send,have,far}	009_09.mp3	009_09.mp3	009_09.mp3	009_09.mp3	009_09.mp3
215	3	17	13	long	친애하는 Johnson 씨에게, 계약 갱신 논의를 위해 제안하신 시간들을 죽 한번 봤습니다. 안타깝게도 제안하신 날짜에는 저희가 안 됩니다. 저희가 다른 가능한 날짜들을 추합해서 첨부했습니다. 적어도 이 중 하루가 가능하기를 바랍니다.	Dear Mr. Johnson, We've looked over the proposed times for discussing contract renewal, and I'm afraid that none of the dates you suggested would work for us. Attached is a list of alternative dates we have put together. I hope that at least one of them is acceptable.	\N	\N	\N	\N	{contract,renewal,dates,alternative,acceptable}	017_13.mp3	017_13.mp3	017_13.mp3	017_13.mp3	017_13.mp3
250	2	20	12	dialogue	\N	\N	\N	\N	미안해. 일 때문에 너무 바빴어.	I'm sorry, I've just been busy with work.	{sorry,busy,work}	020_12.mp3	020_12.mp3	020_12.mp3	020_12.mp3	020_12.mp3
216	1	18	1	short	말이 나왔으니 말인데, 어젯밤에 너랑 Nicole 사이에 무슨 일이 있었던거야?	Speaking of which, what happened with you and Nicole last night?	\N	\N	\N	\N	{speaking,happened,nicole,night}	018_01.mp3	018_01.mp3	018_01.mp3	018_01.mp3	018_01.mp3
217	1	18	2	short	돈 이야기가 나왔으니 말인데, 너한테 십만 원 갚을 거 있어.	Speaking of money, I owe you 100,000 won.	\N	\N	\N	\N	{speaking,money,owe}	018_02.mp3	018_02.mp3	018_02.mp3	018_02.mp3	018_02.mp3
218	1	18	3	short	날씨 이야기가 나왔으니 말인데, 이번 가을은 유난히 따뜻했어. 그렇지?	Speaking of the weather, this autumn was unusually warm, wasn't it?	\N	\N	\N	\N	{speaking,weather,autumn,warm}	018_03.mp3	018_03.mp3	018_03.mp3	018_03.mp3	018_03.mp3
219	1	18	4	short	장보는 이야기가 나왔으니 말인데, 신촌역 부근에 대형 마트가 생겼다는 거 들었어요?	Speaking of grocery shopping, did you hear that there's this new megastore near Shinchon Station?	\N	\N	\N	\N	{speaking,grocery,megastore,shinchon}	018_04.mp3	018_04.mp3	018_04.mp3	018_04.mp3	018_04.mp3
326	1	27	2	short	시간이 몇 시인데 안 자고 뭐해?	What are you doing up at this hour?	\N	\N	\N	\N	{doing,hour}	027_02.mp3	027_02.mp3	027_02.mp3	027_02.mp3	027_02.mp3
174	2	14	9	dialogue	\N	\N	터치스크린이 딸린 기기에는 익숙하지 않은 것 같네, 그렇지?	It looks like you're not used to devices with a touch screen, right?	\N	\N	{devices,touch,screen}	014_09.mp3	014_09.mp3	014_09.mp3	014_09.mp3	014_09.mp3
59	2	5	7	dialogue	\N	\N	\N	\N	전혀 문제없습니다. 좋은 코치가 될 자질을 갖춘 분이라 믿어 의심하지 않습니다.	I don't mind at all. I totally believe he has what it takes to be a good coach.	{believe,coach,takes,mind}	005_07.mp3	005_07.mp3	005_07.mp3	005_07.mp3	005_07.mp3
454	2	37	8	dialogue	\N	\N	\N	\N	좋지! 별일 없어.	Sure! I've got nothing going on.	{sure,nothing,going}	037_08.mp3	037_08.mp3	037_08.mp3	037_08.mp3	037_08.mp3
60	2	5	8	dialogue	\N	\N	저녁 먹고 우리 집에 가서 <컨저링> 볼까 하는데. 공포 영화 어때?	After dinner, I was thinking we could go to my place and watch The Conjuring. How do you feel about horror movies?	\N	\N	{horror,movies,feel,watch}	005_08.mp3	005_08.mp3	005_08.mp3	005_08.mp3	005_08.mp3
61	2	5	9	dialogue	\N	\N	\N	\N	싫어, 공포 영화는 못 보겠어. 무서운 거 보는 게 뭐가 재밌다고.	No, I can't stand horror movies! Watching something scary isn't my idea of fun.	{stand,horror,scary,fun}	005_09.mp3	005_09.mp3	005_09.mp3	005_09.mp3	005_09.mp3
111	2	9	10	dialogue	\N	\N	\N	\N	고마워요. 그러면 언제까지 완성할 수 있을 것 같아요?	Thanks. So, when do you think you will be able to complete the materials?	{when,able,complete,materials}	009_10.mp3	009_10.mp3	009_10.mp3	009_10.mp3	009_10.mp3
113	2	9	12	dialogue	\N	\N	\N	\N	말만이라도 고맙다, 내 딸.	Thanks for offering, Sweetie.	{thanks,offering,sweetie}	009_12.mp3	009_12.mp3	009_12.mp3	009_12.mp3	009_12.mp3
115	1	10	1	short	가격대는 어느 정도 생각하세요?	What price range do you have in mind?	\N	\N	\N	\N	{price,range,have,mind}	010_01.mp3	010_01.mp3	010_01.mp3	010_01.mp3	010_01.mp3
62	3	5	10	long	Greg Cho님께. 안녕하세요. 회계팀 Harold입니다. 그 쪽 팀장님인 Frank가 제게 연락해서 자기네 팀으로 오면 어떨까 하는 제안을 하더군요. Frank 팀장님 밑에서 일하니까 어떤가요? 그 팀으로의 이동 제안을 진지하게 고민해보기 전에 우선 당신의 경험을 듣고 싶습니다.	Dear Greg Cho. This is Harold over in Accounting. I'm writing because your manager, Frank, contacted me and asked me to move to your team. How do you feel about working under Frank? I want to hear about your experience before I really consider his transfer offer.	\N	\N	\N	\N	{working,over,transfer,experience}	005_10.mp3	005_10.mp3	005_10.mp3	005_10.mp3	005_10.mp3
63	1	6	1	short	재충전에는 캠핑만 한 게 없죠.	There is nothing like camping to recharge your batteries.	\N	\N	\N	\N	{nothing,camping,recharge,batteries}	006_01.mp3	006_01.mp3	006_01.mp3	006_01.mp3	006_01.mp3
64	1	6	2	short	안 좋았던 한 주를 날려 버리려면 친구들과 맛있는 식사를 하는 게 최고지.	There's nothing like a nice meal with friends to turn a bad week around.	\N	\N	\N	\N	{nothing,meal,friends,turn}	006_02.mp3	006_02.mp3	006_02.mp3	006_02.mp3	006_02.mp3
65	1	6	3	short	주말 내내 넷플릭스 드라마 보는 게 최고야.	There's nothing like binging a show on Netflix all weekend.	\N	\N	\N	\N	{nothing,binging,Netflix,weekend}	006_03.mp3	006_03.mp3	006_03.mp3	006_03.mp3	006_03.mp3
134	2	11	7	dialogue	\N	\N	\N	\N	너무 과하지 않아? 앞으로 눈만 더 높아질거야.	Isn't it a bit much? You're only going to spoil her.	{bit,much,spoil,going}	011_07.mp3	011_07.mp3	011_07.mp3	011_07.mp3	011_07.mp3
116	1	10	2	short	주연 배우로 생각하고 있는 분 있으신지요?	Do you have any actor in mind for the lead role?	\N	\N	\N	\N	{have,actor,mind,lead}	010_02.mp3	010_02.mp3	010_02.mp3	010_02.mp3	010_02.mp3
220	1	18	5	short	아, Teri 이야기가 나왔으니 말인데, 어떻게 지냈대? 새 아파트는 구했대?	Oh, speaking of Teri, how has she been? Has she found a new apartment?	\N	\N	\N	\N	{speaking,teri,apartment}	018_05.mp3	018_05.mp3	018_05.mp3	018_05.mp3	018_05.mp3
221	2	18	7	dialogue	\N	\N	내가 교수님에게 상황을 다 설명했더니, 기말시험 하루 늦게 보게 해 주시는 데 동의하셨어.	So, after explaining everything to the professor, he agreed to let me take the final a day late.	\N	\N	{explaining,professor,agreed,final}	018_07.mp3	018_07.mp3	018_07.mp3	018_07.mp3	018_07.mp3
117	1	10	3	short	괜찮은 소고깃집 생각해 둔 데 있어?	Do you have any good beef place in mind?	\N	\N	\N	\N	{have,beef,place,mind}	010_03.mp3	010_03.mp3	010_03.mp3	010_03.mp3	010_03.mp3
223	2	18	9	dialogue	\N	\N	오늘 Karen 옷 입은 거 봤어? 회사에서 입기엔 좀 그렇지 않아?	Did you see what Karen is wearing today? Is it really appropriate for the office?	\N	\N	{karen,wearing,appropriate,office}	018_09.mp3	018_09.mp3	018_09.mp3	018_09.mp3	018_09.mp3
53	1	5	1	short	중고차 같은 중고 물품 사는 거 어떻게 생각하세요?	How do you feel about buying something second-hand, like a used car?	\N	\N	\N	\N	{second-hand,buying,used,feel}	005_01.mp3	005_01.mp3	005_01.mp3	005_01.mp3	005_01.mp3
54	1	5	2	short	중매업체에 등록해 보는 게 어때요?	How do you feel about signing up for a matchmaking service?	\N	\N	\N	\N	{signing,matchmaking,service,feel}	005_02.mp3	005_02.mp3	005_02.mp3	005_02.mp3	005_02.mp3
55	1	5	3	short	교회에 가 보는 게 어때요?	How do you feel about going to church?	\N	\N	\N	\N	{going,church,feel}	005_03.mp3	005_03.mp3	005_03.mp3	005_03.mp3	005_03.mp3
56	1	5	4	short	등산 모임에 가입해 보는 게 어때요?	How do you feel about joining a hiking club?	\N	\N	\N	\N	{joining,hiking,club,feel}	005_04.mp3	005_04.mp3	005_04.mp3	005_04.mp3	005_04.mp3
57	1	5	5	short	성형수술 하는 거 어떻게 생각하세요?	How do you feel about plastic surgery?	\N	\N	\N	\N	{plastic,surgery,feel}	005_05.mp3	005_05.mp3	005_05.mp3	005_05.mp3	005_05.mp3
58	2	5	6	dialogue	\N	\N	코치가 전 동료였는데, 그런 팀에 합류하는 기분이 어떠신가요?	How do you feel about joining a team when the coach is your ex-teammate?	\N	\N	{joining,team,coach,ex-teammate}	005_06.mp3	005_06.mp3	005_06.mp3	005_06.mp3	005_06.mp3
87	2	7	12	dialogue	\N	\N	\N	\N	음, 이따가 약속이 있긴 한데, 얼굴 정도는 비출 수 있어.	Well, I have plans later, but I am down to stop by at least to say hello.	{plans,down,stop,hello}	007_12.mp3	007_12.mp3	007_12.mp3	007_12.mp3	007_12.mp3
71	2	6	9	dialogue	\N	\N	내가 좀 지쳐 보인다면 미안. 남자친구랑 잠시 안 보기로 했거든. 근데 정말 보고 싶어.	Sorry if I seem a little depressed. My boyfriend and I decided to take a little break. I really miss him.	\N	\N	{depressed,boyfriend,break,miss}	006_09.mp3	006_09.mp3	006_09.mp3	006_09.mp3	006_09.mp3
72	2	6	10	dialogue	\N	\N	\N	\N	아, 그랬구나. 그럼 쇼핑하러 가자. 내가 널 알잖아. 기분 전환에는 옷 사는 게 최고야.	Aww, I'm sorry. Come on, let's go shopping. I know you. There's nothing like buying clothes to cheer you up.	{nothing,shopping,clothes,cheer}	006_10.mp3	006_10.mp3	006_10.mp3	006_10.mp3	006_10.mp3
73	2	6	11	dialogue	\N	\N	어서 집에 가고 싶어. 남편이 특별한 음식을 해 준다고 했거든.	I can't wait to get home. My husband said he would cook something special for me.	\N	\N	{wait,home,cook,special}	006_11.mp3	006_11.mp3	006_11.mp3	006_11.mp3	006_11.mp3
74	2	6	12	dialogue	\N	\N	\N	\N	오, 멋지다! 힘든 하루를 보낸 후에는 기운을 차리는 데 집밥만 한 게 없지.	Oh, that's perfect then! There's nothing like a home-cooked meal to lift your spirits after a long day.	{nothing,home-cooked,meal,spirits}	006_12.mp3	006_12.mp3	006_12.mp3	006_12.mp3	006_12.mp3
76	1	7	1	short	너무 매운 것만 아니면 뭐든 다 좋아요.	I'm up for anything, as long as it's not too spicy.	\N	\N	\N	\N	{up,anything,spicy,long}	007_01.mp3	007_01.mp3	007_01.mp3	007_01.mp3	007_01.mp3
77	1	7	2	short	미슐랭 스타를 받은 음식이라면 뭐든 좋아.	I'm up for anything with a Michelin star.	\N	\N	\N	\N	{up,anything,Michelin,star}	007_02.mp3	007_02.mp3	007_02.mp3	007_02.mp3	007_02.mp3
78	1	7	3	short	뭐 하고 싶어? 난 뭐든 다 좋아.	What do you feel like doing? I'd be up for just about anything.	\N	\N	\N	\N	{feel,up,anything,doing}	007_03.mp3	007_03.mp3	007_03.mp3	007_03.mp3	007_03.mp3
79	1	7	4	short	나 비어퐁 파트너 찾고 있는데. 관심 있어?	I'm looking for a beer pong partner. Are you down?	\N	\N	\N	\N	{looking,beer,pong,down}	007_04.mp3	007_04.mp3	007_04.mp3	007_04.mp3	007_04.mp3
80	1	7	5	short	나 프라이드 치킨이 무지 먹고 싶어. 오늘 밤에 같이 먹을 사람?	I've been craving fried chicken. Is anyone down for some tonight?	\N	\N	\N	\N	{craving,fried,chicken,down}	007_05.mp3	007_05.mp3	007_05.mp3	007_05.mp3	007_05.mp3
81	1	7	6	short	토요일 아침에 북한산 등산 갈까 하는데 같이 갈 사람이 필요해. 관심 있을까?	I was thinking of hiking Bukhan Mountain on Saturday morning, and I need a buddy.	\N	\N	\N	\N	{hiking,thinking,Mountain,buddy}	007_06.mp3	007_06.mp3	007_06.mp3	007_06.mp3	007_06.mp3
82	2	7	7	dialogue	\N	\N	오늘 저녁에 뭐 먹고 싶어?	What do you want to have tonight?	\N	\N	{want,have,tonight}	007_07.mp3	007_07.mp3	007_07.mp3	007_07.mp3	007_07.mp3
84	2	7	9	dialogue	\N	\N	안녕 애들아, 나랑 고든 램지 버거 먹으러 갈 사람 있을까?	Hey guys, anyone want to go with me to try Gordon Ramsay's burger place?	\N	\N	{want,try,place,burger}	007_09.mp3	007_09.mp3	007_09.mp3	007_09.mp3	007_09.mp3
85	2	7	10	dialogue	\N	\N	\N	\N	나 갈게! 네가 산다면 말이야.	I'm down as long as you're paying.	{down,long,paying}	007_10.mp3	007_10.mp3	007_10.mp3	007_10.mp3	007_10.mp3
89	1	8	1	short	오늘 몸이 좀 안 좋아요.	I don't feel quite right today.	\N	\N	\N	\N	{feel,quite,right,today}	008_01.mp3	008_01.mp3	008_01.mp3	008_01.mp3	008_01.mp3
90	1	8	2	short	나도 가고는 싶은데, 오늘 몸이 좀 안 좋아.	I wish I could come, but I don't feel quite right today.	\N	\N	\N	\N	{wish,feel,quite,right}	008_02.mp3	008_02.mp3	008_02.mp3	008_02.mp3	008_02.mp3
91	1	8	3	short	저녁을 같이 못할 것 같습니다. 오늘 몸이 좀 안 좋네요.	I'm afraid I can't join you for dinner. I don't feel quite right today.	\N	\N	\N	\N	{afraid,join,feel,right}	008_03.mp3	008_03.mp3	008_03.mp3	008_03.mp3	008_03.mp3
92	1	8	4	short	여보, 나 오늘은 몸이 좀 안 좋아. 수진이 학교에서 좀 데려와 줄래?	Honey, I don't feel quite right today. Can you pick up Sujin from school?	\N	\N	\N	\N	{feel,right,pick,school}	008_04.mp3	008_04.mp3	008_04.mp3	008_04.mp3	008_04.mp3
192	1	16	1	short	이 티셔츠 너한테 잘 어울려.	This t-shirt looks good on you.	\N	\N	\N	\N	{t-shirt,looks,good}	016_01.mp3	016_01.mp3	016_01.mp3	016_01.mp3	016_01.mp3
193	1	16	2	short	이 옷 너한테 잘 어울린다.	This outfit looks good on you.	\N	\N	\N	\N	{outfit,looks,good}	016_02.mp3	016_02.mp3	016_02.mp3	016_02.mp3	016_02.mp3
195	1	16	4	short	안경이 비싸다고 잘 어울리는 건 아닙니다.	Just because glasses are expensive, that doesn't mean they would look good on you.	\N	\N	\N	\N	{glasses,expensive,look,good}	016_04.mp3	016_04.mp3	016_04.mp3	016_04.mp3	016_04.mp3
196	1	16	5	short	처음 이 모자를 봤을 때 남자 친구가 쓰면 잘 어울리겠다고 생각했어요.	When I first looked at this hat, I thought 'That would look good on my boyfriend'.	\N	\N	\N	\N	{hat,look,good,boyfriend}	016_05.mp3	016_05.mp3	016_05.mp3	016_05.mp3	016_05.mp3
301	1	25	3	short	(파티에서 친구에게) 재미있다니 다행이네.	I'm glad you are enjoying it.	\N	\N	\N	\N	{glad,enjoying}	025_03.mp3	025_03.mp3	025_03.mp3	025_03.mp3	025_03.mp3
70	2	6	8	dialogue	\N	\N	\N	\N	좋지! 네가 산다면.	Sure! As long as you're buying.	{sure,long,buying}	006_08.mp3	006_08.mp3	006_08.mp3	006_08.mp3	006_08.mp3
99	2	8	11	dialogue	\N	\N	오늘 밤에 우리 밖에 나가 놀기로 한 건 아는데, 오늘 뭔가 몸이 좀 이상해.	I know we're supposed to go out tonight, but I don't feel quite right today.	\N	\N	{supposed,out,feel,right}	008_11.mp3	008_11.mp3	008_11.mp3	008_11.mp3	008_11.mp3
100	2	8	12	dialogue	\N	\N	\N	\N	이런, 괜찮은 거야? 그냥 음식 포장해 와서 집에서 영화 보면서 쉬는 건 어때?	Oh, no. Are you okay? How about we get takeout and rest at home with a movie instead?	{okay,takeout,rest,movie}	008_12.mp3	008_12.mp3	008_12.mp3	008_12.mp3	008_12.mp3
102	1	9	1	short	저 지금 스타벅스인데 커피 사다 드릴까요?	Would you like me to grab you some coffee while I'm at Starbucks?	\N	\N	\N	\N	{like,grab,coffee,Starbucks}	009_01.mp3	009_01.mp3	009_01.mp3	009_01.mp3	009_01.mp3
103	1	9	2	short	제가 첫 번째 문장을 읽을까요?	Would you like me to read the first sentence?	\N	\N	\N	\N	{like,read,first,sentence}	009_02.mp3	009_02.mp3	009_02.mp3	009_02.mp3	009_02.mp3
104	1	9	3	short	제가 일어난 김에 물 좀 가져다드릴까요?	Would you like me to get you some water while I'm up?	\N	\N	\N	\N	{like,get,water,up}	009_03.mp3	009_03.mp3	009_03.mp3	009_03.mp3	009_03.mp3
118	1	10	4	short	딱히 염두해 둔 차는 없습니다. 상태만 좋으면 뭐라도 사겠습니다.	I don't really have any car in mind. I will go with pretty much anything as long as it's in good shape.	\N	\N	\N	\N	{have,car,mind,shape}	010_04.mp3	010_04.mp3	010_04.mp3	010_04.mp3	010_04.mp3
119	1	10	5	short	틀별히 염두해 둔 건 없습니다.	I have nothing particular in mind.	\N	\N	\N	\N	{have,nothing,particular,mind}	010_05.mp3	010_05.mp3	010_05.mp3	010_05.mp3	010_05.mp3
121	2	10	7	dialogue	\N	\N	가격대는 어느 정도 생각하세요?	What price range do you have in mind?	\N	\N	{price,range,have,mind}	010_07.mp3	010_07.mp3	010_07.mp3	010_07.mp3	010_07.mp3
197	1	16	6	short	저 여자는 어떻게 저 옷을 소화할까? 저걸 내가 입으면 어울릴까?	How does she pull that off? Would it look good on me?	\N	\N	\N	\N	{pull,off,look,good}	016_06.mp3	016_06.mp3	016_06.mp3	016_06.mp3	016_06.mp3
198	2	16	7	dialogue	\N	\N	안녕하세요. 모자를 보다가 이게 눈에 띄어서요. 할인 중인가요?	Hi, there. I'm looking for a new hat, and this one caught my eye. Is it on sale?	\N	\N	{looking,hat,caught,sale}	016_07.mp3	016_07.mp3	016_07.mp3	016_07.mp3	016_07.mp3
199	2	16	8	dialogue	\N	\N	\N	\N	아닙니다, 손님. 할인하는 제품은 아닌데, 잘 어울리시네요!	No, sir. I'm afraid it isn't, but it looks very good on you!	{afraid,looks,good}	016_08.mp3	016_08.mp3	016_08.mp3	016_08.mp3	016_08.mp3
200	2	16	9	dialogue	\N	\N	어떤 게 더 나아? 회색 카디건 아님 파란색?	Which fits me better, the grey cardigan or the blue one?	\N	\N	{fits,better,cardigan,blue}	016_09.mp3	016_09.mp3	016_09.mp3	016_09.mp3	016_09.mp3
95	2	8	7	dialogue	\N	\N	뭔지는 모르겠는데, 오늘 몸이 좀 안 좋아.	I'm not sure what it is, but I don't feel quite right today.	\N	\N	{sure,feel,quite,right}	008_07.mp3	008_07.mp3	008_07.mp3	008_07.mp3	008_07.mp3
96	2	8	8	dialogue	\N	\N	\N	\N	아침에 먹는 국에 문제가 있었을지도. 좀 심한 냄새가 났거든.	Maybe there was something wrong with that soup you had for breakfast. It smelled a little funny.	{wrong,soup,smelled,funny}	008_08.mp3	008_08.mp3	008_08.mp3	008_08.mp3	008_08.mp3
126	2	10	12	dialogue	\N	\N	\N	\N	몇 군데 생각하고 있는 곳이 있는데, 장시간 비행기 타고 괜찮아?	I have a few places in mind. Are you okey taking a long flight?	{have,places,mind,flight}	010_12.mp3	010_12.mp3	010_12.mp3	010_12.mp3	010_12.mp3
128	1	11	1	short	통변역대학원 진학을 고민하고 있어요.	I was thinking of going to translation grad school.	\N	\N	\N	\N	{thinking,going,translation,grad}	011_01.mp3	011_01.mp3	011_01.mp3	011_01.mp3	011_01.mp3
129	1	11	2	short	연휴 때 호주로 여행을 갈까 생각 중입니다.	I was thinking of traveling to Australia for the holiday.	\N	\N	\N	\N	{thinking,traveling,Australia,holiday}	011_02.mp3	011_02.mp3	011_02.mp3	011_02.mp3	011_02.mp3
130	1	11	3	short	오늘 저녁 약속 있어? 동료가 추천해준 피자 가게 가 볼까 하는데.	Do you already have dinner plans? I was thinking of trying a pizza place that my coworker recommended.	\N	\N	\N	\N	{thinking,trying,pizza,recommended}	011_03.mp3	011_03.mp3	011_03.mp3	011_03.mp3	011_03.mp3
131	1	11	4	short	다음 여행은 몽골을 생각 중이었는데, 안 가기로 했습니다.	I was thinking of Mongolia for my next trip, but I decided not to go.	\N	\N	\N	\N	{thinking,Mongolia,trip,decided}	011_04.mp3	011_04.mp3	011_04.mp3	011_04.mp3	011_04.mp3
132	1	11	5	short	제가 생각하던 가격대보다 조금 비싸네요. 게다가 거는 좀 더 기본형인 것을 생각하고 있었거든요.	It's a little out of my price range. Besides, I was thinking of going with something more basic.	\N	\N	\N	\N	{price,range,thinking,basic}	011_05.mp3	011_05.mp3	011_05.mp3	011_05.mp3	011_05.mp3
201	2	16	10	dialogue	\N	\N	\N	\N	둘 다 잘 어울려. 그냥 싼 걸로 사.	They both look good on you. I say just go with whatever's cheaper.	{look,good,cheaper}	016_10.mp3	016_10.mp3	016_10.mp3	016_10.mp3	016_10.mp3
202	2	16	11	dialogue	\N	\N	이 옷 어때? 사람들이 그러는데 내 피부색이 너무 어두워서 이런 핑크색은 안 어울린대.	How does this dress look? I've been told that my skin is too dark for pink stuff like this.	\N	\N	{dress,look,skin,pink}	016_11.mp3	016_11.mp3	016_11.mp3	016_11.mp3	016_11.mp3
203	2	16	12	dialogue	\N	\N	\N	\N	누가 그래? 너 핑크 엄청 잘 어울려.	Who told you that? You look great in pink.	{told,look,great,pink}	016_12.mp3	016_12.mp3	016_12.mp3	016_12.mp3	016_12.mp3
205	1	17	1	short	화요일 시간 괜찮으세요?	Does Tuesday work for you?	\N	\N	\N	\N	{tuesday,work}	017_01.mp3	017_01.mp3	017_01.mp3	017_01.mp3	017_01.mp3
206	1	17	2	short	사실 화요일이 더 좋습니다.	Tuesday works better for me, actually.	\N	\N	\N	\N	{tuesday,works,better}	017_02.mp3	017_02.mp3	017_02.mp3	017_02.mp3	017_02.mp3
207	1	17	3	short	수요일 괜찮은가요?	Does Wednesday work for you?	\N	\N	\N	\N	{wednesday,work}	017_03.mp3	017_03.mp3	017_03.mp3	017_03.mp3	017_03.mp3
208	1	17	4	short	제안 주신 날짜가 저희랑은 하나도 안 맞습니다.	None of the dates you proposed work for us.	\N	\N	\N	\N	{dates,proposed,work}	017_04.mp3	017_04.mp3	017_04.mp3	017_04.mp3	017_04.mp3
209	1	17	5	short	1시 이후에는 다 좋습니다.	Anytime after 1:00 pm would work for me.	\N	\N	\N	\N	{anytime,after,work}	017_05.mp3	017_05.mp3	017_05.mp3	017_05.mp3	017_05.mp3
210	1	17	6	short	일요일은 안 되지만, 토요일은 하루 종일 가능합니다.	Sunday doesn't work for me but I'm available all day Saturday.	\N	\N	\N	\N	{sunday,work,available,saturday}	017_06.mp3	017_06.mp3	017_06.mp3	017_06.mp3	017_06.mp3
211	2	17	7	dialogue	\N	\N	안녕, Mark. 반가워. 나는 월요일은 저녁 식사 무조건 가능해. 어때?	Hi, Mark. It's nice to hear from you. I'm down for dinner on Monday. What do you think?	\N	\N	{nice,dinner,monday,think}	017_07.mp3	017_07.mp3	017_07.mp3	017_07.mp3	017_07.mp3
212	2	17	8	dialogue	\N	\N	\N	\N	아, 월요일은 약속이 있어. 화요일이 더 나은데. 괜찮아?	Ah, I already have plans for Monday. Tuesday works better for me. Would that be alright?	{plans,tuesday,works,alright}	017_08.mp3	017_08.mp3	017_08.mp3	017_08.mp3	017_08.mp3
213	2	17	9	dialogue	\N	\N	최 선생님, 일요일 수업에 참석 못 할 것 같아요. 다른 날에 해도 될까요?	Mr. Choi, I'm afraid I won't be able to attend our class on Sunday. Could we meet another day?	\N	\N	{afraid,attend,class,sunday}	017_09.mp3	017_09.mp3	017_09.mp3	017_09.mp3	017_09.mp3
214	2	17	10	dialogue	\N	\N	\N	\N	저는 월요일부터 수요일까지 오후 시간은 다 괜찮아요. 어떤 요일이 제일 좋으세요?	I'm actually free every afternoon from Monday to Wednesday. What day works best for you?	{free,afternoon,monday,wednesday}	017_10.mp3	017_10.mp3	017_10.mp3	017_10.mp3	017_10.mp3
222	2	18	8	dialogue	\N	\N	\N	\N	이야기가 잘 돼서 다행이다. 근데, 스케줄 이야기가 나왔으니 말인데, 오늘 저녁 이탈리아 음식점 예약은 한 거야?	I'm glad things worked out for you. By the way, speaking of scheduling, did you make a reservation at the Italian place for dinner tonight?	{glad,worked,speaking,reservation}	018_08.mp3	018_08.mp3	018_08.mp3	018_08.mp3	018_08.mp3
124	2	10	10	dialogue	\N	\N	\N	\N	그건 문제가 되지 않아요. 전 포르쉐 외에는 살 생각이 없거든요.	It really doesn't matter. A Porsche is the only car I have in mind.	{matter,Porsche,only,mind}	010_10.mp3	010_10.mp3	010_10.mp3	010_10.mp3	010_10.mp3
125	2	10	11	dialogue	\N	\N	올해 여름휴가는 어디로 가고 싶어?	Where do you want to go for our summer vacation this year?	\N	\N	{where,want,summer,vacation}	010_11.mp3	010_11.mp3	010_11.mp3	010_11.mp3	010_11.mp3
229	1	19	4	short	너 올해는 단 하루도 안 쉬었구나.	You haven't even taken a single day off this year.	\N	\N	\N	\N	{taken,single,day,off}	019_04.mp3	019_04.mp3	019_04.mp3	019_04.mp3	019_04.mp3
230	1	19	5	short	Shawna가 다음주 초에는 출근을 안 합니다. 간단한 수술 후에 3일 휴가를 쓸 예정이라서요.	Shawna won't be here at the beginning of next week. She's taking three days off to recover after minor surgery.	\N	\N	\N	\N	{beginning,week,taking,off}	019_05.mp3	019_05.mp3	019_05.mp3	019_05.mp3	019_05.mp3
231	1	19	6	short	아산까지 가서 면접을 봅니다. 오후를 통째로 휴가를 내야 할 것같아요.	The interview is all the way in Asan. I'll have to take the whole afternoon off.	\N	\N	\N	\N	{interview,asan,take,afternoon}	019_06.mp3	019_06.mp3	019_06.mp3	019_06.mp3	019_06.mp3
232	2	19	7	dialogue	\N	\N	Hutchinson씨, 제가 어제부터 기침이 좀 나고 미열이 있습니다. 코로나 자가 진단 검사를 해 보니 음성이 나오긴 했는데요. 그래도 내일은 하루 쉴까 합니다.	Mr. Hutchinson. I've had a bit of a cough since yesterday and a slight fever. I took an at-home Covid test, which turned out negative, but I was still thinking of taking tomorrow off.	\N	\N	{cough,fever,covid,taking}	019_07.mp3	019_07.mp3	019_07.mp3	019_07.mp3	019_07.mp3
233	2	19	8	dialogue	\N	\N	\N	\N	안녕하세요. Steve. 괜찮습니다. 미리 알려줘서 고마워요.	Hi, Steve. That will be fine. Thank you for letting me know in advance.	{fine,thank,advance}	019_08.mp3	019_08.mp3	019_08.mp3	019_08.mp3	019_08.mp3
234	2	19	9	dialogue	\N	\N	나 커피 좀 더 마셔야 할 것 같아. 자꾸 졸려서. 아기 본다고 계속 바빴거든.	I think I'll need even more coffee. I can barely stay awake. I've been so busy taking care of the baby.	\N	\N	{coffee,barely,awake,baby}	019_09.mp3	019_09.mp3	019_09.mp3	019_09.mp3	019_09.mp3
235	2	19	10	dialogue	\N	\N	\N	\N	그럴만도 하지. 당분간 좀 쉬어야겠다.	That makes sense. Maybe you should take some time off.	{makes,sense,take,off}	019_10.mp3	019_10.mp3	019_10.mp3	019_10.mp3	019_10.mp3
236	2	19	11	dialogue	\N	\N	우리 회사에서는 매년 한 달여간 유급 휴가를 쓸 수 있어.	I can take over a month of paid time off each year in my job.	\N	\N	{take,month,paid,off}	019_11.mp3	019_11.mp3	019_11.mp3	019_11.mp3	019_11.mp3
237	2	19	12	dialogue	\N	\N	\N	\N	우와. 혹시 너희 회사에 자리 있을까?	Wow. Does your company have any openings?	{company,openings}	019_12.mp3	019_12.mp3	019_12.mp3	019_12.mp3	019_12.mp3
239	1	20	1	short	제가 논문쓰느라 바쁩니다.	I'm busy working on my dissertation.	\N	\N	\N	\N	{busy,working,dissertation}	020_01.mp3	020_01.mp3	020_01.mp3	020_01.mp3	020_01.mp3
240	1	20	2	short	워크숍 준비하느라 바쁩니다.	I'm busy getting ready for the workshop.	\N	\N	\N	\N	{busy,getting,ready,workshop}	020_02.mp3	020_02.mp3	020_02.mp3	020_02.mp3	020_02.mp3
241	1	20	3	short	공부하느라 요새 무척 바쁩니다.	I've been busy with my studies.	\N	\N	\N	\N	{busy,studies}	020_03.mp3	020_03.mp3	020_03.mp3	020_03.mp3	020_03.mp3
242	1	20	4	short	제가 곧 이사해서 요즘 엄청 바쁩니다.	I've been super busy with my upcoming move.	\N	\N	\N	\N	{super,busy,upcoming,move}	020_04.mp3	020_04.mp3	020_04.mp3	020_04.mp3	020_04.mp3
243	1	20	5	short	나 행정 업무 하느라 무지 바빠.	I'm busy with all this admin work!	\N	\N	\N	\N	{busy,admin,work}	020_05.mp3	020_05.mp3	020_05.mp3	020_05.mp3	020_05.mp3
244	1	20	6	short	학교 다닐 때 과제다, 학원이다, 방과 후 활동이다 해서 잠시도 저희를 가만두지 않았죠.	When I was in school, they would always keep us busy with homework, academies, and after-school activities.	\N	\N	\N	\N	{school,keep,busy,homework}	020_06.mp3	020_06.mp3	020_06.mp3	020_06.mp3	020_06.mp3
245	2	20	7	dialogue	\N	\N	Daniel은 늘 피곤하다고 해.	Daniel is always saying that he is tired.	\N	\N	{daniel,always,saying,tired}	020_07.mp3	020_07.mp3	020_07.mp3	020_07.mp3	020_07.mp3
246	2	20	8	dialogue	\N	\N	\N	\N	음, 이해돼. 동시에 책 두 권을 작업하느라 많이 바쁘니까.	Well, that makes sense. He's so busy working on two books at the same time.	{makes,sense,busy,books}	020_08.mp3	020_08.mp3	020_08.mp3	020_08.mp3	020_08.mp3
247	2	20	9	dialogue	\N	\N	안녕하세요, Samantha. 어떻게 지내는지 안부 궁금해서 연락드려요.	Hi, Samantha. I'm just checking in to see if you're doing okay.	\N	\N	{checking,see,doing,okay}	020_09.mp3	020_09.mp3	020_09.mp3	020_09.mp3	020_09.mp3
249	2	20	11	dialogue	\N	\N	어떻게 지냈어, Julie? 문자 보냈는데 답도 없더라.	How are you, Julie? You know, you never texted me back.	\N	\N	{julie,never,texted,back}	020_11.mp3	020_11.mp3	020_11.mp3	020_11.mp3	020_11.mp3
302	1	25	4	short	오늘 아침 발표를 잘했다니 다행입니다.	I'm glad your presentation went well this morning.	\N	\N	\N	\N	{glad,presentation,went,morning}	025_04.mp3	025_04.mp3	025_04.mp3	025_04.mp3	025_04.mp3
227	1	19	2	short	너 진짜 당분간 일 좀 쉬어야해.	I think you really need to take some time off from work.	\N	\N	\N	\N	{take,time,off,work}	019_02.mp3	019_02.mp3	019_02.mp3	019_02.mp3	019_02.mp3
228	1	19	3	short	John, 제가 오후에 반차를 좀 내도 될까요? 편두통이 오는 것 같아서요.	John, do you mind if I take the afternoon off? I think I'm getting a migraine.	\N	\N	\N	\N	{take,afternoon,off,migraine}	019_03.mp3	019_03.mp3	019_03.mp3	019_03.mp3	019_03.mp3
254	1	21	3	short	이 케이크 너무 달다고 그랬나? 안 그런 것같은데.	You said the cake is too sweet? I don't see it that way.	\N	\N	\N	\N	{cake,sweet,see,way}	021_03.mp3	021_03.mp3	021_03.mp3	021_03.mp3	021_03.mp3
255	1	21	4	short	많은 사람들이 부동산 가격이 계속 하락할 거라고 생각하지만 제 생각은 다릅니다.	Many people believe that real estate prices will keep falling, but I don't see it that way.	\N	\N	\N	\N	{believe,real,estate,falling}	021_04.mp3	021_04.mp3	021_04.mp3	021_04.mp3	021_04.mp3
256	1	21	5	short	일부 언론에서는 Elon Musk가 트위터를 망치고 있다고 하는데, 제 생각은 다릅니다.	Some news agencies claim that Elon Musk is ruining Twitter, but I don't see it that way.	\N	\N	\N	\N	{news,elon,musk,twitter}	021_05.mp3	021_05.mp3	021_05.mp3	021_05.mp3	021_05.mp3
257	1	21	6	short	좋은 예문이긴 한데 출판사 생각은 다를 거라는 게 문제죠.	I think that's a great example, but the thing is, I don't think the publisher is going to see it that way.	\N	\N	\N	\N	{great,example,publisher,see}	021_06.mp3	021_06.mp3	021_06.mp3	021_06.mp3	021_06.mp3
258	2	21	7	dialogue	\N	\N	우리 부모님은 늘 이렇게 가르치셨어. 노숙자를 도와주면 상황이 더 나빠진다고.	My parents always taught me supporting the homeless makes problems worse.	\N	\N	{parents,taught,homeless,worse}	021_07.mp3	021_07.mp3	021_07.mp3	021_07.mp3	021_07.mp3
259	2	21	8	dialogue	\N	\N	\N	\N	나는 좀 생각이 다른데. 그들을 도와주면 그들의 삶이 더 나아질거야.	I don't really see it that way. Supporting them could change their lives for the better.	{see,supporting,change,better}	021_08.mp3	021_08.mp3	021_08.mp3	021_08.mp3	021_08.mp3
260	2	21	9	dialogue	\N	\N	요즘 한국 출산율이 너무 낮아. 가정을 꾸리기에 알맞은 집을 마련하는 걸 감당할 수 없어서 그렇다고 봐. 좋은 집이 없으면, 어떻게 애들을 키우겠어?	The birth rate in Korea is so low these days. I really think it's because people can't afford a proper house for a family. Without a good home, how could you raise kids?	\N	\N	{birth,rate,afford,house}	021_09.mp3	021_09.mp3	021_09.mp3	021_09.mp3	021_09.mp3
261	2	21	10	dialogue	\N	\N	\N	\N	좋은 지적이긴 한데, 내 생각은 좀 달라. 교육비가 너무 많이 들기 때문이라고 생각해.	That's a good point, but I don't see it that way. I think it's because the cost of educating kids is too expensive.	{good,point,see,educating}	021_10.mp3	021_10.mp3	021_10.mp3	021_10.mp3	021_10.mp3
263	1	22	1	short	저한테는 좀 부담스러운 금액이었어요.	It was something I could barely afford.	\N	\N	\N	\N	{something,barely,afford}	022_01.mp3	022_01.mp3	022_01.mp3	022_01.mp3	022_01.mp3
264	1	22	2	short	제 월급으로 그 차를 살 수 있을지 모르겠네요.	I'm not sure if I can afford that car on my salary.	\N	\N	\N	\N	{afford,car,salary}	022_02.mp3	022_02.mp3	022_02.mp3	022_02.mp3	022_02.mp3
265	1	22	3	short	TV 큰 걸로 하자. 감당할 수 있어.	Let's go with a bigger TV. We can afford it.	\N	\N	\N	\N	{bigger,tv,afford}	022_03.mp3	022_03.mp3	022_03.mp3	022_03.mp3	022_03.mp3
266	1	22	4	short	외식할 형편이 안됩니다.	We can't afford to eat out.	\N	\N	\N	\N	{afford,eat,out}	022_04.mp3	022_04.mp3	022_04.mp3	022_04.mp3	022_04.mp3
267	1	22	5	short	강남에 살 형편이 안됩니다.	I just can't afford to live in Gangnam.	\N	\N	\N	\N	{afford,live,gangnam}	022_05.mp3	022_05.mp3	022_05.mp3	022_05.mp3	022_05.mp3
268	1	22	6	short	저희가 귀사의 서비스료를 감당하기가 힘들 것 같습니다.	I'm afraid we can't afford your fees.	\N	\N	\N	\N	{afraid,afford,fees}	022_06.mp3	022_06.mp3	022_06.mp3	022_06.mp3	022_06.mp3
269	2	22	7	dialogue	\N	\N	폭스바겐 비틀을 갖는게 평생소원이었어. 이제 한 대 살 수 있을 줄 알았는데, 보니까 내가 감당하기 힘들 것 같다.	I've wanted to get a Volkswagen Beetle my whole life. I thought I could get one now, but it looks like it's more than I can afford.	\N	\N	{volkswagen,beetle,thought,afford}	022_07.mp3	022_07.mp3	022_07.mp3	022_07.mp3	022_07.mp3
270	2	22	8	dialogue	\N	\N	\N	\N	우선 돈을 모으고 몇 년 있다가 한 대 사. 아니면 꼭 갖고 싶으면 할부로 해. 너의 드림카잖아.	Start saving and buy one after a few years. Or pay it in installments if you really want it. It's your dream car.	{saving,years,installments,dream}	022_08.mp3	022_08.mp3	022_08.mp3	022_08.mp3	022_08.mp3
271	2	22	9	dialogue	\N	\N	매달 옷 사는데 돈을 그렇게나 많이 쓰다니!	I can't believe how much money you spend on clothes every month!	\N	\N	{believe,money,spend,clothes}	022_09.mp3	022_09.mp3	022_09.mp3	022_09.mp3	022_09.mp3
272	2	22	10	dialogue	\N	\N	\N	\N	응, 나도 무리하는 거야. 빚이 산더미야.	Yeah, I can't really afford it. I'm deeply in debt.	{afford,deeply,debt}	022_10.mp3	022_10.mp3	022_10.mp3	022_10.mp3	022_10.mp3
252	1	21	1	short	제 생각은 좀 다릅니다.	I don't see it that way.	\N	\N	\N	\N	{see,way}	021_01.mp3	021_01.mp3	021_01.mp3	021_01.mp3	021_01.mp3
253	1	21	2	short	그 친구는 저희가 진지하게 사귀는 관계인 줄 아는데, 저는 안 그렇거든요.	She thinks we are in a serious relationship, but I don't see it that way.	\N	\N	\N	\N	{thinks,serious,relationship,see}	021_02.mp3	021_02.mp3	021_02.mp3	021_02.mp3	021_02.mp3
277	1	23	4	short	제철이 아닌 과일이나 채소는 늘 너무 비싸요.	Out-of-season fruit and vegetables are always out of my price range.	\N	\N	\N	\N	{season,fruit,vegetables,price}	023_04.mp3	023_04.mp3	023_04.mp3	023_04.mp3	023_04.mp3
279	2	23	7	dialogue	\N	\N	이 키보드에 관심 있는데요, 삼십만원은 조금 비싸네요. 혹시 조금 깎아 주실 수 있는지요.	I'm interested in the keyboard but 300,000 won is a bit out of my price range. Could you go any lower?	\N	\N	{interested,keyboard,price,lower}	023_07.mp3	023_07.mp3	023_07.mp3	023_07.mp3	023_07.mp3
280	2	23	8	dialogue	\N	\N	\N	\N	어느 정도 생각하셨는데요?	How much lower were you thinking?	{how,lower,thinking}	023_08.mp3	023_08.mp3	023_08.mp3	023_08.mp3	023_08.mp3
281	2	23	9	dialogue	\N	\N	저희 제품들은 모두 특별히 덴마크에서 수입해요. 이건 천만원이에요.	All of our selections are specially imported from Denmark. This one is 10 million won.	\N	\N	{selections,imported,denmark,million}	023_09.mp3	023_09.mp3	023_09.mp3	023_09.mp3	023_09.mp3
282	2	23	10	dialogue	\N	\N	\N	\N	아, 제 예산보다 훨씬 비싸군요. 좀 더 저렴한 건 없나요?	Oh, That's way out of my price range. Do you have anything cheaper?	{way,price,range,cheaper}	023_10.mp3	023_10.mp3	023_10.mp3	023_10.mp3	023_10.mp3
283	2	23	11	dialogue	\N	\N	매물로 나온 것을 보기 전에, 우선 생각하고 있는 금액대를 물어봐도 될까요?	Before we get started looking at what's available, can I ask your price range?	\N	\N	{before,started,available,price}	023_11.mp3	023_11.mp3	023_11.mp3	023_11.mp3	023_11.mp3
284	2	23	12	dialogue	\N	\N	\N	\N	삼억 원 이상은 쓰고 싶지 않습니다.	We wouldn't want to spend more than 300 million won.	{spend,more,million}	023_12.mp3	023_12.mp3	023_12.mp3	023_12.mp3	023_12.mp3
287	1	24	2	short	소파가 일 년밖에 안 됐는데 너덜너덜하네. 싼 게 비지떡이지 뭐.	The couch is falling apart after only a year. I got what I paid for.	\N	\N	\N	\N	{couch,falling,apart,paid}	024_02.mp3	024_02.mp3	024_02.mp3	024_02.mp3	024_02.mp3
288	1	24	3	short	4천 원도 안 되니 양질의 햄버거는 기대 안 해. 그래도 먹을 만은 해. 딱 그 가격인 듯.	I don't expect a quality fast food hamburger for less than 4,000 won, so it's okay. I get what I pay for.	\N	\N	\N	\N	{expect,quality,hamburger,pay}	024_03.mp3	024_03.mp3	024_03.mp3	024_03.mp3	024_03.mp3
289	1	24	4	short	왠지 너무 싸다 싶었어요. 싼 게 비지떡이죠.	I should have known it was too good to be true. You get what you pay for.	\N	\N	\N	\N	{known,good,true,pay}	024_04.mp3	024_04.mp3	024_04.mp3	024_04.mp3	024_04.mp3
290	1	24	5	short	싼 게 비지떡이라는 점 꼭 기억하렴.	Just keep in mind, you get what you pay for.	\N	\N	\N	\N	{keep,mind,get,pay}	024_05.mp3	024_05.mp3	024_05.mp3	024_05.mp3	024_05.mp3
291	1	24	6	short	(고가의 외제차 주인이 하는 말) 일억 주고 산 게 이 모양이네.	This is what I get for 100 million won.	\N	\N	\N	\N	{get,million}	024_06.mp3	024_06.mp3	024_06.mp3	024_06.mp3	024_06.mp3
293	2	24	8	dialogue	\N	\N	\N	\N	싼 게 다 그렇지 뭐. 좋은 걸 원하면 다른 데 가 봐야지.	Well, you get what you pay for. If you want something good, you need to go somewhere else.	{get,pay,good,somewhere}	024_08.mp3	024_08.mp3	024_08.mp3	024_08.mp3	024_08.mp3
294	2	24	9	dialogue	\N	\N	십만 원 버렸네.	What a waste of 100,000 won!	\N	\N	{waste,won}	024_09.mp3	024_09.mp3	024_09.mp3	024_09.mp3	024_09.mp3
295	2	24	10	dialogue	\N	\N	\N	\N	왠지 너무 싸다고 했어. 싼 게 비지떡이지 뭐.	I knew it was too good to be true. You get what you pay for, I guess.	{knew,good,true,pay}	024_10.mp3	024_10.mp3	024_10.mp3	024_10.mp3	024_10.mp3
296	2	24	11	dialogue	\N	\N	이 오븐 오만 원에 샀는데 한 달 만에 고장 났지 뭐야.	I got this oven for 50,000 won, but it broke after just a month.	\N	\N	{oven,broke,month}	024_11.mp3	024_11.mp3	024_11.mp3	024_11.mp3	024_11.mp3
297	2	24	12	dialogue	\N	\N	\N	\N	그럼 뭘 기대한 거니? 싼 게 비지떡이지.	Well, what were you expecting? You get what you pay for.	{expecting,get,pay}	024_12.mp3	024_12.mp3	024_12.mp3	024_12.mp3	024_12.mp3
299	1	25	1	short	베이비시터 구했다니 다행입니다.	I'm glad you found a babysitter.	\N	\N	\N	\N	{glad,found,babysitter}	025_01.mp3	025_01.mp3	025_01.mp3	025_01.mp3	025_01.mp3
300	1	25	2	short	마음에 들었다니 다행이네요.	I'm glad you liked it.	\N	\N	\N	\N	{glad,liked}	025_02.mp3	025_02.mp3	025_02.mp3	025_02.mp3	025_02.mp3
275	1	23	2	short	심지어 제일 저렴한 것도 제 예산 밖이더라구요.	Even the cheapest one was out of my price range.	\N	\N	\N	\N	{cheapest,price,range}	023_02.mp3	023_02.mp3	023_02.mp3	023_02.mp3	023_02.mp3
276	1	23	3	short	추천해주신 나무 테이블이 제 예산을 훨씬 초과하네요.	I'm afraid the wooden table you recommended is way out of my price range.	\N	\N	\N	\N	{afraid,wooden,table,price}	023_03.mp3	023_03.mp3	023_03.mp3	023_03.mp3	023_03.mp3
304	1	25	6	short	제 말에 공감해 줘서 다행이네요.	I'm glad you can relate.	\N	\N	\N	\N	{glad,relate}	025_06.mp3	025_06.mp3	025_06.mp3	025_06.mp3	025_06.mp3
305	2	25	7	dialogue	\N	\N	이 과자 어디서 샀어요? 너무 맛있어요!	Where did you get these cookies? They're great!	\N	\N	{where,cookies,great}	025_07.mp3	025_07.mp3	025_07.mp3	025_07.mp3	025_07.mp3
306	2	25	8	dialogue	\N	\N	\N	\N	삼촌이 한 통 보내주셨는데 그 과자 회사에서 일하세요. 좋아하시니 다행입니다. 저희는 맛이 질려서요.	We got a whole carton from my uncle, who works for the company. I'm glad you like them. We're kind of sick of the taste.	{carton,uncle,company,glad}	025_08.mp3	025_08.mp3	025_08.mp3	025_08.mp3	025_08.mp3
307	2	25	9	dialogue	\N	\N	늦어서 미안. 일을 최대한 빨리 마치고 왔어.	Sorry I'm late. I finished my work as fast as I could.	\N	\N	{sorry,late,finished,fast}	025_09.mp3	025_09.mp3	025_09.mp3	025_09.mp3	025_09.mp3
308	2	25	10	dialogue	\N	\N	\N	\N	못 올 줄 알았더니 와서 다행이다! 방금 시켰어. 앉아!	I'm glad you could make it. We just ordered. Take a seat!	{glad,make,ordered,seat}	025_10.mp3	025_10.mp3	025_10.mp3	025_10.mp3	025_10.mp3
309	2	25	11	dialogue	\N	\N	남자 친구랑 우리 감정에 대해 길게 이야기했고, 결국 화해했어.	My boyfriend and I had a long conversation about our feelings, and we finally made up.	\N	\N	{boyfriend,conversation,feelings,made}	025_11.mp3	025_11.mp3	025_11.mp3	025_11.mp3	025_11.mp3
310	2	25	12	dialogue	\N	\N	\N	\N	이야기가 잘 됐다니 다행이다! 너희 둘은 너무 잘 어울려.	I'm glad things worked out in the end! You two are great together.	{glad,worked,great,together}	025_12.mp3	025_12.mp3	025_12.mp3	025_12.mp3	025_12.mp3
312	1	26	1	short	평일 오전 9시에서 오후 6시 사이에 언제라도 편하게 연락 주시기 바랍니다.	Please feel free to contact me anytime between 9 and 6 on weekdays.	\N	\N	\N	\N	{feel,free,contact,weekdays}	026_01.mp3	026_01.mp3	026_01.mp3	026_01.mp3	026_01.mp3
313	1	26	2	short	안 되면 부담 없이 알려 주세요.	Feel free to say no.	\N	\N	\N	\N	{feel,free,say}	026_02.mp3	026_02.mp3	026_02.mp3	026_02.mp3	026_02.mp3
314	1	26	3	short	이번 주말에 부모님이 서울에 오신다면서요. 필요하면 부담 갖지 말고 금요일은 쉬세요.	I heard you have your parents coming into Seoul this weekend. Feel free to take Friday off if you need to.	\N	\N	\N	\N	{parents,seoul,weekend,feel}	026_03.mp3	026_03.mp3	026_03.mp3	026_03.mp3	026_03.mp3
315	1	26	4	short	제 에세이 보시고 피드백 좀 주실 수 있을까요? 바쁘시면 부담 갖지 말고 안 된다고 하시고요.	Can I get your opinion on my essay? Feel free to say no if you don't have the time.	\N	\N	\N	\N	{opinion,essay,feel,time}	026_04.mp3	026_04.mp3	026_04.mp3	026_04.mp3	026_04.mp3
316	1	26	5	short	편하게 제 비서에게 연락해서 회의 잡으시면 됩니다.	Feel free to call my secretary to arrange a meeting.	\N	\N	\N	\N	{feel,secretary,arrange,meeting}	026_05.mp3	026_05.mp3	026_05.mp3	026_05.mp3	026_05.mp3
317	1	26	6	short	뭐든 골라 봐. 내가 사 줄게.	Feel free to pick what you want, and I'll pay for it.	\N	\N	\N	\N	{feel,pick,want,pay}	026_06.mp3	026_06.mp3	026_06.mp3	026_06.mp3	026_06.mp3
318	2	26	7	dialogue	\N	\N	안 되면 부담 가지지 말고, 혹시 나랑 같이 자라섬 재즈 페스티벌에 갈 수 있나 해서.	Feel free to say no, but I was just wondering if you'd like to come with me to Jaraseom Jazz Festival.	\N	\N	{feel,free,wondering,jazz}	026_07.mp3	026_07.mp3	026_07.mp3	026_07.mp3	026_07.mp3
319	2	26	8	dialogue	\N	\N	\N	\N	음... 잘 모르겠어. 내일 다시 연락해도 돼?	Umm... I'm not sure. Can I get back to you tomorrow?	{sure,back,tomorrow}	026_08.mp3	026_08.mp3	026_08.mp3	026_08.mp3	026_08.mp3
320	2	26	9	dialogue	\N	\N	안녕하세요. 중고 신발 내놓으신 거 봤습니다. 사고는 싶은데 돈을 마련하려면 시간이 좀 필요해서요.	Hello. I saw your ad for the used shoes. I want to buy them, but I could use some time to come up with the money.	\N	\N	{saw,shoes,buy,money}	026_09.mp3	026_09.mp3	026_09.mp3	026_09.mp3	026_09.mp3
321	2	26	10	dialogue	\N	\N	\N	\N	관심 감사합니다. 홀딩해 두겠습니다. 구매 준비되시면 편히 알려 주세요.	Thank you for your interest. I'll put them aside for you. Feel free to let me know when you're ready to make the purchase.	{interest,aside,feel,purchase}	026_10.mp3	026_10.mp3	026_10.mp3	026_10.mp3	026_10.mp3
322	2	26	11	dialogue	\N	\N	하룻밤 재워 줘서 너무 고마워.	I really appreciate you letting me stay the night.	\N	\N	{appreciate,letting,stay,night}	026_11.mp3	026_11.mp3	026_11.mp3	026_11.mp3	026_11.mp3
323	2	26	12	dialogue	\N	\N	\N	\N	정말 괜찮아. 편하게 샤워하고 그래.	Not a problem! Feel free to use the shower and get comfortable.	{problem,feel,shower,comfortable}	026_12.mp3	026_12.mp3	026_12.mp3	026_12.mp3	026_12.mp3
303	1	25	5	short	(늦게까지 술을 마시는 상황) 내일 일찍 안 일어나도 돼서 얼마나 다행인지.	I'm glad I don't have to wake up early tomorrow.	\N	\N	\N	\N	{glad,wake,early,tomorrow}	025_05.mp3	025_05.mp3	025_05.mp3	025_05.mp3	025_05.mp3
335	3	27	13	long	24시간 고객센터 운영 중입니다. 이 늦은 시간에도 주문 가능합니다. 많은 분들이 이 시간에 연락하시는 것을 부담스러워하시는데, 저희는 언제든 준비되어 있습니다. 새벽 시간에도 배송 가능하니 편하게 문의하세요. 고객님의 편의를 위해 24시간 대기 중입니다.	Our customer service operates 24 hours. Orders are possible even at this late hour. Many people feel uncomfortable contacting us at this time, but we're always ready. Delivery is available even in early morning hours, so feel free to inquire. We're on standby 24 hours for your convenience.	\N	\N	\N	\N	{customer,service,hours,delivery,convenience}	027_13.mp3	027_13.mp3	027_13.mp3	027_13.mp3	027_13.mp3
327	1	27	3	short	이 늦은 시간에 누가 문을 두드리는 거지?	Who could possibly be knocking on our door at this hour?	\N	\N	\N	\N	{possibly,knocking,door,hour}	027_03.mp3	027_03.mp3	027_03.mp3	027_03.mp3	027_03.mp3
328	1	27	4	short	대도시에 사는 건 처음이야. 지금 이 시간에 음식 배달이 된다는 게 말이 돼?	This is my first time in a big city. It's amazing that we can still have food delivered at this hour.	\N	\N	\N	\N	{first,city,food,delivered}	027_04.mp3	027_04.mp3	027_04.mp3	027_04.mp3	027_04.mp3
329	1	27	5	short	내일 배송받고 싶은데요. 지금 이 시간에 주문해도 가능할까요?	I'd like to have it delivered by tomorrow. Is it possible at this hour?	\N	\N	\N	\N	{delivered,tomorrow,possible,hour}	027_05.mp3	027_05.mp3	027_05.mp3	027_05.mp3	027_05.mp3
330	1	27	6	short	늦은 시간에 연락드려 죄송해요.	Sorry to contact you at this hour.	\N	\N	\N	\N	{sorry,contact,hour}	027_06.mp3	027_06.mp3	027_06.mp3	027_06.mp3	027_06.mp3
331	2	27	7	dialogue	\N	\N	늦은 시간에 질문드려 죄송해요.	Sorry to bother you with a question at this hour.	\N	\N	{sorry,bother,question,hour}	027_07.mp3	027_07.mp3	027_07.mp3	027_07.mp3	027_07.mp3
332	2	27	8	dialogue	\N	\N	\N	\N	괜찮습니다.	Not a problem.	{problem}	027_08.mp3	027_08.mp3	027_08.mp3	027_08.mp3	027_08.mp3
333	2	27	9	dialogue	\N	\N	저 오늘 오후에 학부모 간담회 가야 해요.	I have to go to a parent-teacher conference this afternoon.	\N	\N	{parent,teacher,conference,afternoon}	027_09.mp3	027_09.mp3	027_09.mp3	027_09.mp3	027_09.mp3
334	2	27	10	dialogue	\N	\N	\N	\N	그래서 이렇게 이른 시간에 오신 거예요?	Is that why you came here at this hour?	{came,hour}	027_10.mp3	027_10.mp3	027_10.mp3	027_10.mp3	027_10.mp3
336	1	28	1	short	간단하게 아침 식사 하실래요?	You wanna grab some breakfast?	\N	\N	\N	\N	{grab,breakfast,wanna}	028_01.mp3	028_01.mp3	028_01.mp3	028_01.mp3	028_01.mp3
337	1	28	2	short	집에 오는 길에 밀가루 좀 사 올 수 있어? 밀가루가 다 떨어졌어.	Can you grab some flour on your way home? We just ran out.	\N	\N	\N	\N	{grab,flour,ran,out}	028_02.mp3	028_02.mp3	028_02.mp3	028_02.mp3	028_02.mp3
338	1	28	3	short	다시 사무실 들어가기 전에 커피 한 잔 사서 들어갈까 했더니, 안 되겠다. 저기 사람들 줄 좀 봐.	I wanted to grab a coffee before heading back to work, but I don't think I can. Look at that line.	\N	\N	\N	\N	{grab,coffee,heading,line}	028_03.mp3	028_03.mp3	028_03.mp3	028_03.mp3	028_03.mp3
341	1	28	6	short	집에 오는 길에 붕어빵 좀 사다 줘	I want you to grab me some fish-shaped pastries on your way home.	\N	\N	\N	\N	{grab,pastries,fish-shaped,home}	028_06.mp3	028_06.mp3	028_06.mp3	028_06.mp3	028_06.mp3
342	2	28	7	dialogue	\N	\N	안녕, Henry, 퇴근하고 우리랑 맥주 한잔할래?	Hi, Henry, you feel like grabbing a beer with us after work?	\N	\N	{grabbing,beer,work}	028_07.mp3	028_07.mp3	028_07.mp3	028_07.mp3	028_07.mp3
343	2	28	8	dialogue	\N	\N	\N	\N	집에 가 봐야 해. 다음에 하자	I should really get home. Maybe next time.	{home,next,time}	028_08.mp3	028_08.mp3	028_08.mp3	028_08.mp3	028_08.mp3
344	2	28	9	dialogue	\N	\N	간단하게 아침 먹을까요?	You wanna grab some breakfast?	\N	\N	{grab,breakfast,wanna}	028_09.mp3	028_09.mp3	028_09.mp3	028_09.mp3	028_09.mp3
346	2	28	11	dialogue	\N	\N	미안. 30분 늦을 것 같아.	Sorry. It looks like I'll be 30 minutes late.	\N	\N	{sorry,minutes,late}	028_11.mp3	028_11.mp3	028_11.mp3	028_11.mp3	028_11.mp3
347	2	28	12	dialogue	\N	\N	\N	\N	그렇게나? 알았어. 스타벅스 가서 커피나 한 잔 사야겠다. 다행히 나 전자책 리더를 가져왔어	That late? Okay. I'll go by Starbucks and grab a coffee. I'm glad I brought my e-book reader with me.	{starbucks,grab,coffee,e-book}	028_12.mp3	028_12.mp3	028_12.mp3	028_12.mp3	028_12.mp3
349	1	29	1	short	냄새가 적응이 안되네요.	I can't really get used to the smell.	\N	\N	\N	\N	{used,smell,really}	029_01.mp3	029_01.mp3	029_01.mp3	029_01.mp3	029_01.mp3
350	1	29	2	short	저는 처음 보는 사람들 옆에 있으면 불편해요.	I'm not used to being around new people.	\N	\N	\N	\N	{used,around,new,people}	029_02.mp3	029_02.mp3	029_02.mp3	029_02.mp3	029_02.mp3
351	1	29	3	short	저는 삼합은 별로예요. 냄새가 적응이 안 됩니다.	I'm not really into fermented skate. I can't get used to how it smells.	\N	\N	\N	\N	{fermented,skate,used,smells}	029_03.mp3	029_03.mp3	029_03.mp3	029_03.mp3	029_03.mp3
352	1	29	4	short	재택근무에 적응이 안 되네요. 계속 딴짓을 하게 됩니다.	I can't get used to working from home. I always get distracted.	\N	\N	\N	\N	{used,working,home,distracted}	029_04.mp3	029_04.mp3	029_04.mp3	029_04.mp3	029_04.mp3
353	1	29	5	short	이 갤럭시 폰에 적응하는 데 한참 걸렸어요.	It took me a while to get used to this Galaxy phone.	\N	\N	\N	\N	{took,while,used,galaxy}	029_05.mp3	029_05.mp3	029_05.mp3	029_05.mp3	029_05.mp3
354	1	29	6	short	아침에 일찍 일어나는 게 쉽지가 않군요.	I can't get used to waking up early in the morning.	\N	\N	\N	\N	{used,waking,early,morning}	029_06.mp3	029_06.mp3	029_06.mp3	029_06.mp3	029_06.mp3
355	2	29	7	dialogue	\N	\N	너 일본으로 휴가 가는 거 맞지? 거기서 운전할 거야?	You're going on vacation to Japan, right? Are you going to drive while you're there?	\N	\N	{vacation,japan,drive}	029_07.mp3	029_07.mp3	029_07.mp3	029_07.mp3	029_07.mp3
357	2	29	9	dialogue	\N	\N	두바이 날씨에 적응이 안 되네요. 11년간 살고 있는데 영원히 적응을 못할 것 같아요	I can't get used to the weather in Dubai. I've been here 11 years and I'll just never get used to it.	\N	\N	{used,weather,dubai,years}	029_09.mp3	029_09.mp3	029_09.mp3	029_09.mp3	029_09.mp3
358	2	29	10	dialogue	\N	\N	\N	\N	무슨 말인지 너무 잘 알 것 같네요	I totally get what you mean.	{totally,get,mean}	029_10.mp3	029_10.mp3	029_10.mp3	029_10.mp3	029_10.mp3
359	2	29	11	dialogue	\N	\N	여수 날씨가 너무 후텁지근해서 적응이 안 돼요	I just can't get used to how muggy it is in Yeosu.	\N	\N	{used,muggy,yeosu}	029_11.mp3	029_11.mp3	029_11.mp3	029_11.mp3	029_11.mp3
360	2	29	12	dialogue	\N	\N	\N	\N	나도 처음 왔을 때는 그랬죠	I felt the same way when I first came here.	{felt,same,first,came}	029_12.mp3	029_12.mp3	029_12.mp3	029_12.mp3	029_12.mp3
362	1	30	1	short	내일이나 올 줄 알았더니.	I wasn't expecting you until tomorrow.	\N	\N	\N	\N	{expecting,until,tomorrow}	030_01.mp3	030_01.mp3	030_01.mp3	030_01.mp3	030_01.mp3
363	1	30	2	short	그곳은 11시나 돼야 열어. 11시 20분에 보자.	They don't open until 11. See you there at 11:20.	\N	\N	\N	\N	{open,until,see}	030_02.mp3	030_02.mp3	030_02.mp3	030_02.mp3	030_02.mp3
364	1	30	3	short	저는 열두 살이 되어서야 처음 비행기를 타 봤어요.	I didn't get on a plane until I was 12.	\N	\N	\N	\N	{plane,until,twelve}	030_03.mp3	030_03.mp3	030_03.mp3	030_03.mp3	030_03.mp3
365	1	30	4	short	지금은 제가 골초지만, 스물다섯 살이 되어서야 처음으로 담배를 피워 봤답니다.	I'm a big smoker now, but I didn't try my first cigarette until I was 25.	\N	\N	\N	\N	{smoker,cigarette,until,twenty-five}	030_04.mp3	030_04.mp3	030_04.mp3	030_04.mp3	030_04.mp3
366	1	30	5	short	전 서른여덟이 되어서야 처음으로 해외여행을 했답니다.	I didn't travel outside of Korea until I was 38.	\N	\N	\N	\N	{travel,outside,korea,until}	030_05.mp3	030_05.mp3	030_05.mp3	030_05.mp3	030_05.mp3
391	1	32	6	short	그래서 네가 어젯밤에 팀 회식에 못 온 거구나.	That explains why you couldn't make it to the team dinner last night.	\N	\N	\N	\N	{explains,team,dinner,last}	032_06.mp3	032_06.mp3	032_06.mp3	032_06.mp3	032_06.mp3
340	1	28	5	short	나 써브웨이인데. 너도 샌드위치 좀 사다 줄까?	I'm at Subway. Want me to grab a sandwich, too, while I'm here?	\N	\N	\N	\N	{grab,sandwich,subway}	028_05.mp3	028_05.mp3	028_05.mp3	028_05.mp3	028_05.mp3
372	2	30	11	dialogue	\N	\N	택시 기본요금이 인상되긴 하는데 2월 돼야 올라.	Taxi base fares are going to rise, but not until next February.	\N	\N	{taxi,fares,until,february}	030_11.mp3	030_11.mp3	030_11.mp3	030_11.mp3	030_11.mp3
373	2	30	12	dialogue	\N	\N	\N	\N	오, 다행이다. 당분간은 걱정 안 해도 되겠네.	Oh, that's a relief. I don't have to worry about it for a while yet.	{relief,worry,while,yet}	030_12.mp3	030_12.mp3	030_12.mp3	030_12.mp3	030_12.mp3
375	1	31	1	short	칭찬으로 생각하렴.	Think of it as a compliment.	\N	\N	\N	\N	{think,compliment}	031_01.mp3	031_01.mp3	031_01.mp3	031_01.mp3	031_01.mp3
376	1	31	2	short	Samantha는 저를 성가신 존재로 여깁니다.	Samantha thinks of me as a nuisance.	\N	\N	\N	\N	{samantha,thinks,nuisance}	031_02.mp3	031_02.mp3	031_02.mp3	031_02.mp3	031_02.mp3
377	1	31	3	short	저는 늘 고객들에게 커피를 삽니다. 투자라고 생각하기 때문이지요.	I always buy my clients coffee because I think of it as an investment.	\N	\N	\N	\N	{buy,clients,coffee,investment}	031_03.mp3	031_03.mp3	031_03.mp3	031_03.mp3	031_03.mp3
378	1	31	4	short	(감독이 선수들에게) 우리가 다음 라운드 진출에는 실패했지만, 이번 패배를 성장할 수 있는 기회로 생각하길 바랍니다	Even though we couldn't make it to the next round, I want you to think of this loss as an opportunity for growth.	\N	\N	\N	\N	{round,loss,opportunity,growth}	031_04.mp3	031_04.mp3	031_04.mp3	031_04.mp3	031_04.mp3
379	1	31	5	short	운동을 귀찮은 일로 생각하지 말고 하루 일과로 생각해!	Don't think of exercise as a chore; think of it as a part of daily routine!	\N	\N	\N	\N	{exercise,chore,daily,routine}	031_05.mp3	031_05.mp3	031_05.mp3	031_05.mp3	031_05.mp3
380	1	31	6	short	자가 격리해야 해서 안됐다. 그냥 그동안 못했던 비디오 게임을 하고, 좋아하는 TV 프로를 볼 수 있는 기회라고 생각해.	I'm sorry you have to quarantine. Just think of it as a chance to get caught up on video games and your favorite TV shows.	\N	\N	\N	\N	{quarantine,chance,video,games}	031_06.mp3	031_06.mp3	031_06.mp3	031_06.mp3	031_06.mp3
381	2	31	7	dialogue	\N	\N	나 오랫동안 Dave를 짝사랑해 왔는데, 그는 나를 여동생으로 생각한다고 했어.	I've had a crush on Dave for so long but he just said he thinks of me as a sister.	\N	\N	{crush,dave,thinks,sister}	031_07.mp3	031_07.mp3	031_07.mp3	031_07.mp3	031_07.mp3
382	2	31	8	dialogue	\N	\N	\N	\N	그래도 칭찬으로 생각하렴. 너에게서 매력은 못 느낀다 해도 너를 아낀다는 말이니까.	Still, think of it as a compliment. He cares about you, even if he doesn't find you attractive.	{compliment,cares,attractive}	031_08.mp3	031_08.mp3	031_08.mp3	031_08.mp3	031_08.mp3
383	2	31	9	dialogue	\N	\N	도시락을 싸 가지고 다니는 게 어때? 매일 밖에 나가서 먹는 것보다 쌀 텐데.	Why don't you try packing your lunch? It's gotta be cheaper than eating out everyday.	\N	\N	{packing,lunch,cheaper,eating}	031_09.mp3	031_09.mp3	031_09.mp3	031_09.mp3	031_09.mp3
384	2	31	10	dialogue	\N	\N	\N	\N	나가서 먹으면 돈은 더 들지. 그렇지만 시간을 절약할 수 있는 것으로 생각하고 있거든. 지금 나한테 그것이 더 중요해.	Eating out does cost more, but I think of it as a time-saver. That's more important to me now.	{eating,cost,time-saver,important}	031_10.mp3	031_10.mp3	031_10.mp3	031_10.mp3	031_10.mp3
386	1	32	1	short	아, 그래서 남부 억양이 있는거구나.	That explains why you have a southern accent.	\N	\N	\N	\N	{explains,southern,accent}	032_01.mp3	032_01.mp3	032_01.mp3	032_01.mp3	032_01.mp3
387	1	32	2	short	그래서 네가 늘 힘이 넘치는구나.	That explains why you are always so energetic.	\N	\N	\N	\N	{explains,always,energetic}	032_02.mp3	032_02.mp3	032_02.mp3	032_02.mp3	032_02.mp3
388	1	32	3	short	그래서 자네가 항상 회사에 지각을 하는 거군.	That explains why you are always late to work.	\N	\N	\N	\N	{explains,always,late,work}	032_03.mp3	032_03.mp3	032_03.mp3	032_03.mp3	032_03.mp3
389	1	32	4	short	그래서 마지막 순간에 디자인이 바뀐 거군요.	That explains why the design was changed at the last minute.	\N	\N	\N	\N	{explains,design,changed,last}	032_04.mp3	032_04.mp3	032_04.mp3	032_04.mp3	032_04.mp3
390	1	32	5	short	그래서 샌디에이고 날씨가 그렇게 좋은 거구나.	That explains why San Diego has such nice weather.	\N	\N	\N	\N	{explains,san,diego,weather}	032_05.mp3	032_05.mp3	032_05.mp3	032_05.mp3	032_05.mp3
368	2	30	7	dialogue	\N	\N	나는 집에 가봐야겠어. 최소 6시간을 못 자면 다음 날 헤롱헤롱하거든.	I need to head home. I can barely function if I don't get at least 6 hours of sleep.	\N	\N	{home,function,hours,sleep}	030_07.mp3	030_07.mp3	030_07.mp3	030_07.mp3	030_07.mp3
369	2	30	8	dialogue	\N	\N	\N	\N	난 괜찮아. 이 공식들 다 외우고 나서 집에 갈 거야.	I'll be fine. I'm not leaving until I've memorized all of these formulas.	{fine,leaving,until,memorized}	030_08.mp3	030_08.mp3	030_08.mp3	030_08.mp3	030_08.mp3
370	2	30	9	dialogue	\N	\N	잠깐만! 첫 남자 친구라고? 너 스물다섯이잖아!	Wait! Is this your first boyfriend? You're 25 years old!	\N	\N	{wait,first,boyfriend,twenty-five}	030_09.mp3	030_09.mp3	030_09.mp3	030_09.mp3	030_09.mp3
371	2	30	10	dialogue	\N	\N	\N	\N	응, 근데 기다리길 잘한 것 같아. 올인할 준비가 됐을 때 남자를 사귀고 싶었거든.	Yes, but I think waiting was the right choice. I didn't want to start a relationship until I was ready to commit.	{waiting,right,until,commit}	030_10.mp3	030_10.mp3	030_10.mp3	030_10.mp3	030_10.mp3
394	2	32	9	dialogue	\N	\N	위층 이웃이 밤새 시끄럽게 하더라고요. 친구들 불러서 춤을 추고 있었던 것 같아요.	My upstairs neighbors were making noise all night. I think they had some friends over and were dancing.	\N	\N	{upstairs,neighbors,noise,dancing}	032_09.mp3	032_09.mp3	032_09.mp3	032_09.mp3	032_09.mp3
395	2	32	10	dialogue	\N	\N	\N	\N	아, 그래서 그렇군요. 눈 밑에 다크서클도 생겼네요.	Oh, that explains it. You've got dark circles under your eyes.	{explains,dark,circles,eyes}	032_10.mp3	032_10.mp3	032_10.mp3	032_10.mp3	032_10.mp3
396	2	32	11	dialogue	\N	\N	Sam이 사장님 형이랑 같은 고등학교 나왔대.	I heard Sam went to high school with the boss's brother.	\N	\N	{sam,high,school,boss}	032_11.mp3	032_11.mp3	032_11.mp3	032_11.mp3	032_11.mp3
655	1	54	1	short	점심 먹으면서 그동안 못했던 이야기하자.	Let's catch up over lunch.	\N	\N	\N	\N	{catch,over,lunch}	054_01.mp3	054_01.mp3	054_01.mp3	054_01.mp3	054_01.mp3
397	2	32	12	dialogue	\N	\N	\N	\N	아, 그래서 그렇게 빨리 승진을 했던 거구나.	Oh, that explains how he's gotten promoted so quickly.	{explains,promoted,quickly}	032_12.mp3	032_12.mp3	032_12.mp3	032_12.mp3	032_12.mp3
399	1	33	1	short	오늘 밤 약속 유효한지 확인차 연락드려요.	I just wanted to make sure we are still on for tonight.	\N	\N	\N	\N	{wanted,sure,still,tonight}	033_01.mp3	033_01.mp3	033_01.mp3	033_01.mp3	033_01.mp3
400	1	33	2	short	이사하기 전에 이삿짐 싸는 거 도와줘서 고맙다는 말 하려고 연락했어요.	I just wanted to thank you for helping me pack my stuff before the move.	\N	\N	\N	\N	{wanted,thank,helping,pack}	033_02.mp3	033_02.mp3	033_02.mp3	033_02.mp3	033_02.mp3
401	1	33	3	short	우리가 금요일에 보는 거 유효한지 확인차 연락드려요.	I just wanted to make sure we are still on for Friday.	\N	\N	\N	\N	{wanted,sure,still,friday}	033_03.mp3	033_03.mp3	033_03.mp3	033_03.mp3	033_03.mp3
402	1	33	4	short	오늘 밤에 올 수 있는지 확인차 연락했어.	I just wanted to check if you can still make it tonight.	\N	\N	\N	\N	{wanted,check,make,tonight}	033_04.mp3	033_04.mp3	033_04.mp3	033_04.mp3	033_04.mp3
403	1	33	5	short	타이어에 바람이 빠졌다는 거 알려 드리려고요.	I just wanted to let you know that your tire looks low.	\N	\N	\N	\N	{wanted,know,tire,low}	033_05.mp3	033_05.mp3	033_05.mp3	033_05.mp3	033_05.mp3
404	1	33	6	short	파란색 쉐보레 볼트 차주 되시죠? 혹시 차 좀 빼 주실 수 있는지 여쭤보려고 연락드립니다.	Are you the owner of the blue Chevy Volt? I just wanted to ask if you could move your car.	\N	\N	\N	\N	{owner,chevy,wanted,move}	033_06.mp3	033_06.mp3	033_06.mp3	033_06.mp3	033_06.mp3
406	2	33	8	dialogue	\N	\N	\N	\N	근데 저희 딸이 지금 진지하게 만나는 사람이 있어요. 거의 일 년째 만나고 있거든요.	The thing is, she's in a committed relationship at the moment. She has been seeing the guy for almost a year.	{committed,relationship,seeing,year}	033_08.mp3	033_08.mp3	033_08.mp3	033_08.mp3	033_08.mp3
407	2	33	9	dialogue	\N	\N	John이랑 나 드디어 결혼해! 너 올 수 있는지 해서 연락한 거야. 특별한 날 너를 보면 너무 좋을 듯!	John and I are getting married! I just wanted to know if you could make it. It would be so nice to see you on my special day.	\N	\N	{married,wanted,special,day}	033_09.mp3	033_09.mp3	033_09.mp3	033_09.mp3	033_09.mp3
408	2	33	10	dialogue	\N	\N	\N	\N	축하해! 너무 기쁜 소식이다! 꼭 갈게!	Congratulations! What great news! I wouldn't miss it for the world.	{congratulations,great,miss,world}	033_10.mp3	033_10.mp3	033_10.mp3	033_10.mp3	033_10.mp3
409	3	33	13	long	안녕하세요. 금요일로 예정된 회의 관련해서 메일 드립니다. 저희 팀장님이 그날 갑작스럽게 출장을 가게 되었습니다. 그래서 혹시 월요일로 회의를 미룰 수 있을까 해서 연락드리게 되었습니다. 그러면 모두가 참석 가능할 겁니다.	I'm emailing in regards to our scheduled meeting this Friday. My team leader has to go on a sudden business trip that day. So I just wanted to find out if it would be possible to push back the meeting until Monday. This way, the whole team could be present.	\N	\N	\N	\N	{emailing,meeting,friday,monday}	033_13.mp3	033_13.mp3	033_13.mp3	033_13.mp3	033_13.mp3
410	1	34	1	short	연락 기다리겠습니다.	I look forward to hearing from you.	\N	\N	\N	\N	{look,forward,hearing}	034_01.mp3	034_01.mp3	034_01.mp3	034_01.mp3	034_01.mp3
411	1	34	2	short	피드백 기다리겠습니다.	I look forward to your feedback.	\N	\N	\N	\N	{look,forward,feedback}	034_02.mp3	034_02.mp3	034_02.mp3	034_02.mp3	034_02.mp3
412	1	34	3	short	연락 기다리겠습니다.	We look forward to hearing from you.	\N	\N	\N	\N	{look,forward,hearing}	034_03.mp3	034_03.mp3	034_03.mp3	034_03.mp3	034_03.mp3
413	1	34	4	short	귀사에서 일할 수 있는 기회가 꼭 주어졌으면 합니다.	I'm looking forward to getting the opportunity to work with you.	\N	\N	\N	\N	{looking,forward,opportunity,work}	034_04.mp3	034_04.mp3	034_04.mp3	034_04.mp3	034_04.mp3
414	1	34	5	short	드디어 날씨가 조금 선선해지고 있네. 어서 가을이 왔으면.	It's finally starting to cool down. I'm really looking forward to fall.	\N	\N	\N	\N	{finally,cool,looking,fall}	034_05.mp3	034_05.mp3	034_05.mp3	034_05.mp3	034_05.mp3
415	1	34	6	short	곧 얼굴 뵙기를 기대합니다.	I look forward to seeing you in person.	\N	\N	\N	\N	{look,forward,seeing,person}	034_06.mp3	034_06.mp3	034_06.mp3	034_06.mp3	034_06.mp3
416	2	34	7	dialogue	\N	\N	차가 다음 주에 온다고? 정말 기대되겠다.	Your new car is being delivered next week, right? You must be so excited.	\N	\N	{car,delivered,week,excited}	034_07.mp3	034_07.mp3	034_07.mp3	034_07.mp3	034_07.mp3
417	2	34	8	dialogue	\N	\N	\N	\N	응! 어서 몰아 보고 싶어. 못 기다리겠어.	Yeah, I'm looking forward to finally taking it for a spin. I can't wait.	{looking,forward,spin,wait}	034_08.mp3	034_08.mp3	034_08.mp3	034_08.mp3	034_08.mp3
393	2	32	8	dialogue	\N	\N	\N	\N	아, 그래서 내 전화를 안 받았구나.	Oh, that explains why she didn't answer my calls.	{explains,answer,calls}	032_08.mp3	032_08.mp3	032_08.mp3	032_08.mp3	032_08.mp3
421	1	35	1	short	구글에서 분석 전문가로 일해보니 어때요?	What is it like working as an Analytical Lead at Google?	\N	\N	\N	\N	{like,working,analytical,google}	035_01.mp3	035_01.mp3	035_01.mp3	035_01.mp3	035_01.mp3
422	1	35	2	short	워킹맘으로 살아간다는 건 어떤 느낌인가요?	What is it like being a working mom?	\N	\N	\N	\N	{like,being,working,mom}	035_02.mp3	035_02.mp3	035_02.mp3	035_02.mp3	035_02.mp3
423	1	35	3	short	유치원에서 영어 선생님으로 일하니 어떤가요?	What is it like to work as an English kindergarten teacher?	\N	\N	\N	\N	{like,work,english,kindergarten}	035_03.mp3	035_03.mp3	035_03.mp3	035_03.mp3	035_03.mp3
424	1	35	4	short	압박감이 심한 분야에서 근무하시는 게 어떤 느낌인가요?	What is it like to work in such a high-pressure field?	\N	\N	\N	\N	{like,work,high-pressure,field}	035_04.mp3	035_04.mp3	035_04.mp3	035_04.mp3	035_04.mp3
764	1	63	1	short	이 말을 어떻게 꺼내야 할지.	I can't think of the right thing to say.	\N	\N	\N	\N	{think,right,thing,say}	063_01.mp3	063_01.mp3	063_01.mp3	063_01.mp3	063_01.mp3
425	1	35	5	short	스포트라이트를 받는 유명인으로 살아간다는 게 어떤 기분인가요?	What is it like to be a celebrity, living in the spotlight?	\N	\N	\N	\N	{like,celebrity,living,spotlight}	035_05.mp3	035_05.mp3	035_05.mp3	035_05.mp3	035_05.mp3
426	1	35	6	short	사랑하는 사람을 잃는다는 게 어떤 건지 잘 압니다.	I know what it's like to lose a loved one.	\N	\N	\N	\N	{know,like,lose,loved}	035_06.mp3	035_06.mp3	035_06.mp3	035_06.mp3	035_06.mp3
427	2	35	7	dialogue	\N	\N	제법 오랫동안 아이를 원해 왔지만, 막상 임신하니 믿기지 않아! 너도 아이 있잖아, Rachel? 첫 아이 낳았을 때 어땠어? 무섭지 않았어?	We've been wanting a child for a while, but I can't believe it's finally happening! You have a little boy, don't you, Rachel? What was it like to have your first child? Weren't you scared?	\N	\N	{child,believe,first,scared}	035_07.mp3	035_07.mp3	035_07.mp3	035_07.mp3	035_07.mp3
428	2	35	8	dialogue	\N	\N	\N	\N	안 무서웠다면 거짓말이지. 근데 그만한 가치가 있었어.	I'd be lying if I said I wasn't. But it was all worth it.	{lying,scared,worth}	035_08.mp3	035_08.mp3	035_08.mp3	035_08.mp3	035_08.mp3
429	2	35	9	dialogue	\N	\N	친부모님 만났다니 정말 용기가 필요했겠구나. 그분들 처음으로 만나 본 느낌이 어땠어?	It was a huge step to meet your birth parents. What was it like to meet them for the first time?	\N	\N	{step,birth,parents,first}	035_09.mp3	035_09.mp3	035_09.mp3	035_09.mp3	035_09.mp3
430	2	35	10	dialogue	\N	\N	\N	\N	마음이 복잡했지 뭐. 그래도 만날 수 있어서 다행이다 싶어.	It was a lot to process. But I'm glad I was able to do it.	{lot,process,glad,able}	035_10.mp3	035_10.mp3	035_10.mp3	035_10.mp3	035_10.mp3
431	2	35	11	dialogue	\N	\N	제가 아산에 사는데요. 일은 광주에서 하거든요. 그래서 주말에만 애들을 볼 수 있지요.	I live in Asan, but I actually work in Gwangju. I can only see my kids on weekends.	\N	\N	{live,asan,work,gwangju}	035_11.mp3	035_11.mp3	035_11.mp3	035_11.mp3	035_11.mp3
433	3	35	13	long	안녕, Cindy. 아직 Brad를 못 잊는다고 들었어. 오래 사귄 후에 다시 혼자 되는 게 어떤 기분인 줄 알아. 근데 그 사람이 너한테 어떻게 했는지를 꼭 기억해. 틀림없이 곧 괜찮은 남자 만날 수 있을 거야.	Hi, Cindy. I heard you're having trouble getting over Brad. I know what it's like to be single again after a long relationship. But remember how badly he treated you. You can definitely find a decent guy soon.	\N	\N	\N	\N	{trouble,getting,over,relationship}	035_13.mp3	035_13.mp3	035_13.mp3	035_13.mp3	035_13.mp3
434	1	36	1	short	스테이크 조금만 더 익혀 주세요.	I'd like to get this steak cooked a little more.	\N	\N	\N	\N	{like,steak,cooked,more}	036_01.mp3	036_01.mp3	036_01.mp3	036_01.mp3	036_01.mp3
435	1	36	2	short	스테이크 조금 더 익혀 주실 수 있을까요? 덜 익은 걸로 보이는데, 미디엄으로 원했거든요.	Could I get this steak cooked a little more? It looks rare, but I wanted it medium.	\N	\N	\N	\N	{steak,cooked,rare,medium}	036_02.mp3	036_02.mp3	036_02.mp3	036_02.mp3	036_02.mp3
436	1	36	3	short	남은 음식은 싸 주시겠어요?	I'd like to get these leftovers wrapped up.	\N	\N	\N	\N	{like,leftovers,wrapped}	036_03.mp3	036_03.mp3	036_03.mp3	036_03.mp3	036_03.mp3
437	1	36	4	short	이 근처에 코트 수선할 데 있을까요?	Is there any place nearby where I can get my coat fixed?	\N	\N	\N	\N	{place,nearby,coat,fixed}	036_04.mp3	036_04.mp3	036_04.mp3	036_04.mp3	036_04.mp3
438	1	36	5	short	(미용실에서) 윗머리를 1센티미터만 더 잘라 주실 수 있을까요?	Could I have maybe a centimeter more taken off the top?	\N	\N	\N	\N	{centimeter,taken,off,top}	036_05.mp3	036_05.mp3	036_05.mp3	036_05.mp3	036_05.mp3
439	1	36	6	short	제 계정과 프로필 삭제를 원합니다.	I'd like to have my account and profile deleted.	\N	\N	\N	\N	{like,account,profile,deleted}	036_06.mp3	036_06.mp3	036_06.mp3	036_06.mp3	036_06.mp3
440	2	36	7	dialogue	\N	\N	나 컴퓨터 고쳐야 하는데.	I need to get my computer fixed.	\N	\N	{need,computer,fixed}	036_07.mp3	036_07.mp3	036_07.mp3	036_07.mp3	036_07.mp3
441	2	36	8	dialogue	\N	\N	\N	\N	나보고 고쳐 달라는 말이야?	Would you like me to fix it for you?	{would,like,fix}	036_08.mp3	036_08.mp3	036_08.mp3	036_08.mp3	036_08.mp3
442	2	36	9	dialogue	\N	\N	혹시 이 점을 뺄 수 있을까요?	Is it possible to get this mole removed?	\N	\N	{possible,mole,removed}	036_09.mp3	036_09.mp3	036_09.mp3	036_09.mp3	036_09.mp3
419	2	34	10	dialogue	\N	\N	\N	\N	Daniel, 저도 기대됩니다. 죄송하지만 제가 삼겹살을 못 먹습니다. 사실 채식주의자거든요.	Hi, Daniel! I'm excited too, but I'm afraid it doesn't work for me. I'm actually a vegan.	{excited,afraid,work,vegan}	034_10.mp3	034_10.mp3	034_10.mp3	034_10.mp3	034_10.mp3
448	1	37	2	short	오늘 퇴근하고 뭐 하세요?	What are you up to after work today?	\N	\N	\N	\N	{what,up,after,work}	037_02.mp3	037_02.mp3	037_02.mp3	037_02.mp3	037_02.mp3
449	1	37	3	short	얘들아, 이번 주말에 뭐 해?	Guys, what are you up to this weekend?	\N	\N	\N	\N	{guys,what,up,weekend}	037_03.mp3	037_03.mp3	037_03.mp3	037_03.mp3	037_03.mp3
450	1	37	4	short	이번 주 금요일에 뭐 하니? 나가서 저녁이나 할까 싶어서.	Are you up to anything this Friday? I was thinking of going out for dinner.	\N	\N	\N	\N	{up,anything,friday,dinner}	037_04.mp3	037_04.mp3	037_04.mp3	037_04.mp3	037_04.mp3
451	1	37	5	short	오늘 밤에 뭐 해? 영화나 볼까?	Are you up to anything tonight? Do you want to catch a movie?	\N	\N	\N	\N	{up,anything,tonight,movie}	037_05.mp3	037_05.mp3	037_05.mp3	037_05.mp3	037_05.mp3
452	1	37	6	short	내일 나가서 저녁이나 먹을까 하는데, 너 특별한 일 없으면 말이야.	Maybe we could go out for dinner tomorrow if you're not already up to anything.	\N	\N	\N	\N	{dinner,tomorrow,already,anything}	037_06.mp3	037_06.mp3	037_06.mp3	037_06.mp3	037_06.mp3
453	2	37	7	dialogue	\N	\N	안녕, Jake, 지금 뭐 해? 시간 괜찮으면 나랑 이마트 갈래?	Hi, Jake, what are you up to now? If you are free, how about coming down to E-mart with me?	\N	\N	{what,up,free,e-mart}	037_07.mp3	037_07.mp3	037_07.mp3	037_07.mp3	037_07.mp3
455	2	37	9	dialogue	\N	\N	안녕, Gabriel! 오랜만이네요. 요즘 뭐 하고 지내셨나요?	Hi, Gabriel! I haven't seen you come in for a while. What have you been up to?	\N	\N	{gabriel,seen,while,been}	037_09.mp3	037_09.mp3	037_09.mp3	037_09.mp3	037_09.mp3
456	2	37	10	dialogue	\N	\N	\N	\N	네. 가족들이랑 여름휴가 다녀왔어요.	Hey, yeah. I've been away on summer vacation with my family.	{been,away,summer,vacation}	037_10.mp3	037_10.mp3	037_10.mp3	037_10.mp3	037_10.mp3
457	2	37	11	dialogue	\N	\N	Johnson 씨, 지금 바빠요? 중요한 일 없으면, 내 사무실에서 좀 봤으면 하는데.	Mr. Johnson, are you busy right now? If you're not up to anything important, I'd like to see you in my office.	\N	\N	{busy,up,important,office}	037_11.mp3	037_11.mp3	037_11.mp3	037_11.mp3	037_11.mp3
458	2	37	12	dialogue	\N	\N	\N	\N	네, 이건 이따가 하겠습니다. 5분 후에 뵙겠습니다.	Okay, I can put this aside for a moment. See you in five minutes.	{okay,aside,five,minutes}	037_12.mp3	037_12.mp3	037_12.mp3	037_12.mp3	037_12.mp3
460	1	38	1	short	딱 맞게 전화했네.	You caught me just in time.	\N	\N	\N	\N	{caught,just,time}	038_01.mp3	038_01.mp3	038_01.mp3	038_01.mp3	038_01.mp3
461	1	38	2	short	너 자기 전에 내가 딱 맞게 전화를 잘했네.	I'm glad I could catch you just before you went to bed.	\N	\N	\N	\N	{glad,catch,before,bed}	038_02.mp3	038_02.mp3	038_02.mp3	038_02.mp3	038_02.mp3
462	1	38	3	short	안녕, Andy. 나가려던 참인데 딱 맞게 전화했네. 짧게 부탁해.	Hi, Andy. You caught me on my way out. Please make it quick!	\N	\N	\N	\N	{caught,way,out,quick}	038_03.mp3	038_03.mp3	038_03.mp3	038_03.mp3	038_03.mp3
463	1	38	4	short	비행기가 막 이륙하려는 참인데. 아슬아슬하게 전화했구나.	We're about to take off. You caught me just in time.	\N	\N	\N	\N	{about,take,off,caught}	038_04.mp3	038_04.mp3	038_04.mp3	038_04.mp3	038_04.mp3
464	1	38	5	short	Alex, 샤워하려던 참인데 네가 딱 전화를 했네. 무슨 일이야?	Alex, you caught me just before I got into the shower. What's up?	\N	\N	\N	\N	{caught,before,shower,what}	038_05.mp3	038_05.mp3	038_05.mp3	038_05.mp3	038_05.mp3
465	1	38	6	short	너 퇴근하기 전에 연락을 해야 할 것 같아서.	I was hoping to catch you before you left the office.	\N	\N	\N	\N	{hoping,catch,before,left}	038_06.mp3	038_06.mp3	038_06.mp3	038_06.mp3	038_06.mp3
466	2	38	7	dialogue	\N	\N	너희랑 중국 음식 먹기로 했는데 내가 몸이 좀 안 좋아. 오늘은 튀긴 음식은 못 먹을 것 같아.	I know I said I'd eat Chinese food with you guys but I'm feeling a bit sick. I don't think I should have fried food today.	\N	\N	{chinese,sick,fried,food}	038_07.mp3	038_07.mp3	038_07.mp3	038_07.mp3	038_07.mp3
467	2	38	8	dialogue	\N	\N	\N	\N	내가 Susan한테 전화해 볼게. 주문 넣기 전에 어쩌면 통화 가능할 수 있을지도 모르니.	I'll try calling Susan. Maybe I can catch her before she places an order.	{calling,susan,catch,order}	038_08.mp3	038_08.mp3	038_08.mp3	038_08.mp3	038_08.mp3
468	2	38	9	dialogue	\N	\N	얼굴 보니 좋다, Cheryl! 들어와. Nick은 우리 먹을 술 사러 편의점에 갔어.	Good to see you, Cheryl! Come on in. Nick is out grabbing drinks for us at the convenience store.	\N	\N	{good,see,grabbing,drinks}	038_09.mp3	038_09.mp3	038_09.mp3	038_09.mp3	038_09.mp3
469	2	38	10	dialogue	\N	\N	\N	\N	진짜? 계산하기 전에 통화되는지 한번 봐야겠다. 오늘 약을 먹었거든.	Oh, really? I'll see if I can catch him before he checks out. I'm on some medication today.	{catch,before,checks,medication}	038_10.mp3	038_10.mp3	038_10.mp3	038_10.mp3	038_10.mp3
470	2	38	11	dialogue	\N	\N	Greg, 만 개에 대해 그 회사에 얼마를 청구해야 할까요?	Greg, what rate should we charge that company for 10,000 units?	\N	\N	{rate,charge,company,units}	038_11.mp3	038_11.mp3	038_11.mp3	038_11.mp3	038_11.mp3
122	2	10	8	dialogue	\N	\N	\N	\N	십만 원 미만이면 다 괜찮아요.	Anything under 100,000 won would be fine.	{anything,under,won,fine}	010_08.mp3	010_08.mp3	010_08.mp3	010_08.mp3	010_08.mp3
447	1	37	1	short	내일 밤에 뭐 해요?	What are you up to tomorrow night?	\N	\N	\N	\N	{what,up,tomorrow,night}	037_01.mp3	037_01.mp3	037_01.mp3	037_01.mp3	037_01.mp3
472	3	38	13	long	베이비시팅을 위해 가야 했는데 갈 수가 없었다. 그런데 전화기 배터리가 다 되어서 모르는 사람에게 전화기를 빌려 써야만 했다. 타이밍이 절묘했다. 5분만 늦었으면 나가고 없었을 거라며 Fred는 내가 딱 맞게 전화했다고 했다.	I couldn't make it over there to babysit. My phone was dead, so I had to ask a stranger for his phone. It was good timing. Fred said I caught him just in time, because he would have been out the door just five minutes later.	\N	\N	\N	\N	{babysit,phone,dead,timing}	038_13.mp3	038_13.mp3	038_13.mp3	038_13.mp3	038_13.mp3
473	1	39	1	short	매장 내에서 드실 거예요, 아님 가져가실 거예요?	Is that for here or to go?	\N	\N	\N	\N	{here,go}	039_01.mp3	039_01.mp3	039_01.mp3	039_01.mp3	039_01.mp3
475	1	39	3	short	저녁 9시가 넘으면 식당 안에서는 드실 수 없지만, 포장은 가능합니다.	You can't go and sit inside the restaurant after 9 p.m., but it's still possible to get food to go.	\N	\N	\N	\N	{restaurant,after,food,go}	039_03.mp3	039_03.mp3	039_03.mp3	039_03.mp3	039_03.mp3
476	1	39	4	short	지금은 디저트를 못 먹을 거 같아서요. 포장해 주실 수 있을까요?	I don't think we can eat dessert now. Could we get it to go?	\N	\N	\N	\N	{dessert,get,go}	039_04.mp3	039_04.mp3	039_04.mp3	039_04.mp3	039_04.mp3
477	1	39	5	short	(식당 주인이 직원들에게 하는 말) 건설 현장 사람들이 오전 11시쯤에 픽업 음식을 대량으로 주문합니다.	People from construction sites often call in big to-go orders around 11.	\N	\N	\N	\N	{construction,call,to-go,orders}	039_05.mp3	039_05.mp3	039_05.mp3	039_05.mp3	039_05.mp3
478	1	39	6	short	(식당에 대해 하는 말) 포장용 그릇을 가져가면 짜장면을 더 줘.	If you bring your own to-go container, they always give you extra black bean noodles.	\N	\N	\N	\N	{bring,to-go,container,extra}	039_06.mp3	039_06.mp3	039_06.mp3	039_06.mp3	039_06.mp3
479	2	39	7	dialogue	\N	\N	웬일이야! 들어와.	What a surprise! Please come in.	\N	\N	{what,surprise,come}	039_07.mp3	039_07.mp3	039_07.mp3	039_07.mp3	039_07.mp3
480	2	39	8	dialogue	\N	\N	\N	\N	고마워, 근데 오래는 못 있어. 그냥 너 재킷 돌려주려고 잠깐 들렀거든.	Thanks, but actually, I can't stay. I just wanted to swing by and return your jacket.	{thanks,stay,swing,jacket}	039_08.mp3	039_08.mp3	039_08.mp3	039_08.mp3	039_08.mp3
481	2	39	9	dialogue	\N	\N	우리 예리가 조금 걱정이 되네. 집에 혼자 남겨 두는 건 처음이라.	I'm a little worried about our Yeri. This is the first time we've left her at home by herself.	\N	\N	{worried,yeri,first,home}	039_09.mp3	039_09.mp3	039_09.mp3	039_09.mp3	039_09.mp3
482	2	39	10	dialogue	\N	\N	\N	\N	분명 괜찮을 거야, 아니면 내가 잠깐 들러서 확인해도 되고.	I'm sure she's fine, but I wouldn't mind swinging by and checking in on her.	{sure,fine,swinging,checking}	039_10.mp3	039_10.mp3	039_10.mp3	039_10.mp3	039_10.mp3
484	1	40	1	short	숙대입구역에서 만나는게 어떨까요?	How about we meet at Sookmyung Women's University Station?	\N	\N	\N	\N	{meet,sookmyung,station}	040_01.mp3	040_01.mp3	040_01.mp3	040_01.mp3	040_01.mp3
485	1	40	2	short	우리 화요일 6시에 만나는 거 어때요?	How about we meet at 6 on Tuesday?	\N	\N	\N	\N	{meet,tuesday,6}	040_02.mp3	040_02.mp3	040_02.mp3	040_02.mp3	040_02.mp3
486	1	40	3	short	길 건너 피자 가게에서 간단하게 점심 먹으면 어떨까요?	How about we grab lunch at that pizza place across the street?	\N	\N	\N	\N	{grab,lunch,pizza,street}	040_03.mp3	040_03.mp3	040_03.mp3	040_03.mp3	040_03.mp3
487	1	40	4	short	전원을 껐다가 다시 켜면 어떨까?	How about turning it off and on again?	\N	\N	\N	\N	{turning,off,again}	040_04.mp3	040_04.mp3	040_04.mp3	040_04.mp3	040_04.mp3
488	1	40	5	short	그 친구 Melinda랑 자리 마련해 주면 어떨까?	How about setting him up with Melinda?	\N	\N	\N	\N	{setting,melinda}	040_05.mp3	040_05.mp3	040_05.mp3	040_05.mp3	040_05.mp3
489	1	40	6	short	가격 인상을 조금만 보류하면 어떨까요?	How about we hold off on raising the prices?	\N	\N	\N	\N	{hold,raising,prices}	040_06.mp3	040_06.mp3	040_06.mp3	040_06.mp3	040_06.mp3
490	2	40	7	dialogue	\N	\N	Ashley 말로는 Johnnie가 다른 여자랑 데이트하는 거 봤대!	Ashley said she saw Johnnie on a date with another girl!	\N	\N	{ashley,johnnie,date,girl}	040_07.mp3	040_07.mp3	040_07.mp3	040_07.mp3	040_07.mp3
491	2	40	8	dialogue	\N	\N	\N	\N	잠시만, 섣불리 판단하기 전에 우선 그 사람한테 한번 물어보면 어떨까?	Hold on, how about we ask him about it before jumping to conclusions?	{hold,ask,jumping,conclusions}	040_08.mp3	040_08.mp3	040_08.mp3	040_08.mp3	040_08.mp3
597	1	49	3	short	혼자 먹으려고 요리하는 게 엄청 귀찮게 느껴지시죠?	Does cooking for one feel like too much of a hassle?	\N	\N	\N	\N	{cooking,one,much,hassle}	049_03.mp3	049_03.mp3	049_03.mp3	049_03.mp3	049_03.mp3
471	2	38	12	dialogue	\N	\N	\N	\N	잠시만요. 사장님 퇴근하시기 전에 전화 한번 해 볼게요.	Just a moment. I'll see if I can catch my boss before he leaves.	{moment,catch,boss,leaves}	038_12.mp3	038_12.mp3	038_12.mp3	038_12.mp3	038_12.mp3
474	1	39	2	short	이 커피 테이크아웃해서 가자.	Let's get these coffees to go.	\N	\N	\N	\N	{get,coffees,go}	039_02.mp3	039_02.mp3	039_02.mp3	039_02.mp3	039_02.mp3
494	2	40	11	dialogue	\N	\N	차를 리스하면 꽤 비쌀 거야. 리스 업체에는 신차만 있는 것 같아.	Leasing will be pretty expensive. It looks like they only have brand new cars available.	\N	\N	{leasing,expensive,new,cars}	040_11.mp3	040_11.mp3	040_11.mp3	040_11.mp3	040_11.mp3
495	2	40	12	dialogue	\N	\N	\N	\N	그럼 저렴한 차를 사는 건 어떨까? 파쏘에서 싸게 나온 차들을 좀 봤거든.	How about we just buy a cheap car then? I've seen some good deals on Passo.	{buy,cheap,car,passo}	040_12.mp3	040_12.mp3	040_12.mp3	040_12.mp3	040_12.mp3
497	1	41	1	short	커피 사 왔어요!	I got you a coffee!	\N	\N	\N	\N	{got,coffee}	041_01.mp3	041_01.mp3	041_01.mp3	041_01.mp3	041_01.mp3
498	1	41	2	short	일어난 김에 물 한 잔 가져다줄래요?	Could you get me a glass of water while you're up?	\N	\N	\N	\N	{get,glass,water}	041_02.mp3	041_02.mp3	041_02.mp3	041_02.mp3	041_02.mp3
499	1	41	3	short	멋진 핸드크림 선물로 주셔서 감사해요! 그러지 않으셔도 되는데.	Thanks for getting me such nice hand cream! You didn't have to.	\N	\N	\N	\N	{thanks,getting,hand,cream}	041_03.mp3	041_03.mp3	041_03.mp3	041_03.mp3	041_03.mp3
500	1	41	4	short	학생들에게 크리스마스 선물로 스킨로션을 해 줄까 생각 중입니다.	I'm thinking about getting my students some skin lotion for Christmas.	\N	\N	\N	\N	{getting,students,lotion,christmas}	041_04.mp3	041_04.mp3	041_04.mp3	041_04.mp3	041_04.mp3
501	1	41	5	short	아내분 생일 선물을 뭐 해 주셨어요?	What did you get your wife for her birthday?	\N	\N	\N	\N	{get,wife,birthday}	041_05.mp3	041_05.mp3	041_05.mp3	041_05.mp3	041_05.mp3
502	1	41	6	short	제가 계산하는 동안에 나가서 택시 좀 불러 주실 수 있을까요?	Do you mind going out and getting us a taxi while I pay?	\N	\N	\N	\N	{going,getting,taxi,pay}	041_06.mp3	041_06.mp3	041_06.mp3	041_06.mp3	041_06.mp3
504	2	41	8	dialogue	\N	\N	\N	\N	우와! 선생님 너무 친절하세요. 저는 쿠키 먹을게요, 감사합니다.	Oh, wow! You're so thoughtful. I'll have a cookie, thanks.	{thoughtful,cookie,thanks}	041_08.mp3	041_08.mp3	041_08.mp3	041_08.mp3	041_08.mp3
505	2	41	9	dialogue	\N	\N	이곳 겨울 날씨 너무 힘드네요. 교실 안에 있어도 얼어 죽을 것 같아요!	I really can't handle the winters here. Even in the classroom, I'm always freezing!	\N	\N	{handle,winters,classroom,freezing}	041_09.mp3	041_09.mp3	041_09.mp3	041_09.mp3	041_09.mp3
506	2	41	10	dialogue	\N	\N	\N	\N	고향은 훨씬 더 따뜻한 거예요? 잠시만요, 사무실 가서 스웨터 갖다 줄게요.	Is it much warmer back home? Hold on, I'll get you a sweater from my office.	{warmer,home,sweater,office}	041_10.mp3	041_10.mp3	041_10.mp3	041_10.mp3	041_10.mp3
507	2	41	11	dialogue	\N	\N	여자 친구 생일이 얼마 안 남았는데 뭘 사 줘야 할지 모르겠어. 혹시 추천할 거 있을까?	My girlfriend's birthday is coming up and I'm not sure what to get her. Do you have any suggestions?	\N	\N	{girlfriend,birthday,get,suggestions}	041_11.mp3	041_11.mp3	041_11.mp3	041_11.mp3	041_11.mp3
508	2	41	12	dialogue	\N	\N	\N	\N	음, 마음이 담긴 거라면, 뭘 해 줘도 좋아할 거야!	Well, as long as it's thoughtful, I'm sure she'll love anything you get her!	{thoughtful,love,get}	041_12.mp3	041_12.mp3	041_12.mp3	041_12.mp3	041_12.mp3
510	1	42	1	short	저는 괜찮습니다.	I'm good.	\N	\N	\N	\N	{good}	042_01.mp3	042_01.mp3	042_01.mp3	042_01.mp3	042_01.mp3
511	1	42	2	short	고맙지만 저는 괜찮아요.	I'm good, thanks.	\N	\N	\N	\N	{good,thanks}	042_02.mp3	042_02.mp3	042_02.mp3	042_02.mp3	042_02.mp3
512	1	42	3	short	A: 케이크 한 조각 더 드실래요? B: 아니요, 정말 괜찮아요.	A: Would you like another piece of cake? B: No thanks, I'm totally good.	\N	\N	\N	\N	{piece,cake,totally,good}	042_03.mp3	042_03.mp3	042_03.mp3	042_03.mp3	042_03.mp3
513	1	42	4	short	A: Kelly, 더 줄까요? B: 아니요, 괜찮아요.	A: You need any more, Kelly? B: No thanks, I'm good.	\N	\N	\N	\N	{need,more,good}	042_04.mp3	042_04.mp3	042_04.mp3	042_04.mp3	042_04.mp3
514	1	42	5	short	(상대방이 음식이나 술을 더 시킬지 물었을 때) 지금 이것만으로도 충분해요.	I'm good with what I already have.	\N	\N	\N	\N	{good,already,have}	042_05.mp3	042_05.mp3	042_05.mp3	042_05.mp3	042_05.mp3
515	1	42	6	short	편의점에서 뭐 사다 줄까, 아님 괜찮아?	Do you want anything from the convenience store, or are you good?	\N	\N	\N	\N	{convenience,store,good}	042_06.mp3	042_06.mp3	042_06.mp3	042_06.mp3	042_06.mp3
516	2	42	7	dialogue	\N	\N	뭐 좀 더 드시겠어요, 손님?	Would you like anything else to eat or drink, Sir?	\N	\N	{anything,eat,drink}	042_07.mp3	042_07.mp3	042_07.mp3	042_07.mp3	042_07.mp3
517	2	42	8	dialogue	\N	\N	\N	\N	고맙지만 괜찮아요.	No thanks, I'm good.	{thanks,good}	042_08.mp3	042_08.mp3	042_08.mp3	042_08.mp3	042_08.mp3
518	2	42	9	dialogue	\N	\N	집에 가는 길에 가게 들를 건데, 뭐 필요한 거 있어?	I'm stopping by the store on my way home, would you like anything?	\N	\N	{stopping,store,home,anything}	042_09.mp3	042_09.mp3	042_09.mp3	042_09.mp3	042_09.mp3
519	2	42	10	dialogue	\N	\N	\N	\N	아니, 괜찮아.	Oh, no thanks, I'm good.	{thanks,good}	042_10.mp3	042_10.mp3	042_10.mp3	042_10.mp3	042_10.mp3
520	2	42	11	dialogue	\N	\N	너 이번 주말에 이사한다며. 필요하면 남편이랑 내가 가서 도와줄게.	I heard you're moving this weekend. My husband and I could come and help if you need it.	\N	\N	{moving,weekend,husband,help}	042_11.mp3	042_11.mp3	042_11.mp3	042_11.mp3	042_11.mp3
493	2	40	10	dialogue	\N	\N	\N	\N	그러고 싶은데, 마감일이 임박해서 말이지.	I wish I could, but I have a deadline coming up.	{wish,deadline,coming}	040_10.mp3	040_10.mp3	040_10.mp3	040_10.mp3	040_10.mp3
526	1	43	4	short	외국인들한테는 서울 지하철이 좀 헷갈릴 수도 있을 거예요.	Seoul's subway system might be a bit hard for foreigners to figure out.	\N	\N	\N	\N	{seoul,subway,foreigners,figure}	043_04.mp3	043_04.mp3	043_04.mp3	043_04.mp3	043_04.mp3
527	1	43	5	short	지금 다섯 달째 쉬고 있습니다. 다음에 뭘 해야 할지 막막합니다.	I've been out of work for five months now. I can't figure out what to do next.	\N	\N	\N	\N	{work,months,figure,next}	043_05.mp3	043_05.mp3	043_05.mp3	043_05.mp3	043_05.mp3
528	1	43	6	short	옷장을 다 뒤져 봤는데도 뭘 입어야 할지 모르겠네.	I've gone through my whole closet, and I still can't figure out what to wear.	\N	\N	\N	\N	{closet,figure,wear}	043_06.mp3	043_06.mp3	043_06.mp3	043_06.mp3	043_06.mp3
529	2	43	7	dialogue	\N	\N	음, 저기요! 죄송한데 좀 도와주실 수 있어요? 제 딸 만나러 고려대에 가는 길인데, 가는 방법을 도무지 알 수 없어서요.	Um, hello! I'm sorry, can you help me? I'm on my way to see my daughter at Korea University, but I can't figure out how to get over there.	\N	\N	{help,daughter,korea,university}	043_07.mp3	043_07.mp3	043_07.mp3	043_07.mp3	043_07.mp3
530	2	43	8	dialogue	\N	\N	\N	\N	네, 당연히 도와드려야죠. 그렇게 어렵지 않습니다. 여기 지하철 앱 다운로드하시면, 가는 길 쉽게 알 수 있을 거예요!	Oh! Sure, I can help. It's not too hard. Here, If you download a subway app, you'll be able to figure it out easily.	{help,subway,app,figure}	043_08.mp3	043_08.mp3	043_08.mp3	043_08.mp3	043_08.mp3
531	2	43	9	dialogue	\N	\N	아직도 책상 조립하는 방법을 못 알아낸 거야? 뭐가 이렇게 지저분해.	You still haven't figured out how to put together the desk? I don't like all this mess.	\N	\N	{figured,desk,mess}	043_09.mp3	043_09.mp3	043_09.mp3	043_09.mp3	043_09.mp3
532	2	43	10	dialogue	\N	\N	\N	\N	아직 못했어. 아무래도 매장에 전화해서 도움을 구해야겠어.	No, I might need to call the store for help.	{call,store,help}	043_10.mp3	043_10.mp3	043_10.mp3	043_10.mp3	043_10.mp3
534	1	44	1	short	커피 한 잔 마시면 좋겠네요.	I could really use a cup of coffee.	\N	\N	\N	\N	{really,use,coffee}	044_01.mp3	044_01.mp3	044_01.mp3	044_01.mp3	044_01.mp3
535	1	44	2	short	이 책상 옮기는 거 좀 도와줬으면 좋겠는데.	I could use your help moving this desk.	\N	\N	\N	\N	{use,help,moving,desk}	044_02.mp3	044_02.mp3	044_02.mp3	044_02.mp3	044_02.mp3
536	1	44	3	short	보니까 너 당분간 좀 쉬어야겠다.	You look like you could really use some time off.	\N	\N	\N	\N	{really,use,time,off}	044_03.mp3	044_03.mp3	044_03.mp3	044_03.mp3	044_03.mp3
537	1	44	4	short	지금 마케팅 전략으로는 안 됩니다.	We could use a better marketing strategy.	\N	\N	\N	\N	{use,better,marketing,strategy}	044_04.mp3	044_04.mp3	044_04.mp3	044_04.mp3	044_04.mp3
538	1	44	5	short	미안한데 내가 월세 낼 돈이 오십 달러 부족한데 네가 좀 도와주면 좋을 텐데.	Sorry, I'm $50 short on rent and could use some help.	\N	\N	\N	\N	{short,rent,use,help}	044_05.mp3	044_05.mp3	044_05.mp3	044_05.mp3	044_05.mp3
539	1	44	6	short	어젯밤에 거의 못 잤어. 커피가 필요해.	I hardly slept last night. I could really use a coffee.	\N	\N	\N	\N	{hardly,slept,really,coffee}	044_06.mp3	044_06.mp3	044_06.mp3	044_06.mp3	044_06.mp3
540	2	44	7	dialogue	\N	\N	아직 공부하고 있는 거야? 몇 시간째야. 계속 안 쉬고 하는 거야?	You're still studying? It's been hours. Have you been working this whole time?	\N	\N	{studying,hours,working,time}	044_07.mp3	044_07.mp3	044_07.mp3	044_07.mp3	044_07.mp3
541	2	44	8	dialogue	\N	\N	\N	\N	응. 솔직히 좀 쉬긴 해야 할 듯. 커피 마실까?	Yeah, I have. I could really use a break, honestly. Are you down for some coffee?	{really,use,break,coffee}	044_08.mp3	044_08.mp3	044_08.mp3	044_08.mp3	044_08.mp3
542	2	44	9	dialogue	\N	\N	혹시 일본어 선생님 아는 분 있을까요, Daniel? 다음 달 오사카 가기 전에 제 일본어 좀 다듬어야 할 것 같아서요.	Do you know any Japanese tutors, Daniel? I feel like my Japanese could use some work before I fly to Osaka next month.	\N	\N	{japanese,tutors,osaka,work}	044_09.mp3	044_09.mp3	044_09.mp3	044_09.mp3	044_09.mp3
543	2	44	10	dialogue	\N	\N	\N	\N	도움이 될 수 있으면 좋은데. 제가 아는 분은 전부 영어 선생님이라서요	I wish I could help. Everyone I know just teaches English.	{wish,help,teaches,english}	044_10.mp3	044_10.mp3	044_10.mp3	044_10.mp3	044_10.mp3
544	2	44	11	dialogue	\N	\N	여기. 이 소스 살짝 맛 좀 봐 봐. 어때?	Here. Try a bit of this sauce. What do you think?	\N	\N	{try,sauce,think}	044_11.mp3	044_11.mp3	044_11.mp3	044_11.mp3	044_11.mp3
545	2	44	12	dialogue	\N	\N	\N	\N	응. 나쁘진 않은데. 음 ... 소금을 조금만 더 넣어야겠다.	Yeah. Not bad. Umm... It could just use a little more salt.	{bad,use,salt}	044_12.mp3	044_12.mp3	044_12.mp3	044_12.mp3	044_12.mp3
598	1	49	4	short	커피 원두를 쏟으면 주워 담는 게 일이지.	Coffee beans are a hassle to pick up if you spill them.	\N	\N	\N	\N	{coffee,beans,hassle,spill}	049_04.mp3	049_04.mp3	049_04.mp3	049_04.mp3	049_04.mp3
523	1	43	1	short	눈치가 빠르시네요.	You figured that out right away.	\N	\N	\N	\N	{figured,right,away}	043_01.mp3	043_01.mp3	043_01.mp3	043_01.mp3	043_01.mp3
524	1	43	2	short	나는 에어컨 도저히 못 고치겠다. 기술자 불러야겠어.	I can't figure out how to fix my a/c. I need to call a technician.	\N	\N	\N	\N	{figure,fix,technician}	043_02.mp3	043_02.mp3	043_02.mp3	043_02.mp3	043_02.mp3
525	1	43	3	short	숙제를 이리 가져와 보렴. 같이 풀어 보자.	Bring your homework over here. We can figure it out together.	\N	\N	\N	\N	{bring,homework,figure,together}	043_03.mp3	043_03.mp3	043_03.mp3	043_03.mp3	043_03.mp3
548	1	45	2	short	정말 그렇게 생각하세요? 말씀 너무 고맙습니다.	You think so? That's so nice of you to say.	\N	\N	\N	\N	{think,nice,say}	045_02.mp3	045_02.mp3	045_02.mp3	045_02.mp3	045_02.mp3
549	1	45	3	short	말씀 정말 고마워요!	How nice of you to say so!	\N	\N	\N	\N	{nice,say}	045_03.mp3	045_03.mp3	045_03.mp3	045_03.mp3	045_03.mp3
550	1	45	4	short	그렇게 말씀해 주시다니 너무 고맙네요.	That's so sweet of you to say something like that.	\N	\N	\N	\N	{sweet,say,something}	045_04.mp3	045_04.mp3	045_04.mp3	045_04.mp3	045_04.mp3
551	1	45	5	short	(머리가 잘 됐다는 상대의 말에) 농담이죠? 말씀 감사한데, 저는 그렇게 만족스럽지는 않네요.	You're kidding, right? Thank you for saying so, but I'm still not quite happy with it.	\N	\N	\N	\N	{kidding,thank,saying,happy}	045_05.mp3	045_05.mp3	045_05.mp3	045_05.mp3	045_05.mp3
552	1	45	6	short	(이사하는 걸 도와주겠다는 친구에게) 제안은 너무 고맙지만, 지금은 더 이상의 도움은 필요 없어서 말이야.	It's nice of you to offer, but I don't really need any more help.	\N	\N	\N	\N	{nice,offer,need,help}	045_06.mp3	045_06.mp3	045_06.mp3	045_06.mp3	045_06.mp3
553	2	45	7	dialogue	\N	\N	카페가 어쩜 이렇게 이뻐요! 이 동네에 딱 필요했던 거예요.	What a beautiful cafe! It's just what this neighborhood needed.	\N	\N	{beautiful,cafe,neighborhood,needed}	045_07.mp3	045_07.mp3	045_07.mp3	045_07.mp3	045_07.mp3
554	2	45	8	dialogue	\N	\N	\N	\N	말씀 고마워요. 예쁘게 꾸미려고 엄청 신경 썼답니다.	How nice of you to say so. I put a lot of effort into making it look just right.	{nice,say,effort,right}	045_08.mp3	045_08.mp3	045_08.mp3	045_08.mp3	045_08.mp3
555	2	45	9	dialogue	\N	\N	면접 통과에 대해 너무 걱정하지 말아. 네가 안 되면 누가 되냐?	Don't worry so much about passing the interview. I can't imagine anyone more qualified.	\N	\N	{worry,passing,interview,qualified}	045_09.mp3	045_09.mp3	045_09.mp3	045_09.mp3	045_09.mp3
556	2	45	10	dialogue	\N	\N	\N	\N	그렇게 말해 주니 고맙지만, 잘 모르겠어.	Thank you for saying so, but I'm not sure.	{thank,saying,sure}	045_10.mp3	045_10.mp3	045_10.mp3	045_10.mp3	045_10.mp3
557	2	45	11	dialogue	\N	\N	에세이 정말 인상적이군, James. 자네 많이 늘었어. 전문 에세이 쓰는 사람을 고용해서 쓴 것처럼 말이지.	I'm so impressed with your writing, James. You've really improved. It almost looks like you hired a professional to write for you.	\N	\N	{impressed,writing,improved,professional}	045_11.mp3	045_11.mp3	045_11.mp3	045_11.mp3	045_11.mp3
558	2	45	12	dialogue	\N	\N	\N	\N	하하! 말씀 감사드려요, Brown 교수님. 이건 완전 제가 쓴 거예요.	Haha. That's nice of you to say, Ms. Brown. This essay is all mine.	{nice,say,essay,mine}	045_12.mp3	045_12.mp3	045_12.mp3	045_12.mp3	045_12.mp3
560	1	46	1	short	나쁘지 않아요.	I can't complain at all.	\N	\N	\N	\N	{complain}	046_01.mp3	046_01.mp3	046_01.mp3	046_01.mp3	046_01.mp3
561	1	46	2	short	(요즘 좋아 보인다는 말에 대해) 나쁘지 않아요. 일이 잘 풀리고 있어요.	I can't complain. Things are going pretty well.	\N	\N	\N	\N	{complain,things,going,well}	046_02.mp3	046_02.mp3	046_02.mp3	046_02.mp3	046_02.mp3
562	1	46	3	short	(허리가 안 좋은 사람이) 최근에 몸이 살짝 불편하긴 한데, 그래도 나쁘지 않습니다.	I've been feeling a little out of sorts lately, but I can't complain.	\N	\N	\N	\N	{feeling,sorts,lately,complain}	046_03.mp3	046_03.mp3	046_03.mp3	046_03.mp3	046_03.mp3
563	1	46	4	short	(새로운 상사와 일하는 것이 어떠냐는 질문에) 나쁘지 않아요. 같이 일하기 편해요.	I can't complain. He is easy to work with.	\N	\N	\N	\N	{complain,easy,work}	046_04.mp3	046_04.mp3	046_04.mp3	046_04.mp3	046_04.mp3
565	1	46	6	short	(신차 시승을 마친 고객이) 나쁘지 않아요. 핸들링도 꽤 괜찮았어요.	I can't complain at all. The handling was pretty good.	\N	\N	\N	\N	{complain,handling,pretty,good}	046_06.mp3	046_06.mp3	046_06.mp3	046_06.mp3	046_06.mp3
566	2	46	7	dialogue	\N	\N	대학에 다니기 시작했다고 들었어. 처음 몇 주는 어땠어?	I heard that you finally started college. How were the first few weeks?	\N	\N	{finally,started,college,weeks}	046_07.mp3	046_07.mp3	046_07.mp3	046_07.mp3	046_07.mp3
567	2	46	8	dialogue	\N	\N	\N	\N	음, 나쁘지 않아. 과제는 어렵지만, 그만한 가치가 있을 거야. 게다가 벌써 친구도 많이 사귀었어.	Hm, I can't complain. The assignments are really hard, but I know it will be worth it. And besides, I've made a lot of friends already!	{complain,assignments,worth,friends}	046_08.mp3	046_08.mp3	046_08.mp3	046_08.mp3	046_08.mp3
568	2	46	9	dialogue	\N	\N	이거 이번에 새로 산 차야? 좋아 보이는데 몇 년 된 거야? 20년이나 25년?	Oh, is this your new car? It looks good, but how old is it? Maybe 20 or 25 years old?	\N	\N	{new,car,old,years}	046_09.mp3	046_09.mp3	046_09.mp3	046_09.mp3	046_09.mp3
569	2	46	10	dialogue	\N	\N	\N	\N	응, 2000년 식이야. 근데 나쁘지 않아. 요즘은 저렴한 차를 구하기가 너무 힘들잖아.	Yeah, It's a 2000 model. I can't complain, though. It's hard to find any affordable car in this market.	{2000,model,complain,affordable}	046_10.mp3	046_10.mp3	046_10.mp3	046_10.mp3	046_10.mp3
547	1	45	1	short	그렇게 말씀해 주셔서 너무 고맙습니다.	It's nice of you to say so.	\N	\N	\N	\N	{nice,say}	045_01.mp3	045_01.mp3	045_01.mp3	045_01.mp3	045_01.mp3
572	1	47	2	short	너 나한테 십만 원 갚을 거 있잖아.	You owe me 100,000 won.	\N	\N	\N	\N	{owe,100000,won}	047_02.mp3	047_02.mp3	047_02.mp3	047_02.mp3	047_02.mp3
573	1	47	3	short	카페에서 뭐 좀 사 갈까? 나 어차피 너한테 점심 사야 돼.	Want me to grab you something from the coffee shop? I owe you lunch, anyway.	\N	\N	\N	\N	{grab,coffee,owe,lunch}	047_03.mp3	047_03.mp3	047_03.mp3	047_03.mp3	047_03.mp3
574	1	47	4	short	이사하는 거 도와주셔서 제가 신세를 졌네요.	I owe you a favor for helping me move.	\N	\N	\N	\N	{owe,favor,helping,move}	047_04.mp3	047_04.mp3	047_04.mp3	047_04.mp3	047_04.mp3
576	1	47	6	short	상사들이 널 그렇게 대하는데도 왜 받아 주는 거야? 무슨 빚이라도 진 사람 같아.	Why do you accept such poor treatment from your supervisors? You act like you owe them something.	\N	\N	\N	\N	{accept,treatment,supervisors,owe}	047_06.mp3	047_06.mp3	047_06.mp3	047_06.mp3	047_06.mp3
577	2	47	7	dialogue	\N	\N	이렇게 빨리 수리해 주셔서 정말 감사합니다. 얼마 드리면 되나요?	I really appreciate you getting this fixed so quickly. So how much do I owe you?	\N	\N	{appreciate,fixed,quickly,owe}	047_07.mp3	047_07.mp3	047_07.mp3	047_07.mp3	047_07.mp3
578	2	47	8	dialogue	\N	\N	\N	\N	부품값만 주시면 됩니다. 뭐 크게 어려운 것도 아니었는데요.	Just paying for the parts would be good enough. It wasn't any trouble.	{paying,parts,trouble}	047_08.mp3	047_08.mp3	047_08.mp3	047_08.mp3	047_08.mp3
580	2	47	10	dialogue	\N	\N	\N	\N	잊어버려, Alex! 뭘 고마운 게 있다고. 뒤도 돌아보지 말라고!	Forget about it, Alex! You don't owe them anything. Leave and never look back.	{forget,owe,leave,back}	047_10.mp3	047_10.mp3	047_10.mp3	047_10.mp3	047_10.mp3
581	3	47	13	long	실은 우리가 다시 만나서 일했으면 좋겠다고 하는 거 알고 있어. 나도 그러고 싶어. 근데 나 너한테 신세 진 거 없어. 5년 전에 날 해고한 건 너의 결정이었어. 그래서 이번에 내가 너희 회사에서 일하기로 결정할지는 내 마음이야.	Look, I know you want us to work together again. And I want that, too. But I don't owe you anything. It was your decision to fire me five years ago. So, whether or not I decide to work for your company this time is up to me.	\N	\N	\N	\N	{work,together,owe,decision,fire}	047_13.mp3	047_13.mp3	047_13.mp3	047_13.mp3	047_13.mp3
582	1	48	1	short	저도 같은 생각이예요.	I feel the same way.	\N	\N	\N	\N	{feel,same,way}	048_01.mp3	048_01.mp3	048_01.mp3	048_01.mp3	048_01.mp3
583	1	48	2	short	당신도 그렇게 느꼈다니 다행이군.	I'm glad you felt the same way.	\N	\N	\N	\N	{glad,felt,same,way}	048_02.mp3	048_02.mp3	048_02.mp3	048_02.mp3	048_02.mp3
584	1	48	3	short	그곳 서비스가 진짜 마음에 들었어? 난 전혀 아닌데.	Were you really happy with the service there? I certainly didn't feel the same way.	\N	\N	\N	\N	{happy,service,certainly,feel}	048_03.mp3	048_03.mp3	048_03.mp3	048_03.mp3	048_03.mp3
585	1	48	4	short	그 사람이랑 일하는 게 싫고, 그 사람도 나에 대해 마찬가지일 거야.	I don't like working with him, and I think he feels the same way towards me.	\N	\N	\N	\N	{working,feels,same,towards}	048_04.mp3	048_04.mp3	048_04.mp3	048_04.mp3	048_04.mp3
586	1	48	5	short	언젠가 같이 다시 일했으면 좋겠네요. 당신도 그렇길 바라요.	I want to work with you again someday, and I hope you feel the same way.	\N	\N	\N	\N	{work,again,someday,feel}	048_05.mp3	048_05.mp3	048_05.mp3	048_05.mp3	048_05.mp3
587	1	48	6	short	(카페 주인이 음악 소리가 너무 크지 않은지 묻자) 그 이야기를 꺼내 주셔서 다행이네요. 저도 그렇게 느꼈어요.	I'm glad you brought it up. I was feeling the same way.	\N	\N	\N	\N	{glad,brought,feeling,same}	048_06.mp3	048_06.mp3	048_06.mp3	048_06.mp3	048_06.mp3
588	2	48	7	dialogue	\N	\N	Johnson 씨, 이 제안서 좀 서둘렀나 봐요. 오타 같은 게 보여요. 좀 더 신경 썼으면 좋았을 텐데요.	Mr. Johnson, this proposal looks like it was a bit rushed. I see the typos and such. I think you could have done better.	\N	\N	{proposal,rushed,typos,better}	048_07.mp3	048_07.mp3	048_07.mp3	048_07.mp3	048_07.mp3
589	2	48	8	dialogue	\N	\N	\N	\N	솔직히 저도 그렇게 생각합니다. 좀 더 시간을 들였어야 했어요.	Honestly, I feel the same way. I wish I had spent more time on it.	{honestly,feel,same,spent}	048_08.mp3	048_08.mp3	048_08.mp3	048_08.mp3	048_08.mp3
590	2	48	9	dialogue	\N	\N	Frank, 얘기 좀 해. 우리 사이가 좀 멀어진 것 같아.	Frank, we need to talk. I think we've grown apart.	\N	\N	{need,talk,grown,apart}	048_09.mp3	048_09.mp3	048_09.mp3	048_09.mp3	048_09.mp3
591	2	48	10	dialogue	\N	\N	\N	\N	응, Sally. 나도 그렇게 느낀 지 좀 됐어.	Yeah, Sally. I've felt the same way for a while now.	{felt,same,way,while}	048_10.mp3	048_10.mp3	048_10.mp3	048_10.mp3	048_10.mp3
593	2	48	12	dialogue	\N	\N	\N	\N	응, 맞아! 지난번에 엔진오일 갈 때 나도 그렇게 느꼈거든.	Yeah, really! I felt the same way the last time I got my oil changed.	{felt,same,oil,changed}	048_12.mp3	048_12.mp3	048_12.mp3	048_12.mp3	048_12.mp3
595	1	49	1	short	두 번 갈아타는 게 너무 귀찮게 느껴져요.	Transferring twice feels like a huge hassle.	\N	\N	\N	\N	{transferring,twice,huge,hassle}	049_01.mp3	049_01.mp3	049_01.mp3	049_01.mp3	049_01.mp3
596	1	49	2	short	그건 저한테 엄청 귀찮게 느껴져요.	That feels like a big hassle to me.	\N	\N	\N	\N	{feels,big,hassle}	049_02.mp3	049_02.mp3	049_02.mp3	049_02.mp3	049_02.mp3
571	1	47	1	short	나 너한테 5달러 줄 거 있어.	You owe me five bucks.	\N	\N	\N	\N	{owe,five,bucks}	047_01.mp3	047_01.mp3	047_01.mp3	047_01.mp3	047_01.mp3
601	2	49	7	dialogue	\N	\N	아침에 운동하면, 기분이 좋아지고 업무 집중도 더 잘 돼.	When I work out in the morning, it puts me in a good mood, and it's easier to stay focused at work, too.	\N	\N	{work,morning,mood,focused}	049_07.mp3	049_07.mp3	049_07.mp3	049_07.mp3	049_07.mp3
602	2	49	8	dialogue	\N	\N	\N	\N	응, 나도 출근 전에 운동하고 싶은데 귀찮아.	Yeah, I'd like to start exercising before work too, but it feels like such a hassle.	{exercising,work,feels,hassle}	049_08.mp3	049_08.mp3	049_08.mp3	049_08.mp3	049_08.mp3
605	3	49	13	long	대중교통 이용하는 게 너무 귀찮아요. 지하철역까지 10분 걸어가고, 지하철 타고 20분, 그다음에 버스로 갈아타고 또 15분. 차로는 20분이면 가는 거리인데 대중교통으로는 한 시간이나 걸려요. 너무 번거로워요.	Using public transportation feels like such a hassle. It's a 10-minute walk to the subway station, then a 20-minute ride, then I have to transfer to a bus for another 15 minutes. The same trip takes only 20 minutes by car, but an hour by public transport. It's such a hassle.	\N	\N	\N	\N	{public,transportation,hassle,transfer}	049_13.mp3	049_13.mp3	049_13.mp3	049_13.mp3	049_13.mp3
606	1	50	1	short	여기서는 원래 그래요.	That's just how things work here.	\N	\N	\N	\N	{just,things,work,here}	050_01.mp3	050_01.mp3	050_01.mp3	050_01.mp3	050_01.mp3
607	1	50	2	short	(업무 방식에 대해 하는 말) "그렇지만 여기는 원래 그래요."라는 변명을 자주 듣게 될 겁니다.	You'll often hear excuses like "But that's just how things work here."	\N	\N	\N	\N	{hear,excuses,things,work}	050_02.mp3	050_02.mp3	050_02.mp3	050_02.mp3	050_02.mp3
608	1	50	3	short	자본주의 사회에서는 원래 그런거죠.	That's just how things work in capitalism.	\N	\N	\N	\N	{just,things,work,capitalism}	050_03.mp3	050_03.mp3	050_03.mp3	050_03.mp3	050_03.mp3
609	1	50	4	short	처음에는 CEO의 딸이 저보다 먼저 승진해서 정말 화가 났습니다. 근데 가족 운영 기업에서는 원래 그렇다는 걸 알게 되었지요.	At first, I was mad about the CEO's daughter being promoted faster than me. But then I realized that's just how things work at a family-owned company.	\N	\N	\N	\N	{ceo,daughter,promoted,family}	050_04.mp3	050_04.mp3	050_04.mp3	050_04.mp3	050_04.mp3
610	1	50	5	short	워라밸이 보장되면 참 좋겠지만, 대부분 한국 기업은 그렇지가 않아요.	I wish I had a nice balance between work and home life, but that's not how it works in most Korean companies.	\N	\N	\N	\N	{balance,work,home,korean}	050_05.mp3	050_05.mp3	050_05.mp3	050_05.mp3	050_05.mp3
611	2	50	7	dialogue	\N	\N	네가 요금을 내면, 팁은 내가 낼게.	If you are paying the fare, then I've got the tip!	\N	\N	{paying,fare,tip}	050_07.mp3	050_07.mp3	050_07.mp3	050_07.mp3	050_07.mp3
612	2	50	8	dialogue	\N	\N	\N	\N	하하, 고맙지만, 한국에서는 그렇게 안 해. 택시 기사분들에게 팁을 안 주거든.	Haha, thanks, but that's not how things work here. We don't tip taxi drivers.	{thanks,things,work,tip}	050_08.mp3	050_08.mp3	050_08.mp3	050_08.mp3	050_08.mp3
613	2	50	9	dialogue	\N	\N	월세 낼 돈이 모자라면 사장한테 연봉 올려 달라고 하면 안 돼?	If you don't have enough money to pay your rent, can't you just ask your boss for a raise?	\N	\N	{money,rent,boss,raise}	050_09.mp3	050_09.mp3	050_09.mp3	050_09.mp3	050_09.mp3
614	2	50	10	dialogue	\N	\N	\N	\N	앗, 대기업에서 누가 그래.	Eh, that's not really how things work at a conglomerate.	{really,things,work,conglomerate}	050_10.mp3	050_10.mp3	050_10.mp3	050_10.mp3	050_10.mp3
616	2	50	12	dialogue	\N	\N	\N	\N	죄송한데, 그건 힘듭니다. 무조건 50%를 내야 합니다.	I am afraid it doesn't work that way. Everyone has to put down at least 50%.	{afraid,work,everyone,down}	050_12.mp3	050_12.mp3	050_12.mp3	050_12.mp3	050_12.mp3
618	1	51	1	short	골프를 더 잘 치고 싶어요.	I want to get better at golf.	\N	\N	\N	\N	{want,better,golf}	051_01.mp3	051_01.mp3	051_01.mp3	051_01.mp3	051_01.mp3
619	1	51	2	short	뭐든 정말 더 잘하고 싶으면 올인을 해야 해.	If you really want to get better at anything, you should fully commit to it.	\N	\N	\N	\N	{want,better,fully,commit}	051_02.mp3	051_02.mp3	051_02.mp3	051_02.mp3	051_02.mp3
620	1	51	3	short	조금만 견디세요. 중급 레벨에 도달하면 실력이 느는 데 훨씬 더 오래 걸리거든요.	Hang in there. Once you reach the intermediate level, it takes way longer to get better.	\N	\N	\N	\N	{hang,intermediate,longer,better}	051_03.mp3	051_03.mp3	051_03.mp3	051_03.mp3	051_03.mp3
621	1	51	4	short	무언가를 더 잘하려면 연습만이 답이다.	Practice is the only way to get better at something.	\N	\N	\N	\N	{practice,only,better,something}	051_04.mp3	051_04.mp3	051_04.mp3	051_04.mp3	051_04.mp3
622	1	51	5	short	저는 뭐든 잘 늘지 않는 것 같아요.	I can't seem to get better at anything.	\N	\N	\N	\N	{seem,better,anything}	051_05.mp3	051_05.mp3	051_05.mp3	051_05.mp3	051_05.mp3
623	1	51	6	short	대학 때부터 직접 요리해 오고 있어요. 근데 여전히 더 잘하고 싶답니다. 파스타 하나 만드는 데 한 시간이나 걸리거든요.	I've been cooking for myself since university, but I still want to get better. It takes me an hour to make pasta.	\N	\N	\N	\N	{cooking,university,better,pasta}	051_06.mp3	051_06.mp3	051_06.mp3	051_06.mp3	051_06.mp3
656	1	54	2	short	그 이야기는 저녁 먹으면서 하면 어떨까요?	Maybe we could talk about that over dinner.	\N	\N	\N	\N	{maybe,talk,over,dinner}	054_02.mp3	054_02.mp3	054_02.mp3	054_02.mp3	054_02.mp3
600	1	49	6	short	Josh가 소파를 문 앞에 두고 갔어. 밖에 나갈 때마다 타 넘고 가는 게 몹시 번거로웠어.	Josh left sofa in front of the door. It was such a hassle to get over it every time I went outside.	\N	\N	\N	\N	{josh,sofa,hassle,outside}	049_06.mp3	049_06.mp3	049_06.mp3	049_06.mp3	049_06.mp3
626	2	51	9	dialogue	\N	\N	취업하기 전에 유럽으로 배낭여행 갈까 해. 우선 영어 실력부터 좀 더 키워야 한다는 점이 문제야.	I'm thinking of going backpacking around Europe before I get a job. The thing is, I'll probably need to get better at English first.	\N	\N	{backpacking,europe,job,english}	051_09.mp3	051_09.mp3	051_09.mp3	051_09.mp3	051_09.mp3
627	2	51	10	dialogue	\N	\N	\N	\N	괜찮은 생각인 듯. 유럽은 어딜 가나 영어를 쓰니까.	Not a bad idea. You can use English everywhere in Europe.	{bad,idea,english,europe}	051_10.mp3	051_10.mp3	051_10.mp3	051_10.mp3	051_10.mp3
628	2	51	11	dialogue	\N	\N	일 외에는 할 줄 아는 게 없는 기분이야.	I feel like I have no skills outside of work.	\N	\N	{feel,skills,outside,work}	051_11.mp3	051_11.mp3	051_11.mp3	051_11.mp3	051_11.mp3
629	2	51	12	dialogue	\N	\N	\N	\N	시간만 투자하면 뭐든지 늘 수 있어. 내 친구 철수는 은퇴하고 플루트 배웠는데 지금은 거의 준프로 수준이거든.	You can get better at anything as long as you set aside enough time. You know, my friend, Cheol-soo only took up the flute after retiring, and now he plays semi-professionally.	{better,anything,time,flute}	051_12.mp3	051_12.mp3	051_12.mp3	051_12.mp3	051_12.mp3
631	1	52	1	short	바빠서 운동 할 짬이 안 나네요.	I can't seem to find time to exercise.	\N	\N	\N	\N	{seem,find,time,exercise}	052_01.mp3	052_01.mp3	052_01.mp3	052_01.mp3	052_01.mp3
632	1	52	2	short	회사가 너무 바빠져서, 요즘 헬스장 갈 시간도 없었어요.	I've gotten super busy at work, so I haven't been able to make time to go to the gym.	\N	\N	\N	\N	{busy,work,make,gym}	052_02.mp3	052_02.mp3	052_02.mp3	052_02.mp3	052_02.mp3
633	1	52	3	short	관계에 있어서는 서로를 위해 시간을 내야 한다.	In a relationship, you have to make time for each other.	\N	\N	\N	\N	{relationship,make,time,other}	052_03.mp3	052_03.mp3	052_03.mp3	052_03.mp3	052_03.mp3
634	1	52	4	short	편할 때 들르세요. 언제든 시간 내겠습니다.	Please feel free to come visit me. I can always make time for you.	\N	\N	\N	\N	{feel,free,visit,time}	052_04.mp3	052_04.mp3	052_04.mp3	052_04.mp3	052_04.mp3
635	1	52	5	short	책을 쓰다 보니 너무 바쁘네요. 제대로 밥 챙겨 먹을 시간이 없을 때도 있습니다.	Writing these books has been keeping me super busy. Sometimes, I can't even find time to have a decent meal.	\N	\N	\N	\N	{writing,books,busy,meal}	052_05.mp3	052_05.mp3	052_05.mp3	052_05.mp3	052_05.mp3
636	1	52	6	short	보통 2주에 한 번은 장 보러 가는데, 최근엔 두 달 동안 시간을 못 냈어요.	I normally go grocery shopping every other week, but I haven't been able to find the time for two months.	\N	\N	\N	\N	{grocery,shopping,find,months}	052_06.mp3	052_06.mp3	052_06.mp3	052_06.mp3	052_06.mp3
638	2	52	8	dialogue	\N	\N	\N	\N	당신이 왜 그런 말을 하는지 너무 이해가 돼. 내가 좀 더 노력하고 우리를 위한 시간을 더 만들어 볼게.	I can totally see where you're coming from. I'll make more of an effort and make more time for us.	{see,coming,effort,time}	052_08.mp3	052_08.mp3	052_08.mp3	052_08.mp3	052_08.mp3
639	2	52	9	dialogue	\N	\N	너 결혼식 정말 얼마 안 남았구나! 기대되겠다. 근데 좀 많이 바빠 보이네.	Your wedding is finally almost here! You must be excited. Then again, you seem so busy.	\N	\N	{wedding,finally,excited,busy}	052_09.mp3	052_09.mp3	052_09.mp3	052_09.mp3	052_09.mp3
640	2	52	10	dialogue	\N	\N	\N	\N	맞아. 이제 이틀밖에 안 남았어. 손톱 관리도 받아야 하는데, 이렇게 일이 많으니 어떻게 시간을 내야 할지 모르겠어.	I know. It's only two days away. I need to get my nails done, but I don't know how I can find the time, with everything going on.	{days,away,nails,find}	052_10.mp3	052_10.mp3	052_10.mp3	052_10.mp3	052_10.mp3
642	1	53	1	short	다이소는 가격을 생각하면 꽤 좋은 물건들을 판다.	Daiso has pretty good products for its prices.	\N	\N	\N	\N	{daiso,pretty,products,prices}	053_01.mp3	053_01.mp3	053_01.mp3	053_01.mp3	053_01.mp3
643	1	53	2	short	그 사람은 농구 선수치고는 키가 좀 작다.	He's kind of short for a basketball player.	\N	\N	\N	\N	{short,basketball,player}	053_02.mp3	053_02.mp3	053_02.mp3	053_02.mp3	053_02.mp3
644	1	53	3	short	해가 쨍쨍한 것치고는 상당히 춥다. 그렇지?	It's rather cold for such a sunny day, isn't it?	\N	\N	\N	\N	{rather,cold,sunny,day}	053_03.mp3	053_03.mp3	053_03.mp3	053_03.mp3	053_03.mp3
645	1	53	4	short	그 여자분은 아시아인치고는 키가 상당히 크다.	She is rather tall for an Asian girl.	\N	\N	\N	\N	{rather,tall,asian,girl}	053_04.mp3	053_04.mp3	053_04.mp3	053_04.mp3	053_04.mp3
646	1	53	5	short	집 크기를 생각하면 내 월세가 정말 싼 편이다.	The rent is really low for how big my place is.	\N	\N	\N	\N	{rent,low,big,place}	053_05.mp3	053_05.mp3	053_05.mp3	053_05.mp3	053_05.mp3
647	1	53	6	short	학교 가는 날인 점을 생각하면 놀이동산에 놀랍게 사람이 많더라고요.	The amusement park was surprisingly crowded for a school day.	\N	\N	\N	\N	{amusement,park,crowded,school}	053_06.mp3	053_06.mp3	053_06.mp3	053_06.mp3	053_06.mp3
625	2	51	8	dialogue	\N	\N	\N	\N	응, 근데 스피킹은 아직 부족한 느낌이야.	Yeah, but I still feel like I need to get better at speaking.	{feel,need,better,speaking}	051_08.mp3	051_08.mp3	051_08.mp3	051_08.mp3	051_08.mp3
651	2	53	10	dialogue	\N	\N	\N	\N	방금 길 건넌 분 말이니? 응. 키에 비해 어깨가 진짜 넓어.	The one who just crossed the street? Yeah, he has really wide shoulders for how tall he is.	{crossed,street,wide,shoulders}	053_10.mp3	053_10.mp3	053_10.mp3	053_10.mp3	053_10.mp3
652	2	53	11	dialogue	\N	\N	내 비건 버거 한 입 먹어 봐. 차이가 느껴져?	Try a bite of my vegan hamburger. Can you tell the difference?	\N	\N	{try,vegan,hamburger,difference}	053_11.mp3	053_11.mp3	053_11.mp3	053_11.mp3	053_11.mp3
657	1	54	3	short	미안한데 지금 가 봐야 해. 나중에 다시 이야기하자. 커피 한잔하면서.	I'm sorry. I have to go now, but let's catch up later. Maybe over some coffee.	\N	\N	\N	\N	{sorry,catch,later,coffee}	054_03.mp3	054_03.mp3	054_03.mp3	054_03.mp3	054_03.mp3
658	1	54	4	short	제 여자 친구가 친구들이랑 놀러 나갔어요. 술 마시면서 가십을 나누고 있는 게 틀림없어요.	My girlfriend's out with friends now. I'm sure they're sharing gossip over drinks.	\N	\N	\N	\N	{girlfriend,friends,gossip,drinks}	054_04.mp3	054_04.mp3	054_04.mp3	054_04.mp3	054_04.mp3
659	1	54	5	short	한국인은 삼겹살과 소주를 하면서 친해지는 것을 좋아하는 것 같아.	Koreans seem to love bonding over pork belly and soju.	\N	\N	\N	\N	{koreans,bonding,pork,soju}	054_05.mp3	054_05.mp3	054_05.mp3	054_05.mp3	054_05.mp3
660	1	54	6	short	나 이성 관계 때문에 진지한 조언이 필요해. 커피 말고 술 한잔하면서 이야기하면 어떨까?	I need some serious relationship advice. Maybe we could meet over drinks instead of coffee.	\N	\N	\N	\N	{serious,relationship,advice,drinks}	054_06.mp3	054_06.mp3	054_06.mp3	054_06.mp3	054_06.mp3
661	2	54	7	dialogue	\N	\N	좋습니다. 협력사 관련 대금 문제는 이제 해결된 것 같군요. 다음으로, 새로 온 팀원 관련해서 물어볼게요.	Okay, I think we've solved the billing problem with our supplier. Next, I want to ask you about the new team member.	\N	\N	{solved,billing,supplier,team}	054_07.mp3	054_07.mp3	054_07.mp3	054_07.mp3	054_07.mp3
662	2	54	8	dialogue	\N	\N	\N	\N	음, 술 한잔하면서 이야기하시죠. 그 얘기라면 할 말이 많아서요.	Um, let's talk about that over drinks. I have a lot to say on the topic.	{talk,over,drinks,topic}	054_08.mp3	054_08.mp3	054_08.mp3	054_08.mp3	054_08.mp3
663	2	54	9	dialogue	\N	\N	안녕, Carrie! 잘 지냈어? 나가서 샐러드 먹으면서 이야기하자.	Hey, Carrie! How are you? Let's go out and catch up over some salads.	\N	\N	{carrie,catch,over,salads}	054_09.mp3	054_09.mp3	054_09.mp3	054_09.mp3	054_09.mp3
664	2	54	10	dialogue	\N	\N	\N	\N	사실 너한테 할 이야기가 있는데, 한잔하면서 해야 할 듯. 남편 전화기를 보다가 뭔가를 발견했거든.	Actually, I have something to share with you, and maybe it should be over drinks. I was looking through my husband's phone and I found something.	{share,over,drinks,husband}	054_10.mp3	054_10.mp3	054_10.mp3	054_10.mp3	054_10.mp3
666	1	55	1	short	출근 전에 잠깐 우리 집 들러서 커피 한잔하고 가.	Swing by my place for coffee before work.	\N	\N	\N	\N	{swing,place,coffee,work}	055_01.mp3	055_01.mp3	055_01.mp3	055_01.mp3	055_01.mp3
667	1	55	2	short	Terry 선물 사는 거 깜박했다! 파티 가는 길에 빵집 있어? 잠깐 들러서 케이크 사갈까 싶은데.	I forgot to get Terry a gift! Is there a bakery on our way to the party? Maybe we can swing by and grab a cake.	\N	\N	\N	\N	{forgot,gift,bakery,swing}	055_02.mp3	055_02.mp3	055_02.mp3	055_02.mp3	055_02.mp3
668	1	55	3	short	이따 오후에 네 사무실에 잠깐 들러도 될까?	Do you mind if I swing by your office later this afternoon?	\N	\N	\N	\N	{mind,swing,office,afternoon}	055_03.mp3	055_03.mp3	055_03.mp3	055_03.mp3	055_03.mp3
669	1	55	4	short	집에 오는 길에 그 술집 들르면 안 돼! 콘서트장에 늦지 않으려면 서둘러야 해.	Please don't swing by the bar on your way home! We need to rush a little to make it to the concert on time.	\N	\N	\N	\N	{swing,bar,rush,concert}	055_04.mp3	055_04.mp3	055_04.mp3	055_04.mp3	055_04.mp3
670	1	55	5	short	집에 가기 전에 잠깐만 들러서 술 한잔만 더 하고 가자. 내가 살게!	Let's swing by there and have just one more drink before you head home. My treat!	\N	\N	\N	\N	{swing,drink,head,treat}	055_05.mp3	055_05.mp3	055_05.mp3	055_05.mp3	055_05.mp3
671	2	55	7	dialogue	\N	\N	웬일이야! 들어와.	What a surprise! Please come in.	\N	\N	{surprise,come}	055_07.mp3	055_07.mp3	055_07.mp3	055_07.mp3	055_07.mp3
649	2	53	8	dialogue	\N	\N	\N	\N	고마워요. 영국 드라마를 많이 봤고, 연습도 많이 하려고 해요.	Thanks. I've watched a lot of British shows, and I make sure to practice as much as possible.	{watched,british,shows,practice}	053_08.mp3	053_08.mp3	053_08.mp3	053_08.mp3	053_08.mp3
650	2	53	9	dialogue	\N	\N	저 남자 봤어?	Did you see that guy?	\N	\N	{see,guy}	053_09.mp3	053_09.mp3	053_09.mp3	053_09.mp3	053_09.mp3
653	2	53	12	dialogue	\N	\N	\N	\N	응, 내가 먹는 일반 버거랑은 분명 다르긴 하네. 그래도 두부로 만든 것치고는 고기 맛이 꽤 나긴 하네.	Yeah, it's definitely not the same as my real burger. Still it tastes pretty meaty for something made from tofu.	{definitely,burger,meaty,tofu}	053_12.mp3	053_12.mp3	053_12.mp3	053_12.mp3	053_12.mp3
674	2	55	10	dialogue	\N	\N	\N	\N	분명 괜찮을 거야, 아니면 내가 잠깐 들러서 확인해도 되고.	I'm sure she's fine, but I wouldn't mind swinging by and checking in on her.	{sure,fine,swinging,checking}	055_10.mp3	055_10.mp3	055_10.mp3	055_10.mp3	055_10.mp3
675	2	55	11	dialogue	\N	\N	아, 잠깐 들를 거라는 거죠? 그럼 3시 45분 어때요?	Oh, you need to swing by? How about 3:45?	\N	\N	{need,swing,3:45}	055_11.mp3	055_11.mp3	055_11.mp3	055_11.mp3	055_11.mp3
677	3	55	13	long	지난주 매장 그랜드 오픈 후에 문제없이 잘 돌아가고 있길 바랍니다. 물론, 여러분이 새로운 루틴에 적응하는 데 시간이 좀 걸리겠습니다만, Yamata 씨가 매장에 들러서 모든 것이 순조로운지 보고 싶어 하십니다.	After the grand opening last week, we hope business has been going smoothly. Of course, it will take some time for you guys to get settled into your new routines. Mr. Yamata wanted to swing by and make sure everything is okay.	\N	\N	\N	\N	{grand,opening,smoothly,routines,swing}	055_13.mp3	055_13.mp3	055_13.mp3	055_13.mp3	055_13.mp3
678	1	56	1	short	죄송한데 선약이 있습니다.	I'm afraid I already have plans.	\N	\N	\N	\N	{afraid,already,plans}	056_01.mp3	056_01.mp3	056_01.mp3	056_01.mp3	056_01.mp3
679	1	56	2	short	미안한데 안 돼. 나 이미 약속이 있거든.	I'm sorry, I can't. I already have plans.	\N	\N	\N	\N	{sorry,already,plans}	056_02.mp3	056_02.mp3	056_02.mp3	056_02.mp3	056_02.mp3
731	2	60	7	dialogue	\N	\N	나 관리자로 승진했어.	I just got promoted to supervisor.	\N	\N	{promoted,supervisor}	060_07.mp3	060_07.mp3	060_07.mp3	060_07.mp3	060_07.mp3
680	1	56	3	short	이번 주에 등산이나 하면 어떨까 하는데. 이번 일요일에 약속 있어?	I thought maybe we could go for a hike or something this week. Do you have any plans this Sunday?	\N	\N	\N	\N	{thought,hike,plans,sunday}	056_03.mp3	056_03.mp3	056_03.mp3	056_03.mp3	056_03.mp3
681	1	56	4	short	금요일에 나랑 전시회 갈래? 선약이 없으면 말이야.	Do you want to come with me to the exhibition on Friday? I mean if you don't already have plans.	\N	\N	\N	\N	{exhibition,friday,already,plans}	056_04.mp3	056_04.mp3	056_04.mp3	056_04.mp3	056_04.mp3
682	1	56	5	short	실은 대치동에서 부동산 중개업자 분과 약속이 있어요. 거기로 이사를 할까 해서요.	I actually have this appointment with a real estate agent in Daechi-dong. I'm thinking of moving there.	\N	\N	\N	\N	{appointment,real,estate,daechi}	056_05.mp3	056_05.mp3	056_05.mp3	056_05.mp3	056_05.mp3
683	1	56	6	short	제가 매주 화요일에는 퇴근 후에 PT 스케줄이 있습니다.	I have a personal training appointment every Tuesday after work.	\N	\N	\N	\N	{personal,training,appointment,tuesday}	056_06.mp3	056_06.mp3	056_06.mp3	056_06.mp3	056_06.mp3
684	2	56	7	dialogue	\N	\N	이번 주말에 뭐해? 난 스케줄이 하나도 없어.	What are you up to this weekend? My schedule's completely free.	\N	\N	{weekend,schedule,completely,free}	056_07.mp3	056_07.mp3	056_07.mp3	056_07.mp3	056_07.mp3
685	2	56	8	dialogue	\N	\N	\N	\N	토요일 날 친구가 국악 콘서트에서 연주하거든. 너 약속 없으면, 같이 가는 거 어때?	On Saturday, one of my friends is performing in a Gugak concert. If you don't have any plans, how about coming along?	{saturday,gugak,concert,plans}	056_08.mp3	056_08.mp3	056_08.mp3	056_08.mp3	056_08.mp3
686	2	56	9	dialogue	\N	\N	Julie, 오늘 퇴근하고 우리 팀 회식하기로 했는데, 올 수 있어요?	Hey, Julie. Our team is going out for dinner and drinks after work today. Do you think you can make it?	\N	\N	{team,dinner,drinks,make}	056_09.mp3	056_09.mp3	056_09.mp3	056_09.mp3	056_09.mp3
687	2	56	10	dialogue	\N	\N	\N	\N	아, 죄송한데 선약이 있어요. 오늘 밤에 처음으로 남자 친구 부모님을 뵙거든요.	Oh, I'm afraid I actually have plans. I'm meeting my boyfriend's parents for the first time tonight.	{afraid,plans,meeting,parents}	056_10.mp3	056_10.mp3	056_10.mp3	056_10.mp3	056_10.mp3
688	2	56	11	dialogue	\N	\N	우리 얼굴 안 본 지 꽤 됐다. 금요일 날 시간 돼?	It's been a while since we last met up! Do you have time to chill on Friday?	\N	\N	{while,met,time,friday}	056_11.mp3	056_11.mp3	056_11.mp3	056_11.mp3	056_11.mp3
689	2	56	12	dialogue	\N	\N	\N	\N	금요일 1시에 병원 예약이 잡혀 있는데 그 이후에는 다 괜찮아!	On Friday, I have a doctor's appointment at 1 p.m. But any time after that, I'm free to meet!	{friday,doctor,appointment,free}	056_12.mp3	056_12.mp3	056_12.mp3	056_12.mp3	056_12.mp3
691	1	57	1	short	요새 돈이 좀 궁해.	Money is a bit tight right now.	\N	\N	\N	\N	{money,bit,tight,now}	057_01.mp3	057_01.mp3	057_01.mp3	057_01.mp3	057_01.mp3
693	1	57	3	short	너 요새 금전적으로 어려우면 계산은 내가 해도 돼.	I can take care of the check if you're tight on cash.	\N	\N	\N	\N	{take,care,check,tight}	057_03.mp3	057_03.mp3	057_03.mp3	057_03.mp3	057_03.mp3
694	1	57	4	short	혹시 할부로 구매할 방법이 있을까요? 이 컴퓨터 너무 마음에 드는데 이번 달에 자금 사정이 좀 안 좋아서요.	Is there any way I can pay for this in installments? I love the computer, but money's tight this month.	\N	\N	\N	\N	{pay,installments,computer,tight}	057_04.mp3	057_04.mp3	057_04.mp3	057_04.mp3	057_04.mp3
695	1	57	5	short	이 웹사이트에는 적은 돈으로 요리할 수 있는 레시피가 굉장히 많아요.	This website has a lot of recipes for cooking on a tight budget.	\N	\N	\N	\N	{website,recipes,cooking,budget}	057_05.mp3	057_05.mp3	057_05.mp3	057_05.mp3	057_05.mp3
696	1	57	6	short	제 조카가 캘리포니아로 유학을 가는데, 장학금을 못 받으면 굉장히 팍팍할 거예요.	My nephew is going to California for university, but without any scholarships, his budget is going to be tight.	\N	\N	\N	\N	{nephew,california,scholarships,budget}	057_06.mp3	057_06.mp3	057_06.mp3	057_06.mp3	057_06.mp3
673	2	55	9	dialogue	\N	\N	우리 예리가 조금 걱정이 되네. 집에 혼자 남겨 두는 건 처음이라.	I'm a little worried about our Yeri. This is the first time we've left her at home by herself.	\N	\N	{worried,yeri,first,home}	055_09.mp3	055_09.mp3	055_09.mp3	055_09.mp3	055_09.mp3
699	2	57	9	dialogue	\N	\N	Harper 씨, 어떻게 된 건가요? 올해 제 성과가 썩 좋지 않아서인가요?	What is it, Mr. Harper? Was my performance not so good this year?	\N	\N	{harper,performance,good,year}	057_09.mp3	057_09.mp3	057_09.mp3	057_09.mp3	057_09.mp3
702	1	58	1	short	근무 시간은 어때?	What are the hours like?	\N	\N	\N	\N	{hours,like}	058_01.mp3	058_01.mp3	058_01.mp3	058_01.mp3	058_01.mp3
703	1	58	2	short	근무 시간은 긴데, 그래도 급여는 평균 이상이야.	The hours are long, but at least the pay is above average.	\N	\N	\N	\N	{hours,long,pay,average}	058_02.mp3	058_02.mp3	058_02.mp3	058_02.mp3	058_02.mp3
704	1	58	3	short	근무 시간은 나쁘지 않은데 출퇴근이 너무 오래 걸려.	The hours aren't bad, but my commute takes forever.	\N	\N	\N	\N	{hours,bad,commute,forever}	058_03.mp3	058_03.mp3	058_03.mp3	058_03.mp3	058_03.mp3
705	1	58	4	short	근무 시간은 너무 좋아. 매일 저녁 애들이랑 시간을 보낼 수도 있고. 근데 급여가 조금 낮아.	The hours are great. I get to spend every evening with my boys. Then again, the pay is a bit low.	\N	\N	\N	\N	{hours,great,evening,pay}	058_04.mp3	058_04.mp3	058_04.mp3	058_04.mp3	058_04.mp3
706	1	58	5	short	근무 시간이 어떻게 되는지와 초과 근무가 의무인지 확인하고 싶습니다.	I just wanted to know what the hours are like, and if any overtime is mandatory.	\N	\N	\N	\N	{know,hours,overtime,mandatory}	058_05.mp3	058_05.mp3	058_05.mp3	058_05.mp3	058_05.mp3
707	1	58	6	short	근무 시간이 너무 적어서 부업으로 과외를 할까 생각 중입니다. 돈이 정말 필요하거든요.	I'm not getting enough hours, so I'm thinking about doing some tutoring on the side, too. I could really use the money.	\N	\N	\N	\N	{getting,hours,tutoring,money}	058_06.mp3	058_06.mp3	058_06.mp3	058_06.mp3	058_06.mp3
708	2	58	7	dialogue	\N	\N	안녕하세요. 파트타임 요리사를 구한다는 것 봤습니다. 근무 시간이 어떻게 되는지 물어봐도 될까요?	Hello. I saw that you have an opening for a part-time cook. May I ask what the hours are?	\N	\N	{opening,part-time,cook,hours}	058_07.mp3	058_07.mp3	058_07.mp3	058_07.mp3	058_07.mp3
709	2	58	8	dialogue	\N	\N	\N	\N	자리가 몇 개 있습니다. 면접 보러 오셔서 세부 내용을 조율하면 어떨까 합니다.	We have a few positions available! Why don't you come in for an interview, and we can work out the details.	{positions,available,interview,details}	058_08.mp3	058_08.mp3	058_08.mp3	058_08.mp3	058_08.mp3
710	2	58	9	dialogue	\N	\N	이제 거의 60세인데, 연봉이 꽤 높으시네요. 계속 정규직으로 모시고 갈 수 있을지 모르겠습니다. 은퇴는 생각해 보셨어요?	Well, you're almost sixty now, and your salary is pretty high. I'm not sure if we can afford to keep you on full-time. Have you considered retiring?	\N	\N	{sixty,salary,full-time,retiring}	058_09.mp3	058_09.mp3	058_09.mp3	058_09.mp3	058_09.mp3
711	2	58	10	dialogue	\N	\N	\N	\N	솔직히, 아직 은퇴는 생각이 없습니다만, 근무 시간을 좀 줄이는 건 어떨까요?	Honestly, I'd rather not retire yet, but how about if I started working fewer hours?	{honestly,retire,working,fewer}	058_10.mp3	058_10.mp3	058_10.mp3	058_10.mp3	058_10.mp3
713	1	59	1	short	회사에 일이 너무 많긴 한데, 그래도 감당하기 힘든 수준은 아닙니다.	I have a lot on my plate at work, but it's nothing I can't handle.	\N	\N	\N	\N	{plate,work,nothing,handle}	059_01.mp3	059_01.mp3	059_01.mp3	059_01.mp3	059_01.mp3
714	1	59	2	short	매운 한국 음식은 도저히 감당이 안 돼요.	I can't handle spicy Korean food.	\N	\N	\N	\N	{handle,spicy,korean,food}	059_02.mp3	059_02.mp3	059_02.mp3	059_02.mp3	059_02.mp3
715	1	59	3	short	한국 여름은 살인적이에요. 제가 열이 많아서 더운 걸 못 견디거든요.	Summers in Korea are brutal. I'm hot-natured, which means I can't stand the heat.	\N	\N	\N	\N	{summers,brutal,hot-natured,heat}	059_03.mp3	059_03.mp3	059_03.mp3	059_03.mp3	059_03.mp3
716	1	59	4	short	남자아이들로만 구성된 수업을 해야 하는 건 너무 싫어요. 십대 남자아이들 15명은 감당하기 힘듭니다.	I hate when I have to teach all-boys classes. 15 teenage boys are more than I can handle.	\N	\N	\N	\N	{teach,all-boys,teenage,handle}	059_04.mp3	059_04.mp3	059_04.mp3	059_04.mp3	059_04.mp3
717	1	59	5	short	추가로 더 온다는 사람 있으면 파티 음식은 외부에 맡기자. 10인분 요리하는 건 힘들어.	If anyone else says they are coming, let's get the party catered. Cooking for ten is more than I can handle.	\N	\N	\N	\N	{coming,party,catered,handle}	059_05.mp3	059_05.mp3	059_05.mp3	059_05.mp3	059_05.mp3
718	2	59	7	dialogue	\N	\N	습기가 너무 심해서 견디기가 힘들어. 내가 샌디에이고의 좋은 날씨에만 익숙해서 말이야.	I can't handle all this humidity. I'm from San Diego, so I'm spoiled by the good weather there.	\N	\N	{handle,humidity,san,diego}	059_07.mp3	059_07.mp3	059_07.mp3	059_07.mp3	059_07.mp3
698	2	57	8	dialogue	\N	\N	\N	\N	응, 여보. 근데 우리 외식 너무 많이 하지 말아야 할 듯. 요새 우리 좀 빠듯하잖아, 안 그래?	Yeah, honey, but I think we should stop eating out so much. Money's a bit tight right now, don't you think?	{honey,eating,money,tight}	057_08.mp3	057_08.mp3	057_08.mp3	057_08.mp3	057_08.mp3
701	3	57	13	long	연간 보고서를 보면 매출이 전년 대비 8% 감소했습니다. 이것은 경비 예산이 더 빠듯해진다는 뜻이며, 그에 따라 모든 직원들에게 출장을 줄일 것을 요청합니다. 직접 해외 출장을 가는 대신 가능하다면 줌으로 회의를 진행해 주셔야 합니다.	Our annual report shows that sales dropped about 8% year-over-year. This means that the expense budget is tighter, and we're asking all staff to cut down on travel accordingly. Instead of physically going abroad for business, Zoom meetings are to be conducted whenever possible.	\N	\N	\N	\N	{annual,report,sales,budget,zoom}	057_13.mp3	057_13.mp3	057_13.mp3	057_13.mp3	057_13.mp3
721	2	59	10	dialogue	\N	\N	\N	\N	그래, 그럴 수도 있겠다. 너무 매워서 못 먹겠으면, 밥이랑 같이 먹거나 아니면 치즈를 좀 시켜서 위에 올려서 먹으면 돼.	Yeah, it can be. If it's too spicy for you to handle, have it with some rice. Or we can order some cheese to put on top.	{spicy,handle,rice,cheese}	059_10.mp3	059_10.mp3	059_10.mp3	059_10.mp3	059_10.mp3
722	2	59	11	dialogue	\N	\N	노스페이스가 패딩 신상 출시한 거 알아? 하나 사고 싶었는데, 홈페이지가 다운됐네.	Do you see North Face came out with a new padded coat? I wanted to get one, but their website is down.	\N	\N	{north,face,padded,website}	059_11.mp3	059_11.mp3	059_11.mp3	059_11.mp3	059_11.mp3
723	2	59	12	dialogue	\N	\N	\N	\N	아마 주문이 폭주하는 바람에 사이트가 다운된 걸 거야.	Maybe they got more orders than they can handle, and their site crashed.	{orders,handle,site,crashed}	059_12.mp3	059_12.mp3	059_12.mp3	059_12.mp3	059_12.mp3
725	1	60	1	short	이건 파티해야 돼!	That calls for a party!	\N	\N	\N	\N	{calls,party}	060_01.mp3	060_01.mp3	060_01.mp3	060_01.mp3	060_01.mp3
726	1	60	2	short	이건 축하해야 할 일이네!	That calls for a celebration!	\N	\N	\N	\N	{calls,celebration}	060_02.mp3	060_02.mp3	060_02.mp3	060_02.mp3	060_02.mp3
727	1	60	3	short	한잔 더 하러 가야 하겠어.	This calls for another round.	\N	\N	\N	\N	{calls,another,round}	060_03.mp3	060_03.mp3	060_03.mp3	060_03.mp3	060_03.mp3
728	1	60	4	short	이건 올리브기름이 있어야 하거든. 옥수수기름으로 대체해도 될까?	It calls for olive oil. Do you think corn oil will work as a substitute?	\N	\N	\N	\N	{calls,olive,corn,substitute}	060_04.mp3	060_04.mp3	060_04.mp3	060_04.mp3	060_04.mp3
729	1	60	5	short	이건 바닐라 추출물이 있어야 해. 아직 좀 남았나?	It calls for vanilla extract. Do we still have any?	\N	\N	\N	\N	{calls,vanilla,extract,have}	060_05.mp3	060_05.mp3	060_05.mp3	060_05.mp3	060_05.mp3
730	1	60	6	short	레시피 보니까 파스타에 치즈를 넣어야 하고, 그 위에다가 치즈 한 겹을 얹어야 한대.	The recipe calls for some cheese in the pasta, but then a whole other layer of cheese on top of that.	\N	\N	\N	\N	{recipe,calls,cheese,layer}	060_06.mp3	060_06.mp3	060_06.mp3	060_06.mp3	060_06.mp3
732	2	60	8	dialogue	\N	\N	\N	\N	너무 잘됐다! 파티라도 해야겠는걸!	That's awesome! That calls for a party!	{awesome,calls,party}	060_08.mp3	060_08.mp3	060_08.mp3	060_08.mp3	060_08.mp3
733	2	60	9	dialogue	\N	\N	보니까 냉장고에 돼지고기밖에 없네.	It turns out we only have pork in the fridge.	\N	\N	{turns,pork,fridge}	060_09.mp3	060_09.mp3	060_09.mp3	060_09.mp3	060_09.mp3
735	2	60	11	dialogue	\N	\N	나랑 맥주 마셔 줘서 고마워. 사장이 나를 다음 달부터 파트타임으로 강등시키기로 했더라고.	Thanks for grabbing a beer with me. It turns out the boss decided to demote me to part-time, starting next month.	\N	\N	{thanks,beer,boss,demote}	060_11.mp3	060_11.mp3	060_11.mp3	060_11.mp3	060_11.mp3
736	2	60	12	dialogue	\N	\N	\N	\N	아, 마음이 안 좋아서 더 센 술 마셔야 되겠네. 내가 살 테니 위스키 한 병 어때?	Oh, that's rough, and it calls for something stronger. How about a bottle of whisky, on me?	{rough,calls,stronger,whisky}	060_12.mp3	060_12.mp3	060_12.mp3	060_12.mp3	060_12.mp3
738	1	61	1	short	죄송해요. 못 들었어요.	I'm sorry. I didn't catch that.	\N	\N	\N	\N	{sorry,catch}	061_01.mp3	061_01.mp3	061_01.mp3	061_01.mp3	061_01.mp3
739	1	61	2	short	미안한데 잘 못 들었어요. 한 번만 더 이야기해 주시겠어요?	Oh, I'm sorry. I didn't catch that. Could you repeat it?	\N	\N	\N	\N	{sorry,catch,repeat}	061_02.mp3	061_02.mp3	061_02.mp3	061_02.mp3	061_02.mp3
740	1	61	3	short	성함을 못 들은 것 같습니다.	I'm afraid I didn't catch your name.	\N	\N	\N	\N	{afraid,catch,name}	061_03.mp3	061_03.mp3	061_03.mp3	061_03.mp3	061_03.mp3
741	1	61	4	short	(이사한다는 말을 듣고) 날짜를 잘 못 들었어. 언제 다시 이사 간다고?	I didn't catch the date. When are you moving out again?	\N	\N	\N	\N	{catch,date,moving}	061_04.mp3	061_04.mp3	061_04.mp3	061_04.mp3	061_04.mp3
742	1	61	5	short	(발표자가 청중에게) 혹시 놓친 부분이 있을까요?	Is there anything you weren't able to catch?	\N	\N	\N	\N	{anything,able,catch}	061_05.mp3	061_05.mp3	061_05.mp3	061_05.mp3	061_05.mp3
743	1	61	6	short	예산에 관해 이야기하실 때 제가 발표 내용 일부를 놓쳤어요.	I didn't catch the part of your presentation when you talked about the budget.	\N	\N	\N	\N	{catch,part,presentation,budget}	061_06.mp3	061_06.mp3	061_06.mp3	061_06.mp3	061_06.mp3
744	2	61	7	dialogue	\N	\N	안녕하세요, 38 사이즈로 새 신발 있는지 문의드려요.	Hello, I was wondering if you have the new shoes in size 38.	\N	\N	{wondering,shoes,size,38}	061_07.mp3	061_07.mp3	061_07.mp3	061_07.mp3	061_07.mp3
745	2	61	8	dialogue	\N	\N	\N	\N	죄송한데, 무슨 사이즈라고요? 잘 못 들었어요.	I'm sorry? What size? I didn't catch that.	{sorry,size,catch}	061_08.mp3	061_08.mp3	061_08.mp3	061_08.mp3	061_08.mp3
720	2	59	9	dialogue	\N	\N	이런, 닭갈비가 이렇게 매운 건 줄 몰랐어.	Oh, man. I didn't know dakgalbi would be so spicy.	\N	\N	{man,dakgalbi,spicy}	059_09.mp3	059_09.mp3	059_09.mp3	059_09.mp3	059_09.mp3
748	2	61	11	dialogue	\N	\N	죄송한데, Kline 선생님? 3, 4번 문제 답을 못 들었어요.	Excuse me, Mr. Kline? I didn't catch the answers to number 3 and 4.	\N	\N	{excuse,kline,catch,answers}	061_11.mp3	061_11.mp3	061_11.mp3	061_11.mp3	061_11.mp3
749	2	61	12	dialogue	\N	\N	\N	\N	아, 그래. 다시 불러 줄게.	Ah, okay. I'll give the answers again.	{okay,give,answers,again}	061_12.mp3	061_12.mp3	061_12.mp3	061_12.mp3	061_12.mp3
751	1	62	1	short	어쩐지 기분이 상쾌해 보이더라.	No wonder you look so refreshed.	\N	\N	\N	\N	{wonder,look,refreshed}	062_01.mp3	062_01.mp3	062_01.mp3	062_01.mp3	062_01.mp3
752	1	62	2	short	당신 어제 새벽 3시나 되어서 집에 들어온 데다, 술 냄새가 진동하더군. 오늘 아픈 게 당연한 거야.	You didn't get home until 3:00 a.m., and you reeked of alcohol. No wonder you feel sick today.	\N	\N	\N	\N	{home,reeked,alcohol,wonder}	062_02.mp3	062_02.mp3	062_02.mp3	062_02.mp3	062_02.mp3
753	1	62	3	short	너희 동네에서 시위가 있었다고 뉴스에서 들었어. 그래서 늦었구나.	I heard on the news that there was a protest in your neighborhood. No wonder you're late.	\N	\N	\N	\N	{heard,news,protest,wonder}	062_03.mp3	062_03.mp3	062_03.mp3	062_03.mp3	062_03.mp3
754	1	62	4	short	그 사람은 패션 감각이 전혀 없어요. 그러니까 여자 친구가 안 생기죠.	He has zero fashion sense. No wonder he can't find a girlfriend.	\N	\N	\N	\N	{zero,fashion,sense,wonder}	062_04.mp3	062_04.mp3	062_04.mp3	062_04.mp3	062_04.mp3
755	1	62	5	short	공급망 문제가 있으니, 가격이 올라가는 건 당연하죠.	There's a supply chain issue, so no wonder prices are rising.	\N	\N	\N	\N	{supply,chain,wonder,prices}	062_05.mp3	062_05.mp3	062_05.mp3	062_05.mp3	062_05.mp3
756	1	62	6	short	재료가 기본적으로 버터, 밀가루, 설탕이군. 그래서 맛이 좋은 거구나.	The ingredients are just butter, flour, and sugar. No wonder it tastes good.	\N	\N	\N	\N	{ingredients,butter,flour,wonder}	062_06.mp3	062_06.mp3	062_06.mp3	062_06.mp3	062_06.mp3
757	2	62	7	dialogue	\N	\N	Gerry가 어젯밤에 사장이랑 소주 다섯 병 마셨다더라.	I heard Gerry drank five bottles of soju with the boss last night.	\N	\N	{heard,gerry,bottles,soju}	062_07.mp3	062_07.mp3	062_07.mp3	062_07.mp3	062_07.mp3
758	2	62	8	dialogue	\N	\N	\N	\N	아, 그래서 아침에 그 친구 눈이 그렇게 빨갰구나.	Oh, no wonder his eyes were so red this morning.	{wonder,eyes,red,morning}	062_08.mp3	062_08.mp3	062_08.mp3	062_08.mp3	062_08.mp3
759	2	62	9	dialogue	\N	\N	간식 고마워요. 아침 먹고는 아무것도 못 먹었어요.	Thank you for the snack. I didn't have anything since breakfast.	\N	\N	{thank,snack,anything,breakfast}	062_09.mp3	062_09.mp3	062_09.mp3	062_09.mp3	062_09.mp3
760	2	62	10	dialogue	\N	\N	\N	\N	알죠! 그러면 당연히 배고프죠.	I see! No wonder you were so hungry.	{see,wonder,hungry}	062_10.mp3	062_10.mp3	062_10.mp3	062_10.mp3	062_10.mp3
762	2	62	12	dialogue	\N	\N	\N	\N	그래서 파업을 하는 거구나. 돈을 그렇게 많이 받는데 왜 파업을 하나 했거든.	No wonder they're on strike. I was wondering, since they get paid so much.	{wonder,strike,wondering,paid}	062_12.mp3	062_12.mp3	062_12.mp3	062_12.mp3	062_12.mp3
765	1	63	2	short	제 상황에 해당하는 딱 맞는 단어가 생각이 안 납니다.	I can't think of the right word for my situation.	\N	\N	\N	\N	{think,right,word,situation}	063_02.mp3	063_02.mp3	063_02.mp3	063_02.mp3	063_02.mp3
766	1	63	3	short	'화가 나'보다 내 감정을 더 잘 표현할 수 있는 단어는 없는 듯해.	I can't think of a better word to describe how I feel than 'angry'.	\N	\N	\N	\N	{think,better,word,angry}	063_03.mp3	063_03.mp3	063_03.mp3	063_03.mp3	063_03.mp3
767	1	63	4	short	전시회 너무 멋졌어. 오후 시간을 이보다 더 잘 보낼 수가 있을까?	What a nice exhibition. I can't think of a better way to spend my afternoon off.	\N	\N	\N	\N	{nice,exhibition,think,better}	063_04.mp3	063_04.mp3	063_04.mp3	063_04.mp3	063_04.mp3
768	1	63	5	short	남은 치즈를 어디에다 써야 할지 모르겠네.	I can't think of a use for all this leftover cheese.	\N	\N	\N	\N	{think,use,leftover,cheese}	063_05.mp3	063_05.mp3	063_05.mp3	063_05.mp3	063_05.mp3
769	1	63	6	short	듀얼 모니터 쓰면 너무 편리해. 동시에 여러 가지 작업을 하거나 작업을 바꿔 가며 하는 게 가능하거든. 단점은 찾을 수가 없어.	Using dual monitors is really convenient. I can multitask or switch between tasks. I can't think of any downside.	\N	\N	\N	\N	{dual,monitors,multitask,downside}	063_06.mp3	063_06.mp3	063_06.mp3	063_06.mp3	063_06.mp3
770	2	63	7	dialogue	\N	\N	아는 사람 중에 전기차 타는 사람 있어?	Do you know anyone who has an electric vehicle?	\N	\N	{know,anyone,electric,vehicle}	063_07.mp3	063_07.mp3	063_07.mp3	063_07.mp3	063_07.mp3
796	2	65	10	dialogue	\N	\N	\N	\N	진짜로? 그 친구 배경을 모르나 보네? 해외 유학도 간 적이 없거든.	Oh, really? Aren't you aware of his background? He's never studied abroad.	{really,aware,background,abroad}	065_10.mp3	065_10.mp3	065_10.mp3	065_10.mp3	065_10.mp3
747	2	61	10	dialogue	\N	\N	\N	\N	하하, 괜찮아요. 제 책에 관심 가져 주시는 것만으로도 좋은데요.	Haha, no problem. I'm just glad you're interested in my work.	{problem,glad,interested,work}	061_10.mp3	061_10.mp3	061_10.mp3	061_10.mp3	061_10.mp3
775	1	64	1	short	새해가 코앞이네. 그나저나 너 부모님 댁에 갈 거야?	New Year's is just around the corner. Are you going to your parent's house, by the way?	\N	\N	\N	\N	{new,year,corner,way}	064_01.mp3	064_01.mp3	064_01.mp3	064_01.mp3	064_01.mp3
776	1	64	2	short	그래서 내가 다른 재즈 페스티벌에 안 가는 거야. 그나저나 넌 재즈 좋아해?	That's why I'll never go to another Jazz Festival. Do you like jazz, by the way?	\N	\N	\N	\N	{never,jazz,festival,way}	064_02.mp3	064_02.mp3	064_02.mp3	064_02.mp3	064_02.mp3
777	1	64	3	short	이 방에는 두 개의 트윈 침대가 구비되어 있습니다. 참고로 해변도 너무 잘 보입니다.	This room comes with two twin beds. You'll also have a great view of the beach, by the way.	\N	\N	\N	\N	{room,twin,beds,beach}	064_03.mp3	064_03.mp3	064_03.mp3	064_03.mp3	064_03.mp3
778	1	64	4	short	제 친구가 트레이너를 구하고 있어요. 참고로 제 친구는 싱글이에요.	I have a friend who's looking for a trainer. He's single, by the way.	\N	\N	\N	\N	{friend,looking,trainer,single}	064_04.mp3	064_04.mp3	064_04.mp3	064_04.mp3	064_04.mp3
779	1	64	5	short	Mark랑 Mindy 먹을 음식도 주문해야 해. 그나저나 그 친구들은 언제 도착한대?	We'll just have to order something for Mark and Mindy. When are they coming, by the way?	\N	\N	\N	\N	{order,mark,mindy,coming}	064_05.mp3	064_05.mp3	064_05.mp3	064_05.mp3	064_05.mp3
780	2	64	7	dialogue	\N	\N	나랑 같이 요가 수업 받을래? 친구를 소개하면 할인받을 수 있거든.	Do you want to join this yoga class with me? I can get a discount for referring a friend.	\N	\N	{join,yoga,class,discount}	064_07.mp3	064_07.mp3	064_07.mp3	064_07.mp3	064_07.mp3
781	2	64	8	dialogue	\N	\N	\N	\N	생각해 볼게. 유연성을 좀 기르긴 해야 해. 근데 선생님 귀여우셔?	I'll think about it. I do need to work on my flexibility. By the way, is the instructor cute?	{think,flexibility,instructor,cute}	064_08.mp3	064_08.mp3	064_08.mp3	064_08.mp3	064_08.mp3
782	2	64	9	dialogue	\N	\N	아직 만나는 사람 없지? 내 친구 Samantha 소개해 줄까? 네 또래인 데다 엄청 착해.	You're still single, right? Can I set you up with my friend, Samantha? She's your age and really kind.	\N	\N	{single,set,samantha,kind}	064_09.mp3	064_09.mp3	064_09.mp3	064_09.mp3	064_09.mp3
783	2	64	10	dialogue	\N	\N	\N	\N	좋아! 그나저나 Samantha MBTI가 뭔지 알아?	Sounds great! By the way, do you know Samantha's MBTI?	{sounds,great,samantha,mbti}	064_10.mp3	064_10.mp3	064_10.mp3	064_10.mp3	064_10.mp3
784	2	64	11	dialogue	\N	\N	안녕하세요. 벤츠 신모델 정보 좀 알고 싶어서요.	Hi, there. I'd like some more information on the new Mercedes model.	\N	\N	{information,new,mercedes,model}	064_11.mp3	064_11.mp3	064_11.mp3	064_11.mp3	064_11.mp3
785	2	64	12	dialogue	\N	\N	\N	\N	물론이죠. 전부 말씀드릴게요. 그나저나 지금 타는 차량 종류가 어떤 거세요?	Sure. I can tell you all about it. Which make of car are you currently driving, by the way?	{sure,tell,make,driving}	064_12.mp3	064_12.mp3	064_12.mp3	064_12.mp3	064_12.mp3
786	3	64	13	long	어젯밤에 나랑 놀아 줘서 고마워! 나는 너무 재미있었는데 너도 그랬으면 좋겠어. 그나저나 회사 안 늦었어? 너 택시 타다가 넘어질 뻔해서 좀 걱정되더라고.	Thank you for hanging out with me last night! I had a great time and I hope you felt the same way. Btw, did you make it to work on time? I was a little worried after you almost fell getting into a cab.	\N	\N	\N	\N	{hanging,great,time,worried,cab}	064_13.mp3	064_13.mp3	064_13.mp3	064_13.mp3	064_13.mp3
787	1	65	1	short	시간 가는 줄도 몰랐네.	I wasn't aware of the time.	\N	\N	\N	\N	{aware,time}	065_01.mp3	065_01.mp3	065_01.mp3	065_01.mp3	065_01.mp3
788	1	65	2	short	너 남대문 열린 거 아니?	Are you aware your zipper is down?	\N	\N	\N	\N	{aware,zipper,down}	065_02.mp3	065_02.mp3	065_02.mp3	065_02.mp3	065_02.mp3
789	1	65	3	short	너 이에 뭐 낀 거 알아?	Are you aware there is something in your teeth?	\N	\N	\N	\N	{aware,something,teeth}	065_03.mp3	065_03.mp3	065_03.mp3	065_03.mp3	065_03.mp3
790	1	65	4	short	이 좌석이 예약석인 줄을 몰랐습니다.	I wasn't aware that this table was reserved.	\N	\N	\N	\N	{aware,table,reserved}	065_04.mp3	065_04.mp3	065_04.mp3	065_04.mp3	065_04.mp3
791	1	65	5	short	너 아는지 모르겠는데, 화장실 세면대 막혔어.	I don't know if you're aware of this, but the bathroom sink is clogged.	\N	\N	\N	\N	{know,aware,bathroom,clogged}	065_05.mp3	065_05.mp3	065_05.mp3	065_05.mp3	065_05.mp3
792	1	65	6	short	네가 아는지 모르겠지만, 수지 동생이 많이 아파.	I don't know if you're aware of it, but Suzie's brother has been seriously ill.	\N	\N	\N	\N	{know,aware,suzie,ill}	065_06.mp3	065_06.mp3	065_06.mp3	065_06.mp3	065_06.mp3
793	2	65	7	dialogue	\N	\N	셔츠 주머니에 얼룩 묻은 거 아세요?	Are you aware that you have a stain on your shirt pocket?	\N	\N	{aware,stain,shirt,pocket}	065_07.mp3	065_07.mp3	065_07.mp3	065_07.mp3	065_07.mp3
794	2	65	8	dialogue	\N	\N	\N	\N	네, 알고 있는데 지금은 어떻게 할 수가 없어요. 여분 셔츠를 사무실에 하나 둬야겠군요.	Yeah, I know, but there's nothing I can do about it right now. I think I should keep an extra shirt in my office.	{know,nothing,extra,shirt}	065_08.mp3	065_08.mp3	065_08.mp3	065_08.mp3	065_08.mp3
795	2	65	9	dialogue	\N	\N	김 군과의 면접은 생각보다 별로였어.	I wasn't very impressed with Mr. Kim's interview.	\N	\N	{impressed,kim,interview}	065_09.mp3	065_09.mp3	065_09.mp3	065_09.mp3	065_09.mp3
797	2	65	11	dialogue	\N	\N	저 사실 남자 친구랑 왔는데요.	I'm actually here with my boyfriend.	\N	\N	{actually,here,boyfriend}	065_11.mp3	065_11.mp3	065_11.mp3	065_11.mp3	065_11.mp3
772	2	63	9	dialogue	\N	\N	선생님, 한국어 '정'에 해당하는 좋은 번역은 뭘까요?	Sir, what would be a good translation for the Korean term 'Jung'?	\N	\N	{sir,translation,korean,jung}	063_09.mp3	063_09.mp3	063_09.mp3	063_09.mp3	063_09.mp3
801	1	66	2	short	(그룹 콜(단체 통화) 상황에서) 이제 전화를 끊어야 할 듯하네요.	I'm afraid we'll have to let you go.	\N	\N	\N	\N	{afraid,have,let,go}	066_02.mp3	066_02.mp3	066_02.mp3	066_02.mp3	066_02.mp3
802	1	66	3	short	벌써 밤 11시네. 전화 끊어야겠다.	It's already 11 p.m. I think I will have to let you go.	\N	\N	\N	\N	{already,think,let,go}	066_03.mp3	066_03.mp3	066_03.mp3	066_03.mp3	066_03.mp3
803	1	66	4	short	전화 끊어야 할 듯해. 나 버스 타거든.	I think I will have to let you go. I'm getting on the bus.	\N	\N	\N	\N	{think,let,getting,bus}	066_04.mp3	066_04.mp3	066_04.mp3	066_04.mp3	066_04.mp3
804	1	66	5	short	전화 끊어야겠다. 다른 전화가 들어와서.	I think I will have to let you go. I'm getting another call.	\N	\N	\N	\N	{think,let,getting,call}	066_05.mp3	066_05.mp3	066_05.mp3	066_05.mp3	066_05.mp3
806	2	66	7	dialogue	\N	\N	음, 엄마, 전화 끊어도 될까요? 출근 준비를 해야 해서요.	Well, mom, is it alright if I let you go? I should start getting ready for work.	\N	\N	{mom,alright,let,work}	066_07.mp3	066_07.mp3	066_07.mp3	066_07.mp3	066_07.mp3
807	2	66	8	dialogue	\N	\N	\N	\N	당연하지, 얘야. 전화 고마워. 회사에서 좋은 하루 보내고.	Of course, honey. Thanks for calling. Have a great day at work.	{course,honey,thanks,calling}	066_08.mp3	066_08.mp3	066_08.mp3	066_08.mp3	066_08.mp3
808	2	66	9	dialogue	\N	\N	미안한데, 전화가 또 들어오네. 잠깐 끊어도 될까?	Sorry, I'm getting another call. Can I let you go for now?	\N	\N	{sorry,getting,call,let}	066_09.mp3	066_09.mp3	066_09.mp3	066_09.mp3	066_09.mp3
809	2	66	10	dialogue	\N	\N	\N	\N	응. 통화 끝나면 바로 다시 전화 줘.	Okay, but please call me back right away when you're done.	{okay,call,back,done}	066_10.mp3	066_10.mp3	066_10.mp3	066_10.mp3	066_10.mp3
810	2	66	11	dialogue	\N	\N	비번 리셋을 했는데도 여전히 이메일 접속이 안 됩니다.	Even after I reset my password, I still can't get into my email account.	\N	\N	{reset,password,email,account}	066_11.mp3	066_11.mp3	066_11.mp3	066_11.mp3	066_11.mp3
811	2	66	12	dialogue	\N	\N	\N	\N	알겠습니다, 신 과장님. 해결책 찾는 데 시간이 좀 걸릴 것 같으니 지금은 전화 끊고 방법 찾으면 제가 다시 전화드리는 게 어떨까요?	Okay, Ms. Shin. It's probably going to take me some time to figure out a solution, so how about I let you go and call you back when I'm done?	{time,figure,solution,let}	066_12.mp3	066_12.mp3	066_12.mp3	066_12.mp3	066_12.mp3
813	1	67	1	short	설이 일주일도 채 안 남았네.	Lunar New Year is less than a week away.	\N	\N	\N	\N	{lunar,new,year,week}	067_01.mp3	067_01.mp3	067_01.mp3	067_01.mp3	067_01.mp3
814	1	67	2	short	한 정거장만 더 가면 돼. 곧 도착해!	I'm only one stop away. I'll be there soon.	\N	\N	\N	\N	{only,stop,away,soon}	067_02.mp3	067_02.mp3	067_02.mp3	067_02.mp3	067_02.mp3
815	1	67	3	short	주말이 이틀밖에 안 남았는데, 아직 계획이 없어. 나랑 서울 숲 근처에서 뭐 할래?	The weekend is only two days away, but I don't have any plans yet. Do you want to do something with me around Seoul Forest?	\N	\N	\N	\N	{weekend,days,away,plans}	067_03.mp3	067_03.mp3	067_03.mp3	067_03.mp3	067_03.mp3
816	1	67	4	short	여자 친구 생일이 일주일밖에 안 남았다니. 뭘 해 줘야 할지 모르겠어.	I can't believe my girlfriend's birthday is only a week away. I still don't know what to get her.	\N	\N	\N	\N	{believe,birthday,week,away}	067_04.mp3	067_04.mp3	067_04.mp3	067_04.mp3	067_04.mp3
817	1	67	5	short	밸런타인데이가 며칠 안 남았네. 아내를 놀라게 해 주고 싶은데, 뭐가 제일 좋을지 고민이야.	Valentine's Day is only a few days away. I want to surprise my wife, but I still can't figure out what would be the best.	\N	\N	\N	\N	{valentine,days,away,surprise}	067_05.mp3	067_05.mp3	067_05.mp3	067_05.mp3	067_05.mp3
818	2	67	7	dialogue	\N	\N	기말시험이 2주밖에 안 남았어. 나 진짜 제대로 공부 시작해야 할 것 같아.	My finals are only two weeks away. I'm afraid I need to really get down to studying.	\N	\N	{finals,weeks,away,studying}	067_07.mp3	067_07.mp3	067_07.mp3	067_07.mp3	067_07.mp3
819	2	67	8	dialogue	\N	\N	\N	\N	아, 그럼 시험 끝날 때까지는 못 논다는 거지?	Ah, so you won't be able to hang out until after?	{able,hang,until,after}	067_08.mp3	067_08.mp3	067_08.mp3	067_08.mp3	067_08.mp3
820	2	67	9	dialogue	\N	\N	아내 생일이 일주일밖에 안 남았어. 그런데 뭘 사 줘야 할지 고민이야.	My wife's birthday is only a week away, but I can't figure out what to get her.	\N	\N	{wife,birthday,week,figure}	067_09.mp3	067_09.mp3	067_09.mp3	067_09.mp3	067_09.mp3
821	2	67	10	dialogue	\N	\N	\N	\N	있잖아, 나 지난달에 여자 친구에게 멋진 팔찌를 사 줬거든. 그 보석 브랜드 홈페이지 알려 줄게.	You know, I got my girlfriend a nice bracelet last month. I'll share the jeweler's website with you.	{girlfriend,bracelet,jeweler,website}	067_10.mp3	067_10.mp3	067_10.mp3	067_10.mp3	067_10.mp3
822	2	67	11	dialogue	\N	\N	출간일이 한 달밖에 안 남았어요. 그런데 아직 80%도 못 끝냈어요.	The release date is a month away, but I'm not even 80% finished.	\N	\N	{release,date,month,finished}	067_11.mp3	067_11.mp3	067_11.mp3	067_11.mp3	067_11.mp3
823	2	67	12	dialogue	\N	\N	\N	\N	아, 정말요? 검수, 편집에 조판도 해야 하잖아요. 출간일을 늦추는 것도 진지하게 생각해 봐야겠네요.	Oh, really? We still need to proofread, edit, and typeset. We should strongly consider pushing the date back.	{proofread,edit,typeset,pushing}	067_12.mp3	067_12.mp3	067_12.mp3	067_12.mp3	067_12.mp3
800	1	66	1	short	이제 그만 들어가보렴.	I think I will have to let you go.	\N	\N	\N	\N	{think,have,let,go}	066_01.mp3	066_01.mp3	066_01.mp3	066_01.mp3	066_01.mp3
826	1	68	2	short	(공사가 지연되는 상황에서) 3개월 지연되고 있는 상태입니다.	I'm afraid we are three months behind the schedule.	\N	\N	\N	\N	{afraid,three,months,behind}	068_02.mp3	068_02.mp3	068_02.mp3	068_02.mp3	068_02.mp3
827	1	68	3	short	<이상한 변호사 우영우> 보고 있는데 한 3, 4화 정도 밀렸거든. 그러니까 줄거리 미리 말해서 초 치지 마.	I've been watching Extraordinary Attorney Woo, but I'm, like, three or four episodes behind. Please don't spoil anything.	\N	\N	\N	\N	{watching,extraordinary,attorney,behind}	068_03.mp3	068_03.mp3	068_03.mp3	068_03.mp3	068_03.mp3
828	1	68	4	short	공과금이 한 번 밀리기 시작하면, 계속 밀리게 돼.	Once you get behind on your bills, it can be difficult to catch up.	\N	\N	\N	\N	{behind,bills,difficult,catch}	068_04.mp3	068_04.mp3	068_04.mp3	068_04.mp3	068_04.mp3
829	1	68	5	short	나 숙제가 좀 밀렸어. 주말 내내 못 한 숙제를 해야 해.	I'm pretty behind on homework. I'll have to spend all weekend catching up.	\N	\N	\N	\N	{behind,homework,weekend,catching}	068_05.mp3	068_05.mp3	068_05.mp3	068_05.mp3	068_05.mp3
830	2	68	7	dialogue	\N	\N	이런! 이번 달 전기료 좀 봐. 통장에 돈이 충분히 있는지 모르겠네.	Oh, man! Look at this month's electricity bill. I'm not sure I have enough money in my checking account.	\N	\N	{month,electricity,bill,checking}	068_07.mp3	068_07.mp3	068_07.mp3	068_07.mp3	068_07.mp3
831	2	68	8	dialogue	\N	\N	\N	\N	우리 이미 한 달 밀렸어. 또 밀리면 전기 끊겨.	You know, we're already one month behind on payment. If we're late again, they're going to cut us off.	{already,month,behind,cut}	068_08.mp3	068_08.mp3	068_08.mp3	068_08.mp3	068_08.mp3
832	2	68	9	dialogue	\N	\N	안녕하세요, 수진 씨! 공부는 잘돼요? 월세 곧 입금할 건지 알고 싶어서요. 한 달 치가 밀렸거든요.	Hi, Sujin! Are your studies going okay? I just wanted to ask if you're going to transfer the rent soon. You're one month behind on it.	\N	\N	{studies,transfer,rent,behind}	068_09.mp3	068_09.mp3	068_09.mp3	068_09.mp3	068_09.mp3
833	2	68	10	dialogue	\N	\N	\N	\N	이런! 죄송해요. 과제를 하느라 완전히 깜박했네요.	Oh, my gosh! I'm so sorry. I've been working on some projects, and it totally slipped my mind.	{gosh,sorry,projects,slipped}	068_10.mp3	068_10.mp3	068_10.mp3	068_10.mp3	068_10.mp3
834	2	68	11	dialogue	\N	\N	우리가 국세청에 소득 신고를 해야 하는지 몰랐어.	I didn't realize that we had to report our earnings to the tax office.	\N	\N	{realize,report,earnings,tax}	068_11.mp3	068_11.mp3	068_11.mp3	068_11.mp3	068_11.mp3
835	2	68	12	dialogue	\N	\N	\N	\N	이런! 그럼, 몇 달 정도 밀렸겠는데.	Oh, no! We must be, like, a few months behind.	{must,few,months,behind}	068_12.mp3	068_12.mp3	068_12.mp3	068_12.mp3	068_12.mp3
837	1	69	1	short	누가 아니래	That's for sure.	\N	\N	\N	\N	{sure}	069_01.mp3	069_01.mp3	069_01.mp3	069_01.mp3	069_01.mp3
838	1	69	2	short	A: 매출이 살아나고 있습니다. B: 확실히 말이죠.	A: Sales are picking up. B: That's for sure.	\N	\N	\N	\N	{sales,picking,sure}	069_02.mp3	069_02.mp3	069_02.mp3	069_02.mp3	069_02.mp3
839	1	69	3	short	A: 정치인들은 다 거짓말쟁이야. B: 그건 확실해.	A: Politicians are all liars. B: That's for sure.	\N	\N	\N	\N	{politicians,liars,sure}	069_03.mp3	069_03.mp3	069_03.mp3	069_03.mp3	069_03.mp3
840	1	69	4	short	A: 우리는 이와 같은 무역 전쟁을 계속해서는 안 됩니다. B: 그 점은 분명합니다.	A: We can't afford to continue this trade war. B: That's for sure.	\N	\N	\N	\N	{afford,continue,trade,sure}	069_04.mp3	069_04.mp3	069_04.mp3	069_04.mp3	069_04.mp3
841	1	69	5	short	A: 제 남편이 바람을 피울 사람은 아니에요. B: 그건 확실해요.	A: My husband is not the kind of guy who would ever cheat. B: That's for sure.	\N	\N	\N	\N	{husband,kind,cheat,sure}	069_05.mp3	069_05.mp3	069_05.mp3	069_05.mp3	069_05.mp3
843	2	69	7	dialogue	\N	\N	그 사람 좀 고집불통인 것 같아.	I just thought he was a little stubborn.	\N	\N	{thought,little,stubborn}	069_07.mp3	069_07.mp3	069_07.mp3	069_07.mp3	069_07.mp3
844	2	69	8	dialogue	\N	\N	\N	\N	내 말이.	That's for sure.	{sure}	069_08.mp3	069_08.mp3	069_08.mp3	069_08.mp3	069_08.mp3
845	2	69	9	dialogue	\N	\N	너무 맞는 말씀입니다. 반드시 우리나라를 스타트업에게 더 환영받을 수 있는 곳으로 만들어야 해요.	That's for sure. We should definitely make Korea a more welcoming place for startups.	\N	\N	{sure,definitely,korea,startups}	069_09.mp3	069_09.mp3	069_09.mp3	069_09.mp3	069_09.mp3
846	2	69	11	dialogue	\N	\N	우리 이번 프로젝트 진짜 열심히 했어요. 끝나면 연봉 인상을 요구합시다.	We've worked so hard on this project. We should ask for a raise once it's over.	\N	\N	{worked,hard,project,raise}	069_11.mp3	069_11.mp3	069_11.mp3	069_11.mp3	069_11.mp3
847	2	69	12	dialogue	\N	\N	\N	\N	당연히 그래야죠. 우리의 가치를 이미 증명했으니까요.	That's for sure. We've proven our worth.	{sure,proven,worth}	069_12.mp3	069_12.mp3	069_12.mp3	069_12.mp3	069_12.mp3
849	1	70	1	short	검은 색이 진리지.	You can't go wrong with black.	\N	\N	\N	\N	{go,wrong,black}	070_01.mp3	070_01.mp3	070_01.mp3	070_01.mp3	070_01.mp3
825	1	68	1	short	일이 밀려서 점심 먹을 시간도 없어.	I don't have time to grab lunch. I'm behind on work.	\N	\N	\N	\N	{time,grab,lunch,behind}	068_01.mp3	068_01.mp3	068_01.mp3	068_01.mp3	068_01.mp3
112	2	9	11	dialogue	\N	\N	방금 인천에 도착했어요! 그나저나 면세점에 들를까 하는데요. 아빠랑 엄마 뭐 사다 드릴까요?	I just landed at Incheon! By the way, I think I'll go by a duty-free shop. Do you want me to get you or Mom anything?	\N	\N	{landed,duty-free,want,get}	009_11.mp3	009_11.mp3	009_11.mp3	009_11.mp3	009_11.mp3
851	1	70	3	short	어두운 회색 슈트는 언제나 옳지.	You can't go wrong with a dark gray suit.	\N	\N	\N	\N	{wrong,dark,gray,suit}	070_03.mp3	070_03.mp3	070_03.mp3	070_03.mp3	070_03.mp3
852	1	70	4	short	날씨 좋은 곳 원하면, 무조건 샌디에이고가 답이다.	If you want good weather, you can't go wrong with San Diego.	\N	\N	\N	\N	{weather,wrong,san,diego}	070_04.mp3	070_04.mp3	070_04.mp3	070_04.mp3	070_04.mp3
853	1	70	5	short	감자와 치즈는 언제나 옳다.	Potatoes and cheese. You can't go wrong with them.	\N	\N	\N	\N	{potatoes,cheese,wrong}	070_05.mp3	070_05.mp3	070_05.mp3	070_05.mp3	070_05.mp3
854	1	70	6	short	BMW는 언제나 옳은 선택이지.	You can never go wrong with BMW.	\N	\N	\N	\N	{never,wrong,bmw}	070_06.mp3	070_06.mp3	070_06.mp3	070_06.mp3	070_06.mp3
855	2	70	7	dialogue	\N	\N	나도 하루 종일 아무것도 못 먹었어. 넌 뭐 먹고 싶어?	I haven't eaten all day, either. What do you want?	\N	\N	{eaten,day,either,want}	070_07.mp3	070_07.mp3	070_07.mp3	070_07.mp3	070_07.mp3
856	2	70	8	dialogue	\N	\N	\N	\N	난 고기가 너무 당기는데 한국식 바비큐는 언제나 옳지.	I'm craving meat and we can't go wrong with Korean BBQ.	{craving,meat,wrong,korean}	070_08.mp3	070_08.mp3	070_08.mp3	070_08.mp3	070_08.mp3
857	2	70	9	dialogue	\N	\N	20명이 오는데, 아마도 피자 다섯 판이면 충분할 듯. 무슨 피자 시켜야 할까?	We have 20 people coming, so maybe five pizzas will be enough. What should we get?	\N	\N	{people,coming,pizzas,enough}	070_09.mp3	070_09.mp3	070_09.mp3	070_09.mp3	070_09.mp3
858	2	70	10	dialogue	\N	\N	\N	\N	치즈 페퍼로니 시키면 실패할 일이 없지.	You can't go wrong with just cheese and pepperoni.	{wrong,cheese,pepperoni}	070_10.mp3	070_10.mp3	070_10.mp3	070_10.mp3	070_10.mp3
3	1	1	3	short	소개팅은 저랑 안 맞아요.	Going on a blind date isn't for me.	\N	\N	\N	\N	{going,date}	001_03.mp3	001_03.mp3	001_03.mp3	001_03.mp3	001_03.mp3
21	2	2	8	dialogue	\N	\N			응! 어서 보고 싶어. 내가 제일 좋아하는 장면들이 다 포함되어 있기를.	Yes! I can't wait to see it. I hope they included all my favorite scenes.	{favorite,scenes}	002_08.mp3	002_08.mp3	002_08.mp3	002_08.mp3	002_08.mp3
26	3	2	13	long	신형 그랜저를 어서 보고 싶네요. 실은 일산 자유로에서 본 친구가 있긴한데, 자세히는 못 봤다고 합니다. 현대가 이런 차들에 위장막을 씌우니까요. 위장막때문에 스파이 샷이 의마가 없어서 너무 속상해요	I can't wait to get a glimpse of the new Grandeur. I actually have a friend who spotted one on the Ilsan freeway, but he couldn't really see any details. Hyundai uses these car camouflage wraps. They make spy shots useless and it's really frustrating.	\N	\N	\N	\N	{glimpse,camouflage}	002_13.mp3	002_13.mp3	002_13.mp3	002_13.mp3	002_13.mp3
27	1	3	1	short	(사내 발표 상황)죄송한데 조금 짧게 해주시겠어요?	Do you mind keeping it a bit short?	\N	\N	\N	\N	{keeping,short}	003_01.mp3	003_01.mp3	003_01.mp3	003_01.mp3	003_01.mp3
68	1	6	6	short	팬케이크에는 진짜 메이플 시럽을 얹어 먹어야 제맛이야.	There's nothing like real maple syrup on pancakes.	\N	\N	\N	\N	{nothing,maple,syrup,pancakes}	006_06.mp3	006_06.mp3	006_06.mp3	006_06.mp3	006_06.mp3
69	2	6	7	dialogue	\N	\N	회사에서 힘든 하루를 보내고 나면 시원한 맥주가 최고지. 퇴근하고 한잔 하러 갈래?	There's nothing like a cold beer after a long day of work. How about we go grab one when we get off?	\N	\N	{nothing,beer,work,grab}	006_07.mp3	006_07.mp3	006_07.mp3	006_07.mp3	006_07.mp3
75	3	6	13	long	바디프랜드 매장에 오셔서 새로 출시된 프로마사지 X7 의자를 체험해 보세요. 일주일에 세 번 전문 마사지사를 집에 부른다고 해도 저희 의자로 받는 안마가 최고라는 점을 인정할 수밖에 없을 겁니다.	Come to a Bodyfriend store and try out our new line of Pro Massage X7 chairs. Even if you have a professional masseur come to your house three times a week, you'll have to admit there's nothing like a massage from one of our chairs.	\N	\N	\N	\N	{nothing,massage,chairs,professional}	006_13.mp3	006_13.mp3	006_13.mp3	006_13.mp3	006_13.mp3
98	2	8	10	dialogue	\N	\N	\N	\N	미안해, 사실 오늘 몸이 좀 안 좋아. 집에 있어야 할 것 같아. 다음에 먹어도 될까?	Sorry, actually I don't feel quite right today. I think I need to stay home. Can we take a rain check?	{sorry,feel,right,need}	008_10.mp3	008_10.mp3	008_10.mp3	008_10.mp3	008_10.mp3
114	3	9	13	long	안녕하세요. 다름이 아니라 저희 수요일에 회의하는 거 맞는지 확인차 연락드립니다. 그리고 용산 본사에 회의실 잡을까요? (잠시 후) 근데 보니까 본사 회의실은 예약이 꽉 찼네요. 장소를 변경하든지, 날짜를 바꾸든지 해야 할 것 같습니다.	I just wanted to make sure the meeting is still on for Wed. And would you like me to arrange a room at the headquaters in Youngsan? (pause) I just found out that headquaters is all booked up. We'll have to change something, either the location or date.	\N	\N	\N	\N	{meeting,arrange,booked,change}	009_13.mp3	009_13.mp3	009_13.mp3	009_13.mp3	009_13.mp3
850	1	70	2	short	블랙과 화이트의 컬러 조합은 잘못될 수가 없습니다.	You can't go wrong with the color combination of black and white.	\N	\N	\N	\N	{wrong,color,combination,black}	070_02.mp3	070_02.mp3	070_02.mp3	070_02.mp3	070_02.mp3
147	2	12	8	dialogue	\N	\N	\N	\N	와우, 나도 그럴 시간이 있었으면. 풀타임으로 일하니 너무 힘들고, 내가 좋아하는 걸 할 시간이 없어.	Wow, I wish I had time for that. It's so hard having a full-time job, and there's never enough time to do things I really enjoy.	{wish,had,time,enjoy}	012_08.mp3	012_08.mp3	012_08.mp3	012_08.mp3	012_08.mp3
152	3	12	13	long	이번 출장에 팀원들과 같이 갈 수 있으면 좋겠지만, 지금은 제가 업무가 너무 많습니다. 다음에 꼭 귀사의 시설에 방문하겠습니다. 그건 그렇고, Holtz 씨는 좀 어때요? 독감 걸리셨다는 이야기 들었어요.	I wish I could join the team on the trip over there, but I'm afraid I have too much on my plate at the moment. I will definitely come and visit your facilities next time. By the way, how is Mr. Holtz holding up? I heard that he came down with the flu.	\N	\N	\N	\N	{wish,could,join,flu}	012_13.mp3	012_13.mp3	012_13.mp3	012_13.mp3	012_13.mp3
173	2	14	8	dialogue	\N	\N	\N	\N	스포츠카에 그렇게 큰돈을 쓸 생각을 하다니. 돈 모으고 투자해서 빨리 은퇴해야지.	I can't believe you're thinking about spending so much money on a sports car. You should just save, invest and retire early.	{believe,spending,money,sports}	014_08.mp3	014_08.mp3	014_08.mp3	014_08.mp3	014_08.mp3
178	3	14	13	long	남성분들은 이해를 못 합니다. 저희 차가 너무 비싸다거나 너무 작다거나 장거리 운행에는 별로라는 말을 합니다. 미니 쿠퍼에는 여성들이 거부할 수 없는 무언가가 있습니다. 누가 봐도 귀여운 건 당연하고, 운전의 재미도 있으며 좁은 공간에서 주차하기도 더 편합니다.	Guys just don't get it. They say our cars are overpriced, or too small, or impractical for long distances. There is something about Mini Coopers that women find irresistible. And besides obviously looking cute, our cars are fun to drive, and also easier to park in cramped spaces.	\N	\N	\N	\N	{mini,coopers,women,irresistible}	014_13.mp3	014_13.mp3	014_13.mp3	014_13.mp3	014_13.mp3
224	2	18	10	dialogue	\N	\N	\N	\N	맞아. 너무 야해. 근데 Karen 이야기가 나왔으니 말인데, 다음 주 목요일에 그 친구 생일이야.	Right. It's a little too revealing. By the way, speaking of Karen, her birthday is coming up next Thursday.	{revealing,speaking,karen,birthday}	018_10.mp3	018_10.mp3	018_10.mp3	018_10.mp3	018_10.mp3
225	3	18	13	long	나는 영화 보러 못 가. 야근해야 해. 일 이야기가 나왔으니 말인데, Kate라는 그 여자분과 여전히 같이 일하고 있어? 그 분이랑 다시 얼굴 보면 좋겠다고 생각했거든.	A: I can't make it to the movie. I have to work late.\\nB: Alright. We understand.\\nC: Speaking of work, though, do you still work with that woman named Kate? I was just thinking that it would be nice to see her again.	\N	\N	\N	\N	{movie,work,speaking,kate}	018_13.mp3	018_13.mp3	018_13.mp3	018_13.mp3	018_13.mp3
238	3	19	13	long	단골손님에게 알림\\n해럴드 카페가 다음 주 문을 닫습니다. 갑작스럽게 개인사가 생겨서 쉬게 되었습니다. 불편하게 해 드려 죄송합니다. 6일 재오픈 예정이며, 저희 인스타에서 확인해 주세요. 추가 업데이트는 인스타에서 공지하겠습니다.	Attention loyal customers - Harold Cafe will be closed next week. We are taking some time off to deal with a family emergency. We apologize for the inconvenience. We plan to reopen on the 6th, and keep an eye on our Instagram account. More updates will be posted there.	\N	\N	\N	\N	{customers,cafe,closed,emergency,instagram}	019_13.mp3	019_13.mp3	019_13.mp3	019_13.mp3	019_13.mp3
251	3	20	13	long	안녕하세요, Steve 씨. 출장 준비로 바쁘신 줄 압니다. 금요일에 요청한 인보이스를 아직 안 보내 주셨다는 걸 알려드리려고요. 최대한 빨리 처리 부탁드려도 될까요?	Hi, Steve. How are you? I understand that you must be busy getting ready for the business trip. I just wanted to remind you, though, that you still haven't sent us the invoice that we requested on Friday. Could you please take care of it at your earliest convenience?	\N	\N	\N	\N	{busy,business,trip,invoice,convenience}	020_13.mp3	020_13.mp3	020_13.mp3	020_13.mp3	020_13.mp3
262	3	21	13	long	일부 전문가들은 저희가 사업을 온라인으로 전환해야 한다고 합니다. 특히, 비싼 시내 중심가에서 물리적인 사무실 공간을 임대하는 건 합리적이지 않다고들 합니다. 저는 그렇게 생각하지 않습니다. 직원들이 같은 공간에서 함께 일하게 될 때 업무 능률이 오르는 뭔가가 있습니다.	Some experts say we should move business online. They argue that renting a physical office space, especially in expensive downtown areas, doesn't make any sense. I don't see it that way. There is something about working together in the same room that helps employees stay productive.	\N	\N	\N	\N	{experts,business,online,office,productive}	021_13.mp3	021_13.mp3	021_13.mp3	021_13.mp3	021_13.mp3
274	1	23	1	short	전부 제가 생각하고 있는 예산 밖이군요. 이십만원 미만은 없을까요?	This is all out of my price range. Don't you have anything under 200,000 won?	\N	\N	\N	\N	{price,range,under}	023_01.mp3	023_01.mp3	023_01.mp3	023_01.mp3	023_01.mp3
278	1	23	5	short	우리 아파트 근처에 있는 쉐보레 매장에 가 봤는데, 내가 생각하는 가격대의 차는 없었어요.	I checked out the Chevrolet dealership near my apartment, but they didn't have anything in my price range.	\N	\N	\N	\N	{chevrolet,dealership,price,range}	023_05.mp3	023_05.mp3	023_05.mp3	023_05.mp3	023_05.mp3
345	2	28	10	dialogue	\N	\N	\N	\N	아니요. 시리얼을 한 그릇 먹어서 배가 너무 불러요. 근데 커피는 좋습니다.	Nah. I just had a big bowl of cereal and I'm pretty stuffed. I'm up for coffee, though.	{cereal,stuffed,coffee,though}	028_10.mp3	028_10.mp3	028_10.mp3	028_10.mp3	028_10.mp3
367	1	30	6	short	죄송한데 9시 반은 되어야 회사에 도착할 수 있을 것 같습니다. 저 없이 회의 시작하시죠.	I'm afraid that I won't be able to get to the office until 9:30. Feel free to start the meeting without me.	\N	\N	\N	\N	{office,until,meeting,without}	030_06.mp3	030_06.mp3	030_06.mp3	030_06.mp3	030_06.mp3
374	3	30	13	long	John, 거의 다 온 거니? 나 방금 영화관 도착했는데, 영화가 15분 후에 시작해. 너 오면 그때 들어가려고. 거의 다 왔기를. 첫 장면 놓치고 싶지 않아!	Hey, John. Are you almost here? I just got to the movie theater, and the movie starts in 15 minutes. I don't want to go in until you arrive. I hope you're not far. I don't want to miss the beginning!	\N	\N	\N	\N	{movie,theater,minutes,beginning}	030_13.mp3	030_13.mp3	030_13.mp3	030_13.mp3	030_13.mp3
392	2	32	7	dialogue	\N	\N	너 사람들 있는 데서 다른 여자 손잡고 있었던 걸 네 와이프가 알아 버렸어. 지난 주말에 알게 됐다고 하던데.	Your wife knows that you were holding hands with another woman in public. I heard she found out last weekend.	\N	\N	{wife,holding,hands,weekend}	032_07.mp3	032_07.mp3	032_07.mp3	032_07.mp3	032_07.mp3
398	3	32	13	long	한국 시장에서 BMW의 판매량이 4년 만에 처음으로 벤츠를 앞질렀습니다. BMW는 차별화된 최첨단 배터리 기술을 보유하고 있습니다. 그래서 시장 점유율이 30% 증가한 것이죠. 배터리 화재로 인한 리콜 사태 이후 다시금 소비자들의 마음을 얻기 시작하고 있습니다.	In the Korean market, BMW overtook Mercedes-Benz in sales for the first time in four years. BMW has some cutting-edge battery technology that really sets them apart. That explains why their market share has gone up 30%. They are finally starting to win back customers after their battery fire recall.	\N	\N	\N	\N	{bmw,mercedes,battery,market}	032_13.mp3	032_13.mp3	032_13.mp3	032_13.mp3	032_13.mp3
418	2	34	9	dialogue	\N	\N	안녕하세요, Melinda. 이번 주 수요일 저녁 식사 기대됩니다. 우리 동네 삼겹살집 어때요?	Hey, Melinda. I'm looking forward to grabbing dinner this Wednesday. How about we go to a pork belly place in my neighborhood?	\N	\N	{looking,forward,dinner,wednesday}	034_09.mp3	034_09.mp3	034_09.mp3	034_09.mp3	034_09.mp3
420	3	34	13	long	안녕하세요, Steve 씨. 잘 지내시죠? 보니까 6월분 대금 결제가 두 달 밀렸더군요. 저희 쪽 기록을 보니, 대금이 제때 납부되지 않은 게 이번이 두 번째입니다. 조속히 처리되기를 기대합니다. Jonathon Randall 드림	Dear Steve. I hope you are doing okay. We've come to realize that your June payment is two months overdue. According to our records, this is the second time that a payment of yours has not been received on time. We look forward to having this issue resolved. Regards, Jonathon Randall	\N	\N	\N	\N	{payment,overdue,records,resolved}	034_13.mp3	034_13.mp3	034_13.mp3	034_13.mp3	034_13.mp3
444	2	36	11	dialogue	\N	\N	나 운동을 좀 더 할까 싶은데. 주변에 괜찮은 헬스장 아는 데 있어?	I've been thinking about working out more. Do you know of any good gyms around here?	\N	\N	{thinking,working,gyms,around}	036_11.mp3	036_11.mp3	036_11.mp3	036_11.mp3	036_11.mp3
445	2	36	12	dialogue	\N	\N	\N	\N	나 모퉁이 쪽에 있는 헬스장 다니거든. 실은 회원권 갱신해야 하는데 지금 그쪽으로 갈까?	I go to the place just around the corner. I actually need to have my membership renewed. Why don't we head over there now?	{place,corner,membership,renewed}	036_12.mp3	036_12.mp3	036_12.mp3	036_12.mp3	036_12.mp3
446	3	36	13	long	목재가 다음 달에 배송되는 것으로 알고 있습니다. 그런데 프로젝트 현황을 보니, 조금 더 일찍 받을 수 있으면 좋을 것 같습니다. 혹시 다음 주까지 배송이 가능할지요? 귀사의 노고와 업무 지원에 감사드립니다.	We are expecting a shipment of lumber to be delivered next month. However, after examining our project status, we think it would be preferable to have the materials earlier. Would it be possible to have these items shipped by next week? We appreciate your hard work and support.	\N	\N	\N	\N	{shipment,lumber,delivered,earlier}	036_13.mp3	036_13.mp3	036_13.mp3	036_13.mp3	036_13.mp3
492	2	40	9	dialogue	\N	\N	보니까 몇 달째 일만 하는구나. 좀 쉬면서 재충전을 하는 건 어때?	It seems like you've been doing nothing but work for months. How about you take some time off and recharge?	\N	\N	{work,months,recharge}	040_09.mp3	040_09.mp3	040_09.mp3	040_09.mp3	040_09.mp3
824	3	67	13	long	제품 발매일이 일주일도 안 남았고 저희 SNS가 난리가 났습니다. 각 지점에서는 충분한 물량을 확보해 주시기를 바라며, 분주한 시기를 관리하기 위해 임시직 직원을 채용하는 것도 생각해 봐야 할 것 같습니다.	The launch is less than a week away, and we're seeing a lot of excitement on our social media. I want to make sure each branch has plenty of stock. Also, we should consider hiring seasonal workers to manage the rush.	\N	\N	\N	\N	{launch,week,away,social,seasonal}	067_13.mp3	067_13.mp3	067_13.mp3	067_13.mp3	067_13.mp3
521	2	42	12	dialogue	\N	\N	\N	\N	아, 제안 고마워! 남동생이 이미 와서 도와주기로 했으니 괜찮을 것 같아.	Oh, thanks for the offer! My brother is already coming to help, so I think we're good.	{thanks,offer,brother,good}	042_12.mp3	042_12.mp3	042_12.mp3	042_12.mp3	042_12.mp3
522	3	42	13	long	A: 나 이제야 파티 가는 길이야. 늦어서 미안해. 필요한 거 있을까? 술, 아님 과자? 빈손으로 가면 그렇잖아. B: 우선은 괜찮아. 애들이 너무 많이 가지고 왔거든. 이따가 뭐 필요한 거 생기면 네가 사렴.	A: I'm finally on my way to the party. Sorry for running late. What do you guys need? Drinks or snacks? I don't want to come empty-handed. B: I actually think we're good for now. The guys who are already here brought more than enough. If we need something else later, it can be your treat, though.	\N	\N	\N	\N	{party,late,drinks,snacks,treat}	042_13.mp3	042_13.mp3	042_13.mp3	042_13.mp3	042_13.mp3
533	3	43	13	long	(배송 지연 상황에 대해 거래처에 설명하는 내용의 이메일) 계속 지연되어 죄송합니다만, 저희 쪽 기계가 고장이 나서 현재 주문 건을 처리할 수 없는 상황입니다. 정확한 문제 원인을 파악 중입니다. 기계적 문제와 교체가 필요한 부품 때문인 것 같습니다. 문제가 해결되면, 주문 건을 바로 처리할 수 있습니다.	I'm sorry for the continued delay, but our machines have been malfunctioning and so we are currently unable to complete orders. We are trying to figure out what exactly went wrong. It is likely a mechanical issue and a part that needs replacing. Once this problem is resolved, we'll be able to fulfill your order right away.	\N	\N	\N	\N	{delay,machines,malfunctioning,figure,order}	043_13.mp3	043_13.mp3	043_13.mp3	043_13.mp3	043_13.mp3
546	3	44	13	long	안녕, Nick. 나 소설 쓰는 거 알지? 진도가 안 나가. 이야기가 어느 방향으로 흘러가고 있는지 도무지 감이 안 잡혀. 정말 모르겠어. 지금 소주가 정말 필요하네. 한잔 콜? 내가 살게.	Hi, Nick. You know that novel I've been working on? I feel like I'm stuck. I just can't figure out where this story is going. Man, I don't know. I could really use soju right about now. Are you down? My treat.	\N	\N	\N	\N	{novel,stuck,figure,soju,treat}	044_13.mp3	044_13.mp3	044_13.mp3	044_13.mp3	044_13.mp3
559	3	45	13	long	A: 그동안 어떻게 지냈어요? 제 수업 그만두고 나서 영어 진짜 많이 나아진 것 같네요. 비밀이 뭐가요? B: 말씀 너무 고마워요. 솔직히 다 선생님 덕분이에요. 선생님이 가르쳐 주신 걸 계속 연습하고 있거든요.	A: How have you been? It sounds like your English has really improved since you stopped taking my classes. What's your secret? B: That's nice of you to say. Honestly it's all thanks to you. I've just been doing the same exercises you taught me.	\N	\N	\N	\N	{english,improved,classes,exercises}	045_13.mp3	045_13.mp3	045_13.mp3	045_13.mp3	045_13.mp3
570	3	46	13	long	아빠, 잘 지내시죠? 제가 캄보디아에서 오토바이 타는 것을 많이 걱정하신다고 들었어요. 오토바이가 조금 낡긴 했지만, 나름 괜찮아요. 아주 싸게 샀고요. 너무 걱정 마세요. 안전 운전 과정도 이수하고 있고, 안전 장비도 풀세트로 갖췄어요. 나쁘지 않아요.	Hey, Dad. How are you doing? I heard you were really worried about me riding a motorbike in Cambodia. The bike is slightly old, but I can't complain. I got it super cheap. Please don't be too worried. I've been taking a safety course and I have a full set of safety gear, so I can't complain.	\N	\N	\N	\N	{worried,motorbike,cambodia,safety}	046_13.mp3	046_13.mp3	046_13.mp3	046_13.mp3	046_13.mp3
599	1	49	5	short	머리를 짧게 하면 아침에 시간도 아끼고, 번거롭지도 않아요.	Keeping my hair short saves me time and hassle in the morning.	\N	\N	\N	\N	{keeping,hair,saves,hassle}	049_05.mp3	049_05.mp3	049_05.mp3	049_05.mp3	049_05.mp3
603	2	49	9	dialogue	\N	\N	저희가 직접 에어컨을 수리하려고 했는데 잘 안됐어요. 그래서 에어컨 아래쪽에 플라스틱 통을 놔뒀는데 한 시간마다 비워 줘야 해요.	We tried fixing the air conditioner ourselves, but it didn't work. We put a big plastic bowl underneath it and have to empty it every hour or so.	\N	\N	{fixing,air,conditioner,bowl}	049_09.mp3	049_09.mp3	049_09.mp3	049_09.mp3	049_09.mp3
624	2	51	7	dialogue	\N	\N	내가 보기엔 너 영어 잘하는데. 사실 내가 아는 사람 중에 네가 영어를 제일 잘하는 것 같아.	Your English sounds good to me. In fact, I think you are probably better at English than anyone I know.	\N	\N	{english,sounds,better,anyone}	051_07.mp3	051_07.mp3	051_07.mp3	051_07.mp3	051_07.mp3
630	3	51	13	long	처음 제 유튜브 채널을 시작했을 때는 10분짜리 영상을 편집하는 데 6~7시간 걸렸습니다. 지금은 점점 스킬이 느는 것 같습니다. 이제 원하면 거의 매일 새 영상을 올릴 수 있을 정도가 되었습니다.	When I first started my YouTube channel, it took me six or seven hours to edit one 10-minute video. I think I'm finally getting better. Now I can upload a new video pretty much every day if I want.	\N	\N	\N	\N	{youtube,channel,edit,upload}	051_13.mp3	051_13.mp3	051_13.mp3	051_13.mp3	051_13.mp3
648	2	53	7	dialogue	\N	\N	우와, 해외에 나가 본 적 없는 것치고는 영어가 너무 유창하세요.	Wow, your English is super fluent for someone who has never traveled abroad.	\N	\N	{english,fluent,never,abroad}	053_07.mp3	053_07.mp3	053_07.mp3	053_07.mp3	053_07.mp3
654	3	53	13	long	그동안 저희 채널에서 많은 고급 SUV 리뷰를 했는데요. 중량과 크기를 생각하면 연비가 놀랍다는 점이 이 차의 장점입니다. 매일 출퇴근 용으로 이 차를 이용하고자 하는 분에게 좋은 선택지가 될 겁니다.	I've reviewed a lot of luxury SUVs on this channel. But what's impressive about this one is that it gets fantastic gas mileage, especially for its weight and size. This makes it a good option for those who need a daily commuter.	\N	\N	\N	\N	{reviewed,luxury,suvs,mileage}	053_13.mp3	053_13.mp3	053_13.mp3	053_13.mp3	053_13.mp3
672	2	55	8	dialogue	\N	\N	\N	\N	고마워, 근데 오래는 못 있어. 그냥 너 재킷 돌려주려고 잠깐 들렀거든.	Thanks, but actually, I can't stay. I just wanted to swing by and return your jacket.	{thanks,stay,swing,jacket}	055_08.mp3	055_08.mp3	055_08.mp3	055_08.mp3	055_08.mp3
676	2	55	12	dialogue	\N	\N	\N	\N	그때 괜찮아요. 고마워요. 시간 너무 많이 뺏지 않을게요. 그냥 잠깐 들러서 선물만 드리면 됩니다.	That works for me! Thank you. I won't take up too much of your time. I just wanted to swing by and drop off a little gift.	{works,swing,drop,gift}	055_12.mp3	055_12.mp3	055_12.mp3	055_12.mp3	055_12.mp3
690	3	56	13	long	저희는 콘퍼런스 마치고 며칠 더 머물기로 했습니다. <오징어 게임>과 <기생충> 같은 한국 드라마나 영화에서 본 유명한 곳들을 가 보고 싶어요. 선약이 없으시면, 서울 구경 좀 시켜 주실 수 있을까요?	We decided to stay for a couple more days after the conference is over. We want to check out some famous locations from Korean shows, like Squid Game and Parasite. If you don't already have plans, would you mind showing us around Seoul?	\N	\N	\N	\N	{decided,stay,conference,famous,seoul}	056_13.mp3	056_13.mp3	056_13.mp3	056_13.mp3	056_13.mp3
697	2	57	7	dialogue	\N	\N	안국동에 있는 괜찮은 한식집을 발견했어. 이 집 갈비살 한번 먹어 보고 싶어.	I just came across this nice Korean place in Anguk-dong. I really want to try their short ribs.	\N	\N	{came,korean,anguk,ribs}	057_07.mp3	057_07.mp3	057_07.mp3	057_07.mp3	057_07.mp3
700	2	57	10	dialogue	\N	\N	\N	\N	아니에요, 그동안 열심히 일하셨잖아요. 다만 그것과 상관없이 함께 할 수 없을 것 같습니다. 우리 부서가 내년에는 예산이 더 빠듯할 것 같습니다.	No, you've been a hard worker, but I'm afraid we have to let you go anyway. This department is going to have a tighter budget next year.	{hard,worker,tighter,budget}	057_10.mp3	057_10.mp3	057_10.mp3	057_10.mp3	057_10.mp3
719	2	59	8	dialogue	\N	\N	\N	\N	음, 이곳에서의 첫해잖아요. 분명히 적응될 거예요.	Well, this is your first year here. I'm sure you'll get used to it.	{first,year,sure,used}	059_08.mp3	059_08.mp3	059_08.mp3	059_08.mp3	059_08.mp3
724	3	59	13	long	저희 오일 제품에 관심 가져 주셔서 감사합니다. 이번에 문의하신 주문 건은 저희가 일반적으로 다루는 것보다 큽니다. 2천 배럴은 보내드릴 수 있는데, 저희 장비 부족으로 최대 2주까지 소요될 것 같습니다. 주문 진행하게 되면 알려 주십시오.	Thank you for your interest in our oil products. Your inquiry is about a very large order - larger than what we normally handle. We can send you 2,000 barrels, but with our limited equipment, it will take up to two weeks. Please let me know if you'd like to go forward.	\N	\N	\N	\N	{interest,oil,products,order,equipment}	059_13.mp3	059_13.mp3	059_13.mp3	059_13.mp3	059_13.mp3
746	2	61	9	dialogue	\N	\N	두 번째 책 제목이 뭐라고 했나요? 저희 집 고양이가 뭘 넘어뜨리는 바람에 못 들었어요.	What did you say was the title of your second book? I didn't catch that because my cat knocked something over.	\N	\N	{title,second,book,catch}	061_09.mp3	061_09.mp3	061_09.mp3	061_09.mp3	061_09.mp3
750	3	61	13	long	(줌 회의 진행자가 참석자들에게) 죄송한데 하시는 말씀이 잘 안 들립니다. 다들 회의 참여 전에 마이크가 되는지 꼭 확인 부탁드립니다. 다시 한번 말씀드리지만 뭘 드시거나 마시면 안 됩니다. 주의가 산만해질 수 있으니까요. 마지막으로, 반려동물이나 아이들은 다른 방에 두시는 것도 잊지 마세요.	I'm sorry, I can't catch what you're saying. Everyone, please make sure that your mics are working before entering the meeting. As a reminder, you're not supposed to eat or drink anything. That can be quite distracting. Please make sure to keep your pets and children in another room.	\N	\N	\N	\N	{sorry,catch,mics,meeting,distracting}	061_13.mp3	061_13.mp3	061_13.mp3	061_13.mp3	061_13.mp3
771	2	63	8	dialogue	\N	\N	\N	\N	당장은 생각나는 사람이 없는데 그래도 한 명은 있을 거야. 자동차 회사랑 딜러들 모두 전기차 홍보에 힘쓰고 있잖아.	I can't think of anyone at the moment, but I must know at least one. Car makers and dealers are all trying to promote electric vehicles.	{think,anyone,moment,electric}	063_08.mp3	063_08.mp3	063_08.mp3	063_08.mp3	063_08.mp3
773	2	63	10	dialogue	\N	\N	\N	\N	네, 그 질문 진짜 많이 받았는데요. 저도 딱 한 단어로는 생각이 안 납니다. affection(애정)? attachment(애착)? 딱 이거다 싶은 게 하나도 없네요.	Yeah, I've been getting that question a lot, but I can't really think of a single good expression. Affection? Attachment? Nothing seems quite right.	{getting,question,think,expression}	063_10.mp3	063_10.mp3	063_10.mp3	063_10.mp3	063_10.mp3
798	2	65	12	dialogue	\N	\N	\N	\N	아, 죄송합니다. 일행이 있는 줄은 몰랐네요.	Oh, I'm sorry. I wasn't aware you were with someone.	{sorry,aware,with,someone}	065_12.mp3	065_12.mp3	065_12.mp3	065_12.mp3	065_12.mp3
799	3	65	13	long	안녕하세요, 고객님. 혹시 모르고 계실까 봐 말씀드리자면, 고객님이 선결제한 데이터를 다 쓰셨습니다. 추가 데이터를 구매하길 바랍니다. 그렇지 않으면 10일 자정부터 서비스가 중단됩니다. GT 고객 서비스	Dear customer. In case you aren't aware, you have used up all of your pre-paid data. Please purchase additional data credit. Otherwise service will be suspended starting at midnight on the 10th.	\N	\N	\N	\N	{aware,used,data,purchase,suspended}	065_13.mp3	065_13.mp3	065_13.mp3	065_13.mp3	065_13.mp3
45	1	4	6	\N	서울은 어디라도 다 너무 비싸. 근데 후람동은 상대적으로 저렴한 편이지	All the neighborhoods in Seoul are super expensive, but Huam-dong os relatively cheap.	\N	\N	\N	\N	{neighborhoods,relatively}	004_06.mp3	004_06.mp3	004_06.mp3	004_06.mp3	004_06.mp3
86	2	7	11	dialogue	\N	\N	얘들아, 오늘 밤에 애들 집에 불러서 게임할까 하는데 같이 할 사람?	Guys, I was thinking about having people over for a game night. Who's in?	\N	\N	{thinking,game,night,in}	007_11.mp3	007_11.mp3	007_11.mp3	007_11.mp3	007_11.mp3
88	3	7	13	long	일생일대의 모험을 즐기고 싶으신가요? 에베레스트 등반을 원하신다면 네팔 어드밴처를 선택해 주세요. 이번 한 달 동안만 신규 고객을 위한 특별 행사가 준비되어 있습니다. 선착순 50인은 무료로 여행 보험에 가입할 수 있습니다. 다른 고객이 채 가기 전에 지금 예약하세요.	Are you down for the adventure of a lifetime? Choose Nepal Adventures for your Everest climb. We have a special offer for new customers available only this month. The first fifty hikers who sign up will receive free travel insurance. Act now, before someone else takes your spot.	\N	\N	\N	\N	{down,adventure,Everest,insurance}	007_13.mp3	007_13.mp3	007_13.mp3	007_13.mp3	007_13.mp3
120	1	10	6	short	다른 안이 없으시면 제가 제안을 하고 싶습니다.	I'd like to make a suggestionm, unless you have something in mind.	\N	\N	\N	\N	{make,suggestion,unless,mind}	010_06.mp3	010_06.mp3	010_06.mp3	010_06.mp3	010_06.mp3
123	2	10	9	dialogue	\N	\N	포르쉐를 받으려면 2년을 기다리셔야 합니다. 그것도 보증금으로 오백만 원을 걸 때 이야기고요.	You will have to wait two years to get a Porsche. And that's only if you put down five million won as a deposit.	\N	\N	{wait,Porsche,deposit,million}	010_09.mp3	010_09.mp3	010_09.mp3	010_09.mp3	010_09.mp3
127	3	10	13	long	워크숍 장소로 다음 두 곳을 생각하고 있습니다. 하지만 더 나은 곳이 있으면 알려 주십시오. 꼭 고려해 보겠습니다. 그나저나 조 인사팀장이 기조연설을 못 하게 되었다면서요. 팀 내네서 대신할 분 누구 염두해두고 계신가요?	We have the following two places in mind as possible sites for the workshop. However, if you have any suggestions for places that would be more suitable, please let me know. We'll definitely take them into consideration. By the way, I heard that your HR manager, Ms. Cho is no longer available to deliver the keynote speech. Does your team have anyone in mind to replace her?	\N	\N	\N	\N	{mind,workshop,keynote,replace}	010_13.mp3	010_13.mp3	010_13.mp3	010_13.mp3	010_13.mp3
133	2	11	6	dialogue	\N	\N	지난 달에 내가 소개팅했다고 이야기했었나? 완전히 내 스타일이야. 그녀 생일에 시계를 선물할까 고민 중이야.	Did I mention that I went on a blind date last month? She is totally my type. I was thinking of getting her a watch for her birthday.	\N	\N	{blind,date,thinking,watch}	011_06.mp3	011_06.mp3	011_06.mp3	011_06.mp3	011_06.mp3
163	2	13	11	dialogue	\N	\N	그 호텔이 우리 예약을 혼동했어. 도심이 보이는 방밖에 안 남았다는데, 그 방 선택하면 저녁은 공짜로 주겠대. 어떻게 생각해?	The hotel mixed up our reservation. They only have city-view rooms left, but if we take one, they're willing to throw in a free dinner. How does that sound?	\N	\N	{hotel,reservation,free,dinner}	013_11.mp3	013_11.mp3	013_11.mp3	013_11.mp3	013_11.mp3
189	2	15	11	dialogue	\N	\N	신규 환자분들이 작성해야 하는 양식 세 장 여기 있습니다. 다 작성하시면 말해 주세요.	Here are three forms that we ask all new patients to fill out. Please let me know when you are done.	\N	\N	{forms,patients,fill,done}	015_11.mp3	015_11.mp3	015_11.mp3	015_11.mp3	015_11.mp3
191	3	15	13	long	기구를 다 쓴 뒤에는 꼭 제자리에 놔두실 것을 당부드립니다. 아무렇게나 놔두면 다른 사람들이 찾을 수가 없습니다. 1회 위반자는 경고 조치하며 2회 위반자는 일주일간 헬스장 출입이 금지됩니다. 모두가 즐길 수 있는 헬스장을 만드는 데 협조해 주시면 감사하겠습니다.	Please make sure to put away the weights when you're done. If you leave them out, others can't find what they need. Violators will be warned the first time, and then suspended for a week the second time. We appreciate your cooperation in making the gym a place everyone can enjoy.	\N	\N	\N	\N	{weights,done,violators,suspended}	015_13.mp3	015_13.mp3	015_13.mp3	015_13.mp3	015_13.mp3
194	1	16	3	short	제가 목이 짧아서 터틀넥은 저한테 안 어울려요.	Turtlenecks never look good on me because my neck is too short.	\N	\N	\N	\N	{turtlenecks,look,neck,short}	016_03.mp3	016_03.mp3	016_03.mp3	016_03.mp3	016_03.mp3
594	3	48	13	long	이 영화를 처음 본 게 10년 전이었는데 지루하고 재미없다고 생각했어. 어떻게 대사가 이렇게 지루할 수 있는지 이해가 안 됐어. 최근에 다시 봤는데 같은 느낌이었어. 여전히 지루하고 재미없었어.	I first saw this movie ten years ago and thought it was boring and unfunny. I couldn't understand how the dialogue could be so dull. I recently watched it again and felt the same way. It was still boring and unfunny.	\N	\N	\N	\N	{movie,boring,unfunny,dialogue}	048_13.mp3	048_13.mp3	048_13.mp3	048_13.mp3	048_13.mp3
859	2	70	11	dialogue	\N	\N	엄마. 이 의상 어때요? 회사 갈 때 입기에는 조금 그런 것 같기도 하고.	Mom, what do you think of this outfit? I'm not sure if it's really appropriate for work.	\N	\N	{mom,think,outfit,appropriate}	070_11.mp3	070_11.mp3	070_11.mp3	070_11.mp3	070_11.mp3
861	3	70	13	long	어디에 투자해야 할지를 두고 아직도 고민 중이십니까? 지난 몇 년간 온갖 스타트업에 다 투자해 본 후 내린 결론은 바이오 스타트업이 가장 안전한 선택이라는 점입니다. 바이오는 실패할 일이 없다는 것이 제 생각입니다.	Are you still trying to figure out where to invest your money? Having invested in all sorts of start-ups over the years, I have found that bio-startups are the safest option. In my opinion, it's hard to go wrong with them.	\N	\N	\N	\N	{figure,invest,startups,bio,wrong}	070_13.mp3	070_13.mp3	070_13.mp3	070_13.mp3	070_13.mp3
204	3	16	13	long	저희 울 스카프에 관심 가져 주셔서 감사합니다. 하지만 제가 프로필 사진을 봤는데, 고객님 피부 톤이랑은 안 맞을 것 같습니다. 좀 더 잘 어울릴 만한 스카프가 하나 더 있습니다. 6월 15일에 포스팅한 것 확인해 보시면 됩니다.	I appreciate your interest in my wool scarf. However, I looked at your profile picture, and I'm afraid it probably wouldn't look good on you with your skin tone. I have another scarf that might suit you better. You can check it out in my post from June 15th.	\N	\N	\N	\N	{wool,scarf,profile,skin,tone}	016_13.mp3	016_13.mp3	016_13.mp3	016_13.mp3	016_13.mp3
248	2	20	10	dialogue	\N	\N	\N	\N	안녕하세요. 다음 달 있을 워크숍 준비 때문에 정신이 없네요.	Good afternoon. I've actually been really busy working on arrangements for next month's workshop.	{afternoon,busy,arrangements,workshop}	020_10.mp3	020_10.mp3	020_10.mp3	020_10.mp3	020_10.mp3
273	3	22	13	long	일반적인 믿음에 반하여, 저는 돈이 반드시 더 넉넉한 가족을 뜻하는 것은 아니라고 생각합니다. 부자들은 종종 아이들이 좋은 삶을 살 기회를 원하기 때문에 아이들을 사립 고등학교나 대학교로 보내는 것을 감당할 수 없습니다. 모든 부모님들은 자녀에게 최선을 다할 것입니다. 물질적인 것과는 상관없습니다.	Contrary to popular belief, I don't think money necessarily means a more generous family. Rich people often can't afford to send their children to private high schools and colleges because they want their children to have the opportunity to live a good life. All parents will do their best for their children. It has nothing to do with material things.	\N	\N	\N	\N	{money,generous,family,private,children}	022_13.mp3	022_13.mp3	022_13.mp3	022_13.mp3	022_13.mp3
285	3	23	13	long	안녕하세요! 괜찮은 가격의 할인 제품을 찾고 계시나요? 예산 내에서 쇼핑하는 것이 얼마나 어려운지 압니다. 사실 가격 문제를 겪는 사람들이 많습니다. 그래서 제가 할인 정보를 공유하고 있습니다. 현재 개인 매장에서 좋은 제품이 많이 나왔습니다.	Hello! Looking for good deals within your budget? I know how hard shopping within a price range can be. Actually, many people struggle with price issues. That's why I share discount information. Currently, many private stores have good products available.	\N	\N	\N	\N	{deals,budget,price,range,discount}	023_13.mp3	023_13.mp3	023_13.mp3	023_13.mp3	023_13.mp3
292	2	24	7	dialogue	\N	\N	나 이 헤어드라이어 동네 시장에서 샀는데 싸게 잘 샀다고 생각했거든. 근데 한 번 사용하고 고장나 버렸지 뭐야.	I bought this hair dryer at a local market and I thought I got a great deal. But actually, it broke the first time I used it.	\N	\N	{bought,hair,dryer,broke}	024_07.mp3	024_07.mp3	024_07.mp3	024_07.mp3	024_07.mp3
298	3	24	13	long	이건 비용 절감에 관한 이야기가 아닙니다. 바로 가치에 대한 이야기입니다. 저렴한 제품은 단기적으로는 경제적이지만, 자주 교체해야 합니다. 고품질 제품은 초기 비용이 높지만 오래 지속됩니다. 결국 싼 게 비지떡이라는 말이 맞습니다. 현명한 소비자는 가격이 아니라 가치를 봅니다.	This isn't about cost-cutting. It's about value. Cheap products are economical short-term but require frequent replacement. Quality products have higher initial costs but last longer. In the end, you get what you pay for. Smart consumers look at value, not price.	\N	\N	\N	\N	{cost,value,cheap,quality,pay}	024_13.mp3	024_13.mp3	024_13.mp3	024_13.mp3	024_13.mp3
311	3	25	13	long	제품 수령하셨다니 다행입니다! 제품이 마음에 드셨으면 좋겠습니다. 저희 회사는 고객 만족을 최우선으로 생각합니다. 제품을 사용하시면서 문제가 있으시면 언제든 연락 주세요. 구매해 주셔서 감사하고, 저희 제품이 도움이 되길 바랍니다.	I'm glad you received the product! I hope you're happy with it. Our company prioritizes customer satisfaction. If you have any issues while using the product, please contact us anytime. Thank you for your purchase, and we hope our product helps you.	\N	\N	\N	\N	{glad,received,product,satisfaction,contact}	025_13.mp3	025_13.mp3	025_13.mp3	025_13.mp3	025_13.mp3
324	3	26	13	long	저희 서비스에 관심 가져 주셔서 감사합니다. 언제든 편하게 문의 주세요. 무료 상담도 가능하니 부담 갖지 마시고 연락 주세요. 필요하시면 샘플도 제공 가능합니다. 마음에 안 드시면 언제든 취소 가능하니 걱정 마세요. 고객님의 편의를 위해 최선을 다하겠습니다.	Thank you for your interest in our service. Feel free to contact us anytime. Free consultation is available, so don't hesitate to reach out. We can provide samples if needed. If you're not satisfied, feel free to cancel anytime. We'll do our best for your convenience.	\N	\N	\N	\N	{interest,service,feel,consultation,samples}	026_13.mp3	026_13.mp3	026_13.mp3	026_13.mp3	026_13.mp3
339	1	28	4	short	우리 몇 명이서 워크숍 마치고 한잔하려고 하는데. 너도 같이 한잔?	A couple of us are going to grab some drinks after the workshop. You down?	\N	\N	\N	\N	{grab,drinks,workshop,down}	028_04.mp3	028_04.mp3	028_04.mp3	028_04.mp3	028_04.mp3
348	3	28	13	long	(여행사가 고객들에게 하루 일정을 알리는 내용) 박물관 견학 후에, 약 45분간 자유시간을 가진 후 다음 장소로 이동하겠습니다. 그동안은 자유롭게 돌아다니셔도 됩니다. 입구 근처에 카페가 두세 군데 있는데 기다리는 동안에 커피 한잔하셔도 되고요.	After the museum tour, you will have 45 minutes of free time before we move on to our next location. You can look around more on your own. There are also a couple of cafes near the entrance, so feel free to grab a coffee while you wait.	\N	\N	\N	\N	{museum,free,time,cafes}	028_13.mp3	028_13.mp3	028_13.mp3	028_13.mp3	028_13.mp3
356	2	29	8	dialogue	\N	\N	\N	\N	절대 아니야. 일본은 우리와 반대 차로로 주행하잖아. 난 적응 못 할 것 같아서	No way, they drive on the other side of the road. I don't think I could get used to it.	{drive,side,road,used}	029_08.mp3	029_08.mp3	029_08.mp3	029_08.mp3	029_08.mp3
361	3	29	13	long	(애플의 마케팅 전략 회의 내용) 애플 컴퓨터는 한국 시장 점유율이 매우 낮습니다. 소비자들이 워낙 윈도우 운영체제에 길들어 있어서인지, 애플로 바꿀 생각조차 하지 않을 겁니다. 저희로서는 극복하기 어려운 문제입니다.	Apple computers have such a low market share in the Korean market. Customers are so used to using Windows OS that they won't even consider making the switch. It's a problem that's going to be nearly impossible for us to overcome.	\N	\N	\N	\N	{apple,market,share,windows}	029_13.mp3	029_13.mp3	029_13.mp3	029_13.mp3	029_13.mp3
385	3	31	13	long	(승진 심사에서 탈락한 직원에게 본사에서 근무하는 동료가 힘내라고 격려하는 내용의 이메일) 당신이 승진을 몹시 기대했던 거 알아요. 근데 솔직히 말하면 승진 못한 게 그리 나쁜 것도 아니에요! 당신의 현재 가치를 인정해 주는 것으로 생각하세요. 부서에서 당신을 소중한 자산으로 생각하는 거예요. 게다가 승진하게 되면, 이곳 본사로 와야 하는데, 본사에서 일하는 게 스트레스가 훨씬 심하다는 건 모두가 알잖아요. 그러니까 이번 일에 너무 신경 쓰지 말아요.	I know you were looking forward to that promotion. But, honestly this isn't such a bad thing! Think of it as a recognition of your current value. The department considers you invaluable. Besides, if you'd get promoted, you have to come here to headquarters, and everyone knows it's more stressful working here. Don't let this get to you.	\N	\N	\N	\N	{promotion,recognition,value,headquarters}	031_13.mp3	031_13.mp3	031_13.mp3	031_13.mp3	031_13.mp3
405	2	33	7	dialogue	\N	\N	제 아들이 내년 1월이면 벌써 마흔셋이 됩니다. 따님 있으시죠? 혹시 따님이 저희 아들이랑 만날 생각이 있는지 여쭤보려고요.	My son is already turning 43 next January. You have a daughter, right? I just wanted to ask if you think she would be interested in meeting him.	\N	\N	{son,daughter,wanted,meeting}	033_07.mp3	033_07.mp3	033_07.mp3	033_07.mp3	033_07.mp3
432	2	35	12	dialogue	\N	\N	\N	\N	저런. 괜찮아요? 가족분들과 그리 오래 떨어져 있는 게 어떤 기분인지 상상이 안 되네요.	Oh my gosh. Are you okay with that? I can't imagine what it's like being away from your family for so long.	{okay,imagine,away,family}	035_12.mp3	035_12.mp3	035_12.mp3	035_12.mp3	035_12.mp3
443	2	36	10	dialogue	\N	\N	\N	\N	가능할 것 같은데, 저희는 그런 시술은 하지 않거든요. 다른 병원 추천해 드릴게요.	I believe so, but I'm afraid we don't offer that procedure here. Let me refer you to another clinic.	{believe,afraid,procedure,refer}	036_10.mp3	036_10.mp3	036_10.mp3	036_10.mp3	036_10.mp3
459	3	37	13	long	너희들 오늘 밤에 뭐 해? 괜찮으면 광화문 가서 경기를 보면 어떨까 해. 춥겠지만 열기를 느끼고 싶어서 말이야. 어쩌면 이런 기회가 다시는 없을 수도 있으니까.	What are you guys up to tonight? If anyone's down, I was thinking of heading to Gwanghwamun to watch the game. I know it's gonna be cold, but I don't want to miss all the excitement. We might not ever have another chance like this.	\N	\N	\N	\N	{tonight,gwanghwamun,game,excitement}	037_13.mp3	037_13.mp3	037_13.mp3	037_13.mp3	037_13.mp3
483	3	39	13	long	포장 전문 비즈니스 모델로 바꿈으로써 임대료를 아끼려는 업체들이 늘고 있습니다. 매장 내 식사를 제공하지 않음으로써 매장 좌석, 인테리어 등이 필요 없어지는 것이죠. 많은 식당들에 따르면 배달 및 테이크아웃 주문이 전체 매출의 60에서 70퍼센트를 차지한다고 합니다.	More and more businesses are saving on rent by switching to to-go only business models. By not offering dine-in service, they eliminate the need for indoor seating and decorations. Many restaurants report delivery and take-out orders account for 60-70% of their business anyway.	\N	\N	\N	\N	{businesses,saving,rent,to-go}	039_13.mp3	039_13.mp3	039_13.mp3	039_13.mp3	039_13.mp3
496	3	40	13	long	9월 초네요. 여름 의류 세일에 들어가야 할 시점이군요. 그런데 세일 시점을 좀 바꾸면 어떨까 합니다. 경쟁사가 신제품 라인을 선보일 때까지는 가격 인하를 보류하면 어떨까요? 그러면 고객을 덜 빼앗길 테니까요.	It's the beginning of September, so it is almost time for our annual end-of-summer clothing sale. I was thinking, however, that we could change the timing. How about we hold off on cutting prices until our competitor comes out with their new product line? That way, they won't steal as many of our customers.	\N	\N	\N	\N	{september,sale,timing,competitor,prices}	040_13.mp3	040_13.mp3	040_13.mp3	040_13.mp3	040_13.mp3
503	2	41	7	dialogue	\N	\N	안녕하세요. 오늘은 어린이날이라서, 애들 주려고 과자를 사 왔어요. 좀 드시겠어요?	Good morning. It's Children's Day, so I got the kids some snacks. Would you like some?	\N	\N	{children,day,snacks}	041_07.mp3	041_07.mp3	041_07.mp3	041_07.mp3	041_07.mp3
509	3	41	13	long	그리스 가셨을 때 저에게 와인을 한 병 사다 주신 것 너무 감사해요. 제가 그리스 와인을 얼마나 좋아하는지 아신 거예요. 저도 무언가를 해 드려야 할 것 같은데요. 제가 미국 가서 뭘 사다 드릴 게 있을까요?	It was so kind of you to get me a bottle of wine while you were in Greece. You know how much I enjoy Greek wine. Now I feel like I have to get you something. Is there anything you want from America?	\N	\N	\N	\N	{wine,greece,get,america}	041_13.mp3	041_13.mp3	041_13.mp3	041_13.mp3	041_13.mp3
564	1	46	5	short	(서울에서 파는 타코를 먹어 본 외국인이) 한국 타코가 좀 덜 맵긴 해요. 그래도 나쁘진 않아요.	The tacos I've had in Korea are much less spicy. I can't complain, though.	\N	\N	\N	\N	{tacos,korea,spicy,complain}	046_05.mp3	046_05.mp3	046_05.mp3	046_05.mp3	046_05.mp3
575	1	47	5	short	(헬스 트레이너가 하는 말) 그럼 다음 수업에서는 오늘 못 한 팔굽혀펴기 스무 번 하셔야 합니다.	You owe me 20 push-ups in our next session.	\N	\N	\N	\N	{owe,push-ups,next,session}	047_05.mp3	047_05.mp3	047_05.mp3	047_05.mp3	047_05.mp3
579	2	47	9	dialogue	\N	\N	잘 모르겠어. 이렇게 그만두니 마음이 안 좋아. 후임자 찾는 걸 도와줘야 할까? 아님 마지막 날 좋은 이별 선물이라도 해야 할까?	I don't know. I just feel bad leaving my job like this. Should I help them find my replacement? Or should I give them a nice good-bye gift on my last day?	\N	\N	{leaving,job,replacement,gift}	047_09.mp3	047_09.mp3	047_09.mp3	047_09.mp3	047_09.mp3
592	2	48	11	dialogue	\N	\N	포르쉐에 전화해서 수리 일정 잡으려 했는데, 10월까지 기다려야 된다고 하더라. 신규 고객이 아니면 별로 신경을 안 쓰는 듯.	I called the Porsche and tried to arrange a repair, but they said I would have to wait until October. It's like they don't care about you unless you're a new customer.	\N	\N	{porsche,repair,october,customer}	048_11.mp3	048_11.mp3	048_11.mp3	048_11.mp3	048_11.mp3
604	2	49	10	dialogue	\N	\N	\N	\N	진짜요? 엄청 번거롭겠어요. 그래도 어떻게든 되기는 하네요. 요즘 같은 날씨에 난 에어컨 없이는 못 살아요.	Wow! That sounds like such a hassle. At least it's still working. I couldn't live without a/c in this weather.	{sounds,hassle,working,weather}	049_10.mp3	049_10.mp3	049_10.mp3	049_10.mp3	049_10.mp3
615	2	50	11	dialogue	\N	\N	혹시 예외적으로 30%의 금액만으로 주문할 수 있을까요?	Could you possibly make an exception and let me place an order with only 30% down?	\N	\N	{exception,place,order,down}	050_11.mp3	050_11.mp3	050_11.mp3	050_11.mp3	050_11.mp3
617	3	50	13	long	미국에서는 지나가다 누군가와 부딪히면 곧장 사과를 합니다. 그런데 여기는 그렇지 않습니다! 이곳은 빨리빨리 사회라서 개인의 공간은 무시되기 일쑤입니다.	In America, if you accidentally bump into someone as you walk past them, you immediately apologize. But that's not how it works here! This is a very fast-paced country and personal space is often disregarded.	\N	\N	\N	\N	{america,bump,apologize,fast-paced}	050_13.mp3	050_13.mp3	050_13.mp3	050_13.mp3	050_13.mp3
637	2	52	7	dialogue	\N	\N	당신 요즘 많이 바쁜 거 알아. 근데 서로를 위해 시간을 내는 게 중요한 것 같아. 당신이랑 함께 하는 시간이 그리워.	I know you've been busy lately. But I think it's important that we make time for each other. I miss spending time with you.	\N	\N	{busy,lately,important,spending}	052_07.mp3	052_07.mp3	052_07.mp3	052_07.mp3	052_07.mp3
641	3	52	13	long	요청 건을 좀 더 빨리 마무리해 드리지 못해 죄송합니다. 최소한 진행 상황이라도 말씀을 드려야 했는데 말입니다. 본사에 일이 많네요. 그래서 요청하신 계약서 초안을 작업할 시간적 여유가 없었습니다. 완성해서 다음 금요일까지는 꼭 보내 드리겠습니다.	I'm sorry for not completing your request sooner. Or at least giving you an update. We have a lot going on here at headquarters. So, we haven't been able to find the time to work on the draft contract that you requested. I'll make sure to have it done and sent to you by next Friday.	\N	\N	\N	\N	{sorry,completing,request,headquarters,draft}	052_13.mp3	052_13.mp3	052_13.mp3	052_13.mp3	052_13.mp3
665	3	54	13	long	연휴 음식 준비하는 게 여간 스트레스가 아니죠. 뒷정리는 말할 것도 없고요. 저녁 외식으로 스트레스를 피하세요. 오래간만에 가족분들과 만나서 궁중요리를 먹으면서 이야기를 나누는 것이 최고일 것입니다. 이번 추석에는 친지들과 왕처럼 식사하세요. 예약 가능한 시간대가 얼마 남지 않았으니 서둘러 예약 부탁드립니다.	Preparing a holiday meal can be really stressful, not to mention all the cleaning up after. Avoid the stress by going out for dinner. There is no better way to catch up with your family than over royal court cuisine. Dine like a king with your relatives this Chuseok. Please book quickly before we run out of reservation times.	\N	\N	\N	\N	{preparing,holiday,meal,stressful,reservation}	054_13.mp3	054_13.mp3	054_13.mp3	054_13.mp3	054_13.mp3
692	1	57	2	short	웬만하면 집에서 밥을 더 자주 해 먹어야 할 것 같아. 요즘 좀 빠듯해.	I think we should try cooking at home more. Money is a bit tight right now.	\N	\N	\N	\N	{cooking,home,money,tight}	057_02.mp3	057_02.mp3	057_02.mp3	057_02.mp3	057_02.mp3
712	3	58	13	long	스타 리크루팅의 Harriot입니다. 대형 소프트웨어 회사에 자리가 하나 났습니다. 선생님이 적임자라는 생각이 듭니다. 연봉은 협상 가능하고요, 일 년에 육만 달러 넘게 받게 되실 겁니다. 뿐만 아니라 근무 시간도 짧습니다. 오전만 근무하는 자리예요. 이번 주로 면접을 잡을까요?	This is Harriot at Star Recruiting. I have an opening here with a large software firm. I think you would be a good fit. The pay is negotiable, but I think you could get more than $60,000 a year. On top of that, the hours are short; It's actually a morning-only position. Can I schedule you for an interview this week?	\N	\N	\N	\N	{harriot,recruiting,software,negotiable,morning}	058_13.mp3	058_13.mp3	058_13.mp3	058_13.mp3	058_13.mp3
734	2	60	10	dialogue	\N	\N	\N	\N	정말? 레시피 보니까 소고기가 있어야 한다고 하는데, 돼지고기도 괜찮을 듯.	Oh, really? The recipe calls for beef, but I guess pork will be okay.	{recipe,calls,beef,pork}	060_10.mp3	060_10.mp3	060_10.mp3	060_10.mp3	060_10.mp3
737	3	60	13	long	우리가 프로젝트를 기한 내에, 무엇보다 적은 예산으로 마무리하게 되었다는 말씀을 모두에게 드리게 되어 기쁩니다. 분명 축하해야 할 일입니다. 퇴근 후에 콘래드 호텔에서 술자리에 함께 하시면 제가 여러분의 노고에 일일이 축하를 드리겠습니다.	Everyone, I'm pleased to announce that we've completed the project on time, and under budget, on top of that. This definitely calls for a celebration. I'd like to ask that you join me for drinks after work at Conrad so that I can congratulate you all individually on your efforts.	\N	\N	\N	\N	{pleased,announce,completed,celebration,conrad}	060_13.mp3	060_13.mp3	060_13.mp3	060_13.mp3	060_13.mp3
761	2	62	11	dialogue	\N	\N	들어 보니까 은행 직원들은 거의 밤 9시까지 야근을 해야 한대.	I heard some bank workers pretty much have to stick around the office until 9:00 p.m.	\N	\N	{heard,bank,workers,office}	062_11.mp3	062_11.mp3	062_11.mp3	062_11.mp3	062_11.mp3
763	3	62	13	long	타임스퀘어 근처 식당에서 산 이 햄버거 크기 좀 봐. 메뉴에서 봤을 때는 이렇게 큰 줄 몰랐어. 게다가 브레드스틱도 같이 나오네. 이러니 미국 사람들이 과체중인 게 당연하지.	Look at the size of this hamburger I got from a diner near Times Square. When I saw it on the menu, it didn't look this big! And it comes with a side of breadsticks. No wonder Americans tend to be overweight.	\N	\N	\N	\N	{size,hamburger,times,square,overweight}	062_13.mp3	062_13.mp3	062_13.mp3	062_13.mp3	062_13.mp3
774	3	63	13	long	(사무용품 회사 직원이 같은 회사 타 부서 팀장에게 보내는 이메일) 조 팀장님께. 잠깐 시간 되시면, 배송 문제 좀 도와주실 수 있을까요? 저희가 어쩌다가 며칠 동안 배송하는 걸 깜박했고요, 배송일을 약속한 것이 목요일인데 그때까지 고객에게 물건을 배송할 방법이 생각나지 않습니다.	Mr. Cho, If you have a moment, I could use your help with a shipping problem. We accidentally forgot to send a package out for several days, and now I can't think of a way to get it to the customer by Thursday, which is our guaranteed delivery date.	\N	\N	\N	\N	{moment,help,shipping,think,thursday}	063_13.mp3	063_13.mp3	063_13.mp3	063_13.mp3	063_13.mp3
805	1	66	6	short	(줌 회의 중에) 이 회의 바로 다음에 다른 회의가 잡혀 있어서, 죄송하지만 여기서 마쳐야 할 것 같습니다.	I have another meeting scheduled right after this, so I'm afraid I'll have to let you go.	\N	\N	\N	\N	{meeting,scheduled,afraid,let}	066_06.mp3	066_06.mp3	066_06.mp3	066_06.mp3	066_06.mp3
812	3	66	13	long	(마이애미에 거주하는 미국인 부모님이 서울에 사는 딸에게 하는 통화 중) 시간이 많이 늦었으니 들어가 봐. 우리가 곧 서울 가니까! 마이애미에서 뭐 사 오라고 할 것 있으면, 우리 비행기 타기 전에 문자 줘.	It's getting pretty late here, so I will have to let you go. We'll be there in Seoul before you know it, though! Text me before the flight if you need anything from Miami.	\N	\N	\N	\N	{late,let,seoul,miami,text}	066_13.mp3	066_13.mp3	066_13.mp3	066_13.mp3	066_13.mp3
836	3	68	13	long	(원어민 선생님이 과외를 받는 학생에게 보내는 메시지) 수연 님, 제가 은행 거래내역을 확인하고 있었는데, 보니까 지난 수업료 입금한 지가 꽤 되더라고요. 6월 23일에 입금된 것 같은데, 그럼 두 달 치 수업료가 밀린 것 같아요. 맞을까요?	Sooyeon, I was just going through my bank transactions, and I found that it has been a while since your last tuition payment. I think that was on June 23rd, which would mean you're nearly two months behind on tuition. Does that look right to you?	\N	\N	\N	\N	{bank,transactions,tuition,behind,months}	068_13.mp3	068_13.mp3	068_13.mp3	068_13.mp3	068_13.mp3
842	1	69	6	short	A: Jonathan은 그 정도 스펙이면 다른 직장 구하는 데 문제 없을 거야. B: 내 말이.	A: Jonathan won't have any trouble getting another job with his qualifications. B: That's for sure.	\N	\N	\N	\N	{jonathan,trouble,job,qualifications}	069_06.mp3	069_06.mp3	069_06.mp3	069_06.mp3	069_06.mp3
848	3	69	13	long	George는 최고의 인사부 관리자입니다. 입사 후 30년간 적어도 신규 직원 절반을 교육한 사람이죠. 우리가 성장한 것도 이분의 공이 큽니다. 의심의 여지가 없지요!	George has been a terrific human resources manager. Since he joined 30 years ago, he has helped train at least half of all new hires. Much of our growth was only possible thanks to him. That's for sure.	\N	\N	\N	\N	{terrific,human,resources,train,growth}	069_13.mp3	069_13.mp3	069_13.mp3	069_13.mp3	069_13.mp3
860	2	70	12	dialogue	\N	\N	\N	\N	한번 보자. 바지가 좀 타이트하네. 근데 상의를 블레이저를 입었으니 괜찮을 것 같다. 그 두 조합은 언제나 옳거든.	Let me see. The pants are a little tight, but you've got the blazer on top, which makes it alright. You can't go wrong with that combination.	{pants,tight,blazer,combination}	070_12.mp3	070_12.mp3	070_12.mp3	070_12.mp3	070_12.mp3
\.


--
-- Data for Name: review_queue; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.review_queue (queue_id, user_id, source_day, interval_days, scheduled_for, added_at, last_reviewed, review_count) FROM stdin;
1	user001	14	1	2025-09-19 18:02:26.921017	2025-09-18 18:02:26.921017	\N	0
2	user001	15	1	2025-09-19 18:02:26.921017	2025-09-18 18:02:26.921017	\N	0
3	user001	12	3	2025-09-18 18:02:26.921017	2025-09-18 18:02:26.921017	\N	1
4	user001	10	7	2025-09-16 18:02:26.921017	2025-09-18 18:02:26.921017	\N	2
5	user001	8	14	2025-09-19 18:02:26.921017	2025-09-18 18:02:26.921017	\N	3
6	user002	14	1	2025-09-19 18:02:33.756701	2025-09-18 18:02:33.756701	\N	0
7	user002	13	3	2025-09-20 18:02:33.756701	2025-09-18 18:02:33.756701	\N	1
8	user002	11	7	2025-09-18 18:02:33.756701	2025-09-18 18:02:33.756701	\N	2
9	user003	5	30	2025-09-23 18:02:41.421754	2025-09-18 18:02:41.421754	2025-08-24 18:02:41.421754	4
10	user003	3	60	2025-09-28 18:02:41.421754	2025-09-18 18:02:41.421754	2025-07-30 18:02:41.421754	5
11	user003	1	90	2025-10-03 18:02:41.421754	2025-09-18 18:02:41.421754	2025-07-05 18:02:41.421754	6
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
WQoVS48FjeV8mD9q8iZ40v-5c9o8udwJ	{"cookie":{"originalMaxAge":2592000000,"expires":"2025-10-26T05:25:17.381Z","secure":false,"httpOnly":true,"path":"/"},"passport":{"user":"google_116458393760270019201"}}	2025-11-23 15:45:59
\.


--
-- Data for Name: user_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_progress (progress_id, user_id, category_id, last_studied_day, last_studied_question_id, last_studied_timestamp, solved_count) FROM stdin;
223	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2	2	16	2025-11-03 15:53:58.324765	0
34	google_116458393760270019201	4	1	25	2025-10-22 23:37:57.63534	0
7	user001	2	1	1	2025-09-30 14:24:29.280699	0
8	user001	3	1	1	2025-09-30 14:24:29.280699	0
224	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	3	3	30	2025-11-03 15:53:58.326523	0
6	user001	1	3	2	2025-09-30 14:24:29.280699	0
1	google_116458393760270019201	1	1	1	2025-10-19 23:57:18.264916	0
2	google_116458393760270019201	2	1	12	2025-09-30 14:07:03.654104	0
10	test_user_123	4	1	2	2025-10-19 23:21:30.417338	0
11	test_user_123	5	1	3	2025-10-19 23:21:30.437959	0
12	test_user_123	6	2	15	2025-10-19 23:21:30.458077	0
9	test_user_123	1	1	5	2025-10-19 23:43:45.907555	0
222	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	1	1	5	2025-11-11 01:20:26.200254	3
69	naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	4	12	143	2025-11-11 21:48:44.377453	2
275	kakao_4538877331	4	1	5	2025-11-11 22:11:26.491045	5
281	kakao_4538877331	2	1	7	2025-11-11 22:12:58.606845	1
\.


--
-- Data for Name: user_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_settings (user_id, notifications_enabled, notification_time, autoplay_enabled, voice_speed, voice_gender, theme, font_size, created_at, updated_at) FROM stdin;
test_user_123	t	20:00:00	f	1.00	male	dark	medium	2025-11-04 15:32:35.186414	2025-11-04 15:32:43.141718
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	t	07:00:00	t	1.00	male	light	medium	2025-11-04 14:51:22.877078	2025-11-10 22:41:51.57004
kakao_4538877331	t	20:00:00	f	1.00	male	light	medium	2025-11-11 00:21:06.99666	2025-11-11 00:21:06.99666
\.


--
-- Data for Name: user_streak; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_streak (user_id, current_streak, last_completed_date, today_completed, best_streak, created_at, updated_at) FROM stdin;
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	5	2025-11-01	t	5	2025-10-28 00:14:32.956809	2025-11-01 23:38:33.015753
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (uid, name, email, profile_image, created_at, voice_gender, default_difficulty, daily_goal, total_questions_attempted, total_correct_answers, current_streak, last_login_at, total_days_studied, longest_streak, weekly_attendance, level, last_completed_question_id, earned_badges, attendance_goal, quiz_count_goal, quiz_mode, audio_speed) FROM stdin;
google_116458393760270019201	jishu lim	jishuya3015@gmail.com	🦊	2025-09-18 15:10:27.692948	us_male	2	10	234	56	3	2025-10-17 18:03:54.973603	222	33	{0,0,0,0,0,0,0}	2	model_example_14_1	[]	1	1	keyboard	1.0
test_user_123	김테스트	test@example.com	🦊	2025-09-18 15:20:03.726038	us_male	2	10	4203	182	3	2025-09-25 13:18:31.026201	182	30	{1,1,0,1,1,1,0}	3	model_example_14_1	[]	1	1	keyboard	1.0
user002	이민지	minji@example.com	🦊	2025-09-18 14:25:17.520561	us_male	1	10	22	11	2	2025-09-18 15:09:15.727184	6	2	{0,0,0,0,0,0,0}	2	model_example_14_1	[]	1	1	keyboard	1.0
user003	박준호	junho@example.com	🦊	2025-09-18 14:25:17.520561	us_male	3	10	44	33	2	2025-09-18 15:09:15.727184	11	3	{0,0,0,0,0,0,0}	3	model_example_14_1	[]	1	1	keyboard	1.0
user001	김재우	jaewoo@example.com	🦊	2025-09-18 14:25:17.520561	us_male	2	10	123	12	1	2025-09-18 15:09:15.727184	33	12	{0,0,0,0,0,0,0}	1	model_example_14_1	[]	1	1	keyboard	1.0
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	임지수	jishuya3015@naver.com	🦊	2025-09-18 15:10:32.338366	us_female	2	2	135	9	2	2025-11-11 01:15:21.233283	38	4	{0,0,0,0,0,0,0}	2	model_example_14_1	["complete-model", "streak-7", "questions-100"]	2	25	voice	1.0
kakao_4538877331	임지수	kakao_4538877331@kakao.local	🦊	2025-11-11 00:18:07.281389	us_male	2	10	6	0	1	2025-11-11 21:53:43.193587	1	1	{0,0,0,0,0,0,0}	1	\N	[]	3	30	voice	1.0
\.


--
-- Data for Name: wrong_answers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wrong_answers (user_id, question_id, added_at, wrong_count, last_viewed_at) FROM stdin;
google_116458393760270019201	1	2025-09-30 13:16:46.279734	1	2025-10-31 17:25:01.532671
google_116458393760270019201	3	2025-09-30 13:17:32.863292	1	2025-10-31 17:25:01.532671
google_116458393760270019201	6	2025-10-16 17:32:56.133032	1	2025-10-31 17:25:01.532671
google_116458393760270019201	8	2025-10-16 17:32:56.133859	1	2025-10-31 17:25:01.532671
google_116458393760270019201	10	2025-10-16 17:32:56.134597	1	2025-10-31 17:25:01.532671
google_116458393760270019201	12	2025-10-16 17:32:56.135378	1	2025-10-31 17:25:01.532671
google_116458393760270019201	14	2025-10-16 17:37:33.343008	1	2025-10-31 17:25:01.532671
google_116458393760270019201	16	2025-10-16 17:37:33.344149	1	2025-10-31 17:25:01.532671
google_116458393760270019201	4	2025-10-17 17:45:53.846776	1	2025-10-31 17:25:01.532671
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	2	2025-10-26 17:26:35.850412	3	2025-10-30 17:26:35.850412
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	4	2025-10-28 17:26:35.853622	1	2025-10-28 17:26:35.853622
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	6	2025-10-27 17:26:35.855444	2	2025-10-29 17:26:35.855444
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	8	2025-10-31 17:26:35.857253	1	2025-10-31 17:26:35.857253
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	10	2025-10-24 17:26:35.859251	4	2025-10-30 17:26:35.859251
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	12	2025-10-26 17:29:45.499036	3	2025-10-30 17:29:45.499036
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	14	2025-10-28 17:29:45.503331	1	2025-10-28 17:29:45.503331
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	16	2025-10-27 17:29:45.50536	2	2025-10-29 17:29:45.50536
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	18	2025-10-31 17:29:45.506899	1	2025-10-31 17:29:45.506899
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	20	2025-10-24 17:29:45.539527	4	2025-10-30 17:29:45.539527
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	122	2025-11-05 21:59:37.109222	1	2025-11-05 21:59:37.109222
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	124	2025-11-05 22:14:58.60263	1	2025-11-05 22:14:58.60263
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	131	2025-11-05 22:47:14.155458	1	2025-11-05 22:47:14.155458
naver_IkQGr-fk1gVw2es4wbHnpCW42yMDTgYoKnEXe7A2sWc	134	2025-11-05 23:01:35.379224	1	2025-11-05 23:01:35.379224
kakao_4538877331	3	2025-11-11 22:09:48.460841	1	2025-11-11 22:09:48.460841
\.


--
-- Name: daily_summary_summary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.daily_summary_summary_id_seq', 94, true);


--
-- Name: review_queue_queue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.review_queue_queue_id_seq', 11, true);


--
-- Name: user_progress_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_progress_progress_id_seq', 281, true);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (category_id);


--
-- Name: daily_summary daily_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_summary
    ADD CONSTRAINT daily_summary_pkey PRIMARY KEY (summary_id);


--
-- Name: daily_summary daily_summary_user_id_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_summary
    ADD CONSTRAINT daily_summary_user_id_date_key UNIQUE (user_id, date);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (user_id, question_id);


--
-- Name: question_attempts question_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_attempts
    ADD CONSTRAINT question_attempts_pkey PRIMARY KEY (user_id, question_id, date);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (question_id);


--
-- Name: review_queue review_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_queue
    ADD CONSTRAINT review_queue_pkey PRIMARY KEY (queue_id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: review_queue unique_user_day; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_queue
    ADD CONSTRAINT unique_user_day UNIQUE (user_id, source_day);


--
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (progress_id);


--
-- Name: user_progress user_progress_user_id_category_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_category_id_key UNIQUE (user_id, category_id);


--
-- Name: user_settings user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_pkey PRIMARY KEY (user_id);


--
-- Name: user_streak user_streak_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_streak
    ADD CONSTRAINT user_streak_pkey PRIMARY KEY (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (uid);


--
-- Name: wrong_answers wrong_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wrong_answers
    ADD CONSTRAINT wrong_answers_pkey PRIMARY KEY (user_id, question_id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: idx_daily_summary_user_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_daily_summary_user_date ON public.daily_summary USING btree (user_id, date DESC);


--
-- Name: idx_qa_user_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_qa_user_date ON public.question_attempts USING btree (user_id, date DESC);


--
-- Name: idx_questions_category_day; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_questions_category_day ON public.questions USING btree (category_id, day, question_number);


--
-- Name: idx_review_queue_user_scheduled; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_review_queue_user_scheduled ON public.review_queue USING btree (user_id, scheduled_for);


--
-- Name: idx_users_earned_badges; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_earned_badges ON public.users USING gin (earned_badges);


--
-- Name: idx_wrong_answers_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wrong_answers_user ON public.wrong_answers USING btree (user_id);


--
-- Name: daily_summary set_daily_summary_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_daily_summary_timestamp BEFORE UPDATE ON public.daily_summary FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();


--
-- Name: user_streak set_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.user_streak FOR EACH ROW EXECUTE FUNCTION public.set_timestamp();


--
-- Name: daily_summary daily_summary_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_summary
    ADD CONSTRAINT daily_summary_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(uid) ON DELETE CASCADE;


--
-- Name: favorites favorites_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;


--
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(uid) ON DELETE CASCADE;


--
-- Name: question_attempts fk_qa_question; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_attempts
    ADD CONSTRAINT fk_qa_question FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;


--
-- Name: question_attempts fk_qa_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_attempts
    ADD CONSTRAINT fk_qa_user FOREIGN KEY (user_id) REFERENCES public.users(uid) ON DELETE CASCADE;


--
-- Name: questions fk_questions_category; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT fk_questions_category FOREIGN KEY (category_id) REFERENCES public.category(category_id) ON DELETE CASCADE;


--
-- Name: review_queue review_queue_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_queue
    ADD CONSTRAINT review_queue_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(uid) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(category_id) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_last_studied_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_last_studied_question_id_fkey FOREIGN KEY (last_studied_question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(uid) ON DELETE CASCADE;


--
-- Name: user_settings user_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(uid) ON DELETE CASCADE;


--
-- Name: user_streak user_streak_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_streak
    ADD CONSTRAINT user_streak_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(uid) ON DELETE CASCADE;


--
-- Name: wrong_answers wrong_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wrong_answers
    ADD CONSTRAINT wrong_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;


--
-- Name: wrong_answers wrong_answers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wrong_answers
    ADD CONSTRAINT wrong_answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(uid) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict OiUjMU8CAXC7kmTdQlTy5hPoYfeeBw3RrxnEMPSpjJ8kaaAf49DGbTEOiaeDts8

