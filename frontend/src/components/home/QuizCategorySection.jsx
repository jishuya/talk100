import React from 'react';
import { MOCK_HOME_DATA } from '../../mocks/homePageData';
import { QuizCard } from '../ui';

const QuizCategorySection = ({ categories, onCategoryClick }) => {
  // Mock 데이터를 fallback으로 사용 (API 실패시)
  const quizCategories = categories || MOCK_HOME_DATA.categories;

  const handleCardClick = (category) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  };

  return (
    <div className="px-4 pb-5">
      <h2 className="text-base font-bold mb-3 text-text-primary">카테고리</h2>
      <div className="grid grid-cols-3 gap-3">
        {quizCategories.map((category, index) => (
          <QuizCard
            key={category.id}
            icon={category.icon}
            title={category.title}
            count={category.count}
            onClick={() => handleCardClick(category)}
            style={{ animationDelay: `${index * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default QuizCategorySection;