import React from 'react';
import { AiFillHeart } from 'react-icons/ai';
import { MdOutlineStar } from 'react-icons/md';
import { IconButton } from '../ui/Button';
import { getIconColorWithHover } from '../../utils/iconColors.js';

export const QuizContent = ({
  question,
  userAnswer = '',
  inputMode = 'voice',
  keyboardInput = '',
  onKeyboardInputChange,
  onInputModeChange,
  onFavoriteToggle,
  onStarToggle
}) => {
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
            {question.category}
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
            {question.korean?.split(' ').map((word, index) => {
              // 키워드 하이라이트 체크
              const isKeyword = question.keywords?.some(keyword =>
                word.includes(keyword) || keyword.includes(word.replace(/[.,!?]/g, ''))
              );

              return (
                <span
                  key={index}
                  className={isKeyword ? 'text-primary font-bold underline decoration-dotted underline-offset-2' : ''}
                >
                  {word}{index < question.korean.split(' ').length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </div>
        </div>

        {/* 정답 영역 */}
        <div className="pt-4 border-t border-dashed border-gray-border">
          {/* <div className="text-xs text-text-secondary mb-2">
            정답 (English)
          </div> */}
          <div className="text-base leading-relaxed text-text-primary">
            {question.english?.split(' ').map((word, index) => {
              const isKeyword = question.keywords?.some(keyword =>
                word.toLowerCase().replace(/[.,!?]/g, '') === keyword.toLowerCase()
              );

              return (
                <span
                  key={index}
                  className={isKeyword ? 'bg-yellow-200 px-1 py-0.5 rounded font-semibold' : ''}
                >
                  {word}{index < question.english.split(' ').length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </div>
        </div>

        {/* 즐겨찾기/별표 버튼 */}
        <div className="absolute top-4 right-4 flex gap-2">
          <IconButton
            icon={<AiFillHeart className="text-lg" />}
            onClick={onFavoriteToggle}
            variant="ghost"
            className={getIconColorWithHover('AiFillHeart')}
          />
          <IconButton
            icon={<MdOutlineStar className="text-lg" />}
            onClick={onStarToggle}
            variant="ghost"
            className={getIconColorWithHover('MdOutlineStar')}
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
            <span>⌨️</span>
            <span>키보드</span>
          </button>
        </div>

        <div className="text-xs text-text-secondary mb-2">
          내 답변
        </div>

        <div className="text-base leading-relaxed text-text-primary min-h-[24px]">
          {userAnswer || (
            <span className="text-text-secondary italic">
              {inputMode === 'keyboard'
                ? '아래 입력창에 답변을 작성하세요'
                : '아래 버튼을 눌러 음성으로 답변하세요'
              }
            </span>
          )}
        </div>
      </div>
    </main>
  );
};