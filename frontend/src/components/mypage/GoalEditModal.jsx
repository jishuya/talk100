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
    monthlyGoal: 30,
    targetAccuracy: 80
  });

  useEffect(() => {
    if (goals) {
      setFormData(goals);
    }
  }, [goals]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseInt(value) || 0
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const isValid = formData.dailyGoal >= 1 && formData.dailyGoal <= 10 &&
                  formData.monthlyGoal >= 1 && formData.monthlyGoal <= 31 &&
                  formData.targetAccuracy >= 50 && formData.targetAccuracy <= 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-[320px] max-h-[85vh] flex flex-col">
        <h3 className="text-lg font-semibold mb-4 text-center">학습 목표 수정</h3>

        <div className="mb-5 flex-1 overflow-y-auto">
          <div className="mb-4">
            <label className="text-sm text-text-secondary mb-2 block">
              일일 목표 Day 수
            </label>
            <input
              type="number"
              className="w-full p-3 border border-gray-border rounded-xl text-base focus:border-primary focus:outline-none"
              value={formData.dailyGoal}
              min="1"
              max="10"
              onChange={(e) => handleInputChange('dailyGoal', e.target.value)}
            />
            <div className="text-xs text-text-secondary mt-1">1일 ~ 10일 사이로 설정하세요</div>
          </div>

          <div className="mb-4">
            <label className="text-sm text-text-secondary mb-2 block">
              월간 목표 학습일
            </label>
            <input
              type="number"
              className="w-full p-3 border border-gray-border rounded-xl text-base focus:border-primary focus:outline-none"
              value={formData.monthlyGoal}
              min="1"
              max="31"
              onChange={(e) => handleInputChange('monthlyGoal', e.target.value)}
            />
            <div className="text-xs text-text-secondary mt-1">1일 ~ 31일 사이로 설정하세요</div>
          </div>

          <div className="mb-4">
            <label className="text-sm text-text-secondary mb-2 block">
              목표 정답률 (%)
            </label>
            <input
              type="number"
              className="w-full p-3 border border-gray-border rounded-xl text-base focus:border-primary focus:outline-none"
              value={formData.targetAccuracy}
              min="50"
              max="100"
              onChange={(e) => handleInputChange('targetAccuracy', e.target.value)}
            />
            <div className="text-xs text-text-secondary mt-1">50% ~ 100% 사이로 설정하세요</div>
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