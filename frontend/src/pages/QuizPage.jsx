import { createAnswerStreak } from '../utils/answerStreak';
import { getVisibleKeywords } from '../utils/quizKeywords';
import { normalizeGradingText } from '../utils/grading';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

// UI 컴포넌트들
import { QuizProgressBar } from '../components/quiz/QuizProgressBar';
import { CategoryQuizProgressBar } from '../components/quiz/CategoryQuizProgressBar';
import { QuizContent } from '../components/quiz/QuizContent';
import { QuizControls } from '../components/quiz/QuizControls';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import Modal, { ModalBody } from '../components/ui/Modal';
import BadgeModal from '../components/ui/BadgeModal';
import LevelUpModal from '../components/quiz/LevelUpModal';
import { WrongAnswerModal } from '../components/quiz/WrongAnswerModal';
import QuizOnboarding from '../components/quiz/QuizOnboarding';
import Button from '../components/ui/Button';
import AlertModal from '../components/ui/AlertModal';
import { getIcon } from '../utils/iconMap';

// API 서비스
import { api } from '../services/apiService';
import { stopEffectSound } from '../utils/soundEffects';

// 세션 관리 유틸리티
import {
  getSession,
  moveToNextQuestion,
  markQuestionCompleted,
  isQuizCompleted,
  toggleFavorite,
  toggleStar,
  updateInputMode,
  deleteSession
} from '../utils/sessionStorage';

// 채점 훅
import { useQuizGrading } from '../hooks/useQuizGrading';

// 음성인식 훅
import { useVoiceInput } from '../hooks/useVoiceInput';

// API 훅 및 서비스
import { useToggleWrongAnswer, useToggleFavorite, useUpdateProgress, useQuizMode, useUpdateQuizMode, useHistoryData, useMarkDayCompleted } from '../hooks/useApi';

// 음원 유틸리티
import { getAudioUrl, playEffectSound } from '../utils/audioUtils';

const QuizPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // URL 파라미터에서 세션 ID 추출
  const sessionId = searchParams.get('session');

  // localStorage에서 세션 데이터 로드
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (sessionId) {
      const sessionData = getSession(sessionId);
      if (sessionData) {
        setSession(sessionData);
      } else {
        // 세션이 없으면 홈으로
        navigate('/');
      }
    } else {
      // sessionId가 없으면 홈으로
      navigate('/');
    }
  }, [sessionId, navigate]);

  // 세션 데이터에서 현재 문제 인덱스 추출
  const currentQuestionIndex = session?.currentQuestionIndex || 0;

  // 퀴즈 데이터: 모든 카테고리에서 session에 이미 questions가 저장되어 있음
  // HomePage에서 API를 통해 데이터를 가져와서 세션에 저장했으므로 추가 조회 불필요
  const questionsData = session?.questions;
  const isLoading = !session || !questionsData;

  // 현재 문제 추출 (서버에서 가져온 전체 문제 중 현재 인덱스의 문제)
  const question = useMemo(() => {
    if (!questionsData || !Array.isArray(questionsData)) return null;

    const currentQuestion = questionsData[currentQuestionIndex];
    if (!currentQuestion) return null;

    // 백엔드 데이터 형식을 QuizPage가 기대하는 형식으로 변환
    let korean, english;

    if (currentQuestion.question_type === 'dialogue') {
      // dialogue 타입: korean_a/english_a 또는 korean_b/english_b 사용
      if (currentQuestion.korean_a !== "" && currentQuestion.korean_a !== null) {
        korean = currentQuestion.korean_a;
        english = currentQuestion.english_a;
      } else {
        korean = currentQuestion.korean_b;
        english = currentQuestion.english_b;
      }
    } else {
      // short, long, null 또는 기타 타입: 기본 korean/english 필드 사용
      korean = currentQuestion.korean;
      english = currentQuestion.english;
    }

    return {
      id: currentQuestion.question_id,
      day: currentQuestion.day,
      categoryId: currentQuestion.category_id,
      type: currentQuestion.question_type,
      korean,
      english,
      audio: currentQuestion.audio, // DB의 audio 컬럼 (파일명: '001_01.mp3')
      keywords: currentQuestion.keywords || [], // 전체 키워드 반환
      answer: english,
      isFavorite: currentQuestion.is_favorite || false,
      isWrongAnswer: currentQuestion.is_wrong_answer || false
    };
  }, [questionsData, currentQuestionIndex]);

  // 퀴즈 모드 조회 (DB에서 사용자 설정 불러오기)
  const { data: quizModeData } = useQuizMode();
  const updateQuizModeMutation = useUpdateQuizMode();

  // 카테고리 진행률 정보 (카테고리 퀴즈용)
  const { data: historyData } = useHistoryData();
  const categoryProgress = useMemo(() => {
    if (!historyData || !session?.category) return null;
    const categoryId = session.category;
    // historyData에서 해당 category 찾기
    const categoryInfo = historyData.find(item => item.id === categoryId);
    return categoryInfo || null;
  }, [historyData, session?.category]);

  // 로컬 상태
  const [userAnswer, setUserAnswer] = useState('');
  const [inputMode, setInputMode] = useState('keyboard'); // 초기값은 기본값, useEffect에서 세션/DB 값으로 업데이트
  const [quizMode, setQuizMode] = useState('solving'); // 'solving' | 'grading'
  const answerStreak = useMemo(() => createAnswerStreak(), [sessionId]);
  const [streakMilestone, setStreakMilestone] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [keywordInputs, setKeywordInputs] = useState({});
  const [selectedKeywords, setSelectedKeywords] = useState([]); // 선택된 키워드 유지

  // 모달 상태
  const [showGoalAchievedModal, setShowGoalAchievedModal] = useState(false);
  const [streakInfo, setStreakInfo] = useState(null);
  const [newBadges, setNewBadges] = useState([]);
  const [levelUpInfo, setLevelUpInfo] = useState(null);
  const [wrongAnswerFeedback, setWrongAnswerFeedback] = useState(null); // { correctCount, totalCount }
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', icon: '' });

  // 모달 버튼 ref
  const continueButtonRef = useRef(null);
  const nextQuestionPendingRef = useRef(false);
  const focusKeywordRef = useRef(null); // 빈칸 클릭 시 포커스할 키워드

  // 🎵 음원 재생 관련 상태 및 ref
  const audioRef = useRef(null);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [audioError, setAudioError] = useState(false);

  // 음원 URL 생성
  const audioUrl = useMemo(() => {
    if (!question?.audio) {
      return null;
    }
    const url = getAudioUrl(question.audio);
    return url;
  }, [question?.audio]);

  // 즐겨찾기 & 별 상태 (로컬 상태로 관리하여 즉시 UI 업데이트)
  const [isFavorite, setIsFavorite] = useState(question?.isFavorite || false);
  const [isStarred, setIsStarred] = useState(question?.isWrongAnswer || false);


  // 채점 훅 사용 (selectedKeywords를 포함한 question 전달)
  const questionWithSelectedKeywords = question ? { ...question, keywords: selectedKeywords } : null;
  const { gradingResult, checkKeyword, checkAllKeywords, submitAnswer, resetGrading } = useQuizGrading(questionWithSelectedKeywords, inputMode);

  // 음성인식 훅 사용
  const {
    isListening: isVoiceListening,
    transcript: voiceTranscript,
    isSupported: isVoiceSupported,
    error: voiceError,
    startListening: startVoiceListening,
    stopListening: stopVoiceListening,
    resetTranscript: resetVoiceTranscript
  } = useVoiceInput();

  // 틀린 문제 토글 mutation
  const toggleWrongAnswerMutation = useToggleWrongAnswer();

  // 즐겨찾기 토글 mutation
  const toggleFavoriteMutation = useToggleFavorite();

  // 진행률 업데이트 mutation
  const updateProgressMutation = useUpdateProgress();

  // Day 완료 기록 mutation (카테고리 퀴즈용)
  const markDayCompletedMutation = useMarkDayCompleted();

  // inputMode 초기화 및 동기화 (우선순위: 세션 > DB > 기본값)
  useEffect(() => {
    // 1순위: 세션에 inputMode가 있으면 세션 값 사용
    if (session?.inputMode) {
      setInputMode(session.inputMode);
    }
    // 2순위: 세션에 없고 DB에서 로드된 값이 있으면 DB 값 사용
    else if (quizModeData?.quizMode) {
      setInputMode(quizModeData.quizMode);
    }
  }, [session?.inputMode, quizModeData?.quizMode]);

  // 문제가 바뀔 때마다 즐겨찾기 & 별 상태 초기화 및 키워드 랜덤 선택 (문제 ID가 변경될 때만)
  useEffect(() => {
    if (question) {
      setIsFavorite(question.isFavorite || false);
      setIsStarred(question.isWrongAnswer || false);

      // 🎲 키워드 랜덤 선택: 백엔드에서 받은 키워드 중 랜덤으로 2개만 선택
      const keywords = getVisibleKeywords(question.english, question.keywords || []);
      if (keywords.length > 2) {
        // Fisher-Yates 셔플 알고리즘으로 랜덤 선택
        const shuffled = [...keywords].sort(() => Math.random() - 0.5);
        setSelectedKeywords(shuffled.slice(0, 2));
      } else {
        setSelectedKeywords(keywords);
      }
    }
  }, [question?.id]);

  // 🎵 음원 자동재생: 정답을 맞췄을 때 (grading 모드로 전환될 때) 실행
  useEffect(() => {
    if (quizMode !== 'grading' || !audioRef.current || !audioUrl) {
      return;
    }

    const playAudio = async () => {
      try {
        setAudioError(false);

        // 1배속으로 설정
        audioRef.current.playbackRate = 1.0;
        // 음원 로드
        audioRef.current.load();

        // 자동 재생 시도
        await audioRef.current.play();

      } catch (error) {
        setAudioError(true);
      }
    };

    // 효과음(0.7초) 재생 후 영문 음원 재생
    const timer = setTimeout(playAudio, 700);
    return () => clearTimeout(timer);
  }, [quizMode, audioUrl]); // grading 모드로 전환될 때마다 재생

  // 음원 로딩 완료 처리
  const handleAudioCanPlay = useCallback(() => {
    setIsAudioReady(true);
  }, []);

  // 음원 에러 처리
  const handleAudioError = useCallback(() => {
    setAudioError(true);
  }, []);

  // 첫 문제 로드 시 키워드 input에 자동 포커스
  useEffect(() => {
    if (question && inputMode === 'keyboard' && quizMode === 'solving') {
      setTimeout(() => {
        // 빈칸 클릭으로 전환된 경우 해당 키워드에 포커스
        if (focusKeywordRef.current) {
          const targetInput = document.querySelector(`input[data-keyword="${focusKeywordRef.current}"]`);
          if (targetInput) {
            targetInput.focus();
          }
          focusKeywordRef.current = null; // 사용 후 초기화
        } else {
          // 일반 모드 전환 시 첫 번째 input에 포커스
          const firstInput = document.querySelector('input[data-keyword]');
          if (firstInput) {
            firstInput.focus();
          }
        }
      }, 100);
    }
  }, [question?.id, inputMode, quizMode]);


  // Wait for microphone shutdown so the reward is audible and never recorded.
  useEffect(() => {
    if (quizMode !== 'grading' || isVoiceListening || !question?.id) return;
    const reward = answerStreak.correct(question.id);
    if (!reward) return;
    playEffectSound(reward.sound);
    if ([3, 5, 10].includes(reward.count)) {
      setStreakMilestone({ count: reward.count, sessionId });
    }
  }, [quizMode, isVoiceListening, question?.id, answerStreak, sessionId]);

  useEffect(() => {
    if (!streakMilestone) return;
    const timer = setTimeout(() => setStreakMilestone(null), 1800);
    return () => clearTimeout(timer);
  }, [streakMilestone]);

  // 키워드 입력 변경 핸들러
  const handleKeywordInputChange = (keyword, value) => {
    setKeywordInputs(prev => {
      const newInputs = {
        ...prev,
        [keyword]: value
      };

      // 완성된 답변을 실시간으로 userAnswer에 반영
      const completedAnswers = Object.entries(newInputs)
        .filter(([, val]) => val && val.trim() !== '')
        .map(([, val]) => val.trim())
        .filter((val, index, array) => val !== '' && array.indexOf(val) === index);

      setUserAnswer(completedAnswers.join(', '));

      return newInputs;
    });

  // 1️⃣ 실시간 채점: 개별 키워드 검증
    if (checkKeyword(value, keyword)) {
      // 정답이면 다음 키워드로 포커스 이동
      setTimeout(() => {
        moveToNextKeywordInput(keyword);
      }, 100);
    }
  };

  // 키워드 입력 키 이벤트 핸들러
  const handleKeywordKeyDown = (keyword, value, e) => {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();

      // Tab키의 경우 다음 키워드로 포커스 이동
      if (e.key === 'Tab' && value.trim()) {
        setTimeout(() => {
          moveToNextKeywordInput(keyword);
        }, 50);
      }
    }
  };

  // 다음 키워드 input으로 포커스 이동
  const moveToNextKeywordInput = (currentKeyword) => {
    // DOM에서 현재 모든 키워드 input을 순서대로 가져오기 (영어 문장 순서)
    const allInputs = document.querySelectorAll('input[data-keyword]');
    if (allInputs.length === 0) return;

    // 현재 input의 인덱스 찾기
    let currentIndex = -1;
    allInputs.forEach((input, index) => {
      if (input.dataset.keyword === currentKeyword) {
        currentIndex = index;
      }
    });

    // 다음 input으로 포커스 이동
    if (currentIndex !== -1 && currentIndex < allInputs.length - 1) {
      allInputs[currentIndex + 1].focus();
    }
  };

  // 1️⃣ 실시간 채점: 모든 키워드 정답시 grading 모드로 전환 (자동 이동 X)
  useEffect(() => {
    if (quizMode === 'solving' && inputMode === 'keyboard' && question?.keywords) {
      console.log('[AutoGrading] 키워드 확인:', {
        questionKeywords: question.keywords,
        keywordInputs,
        userAnswer
      });
      // 모든 키워드가 정답인지 확인
      const isAllCorrect = checkAllKeywords(keywordInputs);
      console.log('[AutoGrading] checkAllKeywords 결과:', isAllCorrect);
      if (isAllCorrect) {
        // 채점 결과 설정 (체크마크 표시를 위해)
        submitAnswer(keywordInputs, userAnswer);
        // grading 모드로 전환 (자동으로 다음 문제로 이동하지 않음)
        setQuizMode('grading');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywordInputs, question, quizMode, inputMode]);

  // ================================================================
  // 이벤트 핸들러들
  // ================================================================

  // 입력 모드 전환 (음성 ↔ 키보드)
  // focusKeyword: 빈칸 클릭 시 포커스할 키워드 (선택적)
  const handleInputModeChange = (mode, focusKeyword = null) => {
    focusKeywordRef.current = focusKeyword; // 포커스할 키워드 저장
    setInputMode(mode);
    // 키워드 입력값은 유지 (음성모드에서 입력한 값이 키보드모드에서도 보이도록)
    // setKeywordInputs는 초기화하지 않음

    // localStorage의 세션 데이터 업데이트
    if (sessionId) {
      updateInputMode(sessionId, mode);
      // 세션 상태 갱신
      setSession(getSession(sessionId));
    }

    // DB에 사용자 퀴즈 모드 업데이트
    updateQuizModeMutation.mutate(mode);
  };

  // 2️⃣ 답변 제출 핸들러 (제출 버튼용)
  const handleSubmitAnswer = useCallback(() => {
    // 채점 실행
    const result = submitAnswer(keywordInputs, userAnswer);

    if (result.isAllCorrect) {
      // 정답: grading 모드로 전환 (자동 이동 X)
      setQuizMode('grading');
    } else {
      // 오답: 피드백 모달 표시
      answerStreak.fail(question?.id);
      playEffectSound('error');
      setWrongAnswerFeedback({
        correctCount: result.correctCount,
        totalCount: result.totalCount
      });
    }
  }, [keywordInputs, userAnswer, submitAnswer, answerStreak, question?.id]);

  // 🎤 음성인식 결과를 userAnswer에 반영 및 키워드 자동 추출
  useEffect(() => {
    if (voiceTranscript && inputMode === 'voice' && selectedKeywords.length > 0) {
      console.log('[VoiceGrading] 음성인식 결과:', voiceTranscript);
      console.log('[VoiceGrading] selectedKeywords:', selectedKeywords);
      setUserAnswer(voiceTranscript);

      // 음성인식 결과에서 키워드 자동 추출
      const newKeywordInputs = {};
      const voiceLower = normalizeGradingText(voiceTranscript);

      selectedKeywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        const normalizedKeyword = normalizeGradingText(keyword);
        const found = normalizedKeyword !== '' && voiceLower.includes(normalizedKeyword);
        console.log(`[VoiceGrading] 키워드 "${keyword}" 검색: "${keywordLower}" in "${voiceLower}" = ${found}`);
        if (found) {
          // areAllKeywordsCorrect에서 소문자 키로 조회하므로 소문자로 저장
          newKeywordInputs[keywordLower] = keyword;
        }
      });

      console.log('[VoiceGrading] 추출된 키워드:', newKeywordInputs);

      // 키워드 입력값 업데이트 (함수형 업데이트로 이전 키워드 유지)
      setKeywordInputs(prevInputs => {
        const mergedKeywordInputs = {
          ...prevInputs,  // 이전에 맞춘 키워드 유지
          ...newKeywordInputs  // 새로 맞춘 키워드 추가
        };

        console.log('[VoiceGrading] 병합된 키워드:', mergedKeywordInputs);

        // 음성인식 결과로 자동 채점 (병합된 키워드로 채점)
        const allCorrect = checkAllKeywords(mergedKeywordInputs);
        console.log('[VoiceGrading] checkAllKeywords 결과:', allCorrect);

        submitAnswer(mergedKeywordInputs, voiceTranscript);

        // checkAllKeywords 결과를 우선 사용
        if (allCorrect) {
          // 정답이면 녹음 중지하고 grading 모드로 전환
          if (isVoiceListening) {
            stopVoiceListening();
          }
          setQuizMode('grading');
        }

        return mergedKeywordInputs;
      });
    }
  }, [voiceTranscript, inputMode, selectedKeywords, submitAnswer, checkAllKeywords, isVoiceListening, stopVoiceListening]);

  // 🎤 음성인식 에러 표시
  useEffect(() => {
    if (voiceError) {
      setAlertModal({ isOpen: true, message: voiceError, icon: '⚠️' });
    }
  }, [voiceError]);

  // 음성 녹음 토글
  const handleToggleRecording = useCallback(() => {
    if (!isVoiceSupported) {
      setAlertModal({ isOpen: true, message: '이 브라우저는 음성인식을 지원하지 않습니다.\nChrome이나 Safari를 사용해주세요.', icon: '🎤' });
      return;
    }

    if (isVoiceListening) {
      // 녹음 중지
      stopVoiceListening();
    } else {
      // 이미 답변이 있고 모든 키워드가 정답이면 grading 모드로 전환 (제출)
      // 부분 정답인 경우는 다시 녹음할 수 있도록 허용
      if (userAnswer && gradingResult && gradingResult.isAllCorrect) {
        setQuizMode('grading');
        return;
      }

      // 녹음 시작 (부분 정답이더라도 다시 시도 가능)
      resetVoiceTranscript();
      startVoiceListening();
    }
  }, [isVoiceListening, isVoiceSupported, startVoiceListening, stopVoiceListening, resetVoiceTranscript, userAnswer, gradingResult, keywordInputs]);

  // 메인 액션 버튼 핸들러
  const handleMainAction = useCallback(() => {
    if (inputMode === 'voice') {
      handleToggleRecording();
    } else {
      handleSubmitAnswer();
    }
  }, [inputMode, handleToggleRecording, handleSubmitAnswer]);

  // 실제로 다음 문제로 이동하는 핵심 로직 (뱃지 모달 이후에도 호출됨)
  const moveToNext = useCallback(async () => {
    try {
      if (!sessionId) return;

      // grading 모드에서 "다음 문제" 버튼 클릭 시 백엔드에 진행률 업데이트
      // (정답을 맞춰서 grading 모드가 된 경우이므로 무조건 업데이트)
      // 중요: session.category를 사용! (오늘의 퀴즈는 category=4이지만, 문제의 category_id는 1,2,3일 수 있음)
      // 예외: 틀린문제(5), 즐겨찾기(6), 랜덤복습(7)은 진행률 저장 안함 (개인 복습용)
      const shouldUpdateProgress = session?.category && ![5, 6, 7].includes(session.category);

      if (quizMode === 'grading' && question?.id && shouldUpdateProgress && question?.day) {
        try {
          const progressData = {
            categoryId: session.category,  // 세션의 category 사용 (사용자가 선택한 퀴즈 타입)
            day: question.day,
            questionId: question.id
          };

          const result = await updateProgressMutation.mutateAsync(progressData);

          // 🎉 목표 달성 확인
          if (result?.goalAchieved) {
            // Streak 정보 저장 후 모달 표시
            setStreakInfo(result.streak || null);
            setShowGoalAchievedModal(true);
            return; // 모달 응답을 기다림
          }
        } catch {
          // 진행률 업데이트 실패해도 퀴즈는 계속 진행
        }
      }

      // 현재 문제를 완료 처리
      if (question?.id) {
        markQuestionCompleted(sessionId, question.id);
      }

      // 다음 문제로 이동
      const success = moveToNextQuestion(sessionId);

      if (!success) {
        // 퀴즈 완료
        if (isQuizCompleted(sessionId)) {
          // 🎲 랜덤 퀴즈(7) 완료 시 목표 달성 모달 표시
          if (session?.category === 7) {
            setShowGoalAchievedModal(true);
            return;
          }

          // 📅 카테고리 퀴즈(1,2,3)가 완료되면 Day 완료 기록
          const isCategoryQuiz = session?.category >= 1 && session?.category <= 3 && session?.day;

          if (isCategoryQuiz) {
            try {
              await markDayCompletedMutation.mutateAsync({
                categoryId: session.category,
                day: session.day
              });
            } catch {
              // Day 완료 기록 실패해도 퀴즈 종료는 진행
            }
          }

          if (isCategoryQuiz) playEffectSound('dayComplete');
          deleteSession(sessionId);

          // 카테고리 퀴즈 완료 시 완료 정보와 함께 홈으로 이동
          if (isCategoryQuiz) {
            navigate(`/?completed=true&category=${session.category}&day=${session.day}`);
          } else {
            navigate('/');
          }
          return;
        }
      }

      // 세션 상태 갱신
      const updatedSession = getSession(sessionId);
      setSession(updatedSession);

      // 상태 초기화
      setUserAnswer('');
      setQuizMode('solving');
      setShowHint(false);
      setShowAnswer(false);
      setKeywordInputs({});
      resetGrading();
      resetVoiceTranscript();

      // 스크롤을 맨 위로 이동
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // 첫 번째 키워드 input에 포커스
      setTimeout(() => {
        const firstInput = document.querySelector('input[data-keyword]');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);

    } catch {
      setAlertModal({ isOpen: true, message: '다음 문제 로드에 실패했습니다.', icon: '❌' });
    }
  }, [sessionId, question?.id, question?.day, session?.category, session?.day, quizMode, navigate, resetGrading, resetVoiceTranscript, updateProgressMutation, markDayCompletedMutation]);

  // 다음 문제로 이동 (뱃지 체크 포함)
  const handleNextQuestion = useCallback(async () => {
    if (!sessionId || nextQuestionPendingRef.current) return;
    nextQuestionPendingRef.current = true;
    try {

      // 🎯 문제 완료 시 question_attempts 테이블에 기록 (모든 카테고리)
      if (question?.id) {
        try {
          const result = await api.recordQuestionAttempt(question.id);

          // 🎊 레벨업이 있으면 모달 표시 (최우선)
          if (result?.levelUp) {
            playEffectSound('celebrate');
            setLevelUpInfo(result.levelUp);
            return; // 레벨업 모달이 닫힐 때까지 대기
          }

          // 🏆 새로운 뱃지가 있으면 모달 표시
          if (result?.newBadges && result.newBadges.length > 0) {
            // 사용자 상호작용 컨텍스트 내에서 축하 음원 재생
            playEffectSound('celebrate');

            setNewBadges(result.newBadges);
            return; // 뱃지 모달이 닫힐 때까지 대기
          }
        } catch {
          // 기록 실패해도 퀴즈는 계속 진행
        }
      }

      // 뱃지가 없으면 바로 다음 문제로 이동
      await moveToNext();

    } catch {
      setAlertModal({ isOpen: true, message: '다음 문제 로드에 실패했습니다.', icon: '❌' });
    } finally {
      nextQuestionPendingRef.current = false;
    }
  }, [sessionId, question?.id, moveToNext]);

  // 레벨업 모달 닫기 핸들러
  const handleLevelUpModalClose = useCallback(() => {
    setLevelUpInfo(null);
    // 레벨업 모달 닫힌 후 다음 문제로 이동
    moveToNext();
  }, [moveToNext]);

  // 뱃지 모달 닫기 핸들러
  const handleBadgeModalClose = useCallback(() => {
    setNewBadges([]);
    // 뱃지 모달 닫힌 후 다음 문제로 이동
    moveToNext();
  }, [moveToNext]);

  // 정답 확인 후 방향키 또는 왼쪽 스와이프로 다음 문제로 이동.
  useEffect(() => {
    if (quizMode !== 'grading' || showGoalAchievedModal || newBadges.length > 0 ||
        levelUpInfo || wrongAnswerFeedback || alertModal.isOpen) return;

    const hasOpenDialog = () => document.querySelector('[role="dialog"], [aria-modal="true"]');
    const handleKeyPress = (event) => {
      if (event.defaultPrevented || event.repeat || event.isComposing ||
          event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || hasOpenDialog()) return;
      if (event.key !== 'ArrowRight' && event.key !== 'Enter') return;
      const activeElement = document.activeElement;
      // 기존 Enter 동작은 유지하고, 방향키는 정답 입력란에 포커스가 있어도 사용 가능.
      if (event.key === 'Enter' && (activeElement?.matches('input, textarea') || activeElement?.isContentEditable)) return;
      event.preventDefault();
      handleNextQuestion();
    };

    let touchStart = null;
    const handleTouchStart = (event) => {
      touchStart = null;
      if (event.touches.length !== 1 || hasOpenDialog() ||
          !event.target.closest('.quiz-container') ||
          event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      const touch = event.touches[0];
      touchStart = { id: touch.identifier, x: touch.clientX, y: touch.clientY };
    };
    const handleTouchEnd = (event) => {
      const start = touchStart;
      touchStart = null;
      if (!start || event.touches.length > 0 || hasOpenDialog()) return;
      const touch = Array.from(event.changedTouches).find(item => item.identifier === start.id);
      if (!touch) return;
      const distanceX = start.x - touch.clientX;
      const distanceY = Math.abs(start.y - touch.clientY);
      // 탭이나 세로 스크롤은 제외하고 왼쪽으로 60px 이상 밀었을 때만 이동.
      if (distanceX >= 60 && distanceX > distanceY * 1.5) handleNextQuestion();
    };
    const cancelTouch = () => { touchStart = null; };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', cancelTouch);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', cancelTouch);
    };
  }, [quizMode, handleNextQuestion, showGoalAchievedModal, newBadges, levelUpInfo, wrongAnswerFeedback, alertModal.isOpen]);

  // 목표 달성 모달이 열릴 때 "계속하기" 버튼에 자동 포커스
  useEffect(() => {
    if (showGoalAchievedModal && continueButtonRef.current) {
      setTimeout(() => {
        continueButtonRef.current?.focus();
      }, 100);
    }
  }, [showGoalAchievedModal]);

  // 🎉 목표 달성 모달이 열릴 때 축하 음원 재생
  useEffect(() => {
    if (showGoalAchievedModal) playEffectSound('celebrate');
    return () => {
      if (showGoalAchievedModal) stopEffectSound();
    };
  }, [showGoalAchievedModal]);

  // 목표 달성 모달에서 Enter 키로 추가 학습하기
  useEffect(() => {
    const handleModalKeyPress = (e) => {
      if (e.key === 'Enter' && showGoalAchievedModal) {
        e.preventDefault();
        e.stopPropagation();

        // "계속하기" 버튼 클릭
        if (continueButtonRef.current) {
          continueButtonRef.current.classList.add('animate-pulse');
          setTimeout(() => {
            continueButtonRef.current?.classList.remove('animate-pulse');
            continueButtonRef.current?.click();
          }, 200);
        }
      }
    };

    window.addEventListener('keydown', handleModalKeyPress);
    return () => window.removeEventListener('keydown', handleModalKeyPress);
  }, [showGoalAchievedModal]);

  // 🔁 수동 음원 재생 (다시 듣기 버튼 - 1배속)
  const handlePlayAudio = useCallback(async () => {
    if (!audioRef.current || !audioUrl) {
      setAlertModal({ isOpen: true, message: '음원을 찾을 수 없습니다.', icon: '🔇' });
      return;
    }

    try {
      // 1배속 설정
      audioRef.current.playbackRate = 1.0;
      // 처음부터 재생
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      setAudioError(false);
    } catch (error) {
      setAudioError(true);
      setAlertModal({ isOpen: true, message: '오디오 재생에 실패했습니다.', icon: '🔇' });
    }
  }, [audioUrl]);

  // 🔁 수동 음원 재생 (다시 듣기 버튼 - 0.8배속)
  const handlePlayAudioSlow = useCallback(async () => {
    if (!audioRef.current || !audioUrl) {
      setAlertModal({ isOpen: true, message: '음원을 찾을 수 없습니다.', icon: '🔇' });
      return;
    }

    try {
      // 0.8배속 설정
      audioRef.current.playbackRate = 0.8;
      // 처음부터 재생
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      setAudioError(false);
    } catch (error) {
      setAudioError(true);
      setAlertModal({ isOpen: true, message: '오디오 재생에 실패했습니다.', icon: '🔇' });
    }
  }, [audioUrl]);

  // 힌트 보기 (첫 글자) - 토글 기능
  const handleShowFirstLetters = () => {
    setShowHint(!showHint);
    if (!showHint) {
      setShowAnswer(false);
    }
  };

  // 정답 보기 (전체) - 토글 기능 + 틀린문제 자동 추가
  const handleShowFullAnswer = async () => {
    const willShowAnswer = !showAnswer;
    setShowAnswer(willShowAnswer);

    if (willShowAnswer) {
      answerStreak.fail(question?.id);
      setShowHint(false);

      // 정답을 보면 자동으로 틀린문제(wrong_answer)에 추가 (별표가 안 되어 있을 때만)
      if (!isStarred && question?.id && sessionId) {
        try {
          // 백엔드 API 호출 (isStarred를 false로 전달하여 추가 요청)
          const result = await toggleWrongAnswerMutation.mutateAsync({
            questionId: question.id,
            isStarred: false
          });

          // 성공 시 즉시 UI 업데이트
          if (result?.isStarred !== undefined) {
            // 1. 로컬 상태 업데이트 (즉시 UI 반영)
            setIsStarred(result.isStarred);

            // 2. localStorage 세션 업데이트
            toggleStar(sessionId, question.id);

            // 3. 세션 상태 갱신
            setSession(getSession(sessionId));
          }
        } catch {
          // 에러가 발생해도 정답은 계속 보여줌
        }
      }
    }
  };

  // 즐겨찾기 토글
  const handleToggleFavorite = async () => {
    if (!question?.id || !sessionId) return;

    try {
      // 백엔드 API 호출
      const result = await toggleFavoriteMutation.mutateAsync({
        questionId: question.id,
        isFavorite
      });

      // 성공 시 즉시 UI 업데이트
      if (result?.isFavorite !== undefined) {
        // 1. 로컬 상태 업데이트 (즉시 UI 반영)
        setIsFavorite(result.isFavorite);

        // 2. localStorage 세션 업데이트
        toggleFavorite(sessionId, question.id);

        // 3. 세션 상태 갱신
        setSession(getSession(sessionId));
      }

    } catch {
      setAlertModal({ isOpen: true, message: '즐겨찾기 변경에 실패했습니다.', icon: '❌' });
    }
  };

  // 틀린문제 별표 토글
  const handleToggleStar = async () => {
    if (!question?.id || !sessionId) return;

    try {
      // 백엔드 API 호출
      const result = await toggleWrongAnswerMutation.mutateAsync({
        questionId: question.id,
        isStarred
      });

      // 성공 시 즉시 UI 업데이트
      if (result?.isStarred !== undefined) {
        // 1. 로컬 상태 업데이트 (즉시 UI 반영)
        setIsStarred(result.isStarred);

        // 2. localStorage 세션 업데이트
        toggleStar(sessionId, question.id);

        // 3. 세션 상태 갱신
        setSession(getSession(sessionId));
      }

    } catch {
      setAlertModal({ isOpen: true, message: '별표 변경에 실패했습니다.', icon: '❌' });
    }
  };

  // 🎉 목표 달성 모달: 추가 학습 계속하기
  const handleContinueAdditionalLearning = async () => {
    try {
      // 🎲 랜덤 퀴즈인 경우 새로운 랜덤 문제 불러오기
      const isRandomQuiz = session?.category === 7;

      let result;
      if (isRandomQuiz) {
        // 랜덤 퀴즈: 새로운 무작위 20문제 불러오기
        result = await api.apiCall('/api/quiz/random', { method: 'GET' });
      } else {
        // 오늘의 퀴즈: solved_count 리셋 후 새로운 문제 불러오기
        await api.apiCall('/api/progress/reset-solved-count', { method: 'POST' });

        // 진행률 캐시를 즉시 0으로 업데이트
        queryClient.setQueryData(['progress', 'today'], {
          current: 0,
          total: 20,
          percentage: 0
        });

        result = await api.apiCall('/api/quiz/daily', { method: 'GET' });
      }

      if (result && result.questions && result.questions.length > 0) {
        // 4. 기존 세션 삭제
        deleteSession(sessionId);

        // 5. 새 세션 생성 (사용자의 quiz_mode 설정 유지)
        const { questions } = result;
        const questionIds = questions.map(q => q.question_id);

        const newSessionId = `session_${Date.now()}`;
        const userInputMode = quizModeData?.quizMode || 'keyboard';

        const newSession = {
          sessionId: newSessionId,
          category: isRandomQuiz ? 7 : 4, // 랜덤 퀴즈는 category 7
          questionIds,
          questions,
          progress: { completed: 0, total: questions.length, percentage: 0 },
          currentQuestionIndex: 0,
          completedQuestionIds: [],
          inputMode: userInputMode, // DB에서 가져온 사용자 설정 사용
          quiz_type: isRandomQuiz ? 'random' : 'daily',
          createdAt: Date.now()
        };

        localStorage.setItem(`quiz_session_${newSessionId}`, JSON.stringify(newSession));

        // 6. 모든 상태 초기화
        setShowGoalAchievedModal(false);
        setStreakInfo(null);
        setUserAnswer('');
        setQuizMode('solving');
        setShowHint(false);
        setShowAnswer(false);
        setKeywordInputs({});
        resetGrading();
        resetVoiceTranscript();

        // 7. 새 세션으로 페이지 이동
        navigate(`/quiz?session=${newSessionId}`);
      } else {
        setAlertModal({ isOpen: true, message: '추가 학습할 문제가 없습니다.', icon: '📭' });
        handleGoToHome();
      }

    } catch {
      setAlertModal({ isOpen: true, message: '추가 학습 시작에 실패했습니다.\n다시 시도해주세요.', icon: '❌' });
    }
  };

  // 🎉 목표 달성 모달: 홈으로 이동
  const handleGoToHome = () => {
    deleteSession(sessionId);
    navigate('/');
  };


  // ================================================================
  // 렌더링
  // ================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
        <p className="mt-4 text-text-secondary">퀴즈를 불러오는 중...</p>
      </div>
    );
  }

  if (!session || !question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-text-secondary">퀴즈 데이터를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="quiz-container min-h-screen bg-background flex flex-col">
      {/* 퀴즈 온보딩 튜토리얼 (첫 사용자용) */}
      <QuizOnboarding />

      {streakMilestone?.sessionId === sessionId && (
        <div role="status" className="fixed top-24 left-1/2 -translate-x-1/2 z-[110] rounded-full bg-primary px-5 py-3 text-white font-bold shadow-lg motion-safe:animate-bounce pointer-events-none">
          ✨ {streakMilestone.count}문제 연속 정답!
        </div>
      )}

      {/* 🎵 숨겨진 Audio 엘리먼트 (자동재생용) */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onCanPlay={handleAudioCanPlay}
          onError={handleAudioError}
          preload="auto"
          style={{ display: 'none' }}
        />
      )}

      {/* 프로그레스 바 - 카테고리별 퀴즈(1,2,3)는 전용 프로그레스바 사용 */}
      {session?.category >= 1 && session?.category <= 3 ? (
        <CategoryQuizProgressBar
          completedCount={session?.completedQuestionIds?.length || 0}
          totalQuestions={questionsData?.length || 0}
          day={session?.day}
        />
      ) : (
        <QuizProgressBar
          category={session?.category}
          totalQuestions={questionsData?.length || 0}
          completedCount={session?.completedQuestionIds?.length || 0}
          categoryCompleted={categoryProgress?.category_completed || 0}
          categoryTotal={categoryProgress?.category_total || 0}
        />
      )}

      {/* 🎵 음원 상태 표시 */}
      {audioUrl && (
        <div className="fixed top-20 right-4 z-50">
          {!isAudioReady && !audioError && (
            <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-primary/20 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">음원 로딩 중...</span>
            </div>
          )}
          {audioError && (
            <div className="bg-error/10 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-error/30 flex items-center gap-2">
              {getIcon('IoWarning', { size: 'sm', className: 'text-error' })}
              <span className="text-xs text-error">음원 로드 실패</span>
            </div>
          )}
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <QuizContent
        key={`${sessionId}-${currentQuestionIndex}`}
        question={questionWithSelectedKeywords}
        userAnswer={userAnswer}
        inputMode={inputMode}
        quizMode={quizMode}
        showHint={showHint}
        showAnswer={showAnswer}
        keywordInputs={keywordInputs}
        isFavorite={isFavorite}
        isStarred={isStarred}
        gradingResult={gradingResult}
        isVoiceListening={isVoiceListening}
        onKeywordInputChange={handleKeywordInputChange}
        onKeywordKeyDown={handleKeywordKeyDown}
        onInputModeChange={handleInputModeChange}
        onFavoriteToggle={handleToggleFavorite}
        onStarToggle={handleToggleStar}
        onClearHintAnswer={() => {
          setShowHint(false);
          setShowAnswer(false);
        }}
      />

      {/* 하단 컨트롤 */}
      <QuizControls
        inputMode={inputMode}
        quizMode={quizMode}
        isRecording={isVoiceListening}
        showHint={showHint}
        showAnswer={showAnswer}
        onMainAction={handleMainAction}
        onPlayAudio={handlePlayAudio}
        onPlayAudioSlow={handlePlayAudioSlow}
        onShowFirstLetters={handleShowFirstLetters}
        onShowFullAnswer={handleShowFullAnswer}
        onSkipQuestion={handleNextQuestion}
        gradingResult={gradingResult}
      />

      {/* 🎉 목표 달성 모달 - 샘플 10 스타일 */}
      <Modal
        isOpen={showGoalAchievedModal}
        onClose={handleGoToHome}
        size="sm"
        closeOnOverlayClick={false}
        showCloseButton={false}
        className="rounded-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-br from-primary-light via-primary to-primary-dark py-8 px-6 relative">
          <div className="text-center relative z-10">
            <div className="inline-block mb-3 animate-bounce">
              {getIcon('IoPartyPopper', { size: '5xl' })}
            </div>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
              {session?.category === 7 ? '랜덤복습 완료!' : '오늘의 목표 달성!'}
            </h2>
          </div>
          {/* 장식 효과 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <ModalBody className="py-6 px-6">
          <div className="space-y-5">
            {/* 민트 그라데이션 카드 - 랜덤 퀴즈가 아닌 경우에만 표시 */}
            {streakInfo && session?.category !== 7 && (
              <div className="flex gap-3">
                <div className="flex-1 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl p-4 border border-primary/30 hover:shadow-lg transition-shadow">
                  <div className="flex justify-center mb-2">
                    {getIcon('IoFire', { size: '3xl' })}
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{streakInfo.current_streak}일</div>
                    <div className="text-xs text-gray-600 mt-1">연속 학습</div>
                  </div>
                </div>

                <div className="flex-1 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl p-4 border border-primary/30 hover:shadow-lg transition-shadow">
                  <div className="flex justify-center mb-2">
                    {getIcon('IoTrophy', { size: '3xl' })}
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{streakInfo.best_streak}일</div>
                    <div className="text-xs text-gray-600 mt-1">최고 기록</div>
                  </div>
                </div>
              </div>
            )}

            {/* 질문 */}
            <p className="text-center text-base text-gray-600 pt-2">
              {session?.category === 7
                ? '새로운 랜덤 문제로 계속하시겠습니까?'
                : '추가 학습을 하시겠습니까?'}
            </p>

            {/* 버튼 */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleGoToHome}
                className="flex-1 py-2.5 focus:ring-4 focus:ring-gray-300 transition-all"
              >
                홈으로
              </Button>
              <Button
                ref={continueButtonRef}
                variant="primary"
                onClick={handleContinueAdditionalLearning}
                className="flex-1 py-2.5 focus:ring-4 focus:ring-primary/50 transition-all"
              >
                계속하기
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* 🎊 레벨업 모달 */}
      {levelUpInfo && (
        <LevelUpModal
          isOpen={!!levelUpInfo}
          onClose={handleLevelUpModalClose}
          levelUpInfo={levelUpInfo}
        />
      )}

      {/* 🏆 뱃지 획득 모달 */}
      {newBadges.length > 0 && (
        <BadgeModal
          badges={newBadges}
          onClose={handleBadgeModalClose}
        />
      )}

      {/* ❌ 오답 피드백 모달 */}
      <WrongAnswerModal
        isOpen={!!wrongAnswerFeedback}
        correctCount={wrongAnswerFeedback?.correctCount || 0}
        totalCount={wrongAnswerFeedback?.totalCount || 0}
        onRetry={() => setWrongAnswerFeedback(null)}
        onShowAnswer={() => {
          setWrongAnswerFeedback(null);
          handleShowFullAnswer();
        }}
      />

      {/* Alert 모달 */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, message: '', icon: '' })}
        message={alertModal.message}
        icon={alertModal.icon}
      />

    </div>
  );
};

export default QuizPage;
