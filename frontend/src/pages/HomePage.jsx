import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import CharacterSection from '../components/home/CharacterSection';
import QuizCategorySection from '../components/home/QuizCategorySection';
import QuizPersonalSection from '../components/home/QuizPersonalSection';
import StudyHistorySection from '../components/home/StudyHistorySection';
import Modal, { ModalBody } from '../components/ui/Modal';
import Button from '../components/ui/Button';

// 데이터 훅들
import { useUserData, useBadgesData, useTodayProgress, usePersonalQuizzesData, useHistoryData } from '../hooks/useApi';

// 세션 관리 유틸리티
import { createSession } from '../utils/sessionStorage';

const HomePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 추가 학습 확인 모달 상태
  const [showAdditionalLearningModal, setShowAdditionalLearningModal] = useState(false);
  const continueButtonRef = useRef(null);

  // 데이터 훅들 (ApiService가 자동으로 fallback 처리)
  const { data: userData, isLoading: userLoading } = useUserData();
  const { data: progressData, isLoading: progressLoading } = useTodayProgress();
  const { data: badgesData } = useBadgesData();
  const { data: personalQuizzesData, isLoading: personalQuizzesLoading } = usePersonalQuizzesData();
  const { data: historyData } = useHistoryData();

  // 통합 로딩 상태
  const isLoading = userLoading || progressLoading || personalQuizzesLoading;

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
        const token = localStorage.getItem('jwt_token');
        const resetResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/progress/reset-solved-count`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!resetResponse.ok) {
          alert('진행률 리셋에 실패했습니다. 다시 시도해주세요.');
          return;
        }

        // 진행률 캐시를 즉시 0으로 업데이트
        queryClient.setQueryData(['progress', 'today'], {
          current: 0,
          total: 20,
          percentage: 0
        });
      }

      const token = localStorage.getItem('jwt_token');
      const response = await fetch('/api/quiz/daily', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch today\'s quiz');
      }

      const result = await response.json();
      console.log('Today quiz response:', result.data);

      if (result.success && result.data) {
        const { start_question_id, daily_goal, progress, questions } = result.data;

        // 문제가 없으면 (모두 풀었음)
        if (!questions || questions.length === 0) {
          alert('오늘 풀 수 있는 모든 문제를 완료했습니다!');
          return;
        }

        const question_ids = questions.map(q => q.question_id);

        // 세션 생성 및 데이터 저장 (day 대신 start_question_id 사용)
        const sessionId = createSession(4, start_question_id, question_ids);
        const session = JSON.parse(localStorage.getItem(`quiz_session_${sessionId}`));
        session.questions = questions;
        session.daily_goal = daily_goal;
        session.progress = progress;
        localStorage.setItem(`quiz_session_${sessionId}`, JSON.stringify(session));

        navigate(`/quiz?session=${sessionId}`);
      } else {
        alert('퀴즈 데이터를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('Error fetching today\'s quiz:', error);
      alert('퀴즈를 시작할 수 없습니다. 다시 시도해주세요.');
    }
  };

  const handleCategoryClick = async (category) => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`/api/quiz/category/${category.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch category quiz');
      }

      const result = await response.json();

      if (result.success && result.data) {
        const { category_id, day, questions } = result.data;
        const question_ids = questions.map(q => q.question_id);

        // 세션 생성 및 데이터 저장
        const sessionId = createSession(category_id, day, question_ids);
        const session = JSON.parse(localStorage.getItem(`quiz_session_${sessionId}`));
        session.questions = questions;
        localStorage.setItem(`quiz_session_${sessionId}`, JSON.stringify(session));

        navigate(`/quiz?session=${sessionId}`);
      } else {
        alert('퀴즈 데이터를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('Error fetching category quiz:', error);
      alert('퀴즈를 시작할 수 없습니다. 다시 시도해주세요.');
    }
  };

  const handlePersonalQuizClick = async (quiz) => {
    try {
      // quiz.category_id에 따라 다른 엔드포인트 호출 (5: Wrong Answers, 6: Favorites)
      const endpoint = quiz.category_id === 5
        ? '/api/quiz/wrong-answers'
        : '/api/quiz/favorites';

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch personal quiz');
      }

      const result = await response.json();
      if (result.success && result.data) {
        const { category_id, questions } = result.data;

        // 문제가 없는 경우
        if (!questions || questions.length === 0) {
          const quizName = category_id === 5 ? '틀린 문제' : '즐겨찾기';
          alert(`${quizName}가 없습니다.`);
          return;
        }

        const question_ids = questions.map(q => q.question_id);

        // 세션 생성 및 데이터 저장
        const sessionId = createSession(category_id, 1, question_ids);
        const session = JSON.parse(localStorage.getItem(`quiz_session_${sessionId}`));
        session.questions = questions;
        localStorage.setItem(`quiz_session_${sessionId}`, JSON.stringify(session));

        navigate(`/quiz?session=${sessionId}`);
      } else {
        alert('퀴즈 데이터를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('Error fetching personal quiz:', error);
      alert('퀴즈를 시작할 수 없습니다. 다시 시도해주세요.');
    }
  };

  const handleHistoryItemClick = (item) => {
    // TODO: 백엔드에서 해당 카테고리/Day의 문제 ID 목록 가져오기
    const mockQuestionIds = [1, 2, 3, 4, 5, 6];

    // item.category를 카테고리 ID로 변환 (필요시)
    const categoryId = item.category_id || item.category;
    const sessionId = createSession(categoryId, item.day, mockQuestionIds);
    navigate(`/quiz?session=${sessionId}`);
  };

  return (
    <div>
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

      {/* Study History Section */}
      <StudyHistorySection
        historyItems={historyData}
        onHistoryItemClick={handleHistoryItemClick}
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
                onClick={handleConfirmAdditionalLearning}
                className="flex-1 py-2.5 focus:ring-4 focus:ring-primary/50 transition-all"
              >
                계속하기
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default HomePage;