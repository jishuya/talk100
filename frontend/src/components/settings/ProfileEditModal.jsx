import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

const ProfileEditModal = ({
  isOpen,
  onClose,
  profile,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    email: ''
  });

  // 모달이 열릴 때마다 초기값으로 리셋
  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        name: profile.nickname || '',
        email: profile.email || ''
      });
      // 에러도 초기화
      setErrors({
        name: '',
        email: ''
      });
    }
  }, [isOpen, profile]);

  const validateName = (name) => {
    if (!name.trim()) {
      return '이름을 입력해주세요.';
    }
    if (name.length < 2) {
      return '이름은 2자 이상이어야 합니다.';
    }
    if (name.length > 20) {
      return '이름은 20자 이하여야 합니다.';
    }
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return '이메일을 입력해주세요.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return '올바른 이메일 형식이 아닙니다.';
    }
    return '';
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 실시간 유효성 검사
    if (field === 'name') {
      setErrors(prev => ({
        ...prev,
        name: validateName(value)
      }));
    } else if (field === 'email') {
      setErrors(prev => ({
        ...prev,
        email: validateEmail(value)
      }));
    }
  };

  const handleSave = () => {
    // 최종 유효성 검사
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);

    setErrors({
      name: nameError,
      email: emailError
    });

    // 에러가 있으면 저장하지 않음
    if (nameError || emailError) {
      return;
    }

    onSave(formData);
    onClose();
  };

  const isValid = formData.name.trim() &&
                  formData.email.trim() &&
                  !errors.name &&
                  !errors.email;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6 max-h-[85vh] flex flex-col">
        <h3 className="text-lg font-semibold mb-4 text-center">프로필 수정</h3>

        <div className="mb-5 flex-1 overflow-y-auto">
          {/* 이름 입력 */}
          <div className="mb-4">
            <label className="text-sm text-text-secondary mb-2 block">
              이름
            </label>
            <input
              type="text"
              className={`w-full p-3 border rounded-xl text-base focus:outline-none ${
                errors.name
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-border focus:border-primary'
              }`}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="이름을 입력하세요"
            />
            {errors.name && (
              <div className="text-xs text-red-500 mt-1">{errors.name}</div>
            )}
            {!errors.name && (
              <div className="text-xs text-text-secondary mt-1">2자 ~ 20자 사이로 입력하세요</div>
            )}
          </div>

          {/* 이메일 입력 */}
          <div className="mb-4">
            <label className="text-sm text-text-secondary mb-2 block">
              이메일
            </label>
            <input
              type="email"
              className={`w-full p-3 border rounded-xl text-base focus:outline-none ${
                errors.email
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-border focus:border-primary'
              }`}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="이메일을 입력하세요"
            />
            {errors.email && (
              <div className="text-xs text-red-500 mt-1">{errors.email}</div>
            )}
            {!errors.email && (
              <div className="text-xs text-text-secondary mt-1">올바른 이메일 형식으로 입력하세요</div>
            )}
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

export default ProfileEditModal;
