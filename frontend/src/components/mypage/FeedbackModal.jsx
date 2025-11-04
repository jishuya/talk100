import { useState } from 'react';
import Modal, { ModalBody } from '../ui/Modal';
import { Button } from '../ui/Button';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [feedback, setFeedback] = useState('');

  const handleSend = () => {
    if (feedback && feedback.trim()) {
      // mailto 링크로 이메일 앱 열기
      const subject = encodeURIComponent('[Talk100 피드백]');
      const body = encodeURIComponent(feedback);
      const mailtoLink = `mailto:jishuya3015@naver.com?subject=${subject}&body=${body}`;

      window.location.href = mailtoLink;

      // 모달 닫기 및 입력 초기화
      setFeedback('');
      onClose();
    }
  };

  const handleClose = () => {
    setFeedback('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      closeOnOverlayClick={false}
      showCloseButton={false}
      className="rounded-2xl overflow-hidden"
    >
      <ModalBody className="py-8 px-6">
        <div className="space-y-6">
          {/* 제목 */}
          <h3 className="text-center text-lg font-semibold text-gray-700">
            피드백 보내기
          </h3>

          {/* 안내 메시지 */}
          <p className="text-center text-sm text-text-secondary">
            개선사항이나 의견을 남겨주세요
          </p>

          {/* 텍스트 영역 */}
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="의견을 입력해주세요..."
            className="w-full h-32 px-4 py-3 border border-gray-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary placeholder-text-secondary"
            autoFocus
          />

          {/* 버튼 */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleClose}
              className="flex-1 py-2.5 focus:ring-4 focus:ring-gray-300 transition-all"
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={handleSend}
              disabled={!feedback.trim()}
              className="flex-1 py-2.5 focus:ring-4 focus:ring-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              보내기
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default FeedbackModal;
