import { getIcon } from './iconMap';

// 레벨에 따른 아바타 매핑
const AVATAR_LEVELS = [
  { emoji: '🐣', iconKey: 'HatchingChick', name: '병아리', level: 1, desc: '초보 학습자' },
  { emoji: '🐰', iconKey: 'Rabbit', name: '토끼', level: 3, desc: '열심히 뛰는 중' },
  { emoji: '🐶', iconKey: 'Dog', name: '강아지', level: 5, desc: '충실한 학습자' },
  { emoji: '🐱', iconKey: 'Cat', name: '고양이', level: 7, desc: '똑똑한 학습자' },
  { emoji: '🦊', iconKey: 'Fox', name: '여우', level: 10, desc: '영리한 학습자' },
  { emoji: '🦁', iconKey: 'Lion', name: '사자', level: 15, desc: '자신감 넘치는' },
  { emoji: '🦄', iconKey: 'Unicorn', name: '유니콘', level: 20, desc: '특별한 학습자' },
  { emoji: '🐲', iconKey: 'Dragon', name: '용', level: 25, desc: '전설의 학습자' },
  { emoji: '🦅', iconKey: 'Eagle', name: '독수리', level: 30, desc: '높이 나는 중' },
  { emoji: '👑', iconKey: 'Crown', name: '왕관', level: 40, desc: '마스터' }
];

/**
 * 사용자 레벨에 따른 아바타 정보 반환
 * @param {number} userLevel - 사용자의 현재 레벨
 * @returns {object} 아바타 정보 객체 (emoji, iconKey, name, desc)
 */
export const getAvatarByLevel = (userLevel) => {
  if (!userLevel || userLevel < 1) {
    return AVATAR_LEVELS[0]; // 기본값: 병아리
  }

  // 레벨에 맞는 아바타 찾기 (레벨이 높을수록 우선)
  for (let i = AVATAR_LEVELS.length - 1; i >= 0; i--) {
    if (userLevel >= AVATAR_LEVELS[i].level) {
      return AVATAR_LEVELS[i];
    }
  }

  return AVATAR_LEVELS[0]; // fallback
};

/**
 * 레벨에 따른 아바타 아이콘 반환 (Iconify 컴포넌트)
 * @param {number} userLevel - 사용자의 현재 레벨
 * @param {object} iconProps - 아이콘 컴포넌트에 전달할 props
 * @returns {JSX.Element} Iconify 아이콘 컴포넌트
 */
export const getAvatarIcon = (userLevel, iconProps = {}) => {
  const avatar = getAvatarByLevel(userLevel);
  return getIcon(avatar.iconKey, { size: '5xl', ...iconProps });
};

/**
 * 레벨에 따른 아바타 이모지 반환
 * @param {number} userLevel - 사용자의 현재 레벨
 * @returns {string} 이모지 문자열
 */
export const getAvatarEmoji = (userLevel) => {
  const avatar = getAvatarByLevel(userLevel);
  return avatar.emoji;
};

/**
 * 모든 아바타 레벨 정보 반환
 * @returns {array} 전체 아바타 레벨 배열
 */
export const getAllAvatarLevels = () => {
  return [...AVATAR_LEVELS];
};