import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

// UI 컴포넌트들
import { QuizProgressBar } from '../components/quiz/QuizProgressBar';
import { QuizContent } from '../components/quiz/QuizContent';
import { QuizControls } from '../components/quiz/QuizControls';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { getIcon } from '../utils/iconMap';

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
import { useToggleWrongAnswer, useToggleFavorite, useUpdateProgress } from '../hooks/useApi';

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
      if (currentQuestion.korean_a !== "" && currentQuestion.korean_a !== null) {
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

  // 모달 상태
  const [showGoalAchievedModal, setShowGoalAchievedModal] = useState(false);
  const [streakInfo, setStreakInfo] = useState(null);

  // 즐겨찾기 & 별 상태 (로컬 상태로 관리하여 즉시 UI 업데이트)
  const [isFavorite, setIsFavorite] = useState(question?.isFavorite || false);
  const [isStarred, setIsStarred] = useState(question?.isWrongAnswer || false);


  // 채점 훅 사용
  const { gradingResult, checkKeyword, checkAllKeywords, submitAnswer, resetGrading } = useQuizGrading(question, inputMode);

  // 틀린 문제 토글 mutation
  const toggleWrongAnswerMutation = useToggleWrongAnswer();

  // 즐겨찾기 토글 mutation
  const toggleFavoriteMutation = useToggleFavorite();

  // 진행률 업데이트 mutation
  const updateProgressMutation = useUpdateProgress();

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

  // 첫 문제 로드 시 첫 번째 키워드 input에 자동 포커스
  useEffect(() => {
    if (question && inputMode === 'keyboard' && quizMode === 'solving') {
      setTimeout(() => {
        const firstInput = document.querySelector('input[data-keyword]');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  }, [question?.id, inputMode, quizMode]);


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

      // grading 모드에서 "다음 문제" 버튼 클릭 시 백엔드에 진행률 업데이트
      // (정답을 맞춰서 grading 모드가 된 경우이므로 무조건 업데이트)
      // 중요: session.category를 사용! (오늘의 퀴즈는 category=4이지만, 문제의 category_id는 1,2,3일 수 있음)
      // 예외: 틀린문제(5), 즐겨찾기(6)는 진행률 저장 안함 (개인 복습용)
      const shouldUpdateProgress = session?.category && ![5, 6].includes(session.category);

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
        } catch (error) {
          console.error('Failed to update progress:', error);
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
        // 퀴즈 완료 - 바로 홈으로 이동
        if (isQuizCompleted(sessionId)) {
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

      // 첫 번째 키워드 input에 포커스
      setTimeout(() => {
        const firstInput = document.querySelector('input[data-keyword]');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);

    } catch (error) {
      console.error('Move to next question error:', error);
      alert('다음 문제 로드에 실패했습니다.');
    }
  }, [sessionId, question?.id, question?.day, session?.category, quizMode, navigate, resetGrading, updateProgressMutation]);

  // Enter 키로 다음 문제 넘어가기 (grading 모드일 때만)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && quizMode === 'grading') {
        // input이나 textarea에 포커스되어 있지 않을 때만
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [quizMode, handleNextQuestion]);

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

  // 🎉 목표 달성 모달: 추가 학습 계속하기
  const handleContinueAdditionalLearning = async () => {
    try {
      // 1. solved_count 리셋
      const resetResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/progress/reset-solved-count`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!resetResponse.ok) {
        throw new Error('Failed to reset solved count');
      }

      // 2. 진행률 캐시를 즉시 0으로 업데이트
      queryClient.setQueryData(['progress', 'today'], {
        current: 0,
        total: 20,
        percentage: 0
      });

      // 3. 새로운 문제 불러오기
      const token = localStorage.getItem('jwt_token');
      const quizResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/quiz/daily`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!quizResponse.ok) {
        throw new Error('Failed to fetch new quiz');
      }

      const result = await quizResponse.json();

      if (result.success && result.data && result.data.questions && result.data.questions.length > 0) {
        // 4. 기존 세션 삭제
        deleteSession(sessionId);

        // 5. 새 세션 생성
        const { questions } = result.data;
        const questionIds = questions.map(q => q.question_id);

        const newSessionId = `session_${Date.now()}`;
        const newSession = {
          sessionId: newSessionId,
          category: 4,
          questionIds,
          questions,
          progress: { completed: 0, total: questions.length, percentage: 0 },
          currentQuestionIndex: 0,
          completedQuestions: [],
          inputMode: 'keyboard',
          createdAt: Date.now()
        };

        localStorage.setItem(`quiz_session_${newSessionId}`, JSON.stringify(newSession));

        // 6. 모달 닫기
        setShowGoalAchievedModal(false);
        setStreakInfo(null);

        // 7. 새 세션으로 페이지 이동
        navigate(`/quiz?session=${newSessionId}`);
        window.location.reload();
      } else {
        alert('추가 학습할 문제가 없습니다.');
        handleGoToHome();
      }

    } catch (error) {
      console.error('Failed to start additional learning:', error);
      alert('추가 학습 시작에 실패했습니다. 다시 시도해주세요.');
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
      {/* 프로그레스 바 */}
      <QuizProgressBar />

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

      {/* 🎉 목표 달성 모달 */}
      <Modal
        isOpen={showGoalAchievedModal}
        onClose={handleGoToHome}
        size="md"
        closeOnOverlayClick={false}
        showCloseButton={false}
        className="border-4 border-primary rounded-3xl overflow-hidden"
      >
        <ModalHeader className="bg-gradient-to-r from-primary-light to-primary rounded-t-2xl">
          <div className="text-center">
            <div className="mb-2 animate-bounce flex justify-center">
              {getIcon('IoPartyPopper', { size: '5xl' })}
            </div>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">오늘 목표 완료!</h2>
          </div>
        </ModalHeader>
        <ModalBody className="py-6">
          <div className="text-center space-y-5">
            {streakInfo && (
              <div className="bg-gradient-to-br from-accent-mint to-accent-pale rounded-2xl p-5 space-y-3 border-2 border-primary-light shadow-lg">
                <div className="flex items-center justify-center gap-3">
                  {getIcon('IoFire', { size: '3xl' })}
                  <span className="text-lg text-text-secondary">
                    연속 학습: <span className="font-bold text-primary text-xl">{streakInfo.current_streak}일</span>
                  </span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  {getIcon('IoTrophy', { size: '3xl' })}
                  <span className="text-lg text-text-secondary">
                    최고 기록: <span className="font-bold text-primary text-xl">{streakInfo.best_streak}일</span>
                  </span>
                </div>
              </div>
            )}

            <p className="text-lg font-semibold text-text-primary pt-2">
              추가로 더 푸시겠습니까?
            </p>
          </div>
        </ModalBody>
        <ModalFooter className="bg-gray-50 rounded-b-2xl">
          <Button variant="secondary" onClick={handleGoToHome} className="px-6 py-3">
            홈으로
          </Button>
          <Button variant="primary" onClick={handleContinueAdditionalLearning} className="px-6 py-3">
            계속하기
          </Button>
        </ModalFooter>
      </Modal>

    </div>
  );
};

export default QuizPage;