import React from 'react';
import { MOCK_HOME_DATA } from '../../mocks/homePageData';

const QuizPersonalSection = ({ personalQuizzes, onPersonalQuizClick }) => {
  // Mock 데이터를 fallback으로 사용 (API 실패시)
  const quizzes = personalQuizzes || MOCK_HOME_DATA.personalQuizzes;

  const handleQuizClick = (quiz) => {
    if (onPersonalQuizClick) {
      onPersonalQuizClick(quiz);
    }
  };

  return (
    <div className="quiz-personal">
      <h2 className="section-title">나만의 퀴즈</h2>
      <div className="quiz-mode-grid">
        {quizzes.map((quiz, index) => (
          <div
            key={quiz.id}
            className="quiz-card touchable animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => handleQuizClick(quiz)}
          >
            <div className="quiz-card-icon">{quiz.icon}</div>
            <div className="quiz-card-title">{quiz.title}</div>
            <div className="quiz-card-count">{quiz.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizPersonalSection;