import React from 'react';
import { CalendarBadge, HitBadge, CircularProgress } from '../ui';
import { getIcon } from '../../utils/iconMap';
import { getAvatarEmoji, getAvatarByLevel } from '../../utils/avatarUtils';

const CharacterSection = ({
  user,
  progress,
  badges,
  onStartLearning
}) => {
  // 사용자 레벨에 따른 아바타 정보 가져오기
  const avatarInfo = getAvatarByLevel(user?.level || 1);
  // custom_avatar가 있으면 우선 사용, 없으면 레벨 기반 아바타 사용
  const displayAvatar = user?.custom_avatar || getAvatarEmoji(user?.level || 1);

  return (
    <div className="character-card animate-fade-in">
      {/* 우측 상단 뱃지 - 모바일에서 숨김 */}
      <div className="absolute top-3 right-3 gap-2 hidden md:flex">
        <CalendarBadge count={badges?.days || 0} />
        <HitBadge count={badges?.questions || 0} />
      </div>

      {/* ===== 모바일 레이아웃 ===== */}
      {/* 1줄: 진행률 원형 차트 + 아바타 내부 + percentage 우측하단 */}
      <div className="relative inline-flex items-center justify-center mb-3 md:hidden">
        <CircularProgress
          value={progress?.percentage || 0}
          max={100}
          size={80}
          strokeWidth={8}
          showText={false}
        />
        {/* 아바타 (원형 차트 중앙) */}
        <span
          className="absolute text-3xl"
          title={`${avatarInfo.name} (레벨 ${user?.level || 1}) - ${avatarInfo.desc}`}
        >
          {displayAvatar}
        </span>
        {/* percentage (우측 하단) */}
        <span className="absolute -bottom-1 -right-4 text-sm font-bold text-primary bg-white px-1.5 py-0.5 rounded-full shadow-sm">
          {progress?.percentage || 0}%
        </span>
      </div>

      {/* 2줄: 캐릭터 정보 (모바일) */}
      <div className="mb-3 md:hidden">
        <div className="text-base font-bold text-text-primary mb-0.5">{user?.name || '사용자'}</div>
        <div className="text-xs text-text-secondary">
          학습 목표: {user?.goal || 20}문제
        </div>
      </div>

      {/* 3줄: 학습 시작 버튼 (모바일) */}
      <button className="btn-start-learning md:hidden" onClick={onStartLearning} data-onboarding="today-quiz">
        {getIcon('noto:sparkles', { size: 'xl', className: 'text-yellow-400' })}
        <span>오늘의 퀴즈</span>
      </button>

      {/* ===== 태블릿/데스크톱 레이아웃 (기존) ===== */}
      {/* 캐릭터 아바타 */}
      <div className="hidden md:flex w-25 h-25 mx-auto mb-3 bg-surface rounded-full items-center justify-center text-5xl" title={`${avatarInfo.name} (레벨 ${user?.level || 1}) - ${avatarInfo.desc}`}>
        {displayAvatar}
      </div>

      {/* 캐릭터 정보 */}
      <div className="hidden md:block mb-4">
        <div className="text-xl font-bold text-text-primary mb-1">{user?.name || '사용자'}</div>
        <div className="flex items-center justify-center text-sm text-text-secondary">
          학습 목표: {user?.goal || 20}문제
        </div>
      </div>

      {/* 진행률 원형 차트 */}
      <div className="hidden md:block mb-4">
        <CircularProgress
          value={progress?.percentage || 0}
          max={100}
          size={120}
          strokeWidth={12}
        />
      </div>

      {/* 학습 시작 버튼 */}
      <button className="btn-start-learning hidden md:flex" onClick={onStartLearning} data-onboarding="today-quiz">
        {getIcon('noto:sparkles', { size: 'xl', className: 'text-yellow-400' })}
        <span>오늘의 퀴즈</span>
      </button>
    </div>
  );
};

export default CharacterSection;