import { useEffect, useState } from 'react';
import { getIcon } from '../../utils/iconMap';
import { getBadgeIconName } from '../../utils/badgeIcons';

/**
 * 뱃지 획득 알림 모달
 * @param {Object} props
 * @param {Array} props.badges - 새로 획득한 뱃지 배열
 * @param {Function} props.onClose - 모달 닫기 콜백
 */
const BadgeModal = ({ badges, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // 여러 뱃지가 있을 경우 순차 표시
  useEffect(() => {
    if (!badges || badges.length === 0) {
      onClose();
      return;
    }

    // 3초 후 다음 뱃지 표시 또는 닫기
    const timer = setTimeout(() => {
      if (currentIndex < badges.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        handleClose();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentIndex, badges, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // 애니메이션 시간
  };

  if (!badges || badges.length === 0) return null;

  const currentBadge = badges[currentIndex];
  const iconName = getBadgeIconName(currentBadge.id);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl transform transition-all duration-300 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 뱃지 아이콘 */}
        <div className="mb-6 animate-bounce">
          <div className="flex justify-center mb-2">
            {getIcon(iconName, { size: '5xl' })}
          </div>
          <div className="flex justify-center">
            {getIcon('IoSparkles', { size: '2xl' })}
          </div>
        </div>

        {/* 축하 메시지 */}
        <h2 className="text-2xl font-bold text-primary mb-4">
          🎉 축하합니다!
        </h2>

        {/* 뱃지 획득 메시지 */}
        <p className="text-lg font-semibold text-text-primary mb-2">
          <span className="text-primary">{currentBadge.name}</span> 뱃지를
        </p>
        <p className="text-lg font-semibold text-text-primary mb-4">
          획득하였습니다
        </p>

        {/* 뱃지 설명 */}
        <p className="text-sm text-text-secondary mb-6 px-4">
          {currentBadge.description}
        </p>

        {/* 진행 표시 (여러 뱃지가 있을 경우) */}
        {badges.length > 1 && (
          <div className="flex justify-center gap-2 mb-4">
            {badges.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="w-full py-3 bg-gradient-primary text-white rounded-xl font-medium
                     active:scale-95 transition-transform duration-150 shadow-lg"
        >
          {currentIndex < badges.length - 1 ? '다음' : '확인'}
        </button>

        {/* 건너뛰기 버튼 (여러 뱃지가 있을 경우) */}
        {badges.length > 1 && currentIndex < badges.length - 1 && (
          <button
            onClick={handleClose}
            className="mt-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            모두 건너뛰기
          </button>
        )}
      </div>
    </div>
  );
};

export default BadgeModal;
