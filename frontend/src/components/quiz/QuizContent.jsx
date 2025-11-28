import { useEffect } from 'react';
import { IconButton } from '../ui/Button';
import { getIcon } from '../../utils/iconMap';

// 카테고리 ID를 이름으로 변환하는 함수
const getCategoryName = (categoryId) => {
  const categoryMap = {
    1: 'Model Example',
    2: 'Small Talk',
    3: 'Cases in Point'
  };
  return categoryMap[categoryId] || 'Unknown Category';
};

export const QuizContent = ({
  question,
  userAnswer = '',
  inputMode = 'voice',
  quizMode = 'solving',
  showHint = false,
  showAnswer = false,
  keywordInputs = {},
  onKeywordInputChange,
  onKeywordKeyDown,
  onInputModeChange,
  onFavoriteToggle,
  onStarToggle,
  onClearHintAnswer,  // 힌트/정답 해제 콜백
  isFavorite = false,
  isStarred = false,
  gradingResult = null,
  isVoiceListening = false
}) => {
  // userAnswer 변경 로그
  useEffect(() => {
  }, [userAnswer, keywordInputs, gradingResult]);
  if (!question) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-text-secondary">문제를 불러오는 중...</p>
      </div>
    );
  }
  return (
    <main className="flex-1 overflow-y-auto p-3 pb-32 md:p-4 -webkit-overflow-scrolling-touch">
      {/* 퀴즈 박스 */}
      <div className="bg-white rounded-brand shadow-soft p-4 mb-3 md:p-5 md:mb-4">
        {/* Day & 카테고리 + 즐겨찾기/별표 버튼 (한 줄) */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          {/* 왼쪽: Day & 카테고리 */}
          <div className="flex gap-1.5 md:gap-2">
            <span className="px-2.5 py-1 md:px-3 md:py-1.5 bg-primary text-white rounded-full text-sm md:text-sm font-bold shadow-soft">
              Day {question.day}
            </span>
            <span className="px-2.5 py-1 md:px-3 md:py-1.5 bg-primary text-white rounded-full text-sm md:text-sm font-bold shadow-soft">
              {getCategoryName(question.categoryId)}
            </span>
          </div>
          {/* 오른쪽: 즐겨찾기/별표 버튼 */}
          <div className="flex gap-1 -mr-1">
            <IconButton
              icon={getIcon(isFavorite ? 'fluent:heart-24-filled' : 'fluent:heart-24-regular', {
                size: 'lg',
                className: 'text-red-400'
              })}
              onClick={onFavoriteToggle}
              variant="ghost"
              className="!p-1"
            />
            <IconButton
              icon={getIcon(isStarred ? 'fluent:star-24-filled' : 'fluent:star-24-regular', {
                size: 'lg',
                className: 'text-yellow-400'
              })}
              onClick={onStarToggle}
              variant="ghost"
              className="!p-1"
            />
          </div>
        </div>
        {/* 문제 영역 */}
        <div className="mb-5">
          {question.context && (
            <div className="text-sm text-text-secondary mb-3 leading-relaxed">
              {question.context}
            </div>
          )}
          <div className="text-lg leading-relaxed text-text-primary font-medium">
            {question.korean}
          </div>
        </div>
        {/* 정답 영역 */}
        <div className="pt-4 border-t border-dashed border-gray-border">
          <div className="text-base leading-relaxed text-text-primary flex flex-wrap items-center gap-1">
            {question.english?.split(' ').map((word, index) => {
              const cleanWord = word.replace(/[.,!?]/g, '');
              const isKeyword = question.keywords?.some(keyword =>
                cleanWord.toLowerCase() === keyword.toLowerCase()
              );
              const punctuation = word.match(/[.,!?]+$/)?.[0] || '';
              if (isKeyword && inputMode === 'keyboard' && quizMode === 'solving') {
                // 키보드 모드의 문제풀이 모드에서는 input field 표시
                const keywordKey = cleanWord.toLowerCase();
                const userInput = keywordInputs[keywordKey] || '';
                const hasUserInput = userInput.length > 0;

                // 힌트/정답 표시 값 계산
                const getDisplayValue = () => {
                  if (hasUserInput) return userInput;  // 사용자 입력이 있으면 그대로
                  if (showAnswer) return cleanWord;     // 정답보기: 전체 단어
                  if (showHint) return cleanWord.charAt(0) + '_'.repeat(cleanWord.length - 1);  // 힌트보기: 첫 글자 + 언더스코어
                  return '';
                };

                const displayValue = getDisplayValue();
                const isShowingHintOrAnswer = !hasUserInput && (showHint || showAnswer);

                return (
                  <span key={index} className="inline-flex items-center">
                    <input
                      type="text"
                      value={displayValue}
                      onChange={(e) => onKeywordInputChange?.(keywordKey, e.target.value)}
                      onKeyDown={(e) => onKeywordKeyDown?.(keywordKey, userInput, e)}
                      onFocus={() => {
                        // 포커스 시 힌트/정답 해제
                        if (isShowingHintOrAnswer && onClearHintAnswer) {
                          onClearHintAnswer();
                        }
                      }}
                      className={`px-2 py-1 rounded font-semibold border-2 focus:border-primary focus:outline-none min-w-[70px] max-w-[130px] placeholder:text-transparent ${
                        isShowingHintOrAnswer
                          ? 'bg-yellow-100 border-yellow-200 text-gray-500 text-left'  // 힌트/정답 표시 중 (왼쪽 정렬)
                          : 'bg-yellow-200 border-yellow-300 text-center'  // 일반 입력 상태 (가운데 정렬)
                      }`}
                      style={{
                        width: `${Math.max(cleanWord.length * 10 + 16, 70)}px`,
                        backgroundImage: isShowingHintOrAnswer ? 'none' : 'linear-gradient(to right, #9ca3af 0%, #9ca3af 100%)',
                        backgroundSize: 'calc(100% - 12px) 2px',
                        backgroundPosition: 'center bottom 6px',
                        backgroundRepeat: 'no-repeat'
                      }}
                      placeholder=""
                      data-keyword={keywordKey}
                    />
                    {punctuation && <span className="ml-0.5">{punctuation}</span>}
                  </span>
                );
              } else if (isKeyword && quizMode === 'solving') {
                // 음성 모드의 문제풀이 모드
                const hasInput = keywordInputs[cleanWord.toLowerCase()];
                const isCorrect = gradingResult?.keywordResults?.[cleanWord.toLowerCase()]?.isCorrect;

                // 힌트/정답 표시 값 계산 (음성 모드)
                const getVoiceDisplayValue = () => {
                  if (hasInput) return cleanWord;  // 사용자 입력이 있으면 정답 표시
                  if (showAnswer) return cleanWord;  // 정답보기: 전체 단어
                  if (showHint) return cleanWord.charAt(0) + '_'.repeat(cleanWord.length - 1);  // 힌트보기: 첫 글자 + 언더스코어
                  return '_'.repeat(cleanWord.length);  // 기본: 언더스코어
                };

                const voiceDisplayValue = getVoiceDisplayValue();
                const isShowingHintOrAnswerVoice = !hasInput && (showHint || showAnswer);

                return (
                  <span
                    key={index}
                    className={`px-2 py-0.5 rounded font-semibold ${
                      hasInput
                        ? isCorrect
                          ? 'bg-green-200 text-green-800'  // 정답이면 초록색
                          : 'bg-yellow-200 text-gray-800'   // 입력됐지만 채점 전이면 노란색
                        : isShowingHintOrAnswerVoice
                          ? 'bg-yellow-100 text-gray-500'  // 힌트/정답 표시 중
                          : 'bg-yellow-100 text-gray-400'      // 아직 입력 안 됐으면 연한 노란색
                    }`}
                  >
                    {voiceDisplayValue}
                    {punctuation}
                  </span>
                );
              } else if (isKeyword) {
                // 채점 모드에서는 원래 단어 표시 (노란색 배경)
                return (
                  <span
                    key={index}
                    className="bg-yellow-200 px-1 py-0.5 rounded font-semibold"
                  >
                    {word}
                  </span>
                );
              } else {
                // 일반 단어
                return (
                  <span key={index}>
                    {word}
                  </span>
                );
              }
            }).reduce((acc, curr, index) => {
              if (index === 0) return [curr];
              return [...acc, ' ', curr];
            }, [])}
          </div>
        </div>
        {/* 힌트/정답은 이제 노란색 blank 안에 직접 표시됨 */}
      </div>
      {/* 사용자 답변 박스 */}
      <div className="bg-white rounded-brand shadow-soft p-3 md:p-4 relative min-h-[80px]">
        {/* 입력 모드 토글 */}
        <div className="absolute top-3 right-3 flex bg-background rounded-brand-full p-0.5">
          <button
            onClick={() => onInputModeChange('voice')}
            className={`px-3 py-1.5 rounded-[18px] text-xs transition-all duration-200 flex items-center gap-1 ${
              inputMode === 'voice'
                ? 'bg-white text-primary font-semibold shadow-sm'
                : 'text-text-secondary'
            }`}
          >
            <span>🎤</span>
            <span>음성</span>
          </button>
          <button
            onClick={() => onInputModeChange('keyboard')}
            className={`px-3 py-1.5 rounded-[18px] text-xs transition-all duration-200 flex items-center gap-1 ${
              inputMode === 'keyboard'
                ? 'bg-white text-primary font-semibold shadow-sm'
                : 'text-text-secondary'
            }`}
          >
{getIcon('noto:keyboard', { size: 'sm' })}
            <span>키보드</span>
          </button>
        </div>
        <div className="text-xs text-text-secondary mb-2 flex items-center gap-2">
          {gradingResult?.isAllCorrect && (
            <span className="inline-flex items-center">
              {getIcon('noto:check-mark', { size: 'sm' })}
            </span>
          )}
          <span>내 답변</span>
        </div>
        <div className="text-base leading-relaxed text-text-primary min-h-[24px]">
          {isVoiceListening ? (
            <span className="text-primary italic animate-pulse">
              🎤 듣는 중입니다...
            </span>
          ) : userAnswer ? (
            userAnswer
          ) : (
            <span className="text-text-secondary italic">
              {inputMode === 'keyboard'
                ? '노란 박스를 클릭해서 답변을 작성하세요'
                : '아래 버튼을 눌러 음성으로 답변하세요'
              }
            </span>
          )}
        </div>
      </div>
    </main>
  );
};