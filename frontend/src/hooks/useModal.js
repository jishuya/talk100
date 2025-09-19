import { useState, useCallback } from 'react';

const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [modalData, setModalData] = useState(null);

  const openModal = useCallback((data = null) => {
    setModalData(data);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    // 애니메이션 완료 후 데이터 클리어
    setTimeout(() => {
      setModalData(null);
    }, 300);
  }, []);

  const toggleModal = useCallback((data = null) => {
    if (isOpen) {
      closeModal();
    } else {
      openModal(data);
    }
  }, [isOpen, openModal, closeModal]);

  return {
    isOpen,
    modalData,
    openModal,
    closeModal,
    toggleModal,
  };
};

export default useModal;