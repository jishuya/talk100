import Modal from '../ui/Modal';

/**
 * 오답 피드백 모달
 * - 답변 제출 시 오답인 경우 표시
 * - GoalAchievedModal 스타일과 유사하게 디자인
 */
export const WrongAnswerModal = ({
  isOpen,
  correctCount,
  totalCount,
  onRetry,      // 다시 시도
  onShowAnswer  // 정답 보기
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onRetry} showCloseButton={false} size="sm">
      <div className="p-6 text-center">
        {/* 아이콘 */}
        <div className="text-5xl mb-4">
          {correctCount > 0 ? '🤔' : '💪'}
        </div>

        {/* 제목 */}
        <h2 className="text-xl font-bold text-text-primary mb-2">
          {correctCount > 0 ? '조금만 더!' : '다시 도전해보세요!'}
        </h2>

        {/* 점수 표시 */}
        <div className="bg-orange-50 rounded-xl p-4 mb-4">
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {correctCount}/{totalCount}
          </div>
          <p className="text-sm text-orange-700">
            키워드 정답
          </p>
        </div>

        {/* 격려 메시지 */}
        <p className="text-sm text-text-secondary mb-5">
          {correctCount === 0
            ? '힌트를 참고해서 다시 시도해보세요!'
            : `${totalCount - correctCount}개만 더 맞추면 돼요!`
          }
        </p>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onShowAnswer}
            className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-200 text-text-secondary rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            정답 보기
          </button>
          <button
            onClick={onRetry}
            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm"
          >
            다시 시도
          </button>
        </div>
      </div>
    </Modal>
  );
};
