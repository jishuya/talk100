import React from 'react';
import { getIcon } from '../../utils/iconMap';

const QuizCategorySection = ({ onCategoryClick }) => {
  const quizCategories = [
    {
      id: 1,
      icon: 'tabler:bulb',
      title: 'Model Example',
      path: '/quiz/1',
      count: '1-100'
    },
    {
      id: 2,
      icon: 'tabler:message-circle',
      title: 'Small Talk',
      path: '/quiz/2',
      count: '1-100'
    },
    {
      id: 3,
      icon: 'tabler:file-text',
      title: 'Cases in Point',
      path: '/quiz/3',
      count: '1-100'
    }
  ];

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
                className: category.id === 1 ? 'text-green-400' :
                          category.id === 2 ? 'text-purple-400' :
                          category.id === 3 ? 'text-blue-400' : ''
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