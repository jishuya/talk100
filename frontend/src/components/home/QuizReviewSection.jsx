import { getIcon } from '../../utils/iconMap';

const QuizReviewSection = ({ onReviewClick }) => {
  const reviewQuizzes = [
    {
      id: 'random',
      icon: 'RandomReview',
      title: '랜덤복습',
      description: '무작위 문제 복습'
    },
    {
      id: 'power',
      icon: 'PowerMemory',
      title: '파워암기모드',
      description: '집중 암기 훈련'
    }
  ];

  const handleCardClick = (quiz) => {
    if (onReviewClick) {
      onReviewClick(quiz);
    }
  };

  return (
    <div className="px-4 pb-3 md:pb-4">
      <h2 className="text-sm font-bold mb-2 text-text-primary md:text-base md:mb-3">복습 퀴즈</h2>

      {/* ===== 모바일: 리스트 형태 ===== */}
      <div className="card p-2 md:hidden">
        {reviewQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="flex items-center py-2 border-b border-gray-border last:border-b-0 cursor-pointer touchable"
            onClick={() => handleCardClick(quiz)}
          >
            <div className="w-9 h-9 bg-accent-pale rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              {getIcon(quiz.icon, {
                size: 'lg',
                className: quiz.id === 'random' ? 'text-orange-400' : 'text-red-400'
              })}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-text-primary">
                {quiz.title}
              </div>
            </div>
            <div className="text-xs text-text-secondary">
              {quiz.description}
            </div>
          </div>
        ))}
      </div>

      {/* ===== 태블릿/데스크톱: 그리드 형태 ===== */}
      <div className="hidden md:grid grid-cols-2 gap-3">
        {reviewQuizzes.map((quiz, index) => (
          <div
            key={quiz.id}
            className="quiz-card animate-slide-up"
            onClick={() => handleCardClick(quiz)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              {getIcon(quiz.icon, {
                size: '3xl',
                className: quiz.id === 'random' ? 'text-orange-400' : 'text-red-400'
              })}
            </div>
            <div className="text-sm font-bold text-text-primary mb-1">
              {quiz.title}
            </div>
            <div className="text-xs text-text-secondary">
              {quiz.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizReviewSection;
