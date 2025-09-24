// Simple Icon System using @iconify/react
import { Icon } from '@iconify/react';

// Icon mappings from react-icons to @iconify icons (사용자 제공)
const ICON_MAP = {
  // Navigation Icons
  IoHome: 'tabler:home-filled',
  IoHomeOutline: 'tabler:home',
  IoBook: 'fluent:book-24-filled',
  IoBookOutline: 'fluent:book-24-regular',
  IoStatsChart: 'fluent:data-histogram-24-filled',
  IoStatsChartOutline: 'fluent:data-histogram-24-regular',
  IoPerson: 'fluent:person-24-filled',
  IoPersonOutline: 'fluent:person-24-regular',

  // Action Icons
  IoClose: 'fluent:dismiss-circle-24-filled',
  IoCloseOutline: 'tabler:x',
  IoCloseCircleOutline: 'fluent:dismiss-circle-24-regular',
  IoCheckmark: 'fluent:checkmark-circle-24-filled',
  IoArrowForward: 'tabler:arrow-right',
  IoChevronBackOutline: 'tabler:chevron-left',
  IoChevronDownOutline: 'tabler:chevron-down',
  IoMenuOutline: 'tabler:menu-2',

  // Media & Control Icons
  IoVolumeHigh: 'noto:speaker-high-volume',
  IoMic: 'noto:microphone',
  IoStop: 'noto:stop-button',
  IoPlayForward: 'noto:next-track-button',

  // UI & System Icons
  IoNotifications: 'noto:bell',
  IoSettingsOutline: 'fluent:settings-24-regular',
  IoBulb: 'noto:light-bulb',
  IoTrophy: 'noto:trophy',
  IoLibraryOutline: 'noto:books',
  IoSchoolOutline: 'noto:school',
  IoTimeOutline: 'noto:alarm-clock',
  IoPencil: 'noto:pencil',
  IoMoon: 'noto:crescent-moon',
  IoSunny: 'noto:sun',

  // Content & Learning Icons
  BiChat: 'noto:speech-balloon',
  BiDetail: 'noto:clipboard',
  SiQuizlet: 'noto:graduation-cap',
  logout: 'noto:door',

  // Additional Hamburger Menu Icons
  'solar:folder-with-files-line-duotone': 'solar:folder-with-files-line-duotone',

  // Star Icons
  MdOutlineStar: 'fluent:star-24-regular',
  IoStar: 'fluent:star-24-filled',

  // Heart Icons
  IoHeartOutline: 'fluent:heart-24-regular',
  AiFillHeart: 'fluent:heart-24-filled',

  // Legacy mappings
  AiOutlineQuestionCircle: 'tabler:help-circle',
  AiOutlineCheckCircle: 'fluent:checkmark-circle-24-filled',
  BiBulb: 'noto:light-bulb',
};

export const getIcon = (iconName, { size = 'xl', color, className = '', ...props } = {}) => {
  const iconifyName = ICON_MAP[iconName];
  if (!iconifyName) return null;

  const sizeMap = { xs: 12, sm: 16, md: 20, lg: 24, xl: 28, '2xl': 32, '3xl': 36, '4xl': 40, '5xl': 48 };
  const iconSize = sizeMap[size] || 28;

  // color와 className을 결합 (color가 우선)
  const combinedClassName = [color, className].filter(Boolean).join(' ');

  return <Icon icon={iconifyName} width={iconSize} height={iconSize} className={combinedClassName} {...props} />;
};