// 아이콘별 색상 매핑 통합 유틸리티
export const getIconColor = (iconName, size = 'xl') => {
  const colorMap = {
    'BiBulb': 'text-amber-400',         // 전구 - 부드러운 앰버 (아이디어)
    'BiChat': 'text-sky-400',           // 채팅 - 부드러운 스카이블루 (소통)
    'BiDetail': 'text-violet-400',      // 상세 - 부드러운 바이올렛 (전문성)
    'MdOutlineStar': 'text-orange-500', // 별 - 오렌지 (틀린문제)
    'AiFillHeart': 'text-red-500',      // 하트 - 빨간색 (즐겨찾기)
    'IoTrophy': 'text-yellow-600',      // 트로피 - 금색
    'IoStar': 'text-yellow-400',        // 별 - 부드러운 노란색
    'IoNotifications': 'text-amber-500', // 알림 - 앰버 (알림)
    'IoMoon': 'text-yellow-500',        // 달 - 노란색 (다크모드)
    'IoSunny': 'text-yellow-500',       // 해 - 노란색 (라이트모드)
    'IoSettingsOutline': 'text-gray-500', // 설정 - 회색
    'IoChevronBackOutline': 'text-gray-500', // 뒤로가기 - 회색
    'IoSchoolOutline': 'text-gray-400',  // 학교 - 연한 회색
    'IoChevronDownOutline': 'text-gray-400', // 아래 화살표 - 연한 회색
    'IoCloseOutline': 'text-gray-400',   // 닫기 - 연한 회색
    // 네비게이션 아이콘들
    'navigation-inactive': 'text-gray-400', // 비활성화 네비게이션
  };

  const sizeMap = {
    'sm': 'text-sm',
    'md': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  };

  const baseColor = colorMap[iconName] || 'text-gray-400';
  const sizeClass = sizeMap[size] || 'text-xl';

  return `${sizeClass} ${baseColor}`;
};

// hover 색상까지 포함한 아이콘 색상 클래스 반환
export const getIconColorWithHover = (iconName, size = 'xl') => {
  const hoverColorMap = {
    'AiFillHeart': 'text-red-500 hover:text-red-600',
    'MdOutlineStar': 'text-orange-500 hover:text-orange-600',
  };

  const baseColors = hoverColorMap[iconName];
  if (baseColors) {
    const sizeMap = {
      'sm': 'text-sm',
      'md': 'text-base',
      'lg': 'text-lg',
      'xl': 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl'
    };
    const sizeClass = sizeMap[size] || 'text-xl';

    // 기존 text-* 클래스를 크기 클래스로 교체
    return baseColors.replace(/text-(xl|lg|md|sm|xs|2xl|3xl)/g, sizeClass);
  }

  return getIconColor(iconName, size);
};