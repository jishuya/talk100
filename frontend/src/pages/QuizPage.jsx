import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// UI 컴포넌트들
import { QuizProgressBar } from '../components/quiz/QuizProgressBar';
import { QuizContent } from '../components/quiz/QuizContent';
import { QuizControls } from '../components/quiz/QuizControls';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

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

// API 훅
import { useToggleWrongAnswer, useToggleFavorite } from '../hooks/useApi';

const QuizPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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
        console.error('Session not found:', sessionId);
        navigate('/');
      }
    } else {
      // sessionId가 없으면 홈으로
      console.error('No session ID in URL');
      navigate('/');
    }
  }, [sessionId, navigate]);

  // 세션 데이터에서 현재 문제 인덱스 추출
  const currentQuestionIndex = session?.currentQuestionIndex || 0;

  // 퀴즈 데이터: 모든 카테고리에서 session에 이미 questions가 저장되어 있음
  // HomePage에서 API를 통해 데이터를 가져와서 세션에 저장했으므로 추가 조회 불필요
  const questionsData = session?.questions;
  const isLoading = !session || !questionsData;

  // 📦 Session 데이터 (LocalStorage에서 관리)
  const progress = session?.progress;

  // 현재 문제 추출 (서버에서 가져온 전체 문제 중 현재 인덱스의 문제)
  const question = useMemo(() => {
    if (!questionsData || !Array.isArray(questionsData)) return null;

    const currentQuestion = questionsData[currentQuestionIndex];
    if (!currentQuestion) return null;

    // 백엔드 데이터 형식을 QuizPage가 기대하는 형식으로 변환
    let korean, english, maleAudioUrl, femaleAudioUrl;

    if (currentQuestion.question_type === 'short' || currentQuestion.question_type === 'long') {
      korean = currentQuestion.korean;
      english = currentQuestion.english;
      maleAudioUrl = currentQuestion.audio_male;
      femaleAudioUrl = currentQuestion.audio_female;
    } else if (currentQuestion.question_type === 'dialogue') {
      if (currentQuestion.korean_a !== null) {
        korean = currentQuestion.korean_a;
        english = currentQuestion.english_a;
        maleAudioUrl = currentQuestion.audio_male_a;
        femaleAudioUrl = currentQuestion.audio_female_a;
      } else {
        korean = currentQuestion.korean_b;
        english = currentQuestion.english_b;
        maleAudioUrl = currentQuestion.audio_male_b;
        femaleAudioUrl = currentQuestion.audio_female_b;
      }
    }

    return {
      id: currentQuestion.question_id,
      day: currentQuestion.day,
      categoryId: currentQuestion.category_id,
      type: currentQuestion.question_type,
      korean,
      english,
      maleAudioUrl,
      femaleAudioUrl,
      keywords: currentQuestion.keywords || [],
      answer: english,
      isFavorite: currentQuestion.is_favorite || false,
      isWrongAnswer: currentQuestion.is_wrong_answer || false
    };
  }, [questionsData, currentQuestionIndex]);

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const audioUrl = userInfo.voice_gender === 'female' ? question?.femaleAudioUrl : question?.maleAudioUrl;

  // 로컬 상태
  const [userAnswer, setUserAnswer] = useState('');
  const [inputMode, setInputMode] = useState(session?.inputMode || 'keyboard'); // 세션에서 로드
  const [quizMode, setQuizMode] = useState('solving'); // 'solving' | 'grading'
  const [isRecording, setIsRecording] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [keywordInputs, setKeywordInputs] = useState({});

  // 즐겨찾기 & 별 상태 (로컬 상태로 관리하여 즉시 UI 업데이트)
  const [isFavorite, setIsFavorite] = useState(question?.isFavorite || false);
  const [isStarred, setIsStarred] = useState(question?.isWrongAnswer || false);

  // 채점 훅 사용
  const { gradingResult, checkKeyword, checkAllKeywords, submitAnswer, resetGrading } = useQuizGrading(question, inputMode);

  // 틀린 문제 토글 mutation
  const toggleWrongAnswerMutation = useToggleWrongAnswer();

  // 즐겨찾기 토글 mutation
  const toggleFavoriteMutation = useToggleFavorite();

  // 세션 inputMode 동기화
  useEffect(() => {
    if (session?.inputMode) {
      setInputMode(session.inputMode);
    }
  }, [session?.inputMode]);

  // 문제가 바뀔 때마다 즐겨찾기 & 별 상태 초기화 (문제 ID가 변경될 때만)
  useEffect(() => {
    if (question) {
      setIsFavorite(question.isFavorite || false);
      setIsStarred(question.isWrongAnswer || false);
    }
  }, [question?.id]);


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
    if (!question?.keywords) return;
    // 키워드 배열에서 현재 위치 찾기
    const keywords = question.keywords.map(k => k.toLowerCase());
    const currentIndex = keywords.indexOf(currentKeyword);
    // DOM 쿼리로 다음 input 찾아서 포커스
    if (currentIndex !== -1 && currentIndex < keywords.length - 1) {
      const nextKeyword = keywords[currentIndex + 1];
      const nextInput = document.querySelector(`input[data-keyword="${nextKeyword}"]`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // 1️⃣ 실시간 채점: 모든 키워드 정답시 grading 모드로 전환 (자동 이동 X)
  useEffect(() => {
    if (quizMode === 'solving' && inputMode === 'keyboard' && question?.keywords) {
      // 모든 키워드가 정답인지 확인
      if (checkAllKeywords(keywordInputs)) {
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
  const handleInputModeChange = (mode) => {
    setInputMode(mode);
    if (mode === 'keyboard') {
      setUserAnswer('');
      setKeywordInputs({});
    }

    // localStorage의 세션 데이터 업데이트
    if (sessionId) {
      updateInputMode(sessionId, mode);
      // 세션 상태 갱신
      setSession(getSession(sessionId));
    }
  };

  // 2️⃣ 답변 제출 핸들러 (제출 버튼용)
  const handleSubmitAnswer = useCallback(() => {
    // 채점 실행
    const result = submitAnswer(keywordInputs, userAnswer);

    if (result.isAllCorrect) {
      // 정답: grading 모드로 전환 (자동 이동 X)
      setQuizMode('grading');
    } else {
      // 오답: 피드백 표시
      alert(
        `${result.correctCount}/${result.totalCount} 개 정답입니다.\n다시 시도해보세요!`
      );
    }
  }, [keywordInputs, userAnswer, submitAnswer]);

  // 음성 녹음 토글
  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      // 녹음 중지
      setIsRecording(false);

      // TODO: 실제 음성 인식 구현 (MediaRecorder API)
      try {
        // Mock 음성 인식 결과
        const mockTranscription = 'I see no point in continuing this interview';
        setUserAnswer(mockTranscription);
      } catch (error) {
        console.error('Speech recognition error:', error);
        alert('음성 인식에 실패했습니다. 다시 시도해주세요.');
      }
    } else {
      // 녹음 시작
      setIsRecording(true);
      setUserAnswer('');
    }
  }, [isRecording]);

  // 메인 액션 버튼 핸들러
  const handleMainAction = useCallback(() => {
    if (inputMode === 'voice') {
      handleToggleRecording();
    } else {
      handleSubmitAnswer();
    }
  }, [inputMode, handleToggleRecording, handleSubmitAnswer]);

  // 다음 문제로 이동
  const handleNextQuestion = useCallback(async () => {
    try {
      if (!sessionId) return;

      // 현재 문제를 완료 처리
      if (question?.id) {
        markQuestionCompleted(sessionId, question.id);
      }

      // 다음 문제로 이동
      const success = moveToNextQuestion(sessionId);

      if (!success) {
        // 퀴즈 완료
        if (isQuizCompleted(sessionId)) {
          alert('퀴즈를 모두 완료했습니다!');
          deleteSession(sessionId);
          navigate('/');
          return;
        }
      }

      // 세션 상태 갱신
      setSession(getSession(sessionId));

      // 상태 초기화
      setUserAnswer('');
      setQuizMode('solving');
      setShowHint(false);
      setShowAnswer(false);
      setKeywordInputs({});
      resetGrading(); // 채점 결과 초기화

    } catch (error) {
      console.error('Move to next question error:', error);
      alert('다음 문제 로드에 실패했습니다.');
    }
  }, [sessionId, question?.id, navigate, resetGrading]);

  // 문제 오디오 재생
  const handlePlayAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(error => {
        console.error('Audio playback error:', error);
        alert('오디오 재생에 실패했습니다.');
      });
    }
  };

  // 힌트 보기 (첫 글자) - 토글 기능
  const handleShowFirstLetters = () => {
    setShowHint(!showHint);
    if (!showHint) {
      setShowAnswer(false);
    }
  };

  // 정답 보기 (전체) - 토글 기능
  const handleShowFullAnswer = () => {
    setShowAnswer(!showAnswer);
    if (!showAnswer) {
      setShowHint(false);
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

    } catch (error) {
      console.error('Toggle favorite error:', error);
      alert('즐겨찾기 변경에 실패했습니다.');
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

    } catch (error) {
      console.error('Toggle star error:', error);
      alert('별표 변경에 실패했습니다.');
    }
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
      {/* 프로그레스 바 */}
      <QuizProgressBar
        progress={progress}
      />

      {/* 메인 콘텐츠 */}
      <QuizContent
        question={question}
        userAnswer={userAnswer}
        inputMode={inputMode}
        quizMode={quizMode}
        showHint={showHint}
        showAnswer={showAnswer}
        keywordInputs={keywordInputs}
        isFavorite={isFavorite}
        isStarred={isStarred}
        gradingResult={gradingResult}
        onKeywordInputChange={handleKeywordInputChange}
        onKeywordKeyDown={handleKeywordKeyDown}
        onInputModeChange={handleInputModeChange}
        onFavoriteToggle={handleToggleFavorite}
        onStarToggle={handleToggleStar}
      />

      {/* 하단 컨트롤 */}
      <QuizControls
        inputMode={inputMode}
        quizMode={quizMode}
        isRecording={isRecording}
        showHint={showHint}
        showAnswer={showAnswer}
        onMainAction={handleMainAction}
        onPlayAudio={handlePlayAudio}
        onShowFirstLetters={handleShowFirstLetters}
        onShowFullAnswer={handleShowFullAnswer}
        onSkipQuestion={handleNextQuestion}
        gradingResult={gradingResult}
      />

    </div>
  );
};

export default QuizPage;