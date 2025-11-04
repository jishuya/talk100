import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

const GoalEditModal = ({
  isOpen,
  onClose,
  goals,
  onSave
}) => {
  const [formData, setFormData] = useState({
    dailyGoal: 2,
    weeklyAttendance: 3,
    weeklyTotalQuiz: 30
  });

  useEffect(() => {
    if (goals) {
      setFormData(goals);
    }
  }, [goals]);

  const handleInputChange = (field, value) => {
    // 빈 문자열이면 0으로 처리
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        [field]: 0
      }));
      return;
    }

    const numValue = parseInt(value);

    // 숫자가 아니면 무시
    if (isNaN(numValue)) {
      return;
    }

    // 필드별 범위 체크 및 제한
    let limitedValue = numValue;
    if (field === 'dailyGoal') {
      limitedValue = Math.min(Math.max(numValue, 1), 10);
    } else if (field === 'weeklyAttendance') {
      limitedValue = Math.min(Math.max(numValue, 1), 7);
    } else if (field === 'weeklyTotalQuiz') {
      limitedValue = Math.min(Math.max(numValue, 1), 100);
    }

    setFormData(prev => ({
      ...prev,
      [field]: limitedValue
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const isValid = formData.dailyGoal >= 1 && formData.dailyGoal <= 10 &&
                  formData.weeklyAttendance >= 1 && formData.weeklyAttendance <= 7 &&
                  formData.weeklyTotalQuiz >= 1 && formData.weeklyTotalQuiz <= 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6 max-h-[85vh] flex flex-col">
        <h3 className="text-lg font-semibold mb-4 text-center">학습 목표 수정</h3>

        <div className="mb-5 flex-1 overflow-y-auto">
          <div className="mb-4">
            <label className="text-sm text-text-secondary mb-2 block">
              일일 학습목표
            </label>
            <input
              type="number"
              className="w-full p-3 border border-gray-border rounded-xl text-base focus:border-primary focus:outline-none"
              value={formData.dailyGoal}
              min="1"
              max="10"
              onChange={(e) => handleInputChange('dailyGoal', e.target.value)}
            />
            <div className="text-xs text-text-secondary mt-1">1개 ~ 10개 사이로 설정하세요</div>
          </div>

          <div className="mb-4">
            <label className="text-sm text-text-secondary mb-2 block">
              주간 목표 출석일
            </label>
            <input
              type="number"
              className="w-full p-3 border border-gray-border rounded-xl text-base focus:border-primary focus:outline-none"
              value={formData.weeklyAttendance}
              min="1"
              max="7"
              onChange={(e) => handleInputChange('weeklyAttendance', e.target.value)}
            />
            <div className="text-xs text-text-secondary mt-1">1일 ~ 7일 사이로 설정하세요</div>
          </div>

          <div className="mb-4">
            <label className="text-sm text-text-secondary mb-2 block">
              주간 목표 문제수
            </label>
            <input
              type="number"
              className="w-full p-3 border border-gray-border rounded-xl text-base focus:border-primary focus:outline-none"
              value={formData.weeklyTotalQuiz}
              min="1"
              max="100"
              onChange={(e) => handleInputChange('weeklyTotalQuiz', e.target.value)}
            />
            <div className="text-xs text-text-secondary mt-1">1개 ~ 100개 사이로 설정하세요</div>
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
            disabled={!isValid}
          >
            저장
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GoalEditModal;