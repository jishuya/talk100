const LearningPattern = ({ data }) => {
  if (!data) return null;

  const patternItems = [
    {
      value: data.dailyAvgCompletion,
      label: '일평균 Day 완료'
    },
    {
      value: `${data.goalAchievementRate}%`,
      label: '목표 달성률'
    },
    {
      value: data.wrongAnswers,
      label: '틀린 문제'
    },
    {
      value: data.favorites,
      label: '즐겨찾기'
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-5 mb-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <span>학습 패턴 분석</span>
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {patternItems.map((item, index) => (
          <div key={index} className="p-4 bg-accent-pale rounded-xl text-center">
            <span className="block text-2xl font-bold text-primary mb-1">
              {item.value}
            </span>
            <span className="text-xs text-text-secondary">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningPattern;