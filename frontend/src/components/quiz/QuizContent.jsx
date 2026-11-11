import { useEffect, useRef, useState } from 'react';
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
  const [isEnglishVisible, setIsEnglishVisible] = useState(false);
  const englishSentenceRef = useRef(null);
  const focusOnRevealRef = useRef(false);

  useEffect(() => {
    if (!focusOnRevealRef.current || !isEnglishVisible || inputMode !== 'keyboard') return;
    englishSentenceRef.current?.querySelector('input[data-keyword]')?.focus();
    focusOnRevealRef.current = false;
  }, [isEnglishVisible, inputMode]);

  const handleRevealQuiz = () => {
    if (quizMode === 'solving' && window.matchMedia('(min-width: 768px)').matches) {
      focusOnRevealRef.current = true;
      if (inputMode !== 'keyboard') onInputModeChange?.('keyboard');
    }
    setIsEnglishVisible(true);
  };

  // 명시적으로 힌트나 정답을 요청했을 때는 문장도 함께 표시합니다.
  useEffect(() => {
    if (showHint || showAnswer || quizMode === 'grading') {
      setIsEnglishVisible(true);
    }
  }, [showHint, showAnswer, quizMode]);

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
      <div className="bg-white rounded-brand shadow-soft p-3 mb-3 md:p-4 md:mb-4">
        {/* Day, 카테고리, 문제 번호 + 즐겨찾기/별표 버튼 */}
        <div className="flex items-center justify-between gap-2 mb-3 md:mb-4">
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            <span className="px-2 py-1 md:px-3 md:py-1.5 bg-primary text-white rounded-full text-xs md:text-sm font-bold shadow-soft">
              Day{question.day}
            </span>
            {question.questionNumber != null && (
              <span className="px-2 py-1 md:px-3 md:py-1.5 bg-primary text-white rounded-full text-xs md:text-sm font-bold shadow-soft">
                No.{question.questionNumber}
              </span>
            )}
            <span className="px-2 py-1 md:px-3 md:py-1.5 bg-primary text-white rounded-full text-xs md:text-sm font-bold shadow-soft">
              {getCategoryName(question.categoryId)}
            </span>
          </div>
          {/* 오른쪽: 즐겨찾기/별표 버튼 */}
          <div className="flex shrink-0 gap-1" data-onboarding="favorite-star">
            <IconButton
              icon={getIcon(isFavorite ? 'fluent:heart-24-filled' : 'fluent:heart-24-regular', {
                size: 'md',
                className: 'text-red-400'
              })}
              sound="favorite"
              onClick={onFavoriteToggle}
              variant="ghost"
              className="!px-1 !py-1 md:!px-2"
            />
            <IconButton
              icon={getIcon(isStarred ? 'fluent:star-24-filled' : 'fluent:star-24-regular', {
                size: 'md',
                className: 'text-yellow-400'
              })}
              sound="select"
              onClick={onStarToggle}
              variant="ghost"
              className="!px-1 !py-1 md:!px-2"
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
          {!isEnglishVisible && (
            <button
              type="button"
              aria-expanded={false}
              aria-controls="quiz-english-sentence"
              onClick={handleRevealQuiz}
              className="w-full rounded-xl bg-background px-4 py-6 text-center text-sm text-text-secondary transition-colors hover:bg-accent-pale active:bg-accent-pale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span className="quiz-reveal-prompt inline-flex items-center gap-2 text-base font-bold text-primary">
                <span aria-hidden="true" className="text-2xl">🐣</span>
                <span>퀴즈보기</span>
              </span>
            </button>
          )}
          <div
            id="quiz-english-sentence"
            ref={englishSentenceRef}
            hidden={!isEnglishVisible}
            onClick={(event) => {
              // 빈칸 입력과 음성 모드의 빈칸 선택은 기존 동작을 유지합니다.
              if (event.target.closest('input, [data-quiz-blank]')) return;
              setIsEnglishVisible(false);
            }}
          >
          <div className="text-base leading-relaxed text-text-primary flex flex-wrap items-center gap-1 cursor-pointer">
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

                // 힌트/정답 표시 값 계산 (힌트/정답이 사용자 입력보다 우선)
                const getDisplayValue = () => {
                  if (showAnswer) return cleanWord;     // 정답보기: 전체 단어
                  if (showHint) return cleanWord.charAt(0) + '_'.repeat(cleanWord.length - 1);  // 힌트보기: 첫 글자 + 언더스코어
                  if (hasUserInput) return userInput;  // 사용자 입력이 있으면 그대로
                  return '';
                };

                const displayValue = getDisplayValue();
                const isShowingHintOrAnswer = showHint || showAnswer;

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
                      className={`px-1 py-1 rounded font-semibold border-2 focus:border-primary focus:outline-none min-w-[60px] max-w-[140px] placeholder:text-transparent text-center ${
                        isShowingHintOrAnswer
                          ? 'bg-yellow-100 border-yellow-200 text-gray-500'  // 힌트/정답 표시 중
                          : 'bg-yellow-200 border-yellow-300'  // 일반 입력 상태
                      }`}
                      style={{
                        width: `${Math.max(cleanWord.length * 10 + 12, 70)}px`,  // 항상 동일한 크기
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

                // 힌트/정답 표시 값 계산 (음성 모드) - 힌트/정답이 사용자 입력보다 우선
                const getVoiceDisplayValue = () => {
                  if (showAnswer) return cleanWord;  // 정답보기: 전체 단어
                  if (showHint) return cleanWord.charAt(0) + '_'.repeat(cleanWord.length - 1);  // 힌트보기: 첫 글자 + 언더스코어
                  if (hasInput) return cleanWord;  // 사용자 입력이 있으면 정답 표시
                  return '_'.repeat(cleanWord.length);  // 기본: 언더스코어
                };

                const voiceDisplayValue = getVoiceDisplayValue();
                const isShowingHintOrAnswerVoice = showHint || showAnswer;

                // 빈칸 클릭 시 키보드 모드로 전환 + 해당 키워드 전달
                const handleBlankClick = () => {
                  if (!hasInput && onInputModeChange) {
                    // 키워드를 함께 전달하여 해당 input에 포커스되도록 함
                    onInputModeChange('keyboard', cleanWord.toLowerCase());
                  }
                };

                return (
                  <span
                    key={index}
                    data-quiz-blank
                    onClick={handleBlankClick}
                    className={`px-2 py-0.5 rounded font-semibold cursor-pointer hover:opacity-80 transition-opacity ${
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
        </div>
        {/* 힌트/정답은 이제 노란색 blank 안에 직접 표시됨 */}
      </div>
      {/* 사용자 답변 박스 */}
      <div className="bg-white rounded-brand shadow-soft p-3 md:p-4 md:relative min-h-[80px]">
        {/* 모바일: 첫째 줄 - 내 답변 + 입력 모드 토글 */}
        <div className="flex items-center justify-between mb-2 md:block">
          <div className="text-xs text-text-secondary flex items-center gap-2">
            {gradingResult?.isAllCorrect && (
              <span className="inline-flex items-center">
                {getIcon('noto:check-mark', { size: 'sm' })}
              </span>
            )}
            <span>내 답변</span>
          </div>
          {/* 입력 모드 토글 - 모바일: inline, 데스크탑: absolute */}
          <div className="flex bg-background rounded-brand-full p-0.5 md:absolute md:top-3 md:right-3" data-onboarding="input-mode">
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
        </div>
        {/* 둘째 줄: 안내 텍스트 또는 사용자 답변 */}
        <div className="text-base leading-relaxed text-text-primary min-h-[24px]">
          {isVoiceListening ? (
            <span className="text-primary italic animate-pulse">
              🎤 듣는 중입니다...
            </span>
          ) : userAnswer ? (
            userAnswer
          ) : (
            <span className="text-text-secondary italic text-sm">
              {inputMode === 'keyboard'
                ? isEnglishVisible
                  ? '노란 박스를 클릭해서 답변을 작성하세요'
                  : '먼저 말해본 뒤, 영어 문장을 열어 빈칸을 채워보세요'
                : '아래 정답말하기 버튼을 눌러주세요'
              }
            </span>
          )}
        </div>
      </div>
    </main>
  );
};
