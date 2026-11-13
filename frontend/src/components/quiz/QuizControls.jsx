import { playEffectSound } from '../../utils/soundEffects';
import { useState } from 'react';
import Button from '../ui/Button';
import { getIcon } from '../../utils/iconMap';
import './QuizControls.css';

// 공통 버튼 스타일
const BUTTON_BASE_STYLE = "flex-1 p-3 bg-white border border-gray-border rounded-brand-sm transition-all duration-200 active:bg-primary-light active:scale-[0.97] active:border-primary flex flex-col items-center gap-1";
const LABEL_STYLE = "text-xs text-text-primary";

export const QuizControls = ({
  inputMode = 'voice',
  quizMode = 'solving',
  isRecording = false,
  voiceStatus = 'idle',
  onMainAction,
  onPlayAudio,
  onPlayAudioSlow, // 0.5배속 재생
  onShowFirstLetters,
  onShowFullAnswer,
  onSkipQuestion,
  showHint = false,
  showAnswer = false
}) => {
  const [clickedButton, setClickedButton] = useState(null);
  const isVoicePreparing = inputMode === 'voice' && voiceStatus === 'starting';
  const isVoiceStopping = inputMode === 'voice' && voiceStatus === 'stopping';
  const isVoiceCapturing = inputMode === 'voice' && voiceStatus === 'listening';

  // 버튼 클릭 핸들러 (애니메이션 효과)
  const handleButtonClick = (buttonName, callback) => {
    if (buttonName === 'skipQuestion') playEffectSound('click');
    setClickedButton(buttonName);
    setTimeout(() => setClickedButton(null), 300);
    callback?.();
  };

  if (quizMode === 'solving' && inputMode === 'voice') {
    const capturing = isVoiceCapturing || isRecording;
    const label = isVoicePreparing ? '마이크 연결 취소' : isVoiceStopping ? '인식 마무리 중' : capturing ? '듣고 있어요' : '눌러서 말하기';
    return (
      <div className="fixed bottom-0 left-0 right-0 z-100 rounded-t-[2rem] bg-white shadow-[0_-8px_32px_rgba(0,0,0,0.06)] md:left-1/2 md:w-[768px] md:-translate-x-1/2 lg:w-[900px]">
        <div className="grid grid-cols-[1fr_144px_1fr] items-end gap-1 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="flex justify-center" data-onboarding="hint-answer">
            <button type="button" aria-pressed={showHint} onClick={() => { playEffectSound('select'); onShowFirstLetters?.(); }} className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-2 text-xs focus-visible:outline-primary ${showHint ? 'bg-primary-light text-primary-dark' : 'text-text-secondary'}`}>
              {getIcon('AiOutlineQuestionCircle', { size: '2xl' })}<span>힌트보기</span>
            </button>
          </div>
          <div className="-mt-12 flex flex-col items-center gap-3">
            <div className={`quiz-mic ${capturing ? 'quiz-mic--recording' : isVoicePreparing || isVoiceStopping ? 'quiz-mic--busy' : 'quiz-mic--ready'}`}>
              <span className="quiz-mic__wave quiz-mic__wave--first" aria-hidden="true" />
              <span className="quiz-mic__wave quiz-mic__wave--second" aria-hidden="true" />
              <button type="button" onClick={onMainAction} disabled={isVoiceStopping} aria-label={capturing ? '말하기 완료 · 녹음 중지' : label} aria-busy={isVoicePreparing || isVoiceStopping} aria-pressed={capturing} aria-describedby="quiz-voice-status" className="quiz-mic__button">
                {isVoicePreparing || isVoiceStopping ? (
                  <span aria-hidden="true" className="h-10 w-10 animate-spin rounded-full border-4 border-current border-t-transparent" />
                ) : capturing ? (
                  <svg aria-hidden="true" width="44" height="44" viewBox="0 0 48 48" fill="currentColor"><rect x="12" y="12" width="24" height="24" rx="6" /></svg>
                ) : (
                  <svg aria-hidden="true" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="18" y="5" width="12" height="25" rx="6" />
                    <path d="M11 22v3a13 13 0 0 0 26 0v-3M24 38v6M17 44h14" />
                  </svg>
                )}
              </button>
            </div>
            <span className={`quiz-mic__label ${capturing ? 'text-error' : 'text-primary'}`}>{label}</span>
          </div>
          <button type="button" aria-pressed={showAnswer} onClick={() => { playEffectSound('select'); onShowFullAnswer?.(); }} className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-2 text-xs focus-visible:outline-primary ${showAnswer ? 'bg-primary-light text-primary-dark' : 'text-text-secondary'}`}>
            {getIcon('AiOutlineCheckCircle', { size: '2xl' })}<span>정답보기</span>
          </button>
        </div>
        <p id="quiz-voice-status" role="status" aria-live="polite" className="sr-only">
          {isVoicePreparing ? '마이크를 연결하고 있어요. 다시 누르면 취소돼요.' : capturing ? '듣고 있어요. 다 말하면 가운데 버튼을 눌러주세요.' : isVoiceStopping ? '말씀하신 답을 확인하고 있어요.' : ''}
        </p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:w-[768px] lg:w-[900px] bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.08)] z-100">
      <div className="p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:p-4 md:pb-[calc(1rem+env(safe-area-inset-bottom))]">

        {/* 힌트/정답 보기 버튼들 (문제풀이 모드에서만) */}
        {quizMode === 'solving' && (
          <div className="flex gap-2 mb-3" data-onboarding="hint-answer">
            <button
              onClick={() => { playEffectSound('select'); onShowFirstLetters?.(); }}
              className={`flex-1 px-3 py-2 md:p-3 border border-gray-border rounded-brand-sm transition-all duration-200 active:scale-[0.97] flex flex-row md:flex-col items-center justify-center gap-1.5 md:gap-1 ${showHint ? 'bg-primary-light border-primary' : 'bg-white active:bg-primary-light active:border-primary'}`}
            >
              {getIcon('AiOutlineQuestionCircle', {
                size: 'xl',
                className: showHint ? 'text-white' : 'text-gray-600'
              })}
              <span className={`${LABEL_STYLE} font-semibold ${showHint ? 'text-white' : ''}`}>힌트보기</span>
            </button>
            <button
              onClick={() => { playEffectSound('select'); onShowFullAnswer?.(); }}
              className={`flex-1 px-3 py-2 md:p-3 border border-gray-border rounded-brand-sm transition-all duration-200 active:scale-[0.97] flex flex-row md:flex-col items-center justify-center gap-1.5 md:gap-1 ${showAnswer ? 'bg-primary-light border-primary' : 'bg-white active:bg-primary-light active:border-primary'}`}
            >
              {getIcon('AiOutlineCheckCircle', {
                size: 'xl',
                className: showAnswer ? 'text-white' : 'text-gray-600'
              })}
              <span className={`${LABEL_STYLE} font-semibold ${showAnswer ? 'text-white' : ''}`}>정답보기</span>
            </button>
          </div>
        )}

        {/* 컨트롤 버튼들 (채점모드에서만) - 다시 듣기 x0.8, x1.0, 다음 문제 */}
        {quizMode === 'grading' && (
          <div className="flex gap-2 mb-3">
            {[
              { name: 'playAudioSlow', speed: '0.8', action: onPlayAudioSlow, tone: 'slow' },
              { name: 'playAudio', speed: '1.0', action: onPlayAudio, tone: 'normal' }
            ].map(({ name, speed, action, tone }) => (
              <button
                key={name}
                type="button"
                aria-label={`다시 듣기 ${speed}배속`}
                onClick={() => handleButtonClick(name, action)}
                className={`quiz-replay quiz-replay--${tone} ${clickedButton === name ? 'quiz-replay--pressed' : ''}`}
              >
                <span className="quiz-replay__icon" aria-hidden="true">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                    <path d="M15 9a5 5 0 0 1 0 6" />
                    {tone === 'normal' && <path d="M18 6a9 9 0 0 1 0 12" />}
                  </svg>
                </span>
                <span className="quiz-replay__label">다시 듣기</span>
                <span className="quiz-replay__speed">x{speed}</span>
              </button>
            ))}
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
        {quizMode === 'grading' && (
          <p className="mb-2 text-center text-xs text-text-secondary">
            <span className="hidden md:inline">→ 방향키로 다음 문제</span>
            <span className="md:hidden">왼쪽으로 스와이프하면 다음 문제</span>
          </p>
        )}
        {quizMode === 'solving' && inputMode === 'voice' && (
          <p role="status" aria-live="polite" className="mb-2 text-center text-sm text-text-secondary">
            {isVoicePreparing ? '브라우저에서 마이크를 연결하고 있어요.'
              : isVoiceCapturing ? '이제 말씀하세요. 끝나면 녹음 중지를 눌러주세요.'
              : isVoiceStopping ? '인식 결과를 확인하고 있어요. 잠시 기다려주세요.'
              : '버튼을 누르고 정답을 말씀해주세요.'}
          </p>
        )}
        {/* 메인 액션 버튼 (문제풀이 모드에서만) */}
        {quizMode === 'solving' && (
          <Button
            sound={false}
            disabled={isVoiceStopping}
            aria-busy={isVoicePreparing || isVoiceStopping}
            onClick={onMainAction}
            size="lg"
            shape="pill"
            className={`w-full py-3 md:py-6 text-base md:text-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
              isVoiceCapturing
                ? 'bg-error hover:bg-red-600 animate-pulse'
                : 'btn-primary'
            }`}
          >
            {inputMode === 'voice' ? (
              <>
                {isVoicePreparing ? (
                  <>
                    <span aria-hidden="true" className="h-5 w-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    <span>녹음 시작 · 취소</span>
                  </>
                ) : isVoiceStopping ? (
                  <span>인식 마무리 중...</span>
                ) : isRecording ? (
                  <>
                    {getIcon('IoStop', { size: '2xl' })}
                    <span>이제 말씀하세요 · 녹음 중지</span>
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