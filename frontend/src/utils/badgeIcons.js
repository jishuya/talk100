/**
 * 뱃지 ID와 아이콘 매핑
 * BadgesSection과 BadgeModal에서 사용
 */
export const BADGE_ICON_MAP = {
  // 카테고리 완료
  'complete-model': 'BadgePencil',
  'complete-smalltalk': 'BadgeChat',
  'complete-cases': 'BadgeBook',

  // 연속 학습
  'streak-7': 'BadgeFire',
  'streak-30': 'BadgeFireDouble',
  'streak-100': 'BadgeFireTriple',

  // 문제 수
  'questions-100': 'BadgeHundred',
  'questions-500': 'BadgeBooks',
  'questions-1000': 'BadgeGraduation',

  // 특수 업적
  'master-all': 'BadgeDiamond',
  'dedicated': 'BadgeCrown',
  'collector': 'BadgeHeart',
};

/**
 * 뱃지 ID로 아이콘 이름 가져오기
 * @param {string} badgeId - 뱃지 ID
 * @returns {string} 아이콘 이름
 */
export const getBadgeIconName = (badgeId) => {
  return BADGE_ICON_MAP[badgeId] || 'IoTrophy';
};
