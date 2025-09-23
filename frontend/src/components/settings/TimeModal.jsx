import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

const TimeModal = ({
  isOpen,
  onClose,
  initialTime,
  onSave,
  title = '알림 시간 설정'
}) => {
  const [hour, setHour] = useState(20);
  const [minute, setMinute] = useState(0);

  useEffect(() => {
    if (initialTime) {
      setHour(initialTime.hour || 20);
      setMinute(initialTime.minute || 0);
    }
  }, [initialTime]);

  const handleSave = () => {
    onSave({ hour, minute });
    onClose();
  };

  const formatDisplayTime = (h, m) => {
    const period = h >= 12 ? '오후' : '오전';
    const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    const displayMinute = m.toString().padStart(2, '0');
    return `${period} ${displayHour}:${displayMinute}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-[320px] max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>

        <div className="mb-5">
          <div className="flex items-center justify-center gap-3 p-5 bg-gray-light rounded-xl">
            <input
              type="number"
              className="w-[60px] p-2 text-2xl text-center border border-gray-border rounded-lg bg-white focus:border-primary focus:outline-none"
              value={hour.toString().padStart(2, '0')}
              min="0"
              max="23"
              onChange={(e) => setHour(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
            />
            <span className="text-2xl font-bold">:</span>
            <input
              type="number"
              className="w-[60px] p-2 text-2xl text-center border border-gray-border rounded-lg bg-white focus:border-primary focus:outline-none"
              value={minute.toString().padStart(2, '0')}
              min="0"
              max="59"
              onChange={(e) => setMinute(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
            />
          </div>
          <div className="text-center mt-3">
            <div className="text-lg font-semibold text-primary">
              {formatDisplayTime(hour, minute)}
            </div>
            <div className="text-xs text-text-secondary mt-1">
              매일 이 시간에 학습 알림을 보내드려요
            </div>
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
            확인
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TimeModal;