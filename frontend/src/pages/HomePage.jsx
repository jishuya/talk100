import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CharacterSection from '../components/home/CharacterSection';
import QuizCategorySection from '../components/home/QuizCategorySection';
import QuizPersonalSection from '../components/home/QuizPersonalSection';
import StudyHistorySection from '../components/home/StudyHistorySection';

// 새로운 데이터 훅들
import { useUserData, useBadgesData } from '../hooks/api/useUserData';
import { useProgressData, useStudyHistory } from '../hooks/api/useProgressData';
import { useQuizCategories, usePersonalQuizzes } from '../hooks/api/useQuizData';

const HomePage = () => {
  const { loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // 새로운 데이터 훅들 사용
  const { user: userData, isLoading: userLoading } = useUserData();
  const { progress: progressData, isLoading: progressLoading } = useProgressData();
  const { badges: badgesData } = useBadgesData();
  const { categories: categoriesData } = useQuizCategories();
  const { personalQuizzes: personalQuizzesData } = usePersonalQuizzes();
  const { history: historyData } = useStudyHistory();

  // 통합 로딩 상태
  const isLoading = authLoading || userLoading || progressLoading;

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

  // Temporarily disable login requirement for testing
  // if (!isAuthenticated) {
  //   navigate('/login');
  //   return null;
  // }

  const handleStartLearning = () => {
    console.log('오늘의 퀴즈 시작!');
    navigate('/quiz');
  };

  const handleCategoryClick = (category) => {
    console.log('카테고리 선택:', category);
    navigate(category.path);
  };

  const handlePersonalQuizClick = (quiz) => {
    console.log('개인 퀴즈 선택:', quiz);
    navigate(quiz.path);
  };

  const handleHistoryItemClick = (item) => {
    console.log('학습 기록 선택:', item);
    navigate(`/quiz/${item.category}/${item.day}`);
  };

  return (
    <div>
      {/* Character Section */}
      <CharacterSection
        user={userData}
        progress={progressData}
        badges={badgesData}
        onStartLearning={handleStartLearning}
      />

      {/* Quiz Category Section */}
      <QuizCategorySection
        categories={categoriesData}
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