import { useMemo, useEffect, useRef, useState } from 'react';

/**
 * Day 선택 모달
 * - 카테고리별 퀴즈에서 Day 1~100 선택
 * - WrongAnswerModal 스타일 적용
 * - celebrateDay: 방금 완료한 Day (반짝이는 효과 적용, 2초 후 사라짐)
 */
export const DaySelectModal = ({
  isOpen,
  onClose,
  category,
  onDaySelect,
  completedDays = [],
  celebrateDay = null
}) => {
  const celebrateRef = useRef(null);
  const [showCelebration, setShowCelebration] = useState(false);
  // Day 1~100 생성
  const days = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => i + 1);
  }, []);

  const handleDayClick = (day) => {
    onDaySelect(day);
    onClose();
  };

  // 🎉 축하할 Day로 스크롤 및 2초 후 효과 제거
  useEffect(() => {
    if (isOpen && celebrateDay && celebrateRef.current) {
      setShowCelebration(true);

      // 약간의 딜레이 후 스크롤 (모달 애니메이션 완료 후)
      setTimeout(() => {
        celebrateRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 300);

      // 2초 후 축하 효과 제거
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, celebrateDay]);

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl max-w-sm w-full mx-4 animate-fade-in shadow-xl overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-primary to-primary-dark px-5 py-4">
          <div className="text-center">
            <h2 className="text-lg font-bold text-white">{category.name || category.title}</h2>
            {/* <p className="text-sm text-white font-medium mt-0.5">학습할 Day를 선택하세요</p> */}
          </div>
        </div>

        {/* Day 그리드 */}
        <div className="p-4 max-h-[50vh] overflow-y-auto">
          <div className="grid grid-cols-5 gap-2">
            {days.map((day) => {
              const isCompleted = completedDays.includes(day);
              const isCelebrating = day === celebrateDay && showCelebration;

              return (
                <button
                  key={day}
                  ref={day === celebrateDay ? celebrateRef : null}
                  onClick={() => handleDayClick(day)}
                  className={`
                    relative py-2.5 rounded-xl text-center font-medium transition-all
                    hover:scale-105 active:scale-95 shadow-sm
                    ${isCompleted
                      ? 'bg-primary text-white'
                      : 'bg-accent-pale text-gray-700 hover:bg-primary/20'
                    }
                    ${isCelebrating ? 'animate-celebrate ring-4 ring-yellow-400 ring-opacity-75' : ''}
                  `}
                >
                  {/* ✨ 반짝이 효과 (2초간만 표시) */}
                  {isCelebrating && (
                    <>
                      <span className="absolute -top-1 -right-1 text-xs animate-bounce">✨</span>
                      <span className="absolute -bottom-1 -left-1 text-xs animate-bounce delay-100">⭐</span>
                    </>
                  )}
                  <span className="text-[10px] text-current opacity-60 block leading-none">Day</span>
                  <span className="text-sm font-bold">{day}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 닫기 버튼 */}
        <div className="px-4 pb-2 pt-2">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DaySelectModal;
