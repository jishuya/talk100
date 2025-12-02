import { useTodayProgress } from '../../hooks/useApi';

/**
 * 퀴즈 진행률 바 컴포넌트
 * - 퀴즈 타입별로 다른 진행률 표시
 * - 오늘의 퀴즈(category 4): daily_goal 기준 진행률
 * - 카테고리 퀴즈(1,2,3): 카테고리 전체 문제 수 기준 진행률
 * - 나만의 퀴즈(5,6): 세션 내 순서 (n번째 문제)
 */
export const QuizProgressBar = ({
  category,
  totalQuestions = 0,
  completedCount = 0,
  categoryCompleted = 0,
  categoryTotal = 0
}) => {
  const { data: todayProgress } = useTodayProgress();

  // 1. 오늘의 퀴즈 (Category 4)
  if (category === 4) {
    const progress = todayProgress || { current: 0, total: 10, percentage: 0 };
    return (
      <div className="bg-white shadow-soft rounded-brand mx-4 p-3 md:p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-accent-mint rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
              style={{ width: `${Math.min(progress.percentage || 0, 100)}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-primary min-w-[60px] text-right">
            {progress.current || 0}/{progress.total || 10}
          </span>
        </div>
      </div>
    );
  }

  // 2. 카테고리 퀴즈 (Category 1, 2, 3)
  if (category >= 1 && category <= 3) {
    const completed = categoryCompleted || 0;
    const total = categoryTotal || 1;
    const percentage = Math.round((completed / total) * 100);

    return (
      <div className="bg-white shadow-soft rounded-brand mx-4 p-3 md:p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-accent-mint rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-primary min-w-[80px] text-right">
            {completed}/{total}
          </span>
        </div>
      </div>
    );
  }

  // 3. 나만의 퀴즈 (Category 5: 틀린문제, 6: 즐겨찾기) 또는 랜덤복습 (Category 7)
  if (category === 5 || category === 6 || category === 7) {
    const completed = completedCount || 0;
    const total = totalQuestions || 1;
    const percentage = Math.round((completed / total) * 100);

    return (
      <div className="bg-white shadow-soft rounded-brand mx-4 p-3 md:p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-accent-mint rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-primary min-w-[60px] text-right">
            {completed}/{total}
          </span>
        </div>
      </div>
    );
  }

  // 기본값 (fallback)
  return (
    <div className="bg-white shadow-soft rounded-brand mx-4 p-3 md:p-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-accent-mint rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
            style={{ width: '0%' }}
          />
        </div>
        <span className="text-sm font-semibold text-primary min-w-[60px] text-right">
          0/0
        </span>
      </div>
    </div>
  );
};
