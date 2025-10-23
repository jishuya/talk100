import { useTodayProgress } from '../../hooks/useApi';

/**
 * 퀴즈 진행률 바 컴포넌트
 * - CharacterSection과 동일한 진행률 데이터 사용 (useTodayProgress)
 * - 실시간 서버 데이터 반영
 * - 문제 풀 때마다 자동 업데이트
 */
export const QuizProgressBar = () => {
  const { data: progress } = useTodayProgress();

  // 데이터 없으면 기본값 표시
  const displayProgress = progress || { current: 0, total: 26, percentage: 0 };

  return (
    <div className="bg-white shadow-soft rounded-brand mx-4 mb-4 mt-4 p-4">
      {/* 프로그레스 바 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-accent-mint rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
            style={{ width: `${Math.min(displayProgress.percentage || 0, 100)}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-primary min-w-[60px] text-right">
          {displayProgress.current || 0}/{displayProgress.total || 26}
        </span>
      </div>
    </div>
  );
};