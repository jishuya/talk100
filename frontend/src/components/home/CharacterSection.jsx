import React from 'react';
import { CharacterCard, TrophyBadge, StarBadge, StartLearningButton, CircularProgress } from '../ui';

const CharacterSection = ({
  user = { name: '삔이', goal: 20 },
  progress = { current: 0, total: 20, percentage: 35 },
  badges = { trophy: 182, star: 4203 },
  onStartLearning
}) => {
  return (
    <CharacterCard>
      {/* 우측 상단 뱃지 */}
      <div className="absolute top-3 right-3 flex gap-2">
        <TrophyBadge count={badges.trophy} />
        <StarBadge count={badges.star} />
      </div>

      {/* 캐릭터 아바타 */}
      <div className="w-25 h-25 mx-auto mb-3 bg-surface rounded-full flex items-center justify-center text-5xl">
        👨‍🎓
      </div>

      {/* 캐릭터 정보 */}
      <div className="mb-4">
        <div className="text-xl font-bold text-text-primary mb-1">{user.name}</div>
        <div className="text-sm text-text-secondary">학습 목표: {user.goal}개 ▼</div>
      </div>

      {/* 진행률 원형 차트 */}
      <div className="mb-4">
        <CircularProgress
          value={progress.percentage}
          max={100}
          size={120}
          strokeWidth={12}
        />
      </div>

      {/* 학습 시작 버튼 */}
      <StartLearningButton onClick={onStartLearning}>
        <span>📚</span>
        <span>오늘의 퀴즈</span>
      </StartLearningButton>
    </CharacterCard>
  );
};

export default CharacterSection;