import React from 'react';
import { useNavigate } from 'react-router-dom';
import CharacterSection from '../components/home/CharacterSection';
import QuizCategorySection from '../components/home/QuizCategorySection';
import QuizPersonalSection from '../components/home/QuizPersonalSection';
import StudyHistorySection from '../components/home/StudyHistorySection';

// 새로운 데이터 훅들
import { useUserData, useBadgesData, useProgressData, usePersonalQuizzesData, useHistoryData } from '../hooks/useApi';

// 세션 관리 유틸리티
import { createSession } from '../utils/sessionStorage';

const HomePage = () => {
  const navigate = useNavigate();

  // 데이터 훅들 (ApiService가 자동으로 fallback 처리)
  const { data: userData, isLoading: userLoading } = useUserData();
  const { data: progressData, isLoading: progressLoading } = useProgressData();
  const { data: badgesData } = useBadgesData();
  const { data: personalQuizzesData, isLoading: personalQuizzesLoading } = usePersonalQuizzesData();
  const { data: historyData } = useHistoryData();

  // 통합 로딩 상태
  const isLoading = userLoading || progressLoading || personalQuizzesLoading;

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

  const handleTodayQuizClick = async () => {
    try {
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
      console.log('오늘의 퀴즈: ', result.data)

      if (result.success && result.data) {
        const { day, questions, progress } = result.data;
        const question_ids = questions.map(q => q.question_id);

        // 세션 생성 및 데이터 저장
        const sessionId = createSession(4, day, question_ids);
        const session = JSON.parse(localStorage.getItem(`quiz_session_${sessionId}`));
        session.questions = questions;
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
        const { category_id, day, questions, progress } = result.data;
        const question_ids = questions.map(q => q.question_id);

        // 세션 생성 및 데이터 저장
        const sessionId = createSession(category_id, day, question_ids);
        const session = JSON.parse(localStorage.getItem(`quiz_session_${sessionId}`));
        session.questions = questions;
        session.progress = progress;
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
        const { category_id, questions, progress } = result.data;

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
        session.progress = progress;
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
    console.log('학습 기록 선택:', item);

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
    </div>
  );
};

export default HomePage;