import { Icon } from '@iconify/react';

const ICON_MAP = {
  // === Navigation & UI Actions ===
  IoHome: 'tabler:home-filled',
  IoHomeOutline: 'tabler:home',
  IoMenuOutline: 'tabler:menu-2',
  IoChevronBackOutline: 'tabler:chevron-left',
  IoChevronDownOutline: 'tabler:chevron-down',
  IoClose: 'fluent:dismiss-circle-24-filled',
  IoCloseOutline: 'tabler:x',
  IoCloseCircleOutline: 'fluent:dismiss-circle-24-regular',
  IoCheckmark: 'fluent:checkmark-circle-24-filled',
  IoArrowForward: 'tabler:arrow-right',
  IoSettingsOutline: 'fluent:settings-24-regular',
  OpenFolder: 'fluent:folder-open-24-regular',
  Home : 'fluent:home-24-regular',


  // === Bottom Navigation ===
  IoBook: 'fluent:book-24-filled',
  IoBookOutline: 'fluent:book-24-regular',
  IoStatsChart: 'fluent:data-histogram-24-filled',
  IoStatsChartOutline: 'fluent:data-histogram-24-regular',
  IoPerson: 'fluent:person-24-filled',
  IoPersonOutline: 'fluent:person-24-regular',

  // === Media Controls ===
  IoVolumeHigh: 'tabler:reload',  // 다시 듣기 (변경)
  IoMic: 'noto:microphone',
  IoStop: 'noto:stop-button',
  IoPlayForward: 'tabler:arrow-right',  // 다음 문제 (변경)

  // === Quiz & Learning ===
  AiOutlineQuestionCircle: 'tabler:help-circle',
  AiOutlineCheckCircle: 'tabler:circle-check',
  IoBulb: 'noto:light-bulb',
  BiBulb: 'noto:light-bulb',
  SiQuizlet: 'noto:graduation-cap',
  IoPencil: 'noto:pencil',
  BiChat: 'noto:speech-balloon',
  BiDetail: 'noto:clipboard',

  // === Category Icons ===
  'tabler:bulb': 'tabler:bulb',
  'tabler:message-circle': 'tabler:message-circle',
  'tabler:file-text': 'tabler:file-text',
  'noto:sparkles': 'noto:sparkles',

  // === Interactive Elements ===
  'fluent:star-24-filled': 'fluent:star-24-filled',
  'fluent:star-24-regular': 'fluent:star-24-regular',
  'fluent:heart-24-filled': 'fluent:heart-24-filled',
  'fluent:heart-24-regular': 'fluent:heart-24-regular',
  MdOutlineStar: 'fluent:star-24-regular',
  IoStar: 'fluent:star-24-filled',
  IoHeartOutline: 'fluent:heart-24-regular',
  AiFillHeart: 'fluent:heart-24-filled',

  // === Theme & Status ===
  'tabler:bell-filled': 'tabler:bell-filled',
  'tabler:moon-filled': 'tabler:moon-filled',
  'tabler:sun-filled': 'tabler:sun-filled',
  IoNotifications: 'noto:bell',
  IoMoon: 'noto:crescent-moon',
  IoSunny: 'noto:sun',

  // === Stats & Achievements ===
  Questions: 'noto:direct-hit',
  Days: 'fluent-emoji:spiral-calendar',
  IoTrophy: 'noto:trophy',
  'noto:fire': 'noto:fire',
  'noto:bar-chart': 'noto:bar-chart',
  'noto:star': 'noto:star',

  // === System & Info ===
  'noto:information': 'noto:information',
  'noto:warning': 'noto:warning',
  'noto:speech-balloon': 'noto:speech-balloon',
  'noto:memo': 'noto:memo',
  'noto:keyboard': 'noto:keyboard',
  'noto:door': 'noto:door',
  logout: 'noto:door',

  // === File & Folder ===
  'flat-color-icons:folder': 'flat-color-icons:folder',
  'solar:folder-with-files-line-duotone': 'solar:folder-with-files-line-duotone',

  // === Legacy & Misc ===
  IoLibraryOutline: 'noto:books',
  IoSchoolOutline: 'noto:school',
  IoTimeOutline: 'noto:alarm-clock',
  'noto:red-heart': 'noto:red-heart',
  'fluent:settings-24-regular': 'fluent:settings-24-regular',

  // === Avartar ===
  HatchingChick: 'noto:hatching-chick',
  Rabbit: 'rabbit',
  Dog: 'dog',
  Cat: 'cat',
  Fox: 'fox',
  Lion: 'lion',
  Unicorn: 'unicorn',
  Dragon: 'dragon', 
  Eagle: 'eagle',
  Crown: 'crown',
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