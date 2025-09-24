import React from 'react';
import { MOCK_HOME_DATA } from '../../mocks/homePageData';
import { getIcon } from '../../utils/iconMap';

const QuizPersonalSection = ({ personalQuizzes, onPersonalQuizClick }) => {
  // Mock 데이터를 fallback으로 사용 (API 실패시)
  const quizzes = personalQuizzes || MOCK_HOME_DATA.personalQuizzes;

  const handleQuizClick = (quiz) => {
    if (onPersonalQuizClick) {
      onPersonalQuizClick(quiz);
    }
  };

  return (
    <div className="px-4 pb-5">
      <h2 className="text-base font-bold mb-3 text-text-primary">나만의 퀴즈</h2>
      <div className="grid grid-cols-2 gap-3">
        {quizzes.map((quiz, index) => (
          <div
            key={quiz.id}
            className="quiz-card-personal animate-slide-up"
            onClick={() => handleQuizClick(quiz)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              {typeof quiz.icon === 'string' ? getIcon(quiz.icon, { size: '3xl' }) : quiz.icon}
            </div>
            <div className="text-sm font-bold text-text-primary mb-1">
              {quiz.title}
            </div>
            <div className="text-xs text-text-secondary">
              {quiz.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizPersonalSection;