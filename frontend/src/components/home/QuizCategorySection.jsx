import React from 'react';
import { MOCK_HOME_DATA } from '../../mocks/homePageData';

const QuizCategorySection = ({ categories, onCategoryClick }) => {
  // Mock 데이터를 fallback으로 사용 (API 실패시)
  const quizCategories = categories || MOCK_HOME_DATA.categories;

  const handleCardClick = (category) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  };

  return (
    <div className="quiz-category">
      <h2 className="section-title">카테고리</h2>
      <div className="quiz-mode-grid">
        {quizCategories.map((category, index) => (
          <div
            key={category.id}
            className="quiz-card touchable animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => handleCardClick(category)}
          >
            <div className="quiz-card-icon">{category.icon}</div>
            <div className="quiz-card-title">{category.title}</div>
            <div className="quiz-card-count">{category.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizCategorySection;