import React from 'react';
import { getIcon } from '../../utils/iconMap';

const QuizPersonalSection = ({ personalQuizzes, onPersonalQuizClick }) => {
  const baseQuizzes = [
    {
      id: 'wrong-answers',
      category_id: 5,
      icon: 'fluent:star-24-filled',
      title: '틀린문제',
      path: '/quiz/wrong-answers',
      count: 5
    },
    {
      id: 'favorites',
      category_id: 6,
      icon: 'fluent:heart-24-filled',
      title: '즐겨찾기',
      path: '/quiz/favorites',
      count: 2
    }
  ];

  // personalQuizzes에서 count 값을 category_id로 매칭하여 합치기
  const quizzes = baseQuizzes.map(baseQuiz => {
    const dynamicQuiz = personalQuizzes?.find(quiz => quiz.category_id === baseQuiz.category_id);
    return {
      ...baseQuiz,
      count: dynamicQuiz?.count || 0
    };
  });

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
              {typeof quiz.icon === 'string' ? getIcon(quiz.icon, {
                size: '3xl',
                className: quiz.id === 'wrong-answers' ? 'text-yellow-400' :
                          quiz.id === 'favorites' ? 'text-red-400' : ''
              }) : quiz.icon}
            </div>
            <div className="text-sm font-bold text-gray-700 mb-1">
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