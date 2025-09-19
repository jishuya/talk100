import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CharacterSection from '../components/home/CharacterSection';
import QuizCategorySection from '../components/home/QuizCategorySection';
import QuizPersonalSection from '../components/home/QuizPersonalSection';
import StudyHistorySection from '../components/home/StudyHistorySection';

const HomePage = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // 임시 데이터 (Phase 4에서 실제 API 연동)
  const userData = {
    name: '삔이',
    goal: 20
  };

  const progressData = {
    current: 7,
    total: 20,
    percentage: 35
  };

  const badgesData = {
    trophy: 182,
    star: 4203
  };

  const categoriesData = [
    {
      id: 'model-example',
      icon: '📖',
      title: 'Model Example',
      count: 'Day 1-30',
      path: '/quiz/model-example'
    },
    {
      id: 'small-talk',
      icon: '🗣️',
      title: 'Small Talk',
      count: 'Day 1-30',
      path: '/quiz/small-talk'
    },
    {
      id: 'cases-in-point',
      icon: '💼',
      title: 'Cases in Point',
      count: 'Day 1-30',
      path: '/quiz/cases-in-point'
    }
  ];

  const personalQuizzesData = [
    {
      id: 'wrong-answers',
      icon: '❌',
      title: '틀린문제',
      count: '15개',
      path: '/quiz/wrong-answers'
    },
    {
      id: 'favorites',
      icon: '❤️',
      title: '즐겨찾기',
      count: '8개',
      path: '/quiz/favorites'
    }
  ];

  const historyData = [
    {
      id: 1,
      icon: '📝',
      title: 'Model Example Day 1',
      time: '10분 전',
      score: 85,
      category: 'model-example',
      day: 1
    },
    {
      id: 2,
      icon: '🗣️',
      title: 'Small Talk Day 3',
      time: '2시간 전',
      score: 92,
      category: 'small-talk',
      day: 3
    },
    {
      id: 3,
      icon: '💼',
      title: 'Cases in Point Day 2',
      time: '어제',
      score: 78,
      category: 'cases-in-point',
      day: 2
    }
  ];

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
    <div className="main-content">
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