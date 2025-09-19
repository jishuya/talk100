import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdrop = true,
  actions = null,
  className = '',
}) => {
  // 모달 크기
  const sizes = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg',
    xlarge: 'max-w-2xl',
    full: 'max-w-full mx-4',
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // 배경 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        className={`
          bg-white rounded-primary shadow-primary-lg w-full animate-slide-up
          ${sizes[size]}
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-border">
            <h3 className="text-lg font-semibold text-text-primary">
              {title}
            </h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center touchable rounded-primary-sm hover:bg-gray-light"
              >
                <span className="text-xl text-text-secondary">×</span>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-4">
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex gap-2 p-4 border-t border-gray-border">
            {actions}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// 특화된 모달 변형들
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'primary',
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size="small"
    actions={[
      <Button key="cancel" variant="outline" onClick={onClose}>
        {cancelText}
      </Button>,
      <Button key="confirm" variant={variant} onClick={onConfirm}>
        {confirmText}
      </Button>,
    ]}
  >
    <p className="text-text-primary">{message}</p>
  </Modal>
);

export const FeedbackModal = ({
  isOpen,
  onClose,
  icon,
  title,
  message,
  score,
  autoClose = true,
  duration = 2000,
}) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, duration, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="small"
      showCloseButton={false}
      closeOnBackdrop={false}
    >
      <div className="text-center py-4">
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
        {message && (
          <p className="text-text-secondary mb-2">{message}</p>
        )}
        {score && (
          <p className="text-sm text-text-secondary">{score}</p>
        )}
      </div>
    </Modal>
  );
};

export const AvatarModal = ({
  isOpen,
  onClose,
  avatars,
  selectedAvatar,
  onSelectAvatar,
  userLevel,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="아바타 선택"
    size="large"
    actions={[
      <Button key="cancel" variant="outline" onClick={onClose}>
        취소
      </Button>,
      <Button key="confirm" variant="primary" onClick={onClose}>
        선택
      </Button>,
    ]}
  >
    <div className="mb-4 p-3 bg-accent-pale rounded-primary-sm text-center">
      <div className="font-semibold text-text-primary">현재 레벨: Lv.{userLevel}</div>
      <div className="text-sm text-text-secondary">레벨이 올라갈수록 새로운 아바타가 해금됩니다!</div>
    </div>

    <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
      {avatars.map((avatar, index) => {
        const isUnlocked = userLevel >= avatar.level;
        const isSelected = avatar.emoji === selectedAvatar;

        return (
          <div
            key={index}
            className={`
              aspect-square p-3 rounded-primary-sm border-2 cursor-pointer transition-all
              ${isUnlocked ? 'hover:shadow-primary' : 'opacity-60 cursor-not-allowed'}
              ${isSelected ? 'border-primary bg-accent-mint' : 'border-gray-border bg-gray-light'}
            `}
            onClick={() => isUnlocked && onSelectAvatar(avatar.emoji)}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">{avatar.emoji}</div>
              <div className="text-xs font-medium text-text-primary">{avatar.name}</div>
              <div className="text-xs text-primary">Lv.{avatar.level}</div>
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-primary-sm">
                  <span className="text-lg">🔒</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </Modal>
);

export default Modal;