import React, { useState, useEffect, useCallback, useRef } from 'react';

const QUIZ_ONBOARDING_KEY = 'talk100_quiz_onboarding_completed';

const QuizOnboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [targetRect, setTargetRect] = useState(null);
  const retryCountRef = useRef(0);

  const steps = [
    {
      id: 'input-mode',
      selector: '[data-onboarding="input-mode"]',
      title: '입력 모드',
      description: '키보드로 직접 입력하거나\n음성으로 답변할 수 있어요.\n 기본이 음성모드입니다.',
      position: 'bottom'
    },
    {
      id: 'hint-answer',
      selector: '[data-onboarding="hint-answer"]',
      title: '힌트 / 정답보기',
      description: '힌트보기는 첫번째 글자를\n정답보기는 모든 단어를 보여줍니다.',
      position: 'top'
    },
    {
      id: 'favorite-star',
      selector: '[data-onboarding="favorite-star"]',
      title: '즐겨찾기 / 틀린문제',
      description: '문제를 ❤️로 즐겨찾기에 추가하거나\n⭐로 틀린문제에 추가할 수 있어요.',
      position: 'bottom'
    }
  ];

  // 타겟 요소의 위치 계산 (viewport 기준)
  const updateTargetRect = useCallback(() => {
    const step = steps[currentStep];
    if (!step) return false;

    // 같은 selector를 가진 모든 요소 중 보이는 것 찾기
    const elements = document.querySelectorAll(step.selector);
    let visibleElement = null;

    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      // 보이는 요소인지 확인 (width, height > 0 && viewport 내)
      if (rect.width > 0 && rect.height > 0) {
        visibleElement = el;
        break;
      }
    }

    if (visibleElement) {
      const rect = visibleElement.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom
      });
      return true;
    }
    return false;
  }, [currentStep]);

  // 온보딩 표시 여부 확인
  useEffect(() => {
    const completed = localStorage.getItem(QUIZ_ONBOARDING_KEY);
    if (!completed) {
      setTimeout(() => {
        setIsVisible(true);
      }, 1000); // 퀴즈 페이지 로딩 후 표시
    }
  }, []);

  // 현재 단계의 타겟 위치 업데이트
  useEffect(() => {
    if (!isVisible) return;

    setIsReady(false);
    retryCountRef.current = 0;

    const findAndHighlight = () => {
      const step = steps[currentStep];
      if (!step) return;

      // 보이는 요소 찾기
      const elements = document.querySelectorAll(step.selector);
      let visibleElement = null;

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          visibleElement = el;
          break;
        }
      }

      if (visibleElement) {
        // 요소로 스크롤
        visibleElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // 스크롤 완료 후 위치 계산 (재시도 로직 포함)
        const tryUpdateRect = () => {
          const success = updateTargetRect();
          if (success) {
            setIsReady(true);
          } else if (retryCountRef.current < 10) {
            retryCountRef.current++;
            setTimeout(tryUpdateRect, 100);
          }
        };

        setTimeout(tryUpdateRect, 300);
      }
    };

    findAndHighlight();

    // 윈도우 리사이즈/스크롤 시 위치 재계산
    const handleUpdate = () => {
      updateTargetRect();
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate);

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate);
    };
  }, [isVisible, currentStep, updateTargetRect]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(QUIZ_ONBOARDING_KEY, 'true');
    setIsVisible(false);
    setIsReady(false);
    onComplete?.();
  };

  // isReady와 targetRect가 유효할 때만 렌더링
  if (!isVisible || !isReady || !targetRect || targetRect.width === 0) return null;

  const step = steps[currentStep];
  const padding = 8;

  // 말풍선 위치 계산
  const tooltipWidth = 320;
  const tooltipLeft = Math.max(16, Math.min(
    targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
    window.innerWidth - tooltipWidth - 16
  ));

  // 화살표 위치 (말풍선 내에서의 상대 위치)
  const arrowLeft = Math.min(
    Math.max(targetRect.left + targetRect.width / 2 - tooltipLeft, 24),
    tooltipWidth - 24
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* 반투명 오버레이 - 4개의 div로 스포트라이트 구현 */}
      {/* 상단 */}
      <div
        className="absolute bg-black/70 left-0 right-0 top-0"
        style={{ height: Math.max(0, targetRect.top - padding) }}
      />
      {/* 하단 */}
      <div
        className="absolute bg-black/70 left-0 right-0 bottom-0"
        style={{ top: targetRect.bottom + padding }}
      />
      {/* 좌측 */}
      <div
        className="absolute bg-black/70"
        style={{
          top: targetRect.top - padding,
          left: 0,
          width: Math.max(0, targetRect.left - padding),
          height: targetRect.height + padding * 2
        }}
      />
      {/* 우측 */}
      <div
        className="absolute bg-black/70"
        style={{
          top: targetRect.top - padding,
          left: targetRect.left + targetRect.width + padding,
          right: 0,
          height: targetRect.height + padding * 2
        }}
      />

      {/* 하이라이트 테두리 */}
      <div
        className="absolute border-2 border-primary rounded-xl pointer-events-none"
        style={{
          top: targetRect.top - padding,
          left: targetRect.left - padding,
          width: targetRect.width + padding * 2,
          height: targetRect.height + padding * 2,
          boxShadow: '0 0 0 4px rgba(85, 173, 155, 0.3)'
        }}
      />

      {/* 말풍선 */}
      <div
        className="absolute z-10"
        style={{
          top: step.position === 'bottom'
            ? targetRect.bottom + padding + 16
            : targetRect.top - padding - 16,
          left: tooltipLeft,
          width: tooltipWidth,
          transform: step.position === 'top' ? 'translateY(-100%)' : 'none'
        }}
      >
        {/* 화살표 (위쪽 - 말풍선이 아래에 있을 때) */}
        {step.position === 'bottom' && (
          <div
            className="absolute -top-2 w-4 h-4 bg-white rotate-45 z-0"
            style={{ left: arrowLeft - 8 }}
          />
        )}

        {/* 카드 내용 */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10">
          <div className="p-5">
            {/* 단계 표시 */}
            <div className="flex justify-center gap-1.5 mb-3">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* 제목 */}
            <h3 className="text-lg font-bold text-center text-gray-800 mb-2">
              {step.title}
            </h3>

            {/* 설명 */}
            <p className="text-center text-gray-600 text-sm whitespace-pre-line leading-relaxed mb-4">
              {step.description}
            </p>

            {/* 버튼 영역 */}
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                건너뛰기
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors"
              >
                {currentStep < steps.length - 1 ? '다음' : '시작하기'}
              </button>
            </div>
          </div>
        </div>

        {/* 화살표 (아래쪽 - 말풍선이 위에 있을 때) */}
        {step.position === 'top' && (
          <div
            className="absolute -bottom-2 w-4 h-4 bg-white rotate-45 z-0"
            style={{ left: arrowLeft - 8 }}
          />
        )}
      </div>
    </div>
  );
};

export default QuizOnboarding;

// 온보딩 상태 리셋 (개발/테스트용)
export const resetQuizOnboarding = () => {
  localStorage.removeItem(QUIZ_ONBOARDING_KEY);
};
