import React, { useEffect } from 'react';
import { cn } from '../../utils/cn';
import Button from './Button';
import { IoCloseOutline } from 'react-icons/io5';
import { getIconColor } from '../../utils/iconColors.js';

const Modal = ({
  isOpen = false,
  onClose,
  children,
  className = '',
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      // ESC 키 눌렀을 때 닫힘
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    // 뒷배경의 스크롤기능 막음
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    // 모달 닫히면 원래대로 복귀하기 위해 이벤트 제거
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 animate-fade-in"
        onClick={handleOverlayClick}
      />

      {/* Modal Content */}
      <div
        className={cn(
          'relative bg-white rounded-primary shadow-primary-lg animate-slide-up w-full',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <IoCloseOutline className={getIconColor('IoCloseOutline', 'xl')} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

// Modal Header 컴포넌트
export const ModalHeader = ({ children, className = '', ...props }) => (
  <div className={cn('px-6 py-4 border-b border-gray-border', className)} {...props}>
    <h2 className="text-lg font-bold text-text-primary">
      {children}
    </h2>
  </div>
);

// Modal Body 컴포넌트
export const ModalBody = ({ children, className = '', ...props }) => (
  <div className={cn('px-6 py-4', className)} {...props}>
    {children}
  </div>
);

// Modal Footer 컴포넌트
export const ModalFooter = ({ children, className = '', ...props }) => (
  <div className={cn('px-6 py-4 border-t border-gray-border flex justify-end gap-3', className)} {...props}>
    {children}
  </div>
);

// 확인 모달 컴포넌트
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'primary',
  ...props
}) => (
  <Modal isOpen={isOpen} onClose={onClose} size="sm" {...props}>
    <ModalHeader>{title}</ModalHeader>
    <ModalBody>
      <p className="text-text-primary">{message}</p>
    </ModalBody>
    <ModalFooter>
      <Button variant="secondary" onClick={onClose}>
        {cancelText}
      </Button>
      <Button variant={variant} onClick={onConfirm}>
        {confirmText}
      </Button>
    </ModalFooter>
  </Modal>
);

export default Modal;