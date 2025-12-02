import Modal from './Modal';
import { Button } from './Button';

/**
 * AlertModal - 단순 알림 메시지 모달
 *
 * @param {boolean} isOpen - 모달 열림 상태
 * @param {function} onClose - 모달 닫기 핸들러
 * @param {string} message - 알림 메시지
 * @param {string} icon - 아이콘 (선택사항, 기본: 없음)
 * @param {string} title - 제목 (선택사항)
 * @param {string} buttonText - 버튼 텍스트 (기본: "확인")
 */
const AlertModal = ({
  isOpen,
  onClose,
  message,
  icon,
  title,
  buttonText = '확인'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      closeOnOverlayClick={true}
    >
      <div className="py-8 px-6">
        <div className="space-y-4">
          {/* 아이콘 */}
          {icon && (
            <div className="text-center text-4xl">
              {icon}
            </div>
          )}

          {/* 제목 */}
          {title && (
            <h3 className="text-center text-lg font-semibold text-text-primary">
              {title}
            </h3>
          )}

          {/* 메시지 */}
          <p className="text-center text-base text-gray-700 whitespace-pre-line">
            {message}
          </p>

          {/* 버튼 */}
          <div className="pt-2">
            <Button
              variant="primary"
              onClick={onClose}
              className="w-full py-2.5"
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AlertModal;
