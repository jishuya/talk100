import { getIcon } from '../../utils/iconMap';

const CategoryProgress = ({ data }) => {
  if (!data || !Array.isArray(data)) return null;

  return (
    <div className="bg-white rounded-2xl p-4 mb-3 shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
          {getIcon('flat-color-icons:folder', { size: 'xl' })}
          <span>카테고리별 진행률</span>
        </h2>
      </div>
      <div className="space-y-4">
        {data.map((category) => {
          // 백엔드 응답 형식: { categoryId, name, completed, total, completedDays, totalDays }
          const id = category.categoryId || category.id;
          const completedDays = category.completedDays ?? 0;
          const totalDays = category.totalDays ?? 100;
          const dayProgress = Math.round((completedDays / totalDays) * 100);

          return (
            <div key={id}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-text-primary">
                  {category.name}
                </span>
                <div className="flex gap-3 text-xs text-text-secondary">
                  <span>{dayProgress}%</span>
                  <span>{completedDays}/{totalDays} Day</span>
                </div>
              </div>
              <div className="h-2 bg-accent-mint rounded overflow-hidden">
                <div
                  className="h-full bg-primary rounded transition-all duration-500 ease-out"
                  style={{ width: `${dayProgress}%` }}
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