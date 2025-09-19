import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CharacterCard, QuizCard, SummaryCard, HistoryCard } from '../components/common/Card';
import Button, { StartLearningButton } from '../components/common/Button';
import useModal from '../hooks/useModal';

const HomePage = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const avatarModal = useModal();

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
  const characterData = {
    avatar: '🦊',
    name: '김학습',
    level: 'Lv.12 중급 학습자',
    progress: 35,
    badges: [
      { icon: '🏆', count: '182' },
      { icon: '⭐', count: '4,203' },
    ],
  };

  const quizCategories = [
    { icon: '📖', title: 'Model Example', count: 'Day 1-30' },
    { icon: '🗣️', title: 'Small Talk', count: 'Day 1-30' },
    { icon: '💼', title: 'Cases in Point', count: 'Day 1-30' },
  ];

  const personalQuizzes = [
    { icon: '❌', title: '틀린문제', count: '15개' },
    { icon: '❤️', title: '즐겨찾기', count: '8개' },
  ];

  const recentHistory = [
    { icon: '📝', title: 'Model Example Day 1', time: '10분 전', score: '85%' },
    { icon: '🗣️', title: 'Small Talk Day 3', time: '2시간 전', score: '92%' },
    { icon: '💼', title: 'Cases in Point Day 2', time: '어제', score: '78%' },
  ];

  const handleQuizStart = (category, day = null) => {
    if (day) {
      navigate(`/quiz/${category}/${day}`);
    } else {
      navigate(`/quiz/${category}`);
    }
  };

  const handleDailyQuiz = () => {
    navigate('/quiz');
  };

  return (
    <div className="pt-4 pb-4">
      {/* Character Section */}
      <div className="px-4 py-5 animate-fade-in">
        <CharacterCard
          {...characterData}
          onAvatarClick={avatarModal.openModal}
        >
          <StartLearningButton onClick={handleDailyQuiz}>
            오늘의 퀴즈
          </StartLearningButton>
        </CharacterCard>
      </div>

      {/* Quiz Category Section */}
      <div className="px-4 py-2">
        <h2 className="text-base font-bold text-text-primary mb-3">카테고리</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {quizCategories.slice(0, 2).map((quiz, index) => (
            <QuizCard
              key={index}
              icon={quiz.icon}
              title={quiz.title}
              count={quiz.count}
              onClick={() => handleQuizStart(quiz.title.toLowerCase().replace(' ', '_'))}
              className={`delay-${index * 100}`}
            />
          ))}
        </div>
        <div className="w-full">
          <QuizCard
            icon={quizCategories[2].icon}
            title={quizCategories[2].title}
            count={quizCategories[2].count}
            onClick={() => handleQuizStart('cases_in_point')}
            className="delay-200"
          />
        </div>
      </div>

      {/* Personal Quiz Section */}
      <div className="px-4 py-2">
        <h2 className="text-base font-bold text-text-primary mb-3">나만의 퀴즈</h2>
        <div className="grid grid-cols-2 gap-3">
          {personalQuizzes.map((quiz, index) => (
            <QuizCard
              key={index}
              icon={quiz.icon}
              title={quiz.title}
              count={quiz.count}
              onClick={() => handleQuizStart(quiz.title)}
              className={`delay-${index * 100} bg-accent-mint`}
            />
          ))}
        </div>
      </div>

      {/* Recent History */}
      <div className="px-4 py-2">
        <h2 className="text-base font-bold text-text-primary mb-3">최근 학습</h2>
        <HistoryCard items={recentHistory} />
      </div>

      {/* Phase 2 Demo */}
      <div className="px-4 py-2">
        <div className="bg-white p-4 rounded-primary shadow-primary">
          <h3 className="text-lg font-bold text-text-primary mb-3">
            🎯 Phase 2 완료: 공통 컴포넌트
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <SummaryCard label="AppLayout" value="✅" />
            <SummaryCard label="MobileHeader" value="✅" />
            <SummaryCard label="BottomNav" value="✅" />
            <SummaryCard label="Card Components" value="✅" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="primary" size="small">Primary</Button>
            <Button variant="secondary" size="small">Secondary</Button>
            <Button variant="success" size="small">Success</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;