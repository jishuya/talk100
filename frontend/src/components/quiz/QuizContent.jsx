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
  isFavorite = false,
  isStarred = false,
  gradingResult = null,
  isVoiceListening = false
}) => {
  // userAnswer 변경 로그
  useEffect(() => {
    console.log('📝 [QuizContent] userAnswer 업데이트됨:', userAnswer);
    console.log('📝 [QuizContent] keywordInputs:', keywordInputs);
    console.log('📝 [QuizContent] gradingResult:', gradingResult);
  }, [userAnswer, keywordInputs, gradingResult]);
  if (!question) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-text-secondary">문제를 불러오는 중...</p>
      </div>
    );
  }
  return (
    <main className="flex-1 overflow-y-auto p-4 pb-32 -webkit-overflow-scrolling-touch">
      {/* 퀴즈 박스 */}
      <div className="bg-white rounded-brand shadow-soft p-5 mb-4 relative">
        {/* Day & 카테고리 표시 */}
        <div className="flex gap-2 mb-4">
          <span className="px-3 py-1.5 bg-primary text-white rounded-full text-sm font-bold shadow-soft">
            Day {question.day}
          </span>
          <span className="px-3 py-1.5 bg-primary text-white rounded-full text-sm font-bold shadow-soft">
            {getCategoryName(question.categoryId)}
          </span>
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
                return (
                  <span key={index} className="inline-flex items-center">
                    <input
                      type="text"
                      value={keywordInputs[cleanWord.toLowerCase()] || ''}
                      onChange={(e) => onKeywordInputChange?.(cleanWord.toLowerCase(), e.target.value)}
                      onKeyDown={(e) => onKeywordKeyDown?.(cleanWord.toLowerCase(), keywordInputs[cleanWord.toLowerCase()] || '', e)}
                      className="bg-yellow-200 px-2 py-1 rounded font-semibold text-center border-2 border-yellow-300 focus:border-primary focus:outline-none min-w-[70px] max-w-[130px] placeholder:text-transparent"
                      style={{
                        width: `${Math.max(cleanWord.length * 8 + 8, 70)}px`,
                        backgroundImage: 'linear-gradient(to right, #9ca3af 0%, #9ca3af 100%)',
                        backgroundSize: 'calc(100% - 12px) 2px',
                        backgroundPosition: 'center bottom 6px',
                        backgroundRepeat: 'no-repeat'
                      }}
                      placeholder=""
                      data-keyword={cleanWord.toLowerCase()}
                    />
                    {punctuation && <span className="ml-0.5">{punctuation}</span>}
                  </span>
                );
              } else if (isKeyword && quizMode === 'solving') {
                // 음성 모드의 문제풀이 모드
                const hasInput = keywordInputs[cleanWord.toLowerCase()];
                const isCorrect = gradingResult?.keywordResults?.[cleanWord.toLowerCase()]?.isCorrect;

                return (
                  <span
                    key={index}
                    className={`px-2 py-0.5 rounded font-semibold ${
                      hasInput
                        ? isCorrect
                          ? 'bg-green-200 text-green-800'  // 정답이면 초록색
                          : 'bg-yellow-200 text-gray-800'   // 입력됐지만 채점 전이면 노란색
                        : 'bg-yellow-100 text-gray-400'      // 아직 입력 안 됐으면 연한 노란색
                    }`}
                  >
                    {hasInput ? cleanWord : '_'.repeat(cleanWord.length)}
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
        {/* 힌트정답 영역 */}
        {(showHint || showAnswer) && (
          <div className="pt-4 border-t border-dashed border-gray-border">
            <div className="text-xs text-text-secondary mb-2">
              {showAnswer ? '정답' : '힌트'}
            </div>
            <div className="text-base leading-relaxed text-gray-500">
              {showAnswer
                ? question.english?.split(' ').map((word, index) => {
                    const isKeyword = question.keywords?.some(keyword =>
                      word.toLowerCase().replace(/[.,!?]/g, '') === keyword.toLowerCase()
                    );
                    return (
                      <span
                        key={index}
                        className={isKeyword ? 'bg-gray-200 px-1 py-0.5 rounded font-semibold' : ''}
                      >
                        {word}{index < question.english.split(' ').length - 1 ? ' ' : ''}
                      </span>
                    );
                  })
                : question.english?.split(' ').map((word, index) => {
                    // 힌트: 키워드만 첫 글자로 변경, 나머지는 그대로 표시
                    const cleanWord = word.replace(/[.,!?]/g, '');
                    const isKeyword = question.keywords?.some(keyword =>
                      cleanWord.toLowerCase() === keyword.toLowerCase()
                    );
                    const punctuation = word.match(/[.,!?]+$/)?.[0] || '';
                    if (isKeyword) {
                      // 키워드는 첫 글자만 표시
                      const firstLetter = cleanWord.charAt(0);
                      const restLength = cleanWord.length - 1;
                      const hint = firstLetter + '_'.repeat(restLength);
                      return (
                        <span key={index} className="bg-gray-200 px-1 py-0.5 rounded font-semibold">
                          {hint}{punctuation}
                        </span>
                      );
                    } else {
                      // 키워드가 아니면 그대로 표시
                      return (
                        <span key={index}>
                          {word}
                        </span>
                      );
                    }
                  }).reduce((acc, curr, index) => {
                    if (index === 0) return [curr];
                    return [...acc, ' ', curr];
                  }, [])
              }
            </div>
          </div>
        )}

        {/* 즐겨찾기/별표 버튼 */}
        <div className="absolute top-4 right-4 flex gap-2">
          <IconButton
            icon={getIcon(isFavorite ? 'fluent:heart-24-filled' : 'fluent:heart-24-regular', {
              size: 'lg',
              className: 'text-red-400'
            })}
            onClick={onFavoriteToggle}
            variant="ghost"
          />
          <IconButton
            icon={getIcon(isStarred ? 'fluent:star-24-filled' : 'fluent:star-24-regular', {
              size: 'lg',
              className: 'text-yellow-400'
            })}
            onClick={onStarToggle}
            variant="ghost"
          />
        </div>
      </div>
      {/* 사용자 답변 박스 */}
      <div className="bg-white rounded-brand shadow-soft p-4 relative min-h-[80px]">
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
                ? '위의 키워드 박스를 클릭해서 답변을 작성하세요'
                : '아래 버튼을 눌러 음성으로 답변하세요'
              }
            </span>
          )}
        </div>
      </div>
    </main>
  );
};