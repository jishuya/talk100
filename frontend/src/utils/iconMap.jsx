// ============================================================================
// Icon Management System - talk100
// ============================================================================
// 모든 아이콘을 중앙 집중식으로 관리하는 시스템
// 사용법: getIcon('IoHome', { size: 'xl', color: 'text-primary' })

// React Icons 라이브러리별 Import
import {
  // Navigation Icons
  IoHome, IoHomeOutline,
  IoBook, IoBookOutline,
  IoStatsChart, IoStatsChartOutline,
  IoPerson, IoPersonOutline,

  // Action Icons
  IoClose, IoCloseOutline, IoCloseCircleOutline,
  IoCheckmark, IoArrowForward,
  IoChevronBackOutline, IoChevronDownOutline,
  IoMenuOutline,

  // Media & Control Icons
  IoVolumeHigh, IoMic, IoStop, IoPlayForward,

  // UI & System Icons
  IoNotifications, IoSettingsOutline,
  IoMoon, IoSunny,
  IoPencil, IoBulb,
  IoTimeOutline,

  // Social & Content Icons
  IoHeartOutline, IoTrophy, IoStar,
  IoLibraryOutline, IoSchoolOutline,
} from 'react-icons/io5';

import {
  BiBulb, BiChat, BiDetail
} from "react-icons/bi";

import {
  MdOutlineStar
} from "react-icons/md";

import {
  AiFillHeart, AiOutlineQuestionCircle, AiOutlineCheckCircle
} from "react-icons/ai";

import {
  SiQuizlet
} from "react-icons/si";

// ============================================================================
// 디자인 토큰 - 색상 시스템
// ============================================================================

const COLORS = {
  // Primary Brand Colors
  PRIMARY: 'text-primary',

  // Semantic Colors
  SUCCESS: 'text-green-500',
  WARNING: 'text-yellow-500',
  ERROR: 'text-red-500',
  INFO: 'text-blue-500',

  // Neutral Colors
  GRAY_400: 'text-gray-400',
  GRAY_500: 'text-gray-500',

  // Category-specific Colors
  AMBER: 'text-amber-400',
  AMBER_500: 'text-amber-500',
  SKY: 'text-sky-400',
  VIOLET: 'text-violet-400',
  ORANGE: 'text-orange-500',
  PINK: 'text-pink-500',
  YELLOW_600: 'text-yellow-600',
};

const SIZES = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl'
};

// ============================================================================
// 아이콘 정의 - 구조화된 카테고리별 관리
// ============================================================================

const ICON_CATEGORIES = {
  // 네비게이션 아이콘들
  navigation: {
    IoHome: { component: IoHome, defaultColor: COLORS.PRIMARY },
    IoHomeOutline: { component: IoHomeOutline, defaultColor: COLORS.GRAY_400 },
    IoBook: { component: IoBook, defaultColor: COLORS.PRIMARY },
    IoBookOutline: { component: IoBookOutline, defaultColor: COLORS.GRAY_400 },
    IoStatsChart: { component: IoStatsChart, defaultColor: COLORS.PRIMARY },
    IoStatsChartOutline: { component: IoStatsChartOutline, defaultColor: COLORS.GRAY_400 },
    IoPerson: { component: IoPerson, defaultColor: COLORS.PRIMARY },
    IoPersonOutline: { component: IoPersonOutline, defaultColor: COLORS.GRAY_400 },
  },

  // UI 컨트롤 아이콘들
  controls: {
    IoClose: { component: IoClose, defaultColor: COLORS.GRAY_400 },
    IoCloseOutline: { component: IoCloseOutline, defaultColor: COLORS.GRAY_400 },
    IoCheckmark: { component: IoCheckmark, defaultColor: COLORS.SUCCESS },
    IoArrowForward: { component: IoArrowForward, defaultColor: COLORS.PRIMARY },
    IoChevronBackOutline: { component: IoChevronBackOutline, defaultColor: COLORS.GRAY_500 },
    IoChevronDownOutline: { component: IoChevronDownOutline, defaultColor: COLORS.GRAY_400 },
    IoMenuOutline: { component: IoMenuOutline, defaultColor: COLORS.GRAY_500 },
  },

  // 미디어 & 상호작용 아이콘들
  media: {
    IoVolumeHigh: { component: IoVolumeHigh, defaultColor: COLORS.INFO },
    IoMic: { component: IoMic, defaultColor: COLORS.ERROR },
    IoStop: { component: IoStop, defaultColor: COLORS.ERROR },
    IoPlayForward: { component: IoPlayForward, defaultColor: COLORS.SUCCESS },
  },

  // 시스템 & 설정 아이콘들
  system: {
    IoNotifications: { component: IoNotifications, defaultColor: COLORS.AMBER_500 },
    IoSettingsOutline: { component: IoSettingsOutline, defaultColor: COLORS.GRAY_500 },
    IoMoon: { component: IoMoon, defaultColor: COLORS.WARNING },
    IoSunny: { component: IoSunny, defaultColor: COLORS.WARNING },
    IoPencil: { component: IoPencil, defaultColor: COLORS.GRAY_500 },
    IoBulb: { component: IoBulb, defaultColor: COLORS.WARNING },
    IoTimeOutline: { component: IoTimeOutline, defaultColor: COLORS.INFO },
  },

  // 콘텐츠 & 소셜 아이콘들
  content: {
    IoHeartOutline: { component: IoHeartOutline, defaultColor: COLORS.PINK },
    AiFillHeart: { component: AiFillHeart, defaultColor: COLORS.ERROR },
    IoTrophy: { component: IoTrophy, defaultColor: COLORS.YELLOW_600 },
    IoStar: { component: IoStar, defaultColor: COLORS.WARNING },
    MdOutlineStar: { component: MdOutlineStar, defaultColor: COLORS.ORANGE },
    IoLibraryOutline: { component: IoLibraryOutline, defaultColor: COLORS.INFO },
    IoCloseCircleOutline: { component: IoCloseCircleOutline, defaultColor: COLORS.ERROR },
  },

  // 카테고리 & 학습 아이콘들
  learning: {
    BiBulb: { component: BiBulb, defaultColor: COLORS.AMBER },
    BiChat: { component: BiChat, defaultColor: COLORS.SKY },
    BiDetail: { component: BiDetail, defaultColor: COLORS.VIOLET },
    AiOutlineQuestionCircle: { component: AiOutlineQuestionCircle, defaultColor: COLORS.INFO },
    AiOutlineCheckCircle: { component: AiOutlineCheckCircle, defaultColor: COLORS.SUCCESS },
    SiQuizlet: { component: SiQuizlet, defaultColor: COLORS.PRIMARY },
    IoSchoolOutline: { component: IoSchoolOutline, defaultColor: COLORS.GRAY_400 },
  },
};

// ============================================================================
// 통합 아이콘 맵 생성
// ============================================================================

const createIconMap = () => {
  const iconMap = {};
  const colorMap = {};

  Object.values(ICON_CATEGORIES).forEach(category => {
    Object.entries(category).forEach(([iconName, { component, defaultColor }]) => {
      iconMap[iconName] = component;
      colorMap[iconName] = defaultColor;
    });
  });

  return { iconMap, colorMap };
};

const { iconMap, colorMap } = createIconMap();

// ============================================================================
// 공개 API - 단일 함수만 제공
// ============================================================================

/**
 * 아이콘을 렌더링하는 메인 함수
 * @param {string} iconName - 아이콘 이름 (예: 'IoHome')
 * @param {Object} options - 옵션 객체
 * @param {string} options.size - 크기 ('xs' ~ '5xl', 기본값: 'xl')
 * @param {string} options.color - 커스텀 색상 (Tailwind CSS 클래스)
 * @param {string} options.className - 추가 CSS 클래스
 * @param {Object} options.props - 기타 React props
 * @returns {JSX.Element} 렌더링된 아이콘 컴포넌트
 */
export const getIcon = (iconName, options = {}) => {
  const {
    size = 'xl',
    color = null,
    className = '',
    ...props
  } = options;

  // 아이콘 컴포넌트 가져오기
  const IconComponent = iconMap[iconName];

  // 색상 결정 우선순위: 커스텀 > 기본 색상 > 폴백
  const iconColor = color || colorMap[iconName] || COLORS.GRAY_400;

  // 크기 결정
  const iconSize = SIZES[size] || SIZES.xl;

  // 최종 클래스명 조합
  const finalClassName = [iconSize, iconColor, className]
    .filter(Boolean)
    .join(' ');

  return <IconComponent className={finalClassName} {...props} />;
};

// 기본 export (기존 코드와의 호환성)
export { iconMap };