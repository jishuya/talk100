import React from 'react';
import { getIcon } from '../../utils/iconMap';
import { useCategoryProgress } from '../../hooks/useApi';

const QuizCategorySection = ({ onCategoryClick }) => {
  const { data: categoryProgressData } = useCategoryProgress();

  // 카테고리별 completedDays를 매핑
  const getCompletedDays = (categoryId) => {
    if (!categoryProgressData) return 0;
    const category = categoryProgressData.find(c => c.categoryId === categoryId);
    return category?.completedDays || 0;
  };

  const quizCategories = [
    {
      id: 1,
      icon: 'tabler:bulb',
      title: 'Model Example',
      path: '/quiz/1',
      totalDays: 100
    },
    {
      id: 2,
      icon: 'tabler:message-circle',
      title: 'Small Talk',
      path: '/quiz/2',
      totalDays: 100
    },
    {
      id: 3,
      icon: 'tabler:file-text',
      title: 'Cases in Point',
      path: '/quiz/3',
      totalDays: 100
    }
  ];

  const handleCardClick = (category) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  };

  return (
    <div className="px-4 pb-3 md:pb-4">
      <h2 className="text-sm font-bold mb-2 text-text-primary md:text-base md:mb-3">카테고리</h2>

      {/* ===== 모바일: 리스트 형태 (최근 학습과 동일) ===== */}
      <div className="card p-2 md:hidden">
        {quizCategories.map((category) => (
          <div
            key={category.id}
            className="flex items-center py-2 border-b border-gray-border last:border-b-0 cursor-pointer touchable"
            onClick={() => handleCardClick(category)}
          >
            <div className="w-9 h-9 bg-accent-pale rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              {typeof category.icon === 'string' ? getIcon(category.icon, {
                size: 'lg',
                className: category.id === 1 ? 'text-green-400' :
                          category.id === 2 ? 'text-purple-400' :
                          category.id === 3 ? 'text-blue-400' : ''
              }) : category.icon}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-text-primary">
                {category.title}
              </div>
            </div>
            <div className="text-xs text-text-secondary">
              {getCompletedDays(category.id)}/{category.totalDays} Day
            </div>
          </div>
        ))}
      </div>

      {/* ===== 태블릿/데스크톱: 그리드 형태 (기존) ===== */}
      <div className="hidden md:grid grid-cols-3 gap-3">
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
              {getCompletedDays(category.id)}/{category.totalDays} Day
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizCategorySection;