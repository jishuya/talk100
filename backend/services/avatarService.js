// 아바타 시스템 서비스
// 레벨업 로직 및 아바타 해금 관리

// 아바타 레벨 정보 (50문제 단위로 레벨업)
const AVATAR_LEVELS = [
  { level: 1, emoji: '🐣', name: '병아리', requiredQuestions: 0, description: '초보 학습자' },
  { level: 2, emoji: '🐰', name: '토끼', requiredQuestions: 50, description: '열심히 뛰는 중' },
  { level: 3, emoji: '🐶', name: '강아지', requiredQuestions: 150, description: '충실한 학습자' },
  { level: 4, emoji: '🐱', name: '고양이', requiredQuestions: 250, description: '똑똑한 학습자' },
  { level: 5, emoji: '🦊', name: '여우', requiredQuestions: 350, description: '영리한 학습자' },
  { level: 6, emoji: '🐼', name: '판다', requiredQuestions: 450, description: '귀여운 학습자' },
  { level: 7, emoji: '🦁', name: '사자', requiredQuestions: 550, description: '자신감 넘치는' },
  { level: 8, emoji: '🐯', name: '호랑이', requiredQuestions: 650, description: '강력한 학습자' },
  { level: 9, emoji: '🦄', name: '유니콘', requiredQuestions: 750, description: '특별한 학습자' },
  { level: 10, emoji: '🐲', name: '용', requiredQuestions: 850, description: '전설의 학습자' },
  { level: 11, emoji: '🦅', name: '독수리', requiredQuestions: 950, description: '높이 나는 중' },
  { level: 12, emoji: '👑', name: '왕관', requiredQuestions: 1050, description: '마스터' }
];

/**
 * 문제 수에 따른 레벨 계산
 * @param {number} totalQuestions - 총 푼 문제 수
 * @returns {number} 현재 레벨 (1~12)
 */
function calculateLevel(totalQuestions) {
  // 레벨 배열을 역순으로 순회하며 조건을 만족하는 첫 번째 레벨 반환
  for (let i = AVATAR_LEVELS.length - 1; i >= 0; i--) {
    if (totalQuestions >= AVATAR_LEVELS[i].requiredQuestions) {
      return AVATAR_LEVELS[i].level;
    }
  }
  return 1; // 최소 레벨
}

/**
 * 레벨업 체크
 * @param {number} previousQuestions - 이전 문제 수
 * @param {number} currentQuestions - 현재 문제 수
 * @returns {Object|null} 레벨업 정보 또는 null
 */
function checkLevelUp(previousQuestions, currentQuestions) {
  const previousLevel = calculateLevel(previousQuestions);
  const currentLevel = calculateLevel(currentQuestions);

  if (currentLevel > previousLevel) {
    const levelInfo = AVATAR_LEVELS.find(a => a.level === currentLevel);
    return {
      levelUp: true,
      newLevel: currentLevel,
      previousLevel: previousLevel,
      avatar: levelInfo.emoji,
      avatarName: levelInfo.name,
      requiredQuestions: levelInfo.requiredQuestions,
      message: `${levelInfo.requiredQuestions}문제 달성! 레벨업하였습니다.`
    };
  }

  return null;
}

/**
 * 사용자가 해금한 아바타 목록 조회
 * @param {number} userLevel - 사용자 현재 레벨
 * @returns {Array} 해금된 아바타 목록
 */
function getUnlockedAvatars(userLevel) {
  return AVATAR_LEVELS.filter(avatar => avatar.level <= userLevel);
}

/**
 * 모든 아바타 목록 조회 (잠금 상태 포함)
 * @param {number} userLevel - 사용자 현재 레벨
 * @returns {Array} 모든 아바타 목록 (locked 필드 포함)
 */
function getAllAvatarsWithLockStatus(userLevel) {
  return AVATAR_LEVELS.map(avatar => ({
    ...avatar,
    locked: avatar.level > userLevel
  }));
}

/**
 * 특정 아바타가 해금되었는지 확인
 * @param {number} userLevel - 사용자 현재 레벨
 * @param {string} avatarEmoji - 아바타 이모지
 * @returns {boolean} 해금 여부
 */
function isAvatarUnlocked(userLevel, avatarEmoji) {
  const avatar = AVATAR_LEVELS.find(a => a.emoji === avatarEmoji);
  if (!avatar) return false;
  return avatar.level <= userLevel;
}

/**
 * 레벨에 따른 등급명 반환
 * @param {number} level - 레벨
 * @returns {string} 등급명
 */
function getGradeName(level) {
  if (level <= 3) return '초급 학습자';
  if (level <= 6) return '중급 학습자';
  if (level <= 12) return '고급 학습자';
  return '마스터 학습자';
}

module.exports = {
  AVATAR_LEVELS,
  calculateLevel,
  checkLevelUp,
  getUnlockedAvatars,
  getAllAvatarsWithLockStatus,
  isAvatarUnlocked,
  getGradeName
};
