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
    <div className="px-4 pb-3 md:pb-4" data-onboarding="personal-quiz">
      <h2 className="text-sm font-bold mb-2 text-text-primary md:text-base md:mb-3">나만의 퀴즈</h2>

      {/* ===== 모바일: 리스트 형태 (카테고리와 동일) ===== */}
      <div className="card p-2 md:hidden">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="flex items-center py-2 border-b border-gray-border last:border-b-0 cursor-pointer touchable"
            data-category-id={quiz.category_id}
            onClick={() => handleQuizClick(quiz)}
          >
            <div className="w-9 h-9 bg-accent-pale rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              {typeof quiz.icon === 'string' ? getIcon(quiz.icon, {
                size: 'lg',
                className: quiz.id === 'wrong-answers' ? 'text-yellow-400' :
                          quiz.id === 'favorites' ? 'text-red-400' : ''
              }) : quiz.icon}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-text-primary">{quiz.title}</div>
            </div>
            <div className="text-xs text-text-secondary">{quiz.count}문제</div>
          </div>
        ))}
      </div>

      {/* ===== 태블릿/데스크톱: 기존 그리드 형태 ===== */}
      <div className="hidden md:grid grid-cols-2 gap-3">
        {quizzes.map((quiz, index) => (
          <div
            key={quiz.id}
            className="quiz-card-personal animate-slide-up"
            data-category-id={quiz.category_id}
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