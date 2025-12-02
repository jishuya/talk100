import { useEffect, useRef } from 'react';
import Modal from '../ui/Modal';
import { ENV } from '../../config/environment';

export const GoalAchievedModal = ({
  isOpen,
  daysCompleted,
  onContinue,     // 추가 학습
  onGoHome        // 그만하기
}) => {
  const audioRef = useRef(null);

  // 모달이 열릴 때 축하 음원 재생
  useEffect(() => {
    if (isOpen) {
      const audioUrl = `${ENV.API_BASE_URL}/audio/effect/celebrate.mp3`;
      const audio = new Audio(audioUrl);
      audio.volume = 0.7;
      audioRef.current = audio;

      audio.play().catch(() => {});
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isOpen]);

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
