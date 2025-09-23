const PeriodSelector = ({ selectedPeriod, onPeriodChange }) => {
  const periods = [
    { key: 'week', label: '주간' },
    { key: 'month', label: '월간' },
    { key: 'all', label: '전체' }
  ];

  return (
    <div className="flex gap-2 bg-accent-mint p-1 rounded-full shadow-soft">
      {periods.map((period) => (
        <button
          key={period.key}
          onClick={() => onPeriodChange(period.key)}
          className={`
            flex-1 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300
            ${selectedPeriod === period.key
              ? 'bg-white text-primary font-semibold shadow-sm'
              : 'bg-transparent text-text-secondary hover:bg-white/50'
            }
          `}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

export default PeriodSelector;