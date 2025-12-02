import Modal from '../ui/Modal';

export const GoalAchievedModal = ({
  isOpen,
  daysCompleted,
  onContinue,     // 추가 학습
  onGoHome        // 그만하기
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onGoHome} showCloseButton={false} size="sm">
      <div className="p-8 text-center">
        {/* 축하 아이콘 */}
        <div className="text-6xl mb-4">🎉</div>

        {/* 제목 */}
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          축하합니다!
        </h2>

        {/* 메시지 */}
        <p className="text-lg text-text-primary mb-2">
          오늘의 학습 목표를 달성했습니다!
        </p>

        {/* 안내 메시지 */}
        <p className="text-base text-text-primary mb-6">
          추가로 학습하시겠습니까?
        </p>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onGoHome}
            className="flex-1 px-6 py-3 bg-white border-2 border-primary text-primary rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            그만하기
          </button>
          <button
            onClick={onContinue}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
          >
            추가 학습하기
          </button>
        </div>
      </div>
    </Modal>
  );
};
