import React, { useEffect } from 'react';
import { IoClose, IoCheckmark, IoArrowForward } from 'react-icons/io5';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

export const FeedbackModal = ({
  feedback,
  onClose,
  onNextQuestion,
  autoCloseDelay = 3000
}) => {
  useEffect(() => {
    if (autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
        if (onNextQuestion) {
          onNextQuestion();
        }
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoCloseDelay, onClose, onNextQuestion]);

  if (!feedback) return null;

  const getFeedbackConfig = () => {
    const { score = 0, passed = false, feedback: feedbackData } = feedback;

    if (score >= 90) {
      return {
        icon: '🎉',
        title: '완벽해요!',
        bgColor: 'bg-green-50',
        textColor: 'text-green-800',
        iconBg: 'bg-green-100'
      };
    } else if (score >= 70) {
      return {
        icon: '😊',
        title: '잘했어요!',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-800',
        iconBg: 'bg-blue-100'
      };
    } else {
      return {
        icon: '💪',
        title: '다시 도전해보세요!',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-800',
        iconBg: 'bg-orange-100'
      };
    }
  };

  const config = getFeedbackConfig();
  const { score, matchedKeywords = [], totalKeywords = 0, feedback: feedbackData } = feedback;

  return (
    <Modal isOpen={true} onClose={onClose} showCloseButton={false}>
      <div className={`${config.bgColor} rounded-brand p-6 text-center max-w-sm mx-auto`}>
        {/* 피드백 아이콘 */}
        <div className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <span className="text-3xl">{feedbackData?.icon || config.icon}</span>
        </div>

        {/* 피드백 제목 */}
        <h3 className={`text-xl font-bold ${config.textColor} mb-2`}>
          {feedbackData?.title || config.title}
        </h3>

        {/* 점수 정보 */}
        <div className={`${config.textColor} mb-4`}>
          <div className="text-2xl font-bold mb-1">
            {score}점
          </div>
          <div className="text-sm">
            {matchedKeywords.length}/{totalKeywords} 키워드를 맞추셨어요
          </div>
        </div>

        {/* 피드백 메시지 */}
        {feedbackData?.message && (
          <div className={`text-sm ${config.textColor} mb-6`}>
            {feedbackData.message}
          </div>
        )}

        {/* 매칭된 키워드 표시 */}
        {matchedKeywords.length > 0 && (
          <div className="mb-6">
            <div className="text-xs text-text-secondary mb-2">맞춘 키워드</div>
            <div className="flex flex-wrap gap-1 justify-center">
              {matchedKeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                >
                  <IoCheckmark className="inline w-3 h-3 mr-1" />
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="flex gap-2">
          <Button
            onClick={onClose}
            variant="secondary"
            size="sm"
            className="flex-1"
          >
            <IoClose className="w-4 h-4 mr-1" />
            닫기
          </Button>

          {onNextQuestion && (
            <Button
              onClick={() => {
                onClose();
                onNextQuestion();
              }}
              variant="primary"
              size="sm"
              className="flex-1"
            >
              <IoArrowForward className="w-4 h-4 mr-1" />
              다음 문제
            </Button>
          )}
        </div>

        {/* 자동 닫기 안내 */}
        {autoCloseDelay > 0 && (
          <div className="text-xs text-text-secondary mt-3">
            {Math.ceil(autoCloseDelay / 1000)}초 후 자동으로 다음 문제로 이동합니다
          </div>
        )}
      </div>
    </Modal>
  );
};