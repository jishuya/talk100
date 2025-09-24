import React from 'react';
import { MOCK_HOME_DATA } from '../../mocks/homePageData';
import { getIcon } from '../../utils/iconMap';

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
          <div
            key={category.id}
            className="quiz-card animate-slide-up"
            onClick={() => handleCardClick(category)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              {typeof category.icon === 'string' ? getIcon(category.icon, {
                size: '3xl',
                className: category.id === 'model-example' ? 'text-green-400' :
                          category.id === 'small-talk' ? 'text-purple-400' :
                          category.id === 'cases-in-point' ? 'text-blue-400' : ''
              }) : category.icon}
            </div>
            <div className="text-sm font-bold text-text-primary mb-1">
              {category.title}
            </div>
            <div className="text-xs text-text-secondary">
              {category.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizCategorySection;