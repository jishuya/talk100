const SummaryCard = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-gradient-primary rounded-2xl p-6 text-white mb-5 shadow-xl">
      <div className="text-sm opacity-90 mb-2">총 학습 일수</div>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-bold">{data.totalDays}</span>
        <span className="text-base opacity-90">일</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <span className="block text-xl font-bold">{data.studiedQuestions}</span>
          <span className="text-xs opacity-90 mt-1">학습한 문제</span>
        </div>
        <div className="text-center">
          <span className="block text-xl font-bold">{data.dailyAverage}</span>
          <span className="text-xs opacity-90 mt-1">일평균 학습</span>
        </div>
        <div className="text-center">
          <span className="block text-xl font-bold">{data.reviewCount}</span>
          <span className="text-xs opacity-90 mt-1">복습 표시 ⭐</span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;