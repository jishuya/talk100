import React from 'react';
import { IoVolumeHigh, IoBulb, IoPlayForward, IoMic, IoStop, IoPencil } from 'react-icons/io5';
import Button from '../ui/Button';

export const QuizControls = ({
  inputMode = 'voice',
  isRecording = false,
  keyboardInput = '',
  onKeyboardInputChange,
  onMainAction,
  onPlayAudio,
  onShowHint,
  onSkipQuestion,
  isSubmitting = false
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onMainAction();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:w-[768px] lg:w-[900px] bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.08)] z-100">
      <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        {/* 키보드 입력 영역 */}
        {inputMode === 'keyboard' && (
          <div className="mb-3 p-3 bg-background rounded-brand-sm">
            <textarea
              value={keyboardInput}
              onChange={(e) => onKeyboardInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="영어로 번역해보세요..."
              className="w-full p-3 border border-gray-border rounded-brand-sm text-base bg-white resize-none min-h-[60px] focus:outline-none focus:border-primary transition-colors"
              rows={2}
            />
          </div>
        )}

        {/* 컨트롤 버튼들 */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={onPlayAudio}
            className="flex-1 p-3 bg-white border border-gray-border rounded-brand-sm transition-all duration-200 active:bg-primary-light active:scale-[0.97] active:border-primary flex flex-col items-center gap-1"
          >
            <IoVolumeHigh className="text-xl text-text-primary transition-colors duration-200 active:text-primary" />
            <span className="text-xs text-text-primary">다시 듣기</span>
          </button>

          <button
            onClick={onShowHint}
            className="flex-1 p-3 bg-white border border-gray-border rounded-brand-sm transition-all duration-200 active:bg-primary-light active:scale-[0.97] active:border-primary flex flex-col items-center gap-1"
          >
            <IoBulb className="text-xl text-text-primary transition-colors duration-200 active:text-primary" />
            <span className="text-xs text-text-primary">힌트 보기</span>
          </button>

          <button
            onClick={onSkipQuestion}
            className="flex-1 p-3 bg-white border border-gray-border rounded-brand-sm transition-all duration-200 active:bg-primary-light active:scale-[0.97] active:border-primary flex flex-col items-center gap-1"
          >
            <IoPlayForward className="text-xl text-text-primary transition-colors duration-200 active:text-primary" />
            <span className="text-xs text-text-primary">다음 문제</span>
          </button>
        </div>

        {/* 메인 액션 버튼 */}
        <Button
          onClick={onMainAction}
          disabled={isSubmitting}
          size="lg"
          shape="pill"
          className={`w-full py-4 text-base font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
            isRecording
              ? 'bg-error hover:bg-red-600 animate-pulse'
              : 'btn-primary'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              <span>처리 중...</span>
            </>
          ) : inputMode === 'voice' ? (
            <>
              {isRecording ? (
                <>
                  <IoStop className="text-xl" />
                  <span>녹음 중지</span>
                </>
              ) : (
                <>
                  <IoMic className="text-xl" />
                  <span>정답 말하기</span>
                </>
              )}
            </>
          ) : (
            <>
              <IoPencil className="text-xl" />
              <span>답변 제출</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};