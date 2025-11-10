import { useState } from 'react';
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
  onPlayAudioSlow, // 0.5배속 재생
  onShowFirstLetters,
  onShowFullAnswer,
  onSkipQuestion,
  showHint = false,
  showAnswer = false,
  gradingResult = null
}) => {
  const [clickedButton, setClickedButton] = useState(null);

  // 버튼 클릭 핸들러 (애니메이션 효과)
  const handleButtonClick = (buttonName, callback) => {
    setClickedButton(buttonName);
    setTimeout(() => setClickedButton(null), 300);
    callback?.();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:w-[768px] lg:w-[900px] bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.08)] z-100">
      <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">

        {/* 힌트/정답 보기 버튼들 (문제풀이 모드에서만) */}
        {quizMode === 'solving' && (
          <div className="flex gap-2 mb-3">
            <button
              onClick={onShowFirstLetters}
              className={`flex-1 p-3 border border-gray-border rounded-brand-sm transition-all duration-200 active:scale-[0.97] flex flex-col items-center gap-1 ${showHint ? 'bg-primary-light border-primary' : 'bg-white active:bg-primary-light active:border-primary'}`}
            >
              {getIcon('AiOutlineQuestionCircle', {
                size: 'xl',
                className: showHint ? 'text-white' : 'text-gray-600'
              })}
              <span className={`${LABEL_STYLE} font-semibold ${showHint ? 'text-white' : ''}`}>힌트보기</span>
            </button>
            <button
              onClick={onShowFullAnswer}
              className={`flex-1 p-3 border border-gray-border rounded-brand-sm transition-all duration-200 active:scale-[0.97] flex flex-col items-center gap-1 ${showAnswer ? 'bg-primary-light border-primary' : 'bg-white active:bg-primary-light active:border-primary'}`}
            >
              {getIcon('AiOutlineCheckCircle', {
                size: 'xl',
                className: showAnswer ? 'text-white' : 'text-gray-600'
              })}
              <span className={`${LABEL_STYLE} font-semibold ${showAnswer ? 'text-white' : ''}`}>정답보기</span>
            </button>
          </div>
        )}

        {/* 컨트롤 버튼들 (채점모드에서만) - 다시듣기 x0.5, x1, 다음문제 */}
        {quizMode === 'grading' && (
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => handleButtonClick('playAudioSlow', onPlayAudioSlow)}
              className={`flex-1 p-3 border rounded-brand-sm transition-all duration-200 flex flex-col items-center gap-1 ${
                clickedButton === 'playAudioSlow'
                  ? 'bg-primary border-primary scale-95 shadow-lg'
                  : 'bg-white border-gray-border hover:border-primary active:scale-[0.97]'
              }`}
            >
              {getIcon('IoVolumeHigh', {
                size: 'xl',
                className: clickedButton === 'playAudioSlow' ? 'text-white animate-pulse' : 'text-gray-600'
              })}
              <span className={`${LABEL_STYLE} ${clickedButton === 'playAudioSlow' ? 'text-white font-bold' : ''}`}>다시 듣기 x0.8</span>
            </button>
            <button
              onClick={() => handleButtonClick('playAudio', onPlayAudio)}
              className={`flex-1 p-3 border rounded-brand-sm transition-all duration-200 flex flex-col items-center gap-1 ${
                clickedButton === 'playAudio'
                  ? 'bg-primary border-primary scale-95 shadow-lg'
                  : 'bg-white border-gray-border hover:border-primary active:scale-[0.97]'
              }`}
            >
              {getIcon('IoVolumeHigh', {
                size: 'xl',
                className: clickedButton === 'playAudio' ? 'text-white animate-pulse' : 'text-gray-600'
              })}
              <span className={`${LABEL_STYLE} ${clickedButton === 'playAudio' ? 'text-white font-bold' : ''}`}>다시 듣기 x1</span>
            </button>
            <button
              onClick={() => handleButtonClick('skipQuestion', onSkipQuestion)}
              className={`flex-1 p-3 border rounded-brand-sm transition-all duration-200 flex flex-col items-center gap-1 ${
                clickedButton === 'skipQuestion'
                  ? 'bg-primary border-primary scale-95 shadow-lg'
                  : 'bg-white border-gray-border hover:border-primary active:scale-[0.97]'
              }`}
            >
              {getIcon('IoPlayForward', {
                size: 'xl',
                className: clickedButton === 'skipQuestion' ? 'text-white animate-pulse' : 'text-gray-600'
              })}
              <span className={`${LABEL_STYLE} ${clickedButton === 'skipQuestion' ? 'text-white font-bold' : ''}`}>다음 문제</span>
            </button>
          </div>
        )}
        {/* 메인 액션 버튼 (문제풀이 모드에서만) */}
        {quizMode === 'solving' && (
          <Button
            onClick={onMainAction}
            size="lg"
            shape="pill"
            className={`w-full py-6 text-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
              isRecording
                ? 'bg-error hover:bg-red-600 animate-pulse'
                : 'btn-primary'
            }`}
          >
            {inputMode === 'voice' ? (
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