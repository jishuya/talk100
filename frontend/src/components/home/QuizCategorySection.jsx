import React from 'react';

const QuizCategorySection = ({ categories, onCategoryClick }) => {
  const defaultCategories = [
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

  const quizCategories = categories || defaultCategories;

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