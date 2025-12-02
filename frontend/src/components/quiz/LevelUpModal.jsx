import { useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ENV } from '../../config/environment';

const LevelUpModal = ({ isOpen, onClose, levelUpInfo }) => {
  const audioRef = useRef(null);

  // 모달이 열릴 때 축하 음원 재생
  useEffect(() => {
    if (isOpen && levelUpInfo) {
      const audioUrl = `${ENV.API_BASE_URL}/audio/effect/celebrate.mp3`;
      const audio = new Audio(audioUrl);
      audio.volume = 0.7;
      audioRef.current = audio;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isOpen, levelUpInfo]);

  if (!levelUpInfo) return null;

  const {
    newLevel,
    previousLevel,
    avatar,
    avatarName,
    requiredQuestions,
    message
  } = levelUpInfo;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" className="rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6 text-center">
        {/* 축하 아이콘 */}
        <div className="text-6xl mb-4 animate-bounce">
          🎉
        </div>

        {/* 제목 */}
        <h3 className="text-xl font-bold mb-2 text-text-primary">
          축하합니다!
        </h3>

        {/* 메시지 */}
        <p className="text-base text-text-secondary mb-4">
          {message}
        </p>

        {/* 레벨 변화 */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="px-4 py-2 bg-gray-100 rounded-lg">
            <div className="text-xs text-text-secondary mb-1">이전 레벨</div>
            <div className="text-lg font-bold text-primary">Lv.{previousLevel}</div>
          </div>

          <div className="text-2xl text-primary">→</div>

          <div className="px-4 py-2 bg-accent-mint rounded-lg">
            <div className="text-xs text-text-secondary mb-1">현재 레벨</div>
            <div className="text-lg font-bold text-primary">Lv.{newLevel}</div>
          </div>
        </div>

        {/* 새 아바타 */}
        <div className="p-4 bg-accent-pale rounded-xl mb-4">
          <div className="text-xs text-text-secondary mb-2">새로운 아바타 해금!</div>
          <div className="text-5xl mb-2">{avatar}</div>
          <div className="text-sm font-semibold text-text-primary">{avatarName}</div>
          <div className="text-xs text-text-secondary mt-1">{requiredQuestions}문제 달성</div>
        </div>

        {/* 확인 버튼 */}
        <Button
          variant="primary"
          className="w-full"
          onClick={onClose}
        >
          계속 학습하기
        </Button>
      </div>
    </Modal>
  );
};

export default LevelUpModal;
