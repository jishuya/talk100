import React from 'react';

const CharacterSection = ({
  user = { name: '삔이', goal: 20 },
  progress = { current: 0, total: 20, percentage: 35 },
  badges = { trophy: 182, star: 4203 },
  onStartLearning
}) => {
  return (
    <div className="character-section animate-fade-in">
      {/* 우측 상단 뱃지 */}
      <div className="badge-container">
        <div className="badge-item">
          <span>🏆</span>
          <span>{badges.trophy}</span>
        </div>
        <div className="badge-item">
          <span>⭐</span>
          <span>{badges.star.toLocaleString()}</span>
        </div>
      </div>

      {/* 캐릭터 아바타 */}
      <div className="character-avatar">
        👨‍🎓
      </div>

      {/* 캐릭터 정보 */}
      <div className="character-info">
        <div className="character-name">{user.name}</div>
        <div className="character-level">학습 목표: {user.goal}개 ▼</div>
      </div>

      {/* 진행률 원형 차트 */}
      <div className="progress-container">
        <div className="progress-circle">
          <svg width="120" height="120">
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="var(--accent-mint)"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="var(--primary-color)"
              strokeWidth="12"
              fill="none"
              strokeDasharray="339"
              strokeDashoffset={339 - (339 * progress.percentage / 100)}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            />
          </svg>
          <div className="progress-text">{progress.percentage}%</div>
        </div>
      </div>

      {/* 학습 시작 버튼 */}
      <button
        className="start-learning-btn touchable"
        onClick={onStartLearning}
      >
        <span>📚</span>
        <span>오늘의 퀴즈</span>
      </button>
    </div>
  );
};

export default CharacterSection;