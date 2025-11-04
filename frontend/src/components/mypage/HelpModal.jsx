import Modal, { ModalBody } from '../ui/Modal';
import { Button } from '../ui/Button';

const HelpModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOverlayClick={false}
      showCloseButton={false}
      className="rounded-2xl overflow-hidden"
    >
      <ModalBody className="py-8 px-6">
        <div className="space-y-6">
          {/* 메시지 */}
          <p className="text-center text-lg text-gray-700">
            준비중입니다
          </p>

          {/* 버튼 */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={onClose}
              className="flex-1 py-2.5 focus:ring-4 focus:ring-primary/50 transition-all"
            >
              확인
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default HelpModal;
