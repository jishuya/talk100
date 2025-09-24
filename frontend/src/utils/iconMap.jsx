// @iconify/react를 사용한 간단한 아이콘 시스템
import { Icon } from '@iconify/react';

// 실제 프로젝트에서 사용 중인 아이콘만 매핑
const ICON_MAP = {
  // 네비게이션
  IoMenuOutline: 'tabler:menu-2',
  IoChevronBackOutline: 'tabler:chevron-left',
  IoChevronDownOutline: 'tabler:chevron-down',
  IoCloseOutline: 'tabler:x',

  // 액션
  IoClose: 'fluent:dismiss-circle-24-filled',
  IoCheckmark: 'fluent:checkmark-circle-24-filled',
  IoArrowForward: 'tabler:arrow-right',
  IoSettingsOutline: 'fluent:settings-24-regular',
  IoPencil: 'noto:pencil',

  // 미디어
  IoVolumeHigh: 'noto:speaker-high-volume',
  IoMic: 'noto:microphone',
  IoStop: 'noto:stop-button',
  IoPlayForward: 'noto:next-track-button',

  // UI 요소
  IoBulb: 'noto:light-bulb',
  IoTrophy: 'noto:trophy',

  // 퀴즈 컨트롤
  AiOutlineQuestionCircle: 'tabler:help-circle',
  AiOutlineCheckCircle: 'tabler:circle-check',

  // 상태별 아이콘 (즐겨찾기/틀린문제)
  'fluent:heart-24-filled': 'fluent:heart-24-filled',
  'fluent:heart-24-regular': 'fluent:heart-24-regular',
  'fluent:star-24-filled': 'fluent:star-24-filled',
  'fluent:star-24-regular': 'fluent:star-24-regular',

  // 테마 아이콘
  'tabler:bell-filled': 'tabler:bell-filled',
  'tabler:moon-filled': 'tabler:moon-filled',
  'tabler:sun-filled': 'tabler:sun-filled',

  // 카테고리 아이콘
  'noto:sparkles': 'noto:sparkles',
  'tabler:bulb': 'tabler:bulb',
  'tabler:message-circle': 'tabler:message-circle',
  'tabler:file-text': 'tabler:file-text',

  // 기타 필수 아이콘
  'noto:keyboard': 'noto:keyboard',
  'noto:fire': 'noto:fire',
  'noto:bar-chart': 'noto:bar-chart',
  'noto:star': 'noto:star',
  'noto:warning': 'noto:warning',
  'flat-color-icons:folder': 'flat-color-icons:folder'
};

// 크기 매핑
const SIZE_MAP = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
  '3xl': 36,
  '5xl': 48
};

/**
 * 아이콘 컴포넌트를 반환합니다
 * @param {string} iconName - 아이콘 이름
 * @param {object} options - 옵션
 * @param {string} options.size - 크기 (sm, md, lg, xl, 2xl, 3xl, 5xl)
 * @param {string} options.className - Tailwind CSS 클래스
 * @param {string} options.color - 레거시 색상 (className 사용 권장)
 * @returns {JSX.Element|null} 아이콘 컴포넌트
 */
export const getIcon = (iconName, { size = 'xl', color, className = '', ...props } = {}) => {
  const iconifyName = ICON_MAP[iconName];

  if (!iconifyName) {
    console.warn(`아이콘을 찾을 수 없습니다: "${iconName}"`);
    return null;
  }

  const iconSize = SIZE_MAP[size] || 28;
  const combinedClassName = [color, className].filter(Boolean).join(' ');

  return (
    <Icon
      icon={iconifyName}
      width={iconSize}
      height={iconSize}
      className={combinedClassName}
      {...props}
    />
  );
};