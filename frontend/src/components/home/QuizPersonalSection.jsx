import React from 'react';

const QuizPersonalSection = ({ personalQuizzes, onPersonalQuizClick }) => {
  const defaultPersonalQuizzes = [
    {
      id: 'wrong-answers',
      icon: '❌',
      title: '틀린문제',
      count: '15개',
      path: '/quiz/wrong-answers'
    },
    {
      id: 'favorites',
      icon: '❤️',
      title: '즐겨찾기',
      count: '8개',
      path: '/quiz/favorites'
    }
  ];

  const quizzes = personalQuizzes || defaultPersonalQuizzes;

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