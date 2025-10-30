import { useState } from 'react';
import Modal, { ModalBody } from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { getIcon } from '../utils/iconMap';

/**
 * 목표 달성 모달 디자인 샘플 - 샘플 10 (최종 선택)
 *
 * 사용법:
 * 1. App.jsx에서 import해서 렌더링
 * 2. "미리보기" 버튼을 클릭하면 모달 확인 가능
 */

const GoalModalSamples = () => {
  const [activeModal, setActiveModal] = useState(null);

  // 샘플 Streak 데이터
  const sampleStreak = {
    current_streak: 7,
    best_streak: 15
  };

  const closeModal = () => setActiveModal(null);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          목표 달성 모달 - 샘플 10 (최종)
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-3 text-gray-800">샘플 10: 민트 그라데이션</h3>
          <p className="text-sm text-gray-600 mb-4">민트 색상 강조. 상큼하고 깔끔한 느낌. bounce 애니메이션과 장식 효과.</p>
          <Button onClick={() => setActiveModal('sample10')} variant="primary">
            미리보기
          </Button>
        </div>

        {/* 샘플 10: 민트 그라데이션 카드 (최종) */}
        <Modal
          isOpen={activeModal === 'sample10'}
          onClose={closeModal}
          size="sm"
          className="rounded-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-br from-primary-light via-primary to-primary-dark py-8 px-6 relative">
            <div className="text-center relative z-10">
              <div className="inline-block mb-3 animate-bounce">
                {getIcon('IoPartyPopper', { size: '5xl' })}
              </div>
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                오늘의 목표 달성!
              </h2>
            </div>
            {/* 장식 효과 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>

          <ModalBody className="py-6 px-6">
            <div className="space-y-5">
              {/* 민트 그라데이션 카드 */}
              <div className="flex gap-3">
                <div className="flex-1 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl p-4 border border-primary/30 hover:shadow-lg transition-shadow">
                  <div className="flex justify-center mb-2">
                    {getIcon('IoFire', { size: '3xl' })}
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{sampleStreak.current_streak}일</div>
                    <div className="text-xs text-gray-600 mt-1">연속 학습</div>
                  </div>
                </div>

                <div className="flex-1 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl p-4 border border-primary/30 hover:shadow-lg transition-shadow">
                  <div className="flex justify-center mb-2">
                    {getIcon('IoTrophy', { size: '3xl' })}
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{sampleStreak.best_streak}일</div>
                    <div className="text-xs text-gray-600 mt-1">최고 기록</div>
                  </div>
                </div>
              </div>

              {/* 질문 */}
              <p className="text-center text-base text-gray-600 pt-2">
                추가 학습을 하시겠습니까?
              </p>

              {/* 버튼 */}
              <div className="flex gap-3">
                <Button variant="secondary" onClick={closeModal} className="flex-1 py-2.5">
                  홈으로
                </Button>
                <Button variant="primary" onClick={closeModal} className="flex-1 py-2.5">
                  계속하기
                </Button>
              </div>
            </div>
          </ModalBody>
        </Modal>

      </div>
    </div>
  );
};

export default GoalModalSamples;
