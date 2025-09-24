import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { getIcon } from '../../utils/iconMap';
import HamburgerMenu from './HamburgerMenu';

const MobileHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, changeTheme } = useTheme();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 퀴즈 카테고리별 제목 매핑
  const getQuizTitle = (pathname) => {
    const pathSegments = pathname.split('/');
    if (pathSegments[1] === 'quiz' && pathSegments[2]) {
      const category = pathSegments[2];
      switch (category) {
        case 'cases-in-point':
          return 'Cases in Point';
        case 'model-example':
          return 'Model Example';
        case 'small-talk':
          return 'Small Talk';
        case 'wrong-answers':
          return '틀린 문제';
        case 'favorites':
          return '즐겨찾기';
        default:
          return '오늘의 퀴즈';
      }
    }
    return '오늘의 퀴즈';
  };

  // 페이지별 헤더 설정
  const getHeaderConfig = () => {
    // 퀴즈 페이지들 처리
    if (location.pathname.startsWith('/quiz')) {
      return {
        title: getQuizTitle(location.pathname),
        showBackButton: true,
        showLogo: false,
        rightContent: '',
      };
    }

    switch (location.pathname) {
      case '/':
        return {
          title: 'talk100',
          showBackButton: false,
          showLogo: true,
          showMenuButton: true,
          rightContent: 'profile', // 프로필 + 테마 토글
        };
      case '/status':
        return {
          title: '학습 통계',
          showBackButton: true,
          showLogo: false,
          rightContent: '',
        };
      case '/mypage':
        return {
          title: '마이페이지',
          showBackButton: true,
          showLogo: false,
          rightContent: 'settings',
        };
      case '/settings':
        return {
          title: '설정',
          showBackButton: true,
          showLogo: false,
          rightContent: 'save',
        };
      default:
        return {
          title: 'talk100',
          showBackButton: true,
          showLogo: false,
          rightContent: null,
        };
    }
  };

  const config = getHeaderConfig();

  const handleBackClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const renderRightContent = () => {
    switch (config.rightContent) {
      case 'profile':
        return (
          <div className="flex items-center gap-2">
            {/* 알림 벨 */}
            <button className="w-8 h-8 flex items-center justify-center text-lg touchable">
              {getIcon('tabler:bell-filled', { size: 'xl', className: 'text-yellow-500' })}
            </button>
            {/* 테마 토글 */}
            <button
              onClick={() => changeTheme(theme === 'light' ? 'dark' : 'light')}
              className="w-8 h-8 flex items-center justify-center text-lg touchable"
            >
              {theme === 'light' ?
                getIcon('tabler:moon-filled', { size: 'xl', className: 'text-yellow-500' }) :
                getIcon('tabler:sun-filled', { size: 'xl', className: 'text-yellow-500' })
              }
            </button>
          </div>
        );

      case 'settings':
        return (
          <button
            onClick={handleSettingsClick}
            className="w-8 h-8 flex items-center justify-center text-xl text-text-primary touchable"
          >
            {getIcon('IoSettingsOutline', { size: 'xl' })}
          </button>
        );

      case 'period':
        return (
          <div></div>
          // <div className="flex gap-1 bg-accent-pale p-1 rounded-primary-full">
          //   <button className="px-3 py-1 rounded-primary-full text-xs bg-white text-primary font-semibold">
          //     주간
          //   </button>
          //   <button className="px-3 py-1 rounded-primary-full text-xs text-text-secondary">
          //     월간
          //   </button>
          //   <button className="px-3 py-1 rounded-primary-full text-xs text-text-secondary">
          //     전체
          //   </button>
          // </div>
        );

      case 'save':
        return (
          <button className="px-4 py-1.5 bg-primary text-white rounded-full text-sm font-semibold touchable">
            저장
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:w-[768px] lg:w-[900px] h-header bg-white flex items-center justify-between px-4 z-[100] shadow-primary md:border-b md:border-gray-border md:shadow-none">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        {config.showMenuButton && (
          <button
            onClick={() => setIsMenuOpen(true)}
            className="w-8 h-8 flex items-center justify-center text-xl text-text-primary touchable"
          >
            {getIcon('IoMenuOutline', { size: 'xl' })}
          </button>
        )}

        {config.showBackButton && (
          <button
            onClick={handleBackClick}
            className="w-8 h-8 flex items-center justify-center text-xl text-text-primary touchable"
          >
            {getIcon('IoChevronBackOutline', { size: 'xl' })}
          </button>
        )}

        {config.showLogo ? (
          <span className="text-lg font-bold text-primary">talk100</span>
        ) : (
          <span className="text-base font-semibold text-text-primary">{config.title}</span>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {renderRightContent()}
      </div>

      {/* Hamburger Menu */}
      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </header>
  );
};

export default MobileHeader;