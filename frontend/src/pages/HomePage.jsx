import { playEffectSound } from '../utils/soundEffects';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import CharacterSection from '../components/home/CharacterSection';
import QuizCategorySection from '../components/home/QuizCategorySection';
import QuizReviewSection from '../components/home/QuizReviewSection';
import QuizPersonalSection from '../components/home/QuizPersonalSection';
import StudyHistorySection from '../components/home/StudyHistorySection';
import OnboardingTutorial from '../components/home/OnboardingTutorial';
import Modal, { ModalBody } from '../components/ui/Modal';
import Button from '../components/ui/Button';
import AlertModal from '../components/ui/AlertModal';
import DaySelectModal from '../components/quiz/DaySelectModal';

// 데이터 훅들
import { useUserData, useBadgesData, useTodayProgress, usePersonalQuizzesData, useHistoryData, useQuizMode, useCompletedDays } from '../hooks/useApi';

// 세션 관리 유틸리티
import { createSession } from '../utils/sessionStorage';

// API 서비스
import { api } from '../services/apiService';

// 카테고리 ID → 카테고리 정보 매핑
const CATEGORY_MAP = {
  1: { id: 1, name: 'Model Example' },
  2: { id: 2, name: 'Small Talk' },
  3: { id: 3, name: 'Cases in Point' }
};

const HomePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // 추가 학습 확인 모달 상태
  const [showAdditionalLearningModal, setShowAdditionalLearningModal] = useState(false);
  const continueButtonRef = useRef(null);

  // Day 선택 모달 상태
  const [showDaySelectModal, setShowDaySelectModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 🎉 퀴즈 완료 후 축하 효과용 상태
  const [celebrateDay, setCelebrateDay] = useState(null);

  // Alert 모달 상태
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', icon: '' });

  // 데이터 훅들 (ApiService가 자동으로 fallback 처리)
  const { data: userData, isLoading: userLoading } = useUserData();
  const { data: progressData, isLoading: progressLoading } = useTodayProgress();
  const { data: badgesData } = useBadgesData();
  const { data: personalQuizzesData, isLoading: personalQuizzesLoading } = usePersonalQuizzesData();
  const { data: historyData } = useHistoryData();
  const { data: quizModeData } = useQuizMode();

  // 선택된 카테고리의 완료된 Day 목록 조회
  const { data: completedDaysData } = useCompletedDays(selectedCategory?.id);

  // 통합 로딩 상태
  const isLoading = userLoading || progressLoading || personalQuizzesLoading;

  // 🎉 퀴즈 완료 후 DaySelectModal 자동 열기 (1단계: URL 파라미터 감지)
  useEffect(() => {
    const completed = searchParams.get('completed');
    const categoryId = parseInt(searchParams.get('category'));
    const day = parseInt(searchParams.get('day'));

    if (completed === 'true' && categoryId && day) {
      // 카테고리 정보 설정
      const category = CATEGORY_MAP[categoryId];
      if (category) {
        setSelectedCategory(category);
        setCelebrateDay(day);
        setShowDaySelectModal(true);

        // URL 파라미터 제거 (뒤로가기 시 다시 열리지 않도록)
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, setSearchParams]);

  // 모달이 열릴 때 "계속하기" 버튼에 자동 포커스
  useEffect(() => {
    if (showAdditionalLearningModal && continueButtonRef.current) {
      setTimeout(() => {
        continueButtonRef.current?.focus();
      }, 100);
    }
  }, [showAdditionalLearningModal]);

  // 모달에서 Enter 키 처리
  useEffect(() => {
    const handleModalKeyPress = (e) => {
      if (e.key === 'Enter' && showAdditionalLearningModal) {
        const activeElement = document.activeElement;
        if (activeElement?.tagName === 'BUTTON') {
          activeElement.classList.add('animate-pulse');
          setTimeout(() => {
            activeElement.classList.remove('animate-pulse');
          }, 200);
        }
      }
    };

    window.addEventListener('keydown', handleModalKeyPress);
    return () => window.removeEventListener('keydown', handleModalKeyPress);
  }, [showAdditionalLearningModal]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 오늘의 퀴즈 클릭 핸들러
  const handleTodayQuizClick = async () => {
    playEffectSound('quizStart');
    // 100% 달성 시 추가 학습 확인 모달 표시
    if (progressData?.percentage >= 100) {
      setShowAdditionalLearningModal(true);
      return;
    }
    // 100% 미만이면 바로 시작
    await startTodayQuiz(false);
  };

  // 추가 학습 확인 모달에서 "취소" 클릭
  const handleCancelAdditionalLearning = () => {
    setShowAdditionalLearningModal(false);
  };

  // 추가 학습 확인 모달에서 "계속하기" 클릭
  const handleConfirmAdditionalLearning = async () => {
    setShowAdditionalLearningModal(false);
    await startTodayQuiz(true); // 추가 학습 모드로 시작
  };

  // 오늘의 퀴즈 시작 (추가 학습 모드 포함)
  const startTodayQuiz = async (isAdditionalLearning = false) => {
    try {
      if (isAdditionalLearning) {
        // 추가 학습 시작: solved_count 리셋
        await api.apiCall('/api/progress/reset-solved-count', { method: 'POST' });

        // 진행률 캐시를 즉시 0으로 업데이트
        queryClient.setQueryData(['progress', 'today'], {
          current: 0,
          total: 20,
          percentage: 0
        });
      }

      // api.apiCall()을 사용하여 ENV.API_BASE_URL을 runtime에 가져옴
      const result = await api.apiCall('/api/quiz/daily', { method: 'GET' });

      if (result) {
        const { start_question_id, daily_goal, progress, questions } = result;

        // 문제가 없으면 (모두 풀었음)
        if (!questions || questions.length === 0) {
          setAlertModal({ isOpen: true, message: '오늘 풀 수 있는 모든 문제를 완료했습니다!', icon: '🎉' });
          return;
        }

        const question_ids = questions.map(q => q.question_id);

        // 세션 생성 및 데이터 저장 (day 대신 start_question_id 사용)
        const userInputMode = quizModeData?.quizMode || 'keyboard';
        const sessionId = createSession(4, start_question_id, question_ids, userInputMode);

        // updateSession을 사용하여 안전하게 업데이트 (inputMode 유지)
        const session = JSON.parse(localStorage.getItem(`quiz_session_${sessionId}`));
        session.questions = questions;
        session.daily_goal = daily_goal;
        session.progress = progress;
        localStorage.setItem(`quiz_session_${sessionId}`, JSON.stringify(session));

        navigate(`/quiz?session=${sessionId}`);
      } else {
        setAlertModal({ isOpen: true, message: '퀴즈 데이터를 가져올 수 없습니다.', icon: '❌' });
      }
    } catch {
      setAlertModal({ isOpen: true, message: '퀴즈를 시작할 수 없습니다. 다시 시도해주세요.', icon: '❌' });
    }
  };

  // 카테고리 클릭 시 Day 선택 모달 표시
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setShowDaySelectModal(true);
  };

  // Day 선택 후 퀴즈 시작
  const handleDaySelect = async (day) => {
    if (!selectedCategory) return;

    try {
      // api.apiCall()을 사용하여 ENV.API_BASE_URL을 runtime에 가져옴
      const result = await api.apiCall(`/api/quiz/category/${selectedCategory.id}?day=${day}`, { method: 'GET' });

      if (result) {
        const { category_id, questions } = result;

        // 문제가 없는 경우
        if (!questions || questions.length === 0) {
          setAlertModal({ isOpen: true, message: `Day ${day}에 문제가 없습니다.`, icon: '📭' });
          return;
        }

        const question_ids = questions.map(q => q.question_id);

        // 세션 생성 및 데이터 저장
        const userInputMode = quizModeData?.quizMode || 'keyboard';
        const sessionId = createSession(category_id, day, question_ids, userInputMode);
        const session = JSON.parse(localStorage.getItem(`quiz_session_${sessionId}`));
        session.questions = questions;
        localStorage.setItem(`quiz_session_${sessionId}`, JSON.stringify(session));

        navigate(`/quiz?session=${sessionId}`);
      } else {
        setAlertModal({ isOpen: true, message: '퀴즈 데이터를 가져올 수 없습니다.', icon: '❌' });
      }
    } catch {
      setAlertModal({ isOpen: true, message: '퀴즈를 시작할 수 없습니다. 다시 시도해주세요.', icon: '❌' });
    }
  };

  const handlePersonalQuizClick = async (quiz) => {
    try {
      // quiz.category_id에 따라 다른 엔드포인트 호출 (5: Wrong Answers, 6: Favorites)
      const endpoint = quiz.category_id === 5
        ? '/api/quiz/wrong-answers'
        : '/api/quiz/favorites';

      // api.apiCall()을 사용하여 ENV.API_BASE_URL을 runtime에 가져옴
      const result = await api.apiCall(endpoint, { method: 'GET' });

      if (result) {
        const { category_id, questions } = result;

        // 문제가 없는 경우
        if (!questions || questions.length === 0) {
          const quizName = category_id === 5 ? '틀린 문제' : '즐겨찾기';
          setAlertModal({ isOpen: true, message: `${quizName}가 없습니다.`, icon: '📭' });
          return;
        }

        const question_ids = questions.map(q => q.question_id);

        // 세션 생성 및 데이터 저장
        const userInputMode = quizModeData?.quizMode || 'keyboard';
        const sessionId = createSession(category_id, 1, question_ids, userInputMode);
        const session = JSON.parse(localStorage.getItem(`quiz_session_${sessionId}`));
        session.questions = questions;
        localStorage.setItem(`quiz_session_${sessionId}`, JSON.stringify(session));

        navigate(`/quiz?session=${sessionId}`);
      } else {
        setAlertModal({ isOpen: true, message: '퀴즈 데이터를 가져올 수 없습니다.', icon: '❌' });
      }
    } catch {
      setAlertModal({ isOpen: true, message: '퀴즈를 시작할 수 없습니다. 다시 시도해주세요.', icon: '❌' });
    }
  };

  // 복습 퀴즈 클릭 핸들러
  const handleReviewQuizClick = async (quiz) => {
    // 파워암기모드는 별도 페이지로 이동
    if (quiz.id === 'power') {
      navigate('/power-memory');
      return;
    }

    try {
      // 랜덤복습: /api/quiz/random 호출
      const result = await api.apiCall('/api/quiz/random', { method: 'GET' });

      if (result) {
        const { category_id, questions } = result;

        // 문제가 없는 경우
        if (!questions || questions.length === 0) {
          setAlertModal({ isOpen: true, message: '복습할 문제가 없습니다.', icon: '📭' });
          return;
        }

        const question_ids = questions.map(q => q.question_id);

        // 세션 생성 및 데이터 저장
        const userInputMode = quizModeData?.quizMode || 'keyboard';
        const sessionId = createSession(category_id, 1, question_ids, userInputMode);

        const session = JSON.parse(localStorage.getItem(`quiz_session_${sessionId}`));
        session.questions = questions;
        session.quiz_type = 'random'; // 랜덤 퀴즈 타입 표시
        session.random_goal = 20; // 랜덤 퀴즈 목표 (20문제)
        localStorage.setItem(`quiz_session_${sessionId}`, JSON.stringify(session));

        navigate(`/quiz?session=${sessionId}`);
      } else {
        setAlertModal({ isOpen: true, message: '퀴즈 데이터를 가져올 수 없습니다.', icon: '❌' });
      }
    } catch {
      setAlertModal({ isOpen: true, message: '퀴즈를 시작할 수 없습니다. 다시 시도해주세요.', icon: '❌' });
    }
  };

  return (
    <div>
      {/* 온보딩 튜토리얼 (첫 사용자용) */}
      <OnboardingTutorial />

      {/* Character Section */}
      <CharacterSection
        user={userData}
        progress={progressData}
        badges={badgesData}
        onStartLearning={handleTodayQuizClick}
      />

      {/* Quiz Category Section */}
      <QuizCategorySection
        onCategoryClick={handleCategoryClick}
      />

      {/* Quiz Personal Section */}
      <QuizPersonalSection
        personalQuizzes={personalQuizzesData}
        onPersonalQuizClick={handlePersonalQuizClick}
      />

      {/* Quiz Review Section */}
      <QuizReviewSection
        onReviewClick={handleReviewQuizClick}
      />

      {/* Study History Section */}
      {/* <StudyHistorySection
        historyItems={historyData}
      /> */}

      {/* Day 선택 모달 */}
      <DaySelectModal
        isOpen={showDaySelectModal}
        onClose={() => {
          setShowDaySelectModal(false);
          setCelebrateDay(null); // 축하 효과 초기화
        }}
        category={selectedCategory}
        onDaySelect={handleDaySelect}
        completedDays={completedDaysData?.completedDays || []}
        celebrateDay={celebrateDay}
      />

      {/* 추가 학습 확인 모달 */}
      <Modal
        isOpen={showAdditionalLearningModal}
        onClose={handleCancelAdditionalLearning}
        size="sm"
        closeOnOverlayClick={false}
        showCloseButton={false}
        className="rounded-2xl overflow-hidden"
      >
        <ModalBody className="py-8 px-6">
          <div className="space-y-6">
            {/* 메시지 */}
            <p className="text-center text-lg text-gray-700">
              오늘의 목표를 이미 달성하였습니다.<br />
              추가 학습을 하시겠습니까?
            </p>

            {/* 버튼 */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleCancelAdditionalLearning}
                className="flex-1 py-2.5 focus:ring-4 focus:ring-gray-300 transition-all"
              >
                취소
              </Button>
              <Button
                ref={continueButtonRef}
                variant="primary"
                sound="quizStart"
                onClick={handleConfirmAdditionalLearning}
                className="flex-1 py-2.5 focus:ring-4 focus:ring-primary/50 transition-all"
              >
                계속하기
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

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

export default HomePage;