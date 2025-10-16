import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
// QuizPage 관련 훅들
import { useQuizQuestions, useSubmitAnswer } from '../hooks/useApi';

// UI 컴포넌트들
import { QuizProgressBar } from '../components/quiz/QuizProgressBar';
import { QuizContent } from '../components/quiz/QuizContent';
import { QuizControls } from '../components/quiz/QuizControls';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// 세션 관리 유틸리티
import {
  createSession,
  getSession,
  moveToNextQuestion,
  markQuestionCompleted,
  isQuizCompleted,
  toggleFavorite,
  toggleStar,
  updateInputMode,
  deleteSession
} from '../utils/sessionStorage';

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
      // sessionId가 없으면 임시 테스트 세션 생성 (개발용)
      console.warn('No session ID in URL - creating test session');

      // 임시 테스트 문제 IDs
      const mockQuestionIds = [1, 2, 3, 4, 5, 6];

      // 임시 세션 생성 (카테고리 1: Model Example)
      const testSessionId = createSession(1, 1, mockQuestionIds);

      // 생성된 세션으로 리다이렉트
      navigate(`/quiz?session=${testSessionId}`, { replace: true });
    }
  }, [sessionId, navigate]);

  // 세션 데이터에서 카테고리와 Day 추출
  const category = session?.category;
  const day = session?.day;
  const currentQuestionIndex = session?.currentQuestionIndex || 0;

  // 퀴즈 데이터 및 상태 훅들
  // category=4(오늘의 퀴즈)는 session에 이미 questions가 있음, 다른 카테고리는 서버에서 조회
  const shouldFetchFromServer = category && category !== 4;
  const { data: fetchedQuestions, isLoading, error, refetch } = useQuizQuestions(
    shouldFetchFromServer ? category : null,
    shouldFetchFromServer ? day : null
  );

  // 최종 questionsData: category=4면 session에서, 아니면 서버에서
  const questionsData = category === 4 ? session?.questions : fetchedQuestions;

  // 액션 훅들
  const submitAnswerMutation = useSubmitAnswer();

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

  // 백엔드 데이터에서 직접 가져오기
  const isFavorite = question?.isFavorite || false;
  const isStarred = question?.isWrongAnswer || false;

  // 로컬 상태
  const [userAnswer, setUserAnswer] = useState('');
  const [inputMode, setInputMode] = useState(session?.inputMode || 'keyboard'); // 세션에서 로드
  const [quizMode, setQuizMode] = useState('solving'); // 'solving' | 'grading'
  const [isRecording, setIsRecording] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [keywordInputs, setKeywordInputs] = useState({});

  // 세션 inputMode 동기화
  useEffect(() => {
    if (session?.inputMode) {
      setInputMode(session.inputMode);
    }
  }, [session?.inputMode]);


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

    // 실시간 정답 검증
    if (value.toLowerCase().trim() === keyword) {
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

  // 키워드 입력 기반 실시간 채점 로직
  useEffect(() => {
    if (quizMode === 'solving' && inputMode === 'keyboard' && question?.keywords) {
      const allKeywordsCorrect = question.keywords.every(keyword => {
        const userInput = keywordInputs[keyword.toLowerCase()];
        return userInput?.toLowerCase().trim() === keyword.toLowerCase();
      });

      if (allKeywordsCorrect && question.keywords.length > 0) {
        // 모든 키워드가 정답이면 채점 모드로 전환
        setQuizMode('grading');
        setTimeout(() => {
          handleNextQuestion();
        }, 2000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywordInputs, question, quizMode, inputMode]);

  // 음성 모드 실시간 채점 로직 (기존)
  useEffect(() => {
    if (quizMode === 'solving' && inputMode === 'voice' && userAnswer.trim() && question?.answer) {
      const normalizedAnswer = userAnswer.toLowerCase().trim();
      const normalizedCorrect = question.answer.toLowerCase().trim();

      // 간단한 키워드 매칭 또는 정확한 매칭
      if (normalizedAnswer === normalizedCorrect ||
          (question.keywords && question.keywords.some(keyword =>
            normalizedAnswer.includes(keyword.toLowerCase())
          ))) {
        // 정답이면 채점 모드로 전환
        setQuizMode('grading');
        setTimeout(() => {
          handleNextQuestion();
        }, 2000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAnswer, question, quizMode, inputMode]);

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

  // 답변 제출
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      alert('답변을 입력해주세요!');
      return;
    }

    try {
      await submitAnswerMutation.mutateAsync({
        sessionId,
        questionId: question.id,
        answer: userAnswer.trim(),
        mode: inputMode
      });

      // 자동으로 다음 문제로 이동 (설정에 따라)
      if (session?.settings?.autoNext) {
        setTimeout(() => {
          handleNextQuestion();
        }, 2000);
      }

    } catch (error) {
      console.error('Answer submission error:', error);
      alert('답변 제출에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 다음 문제로 이동
  const handleNextQuestion = async () => {
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

    } catch (error) {
      console.error('Move to next question error:', error);
      alert('다음 문제 로드에 실패했습니다.');
    }
  };

  // 문제 건너뛰기
  const handleSkipQuestion = async () => {
    if (confirm('이 문제를 건너뛰시겠습니까?')) {
      try {
        // TODO: API 연동
        // await skipQuestionMutation.mutateAsync({
        //   sessionId,
        //   questionId: question.id
        // });

        // 상태 초기화
        setUserAnswer('');
        setKeywordInputs({});

      } catch (error) {
        console.error('Skip question error:', error);
        alert('문제 건너뛰기에 실패했습니다.');
      }
    }
  };

  // 음성 녹음 토글
  const handleToggleRecording = async () => {
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
  };

  // 메인 액션 버튼 처리
  const handleMainAction = () => {
    if (inputMode === 'voice') {
      handleToggleRecording();
    } else {
      handleSubmitAnswer();
    }
  };

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

  // 힌트 보기 (기존)
  const handleShowHint = () => {
    if (question?.hints?.length > 0) {
      alert(`힌트: ${question.hints.join(', ')}`);
    } else {
      alert('이 문제에는 힌트가 없습니다.');
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
      // localStorage 세션 업데이트
      toggleFavorite(sessionId, question.id);

      // 세션 상태 갱신
      setSession(getSession(sessionId));

      // TODO: 백엔드 API에도 전송
      console.log('Toggle favorite:', { sessionId, questionId: question.id, isFavorite });

    } catch (error) {
      console.error('Toggle favorite error:', error);
      alert('즐겨찾기 변경에 실패했습니다.');
    }
  };

  // 틀린문제 별표 토글
  const handleToggleStar = async () => {
    if (!question?.id || !sessionId) return;

    try {
      // localStorage 세션 업데이트
      toggleStar(sessionId, question.id);

      // 세션 상태 갱신
      setSession(getSession(sessionId));

      // TODO: 백엔드 API에도 전송
      console.log('Toggle star:', { sessionId, questionId: question.id, isStarred });

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-error mb-4">퀴즈 로드에 실패했습니다.</p>
          <button
            onClick={refetch}
            className="btn-primary"
          >
            다시 시도
          </button>
        </div>
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
        onShowHint={handleShowHint}
        onShowFirstLetters={handleShowFirstLetters}
        onShowFullAnswer={handleShowFullAnswer}
        onSkipQuestion={handleSkipQuestion}
        isSubmitting={submitAnswerMutation.isPending}
      />

    </div>
  );
};

export default QuizPage;