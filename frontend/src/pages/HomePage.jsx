import React from 'react';
import { useNavigate } from 'react-router-dom';
import CharacterSection from '../components/home/CharacterSection';
import QuizCategorySection from '../components/home/QuizCategorySection';
import QuizPersonalSection from '../components/home/QuizPersonalSection';
import StudyHistorySection from '../components/home/StudyHistorySection';

// 새로운 데이터 훅들
import { useUserData, useBadgesData, useProgressData, usePersonalQuizzesData } from '../hooks/useApi';
import { MOCK_HOME_DATA } from '../mocks/homePageData';

const HomePage = () => {
  const navigate = useNavigate();

  // 새로운 데이터 훅들 사용
  const { data: userData, isLoading: userLoading } = useUserData();
  const { data: progressData, isLoading: progressLoading } = useProgressData();
  const { data: badgesData } = useBadgesData();
  const { data: personalQuizzesData, isLoading: personalQuizzesLoading } = usePersonalQuizzesData();

  // Mock 데이터를 fallback으로 사용
  const finalUserData = userData || MOCK_HOME_DATA.user;
  const finalProgressData = progressData || MOCK_HOME_DATA.progress;
  const finalBadgesData = badgesData || MOCK_HOME_DATA.badges;
  const finalPersonalQuizzesData = personalQuizzesData || MOCK_HOME_DATA.personalQuizzes;
  const historyData = MOCK_HOME_DATA.history;

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
        user={finalUserData}
        progress={finalProgressData}
        badges={finalBadgesData}
        onStartLearning={handleStartLearning}
      />

      {/* Quiz Category Section */}
      <QuizCategorySection
        onCategoryClick={handleCategoryClick}
      />

      {/* Quiz Personal Section */}
      <QuizPersonalSection
        personalQuizzes={finalPersonalQuizzesData}
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