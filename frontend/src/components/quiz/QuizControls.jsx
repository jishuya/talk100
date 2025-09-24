import Button from '../ui/Button';
import { getIcon } from '../../utils/iconMap';

// 공통 버튼 스타일
const BUTTON_BASE_STYLE = "flex-1 p-3 bg-white border border-gray-border rounded-brand-sm transition-all duration-200 active:bg-primary-light active:scale-[0.97] active:border-primary flex flex-col items-center gap-1";
const LABEL_STYLE = "text-xs text-text-primary";

export const QuizControls = ({
  inputMode = 'voice',
  quizMode = 'solving',
  isRecording = false,
  onMainAction,
  onPlayAudio,
  onShowHint,
  onShowFirstLetters,
  onShowFullAnswer,
  onSkipQuestion,
  isSubmitting = false,
  showHint = false,
  showAnswer = false
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:w-[768px] lg:w-[900px] bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.08)] z-100">
      <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">

        {/* 힌트/정답 보기 버튼들 (문제풀이 모드에서만) */}
        {quizMode === 'solving' && (
          <div className="flex gap-2 mb-3">
            <button
              onClick={onShowFirstLetters}
              className={`${BUTTON_BASE_STYLE} ${showHint ? 'border-primary bg-primary-light' : ''}`}
            >
              {getIcon('AiOutlineQuestionCircle', {
                size: 'xl',
                className: showHint ? 'text-[#55AD9B]' : 'text-gray-600'
              })}
              <span className={`${LABEL_STYLE} ${showHint ? 'text-[#55AD9B]' : ''}`}>힌트보기</span>
            </button>
            <button
              onClick={onShowFullAnswer}
              className={`${BUTTON_BASE_STYLE} ${showAnswer ? 'border-primary bg-primary-light' : ''}`}
            >
              {getIcon('AiOutlineCheckCircle', {
                size: 'xl',
                className: showAnswer ? 'text-[#55AD9B]' : 'text-gray-600'
              })}
              <span className={`${LABEL_STYLE} ${showAnswer ? 'text-[#55AD9B]' : ''}`}>정답보기</span>
            </button>
          </div>
        )}
        {/* 컨트롤 버튼들 (채점모드에서만) */}
        {quizMode === 'grading' && (
          <div className="flex gap-2 mb-3">
            <button onClick={onPlayAudio} className={BUTTON_BASE_STYLE}>
              {getIcon('IoVolumeHigh', { size: 'xl' })}
              <span className={LABEL_STYLE}>다시 듣기</span>
            </button>
            <button onClick={onShowHint} className={BUTTON_BASE_STYLE}>
              {getIcon('IoBulb', { size: 'xl' })}
              <span className={LABEL_STYLE}>힌트 보기</span>
            </button>
            <button onClick={onSkipQuestion} className={BUTTON_BASE_STYLE}>
              {getIcon('IoPlayForward', { size: 'xl' })}
              <span className={LABEL_STYLE}>다음 문제</span>
            </button>
          </div>
        )}
        {/* 메인 액션 버튼 (문제풀이 모드에서만) */}
        {quizMode === 'solving' && (
          <Button
            onClick={onMainAction}
            disabled={isSubmitting}
            size="lg"
            shape="pill"
            className={`w-full py-6 text-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
              isRecording
                ? 'bg-error hover:bg-red-600 animate-pulse'
                : 'btn-primary'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                <span>처리 중...</span>
              </>
            ) : inputMode === 'voice' ? (
              <>
                {isRecording ? (
                  <>
                    {getIcon('IoStop', { size: '2xl' })}
                    <span>녹음 중지</span>
                  </>
                ) : (
                  <>
                    {getIcon('IoMic', { size: '2xl' })}
                    <span>정답 말하기</span>
                  </>
                )}
              </>
            ) : (
              <>
                {getIcon('IoPencil', { size: '2xl' })}
                <span>답변 제출</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};