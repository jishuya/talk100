import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// QuizPage 관련 훅들
import { useQuizData, useSubmitAnswer } from '../hooks/useApi';

// UI 컴포넌트들
import { QuizProgressBar } from '../components/quiz/QuizProgressBar';
import { QuizContent } from '../components/quiz/QuizContent';
import { QuizControls } from '../components/quiz/QuizControls';
import { FeedbackModal } from '../components/quiz/FeedbackModal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const QuizPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL 파라미터에서 세션 ID 추출 (실제로는 퀴즈 시작시 생성)
  const sessionId = searchParams.get('session') || 'mock_session_001';

  // 퀴즈 데이터 및 상태 훅들
  const { data: quizData, isLoading, error, refetch } = useQuizData(sessionId);

  // 액션 훅들
  const submitAnswerMutation = useSubmitAnswer();

  // Mock 데이터에서 값 추출
  const session = quizData?.session;
  const question = quizData?.currentQuestion;
  const progress = quizData?.progress;
  const audioUrl = question?.audioUrl;

  // 로컬 상태
  const [userAnswer, setUserAnswer] = useState('');
  const [inputMode, setInputMode] = useState('voice'); // 'voice' | 'keyboard'
  const [quizMode, setQuizMode] = useState('solving'); // 'solving' | 'grading'
  const [isRecording, setIsRecording] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [keywordInputs, setKeywordInputs] = useState({});


  // 키워드 입력 변경 핸들러
  const handleKeywordInputChange = (keyword, value) => {
    setKeywordInputs(prev => {
      const newInputs = {
        ...prev,
        [keyword]: value
      };

      // 즉시 답변 업데이트
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

    const keywords = question.keywords.map(k => k.toLowerCase());
    const currentIndex = keywords.indexOf(currentKeyword);

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
  }, [userAnswer, question, quizMode, inputMode]);

  // ================================================================
  // 이벤트 핸들러들
  // ================================================================

  // 입력 모드 변경
  const handleInputModeChange = (mode) => {
    setInputMode(mode);
    if (mode === 'keyboard') {
      setUserAnswer('');
      setKeywordInputs({});
    }

    // 설정 업데이트
    updateSettingsMutation.mutate({
      sessionId,
      settings: { inputMode: mode }
    });
  };

  // 답변 제출
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      alert('답변을 입력해주세요!');
      return;
    }

    try {
      const result = await submitAnswerMutation.mutateAsync({
        sessionId,
        questionId: question.id,
        answer: userAnswer.trim(),
        mode: inputMode
      });

      // 피드백 표시
      setFeedbackData(result);
      setShowFeedback(true);

      // 2초 후 자동으로 다음 문제 (설정에 따라)
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
      await moveToNextMutation.mutateAsync(sessionId);

      // 상태 초기화
      setUserAnswer('');
      setFeedbackData(null);
      setShowFeedback(false);
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
        await skipQuestionMutation.mutateAsync({
          sessionId,
          questionId: question.id
        });

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

      // Mock 음성 인식 (실제로는 MediaRecorder API 사용)
      try {
        const mockAudioBlob = new Blob([], { type: 'audio/wav' });
        const result = await speechRecognitionMutation.mutateAsync({
          audioBlob: mockAudioBlob,
          sessionId
        });

        setUserAnswer(result.transcription);

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

  // 힌트 보기 (첫 글자)
  const handleShowFirstLetters = () => {
    setShowHint(true);
    setShowAnswer(false);
  };

  // 정답 보기 (전체)
  const handleShowFullAnswer = () => {
    setShowAnswer(true);
    setShowHint(false);
  };

  // 즐겨찾기 토글
  const handleToggleFavorite = async () => {
    try {
      await toggleFavoriteMutation.mutateAsync(question.id);
    } catch (error) {
      console.error('Toggle favorite error:', error);
    }
  };

  // 틀린문제 별표 토글
  const handleToggleStar = async () => {
    try {
      await toggleStarMutation.mutateAsync(question.id);
    } catch (error) {
      console.error('Toggle star error:', error);
    }
  };


  // 피드백 모달 닫기
  const handleCloseFeedback = () => {
    setShowFeedback(false);
    setFeedbackData(null);
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
        onMainAction={handleMainAction}
        onPlayAudio={handlePlayAudio}
        onShowHint={handleShowHint}
        onShowFirstLetters={handleShowFirstLetters}
        onShowFullAnswer={handleShowFullAnswer}
        onSkipQuestion={handleSkipQuestion}
        isSubmitting={submitAnswerMutation.isPending}
      />

      {/* 피드백 모달 */}
      {showFeedback && feedbackData && (
        <FeedbackModal
          feedback={feedbackData}
          onClose={handleCloseFeedback}
          onNextQuestion={handleNextQuestion}
        />
      )}
    </div>
  );
};

export default QuizPage;