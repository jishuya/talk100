/**
 * 카테고리별 퀴즈 전용 프로그레스바
 * - Day 선택 후 해당 Day의 문제 진행률 표시
 * - 예: Day 2 선택 → "3/23" (완료한 문제 3개 / 총 23문제)
 */
export const CategoryQuizProgressBar = ({
  completedCount = 0,
  totalQuestions = 0,
  day = null
}) => {
  const total = totalQuestions || 1;
  const percentage = Math.round((completedCount / total) * 100);

  return (
    <div className="bg-white shadow-soft rounded-brand mx-4 p-3 md:p-4">
      <div className="flex items-center gap-3">
        {/* Day 표시 */}
        {day && (
          <span className="text-xs font-medium text-primary bg-accent-pale px-2 py-1 rounded-lg">
            Day {day}
          </span>
        )}

        {/* 프로그레스 바 */}
        <div className="flex-1 h-2 bg-accent-mint rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        {/* 문제 수 표시 */}
        <span className="text-sm font-semibold text-primary min-w-[60px] text-right">
          {completedCount}/{total}
        </span>
      </div>
    </div>
  );
};

export default CategoryQuizProgressBar;
