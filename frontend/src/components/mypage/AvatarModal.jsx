import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

const AvatarModal = ({
  isOpen,
  onClose,
  avatarSystem,
  onSave
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(avatarSystem?.current || '🦊');

  if (!avatarSystem) return null;

  const { userLevel, avatars } = avatarSystem;

  const handleSave = () => {
    onSave(selectedAvatar);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-[380px] max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-center">아바타 선택</h3>

        <div className="p-3 bg-accent-pale rounded-xl mb-3 text-center">
          <div className="text-sm font-semibold mb-1 text-text-primary">
            현재 레벨: Lv.{userLevel}
          </div>
          <div className="text-xs text-text-secondary">
            레벨이 올라갈수록 새로운 아바타가 해금됩니다!
          </div>
        </div>

        <div className="mb-5">
          <div className="grid grid-cols-3 gap-2.5 p-1">
            {avatars.map((avatar, index) => {
              const isUnlocked = userLevel >= avatar.level;
              const isSelected = avatar.emoji === selectedAvatar;

              return (
                <div
                  key={index}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 p-2 relative ${
                    isUnlocked ? 'bg-white border-2' : 'bg-gray-200 opacity-60 cursor-not-allowed'
                  } ${
                    isSelected ? 'bg-accent-mint border-primary' : 'border-gray-border'
                  }`}
                  onClick={() => isUnlocked && setSelectedAvatar(avatar.emoji)}
                >
                  <div className="text-[28px] mb-1">{avatar.emoji}</div>
                  <div className="text-[10px] text-text-secondary text-center">{avatar.name}</div>
                  <div className="text-[9px] text-primary font-semibold">Lv.{avatar.level}</div>
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center text-lg">
                      🔒
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSave}
          >
            선택
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AvatarModal;