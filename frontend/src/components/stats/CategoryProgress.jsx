import { getIcon } from '../../utils/iconMap';

const CategoryProgress = ({ data }) => {
  if (!data || !Array.isArray(data)) return null;

  return (
    <div className="bg-white rounded-2xl p-5 mb-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
          {getIcon('flat-color-icons:folder', { size: 'xl' })}
          <span>카테고리별 진행률</span>
        </h2>
      </div>
      <div className="space-y-4">
        {data.map((category) => {
          // progress가 없으면 completedQuestions/totalQuestions로 계산
          const progress = category.progress ??
            Math.round((category.completedQuestions / category.totalQuestions) * 100);

          return (
            <div key={category.id}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-text-primary">
                  {category.name}
                </span>
                <div className="flex gap-3 text-xs text-text-secondary">
                  <span>{progress}%</span>
                  <span>{category.completedQuestions}/{category.totalQuestions} 문제</span>
                </div>
              </div>
              <div className="h-2 bg-accent-mint rounded overflow-hidden">
                <div
                  className="h-full bg-primary rounded transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryProgress;