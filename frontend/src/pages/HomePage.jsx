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

  const handleStartLearning = () => {
    console.log('오늘의 퀴즈 시작!');

    // TODO: 백엔드에서 오늘의 퀴즈 문제 ID 목록 가져오기
    const mockQuestionIds = [1, 2, 3, 4, 5, 6];

    // 카테고리 4 = 오늘의 퀴즈
    const sessionId = createSession(4, 1, mockQuestionIds);
    navigate(`/quiz?session=${sessionId}`);
  };

  const handleCategoryClick = (category) => {
    console.log('카테고리 선택:', category);

    // TODO: 백엔드에서 해당 카테고리의 문제 ID 목록 가져오기
    const mockQuestionIds = [1, 2, 3, 4, 5, 6];

    // category.id가 카테고리 번호 (1=Model Example, 2=Small Talk, 3=Cases in Point)
    const sessionId = createSession(category.id, 1, mockQuestionIds);
    navigate(`/quiz?session=${sessionId}`);
  };

  const handlePersonalQuizClick = (quiz) => {
    console.log('개인 퀴즈 선택:', quiz);

    // TODO: 백엔드에서 틀린문제/즐겨찾기 문제 ID 목록 가져오기
    const mockQuestionIds = [1, 2, 3];

    // quiz.category_id를 사용 (5=Wrong Answers, 6=Favorites)
    const sessionId = createSession(quiz.category_id, 1, mockQuestionIds);
    navigate(`/quiz?session=${sessionId}`);
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
        onStartLearning={handleStartLearning}
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