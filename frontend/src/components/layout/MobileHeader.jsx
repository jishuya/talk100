import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { IoNotifications, IoMoon, IoSunny, IoSettingsOutline, IoChevronBackOutline } from 'react-icons/io5';
import { getIconColor } from '../../utils/iconColors.js';

const MobileHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, changeTheme } = useTheme();
  const { user } = useAuth();

  // 페이지별 헤더 설정
  const getHeaderConfig = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'talk100',
          showBackButton: false,
          showLogo: true,
          rightContent: 'profile', // 프로필 + 테마 토글
        };
      case '/quiz':
        return {
          title: '오늘의 퀴즈',
          showBackButton: true,
          showLogo: false,
          rightContent: 'settings',
        };
      case '/status':
        return {
          title: '학습 통계',
          showBackButton: false,
          showLogo: false,
          rightContent: 'period',
        };
      case '/mypage':
        return {
          title: '마이페이지',
          showBackButton: false,
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

  const renderRightContent = () => {
    switch (config.rightContent) {
      case 'profile':
        return (
          <div className="flex items-center gap-2">
            {/* 알림 벨 */}
            <button className="w-8 h-8 flex items-center justify-center text-lg touchable">
              <IoNotifications className={getIconColor('IoNotifications', 'xl')} />
            </button>
            {/* 테마 토글 */}
            <button
              onClick={() => changeTheme(theme === 'light' ? 'dark' : 'light')}
              className="w-8 h-8 flex items-center justify-center text-lg touchable"
            >
              {theme === 'light' ?
                <IoMoon className={getIconColor('IoMoon', 'xl')} /> :
                <IoSunny className={getIconColor('IoSunny', 'xl')} />
              }
            </button>
          </div>
        );

      case 'settings':
        return (
          <button className="w-8 h-8 flex items-center justify-center text-xl text-text-primary touchable">
            <IoSettingsOutline className={getIconColor('IoSettingsOutline', 'xl')} />
          </button>
        );

      case 'period':
        return (
          <div className="flex gap-1 bg-accent-pale p-1 rounded-primary-full">
            <button className="px-3 py-1 rounded-primary-full text-xs bg-white text-primary font-semibold">
              주간
            </button>
            <button className="px-3 py-1 rounded-primary-full text-xs text-text-secondary">
              월간
            </button>
            <button className="px-3 py-1 rounded-primary-full text-xs text-text-secondary">
              전체
            </button>
          </div>
        );

      case 'save':
        return (
          <button className="px-4 py-1.5 bg-primary text-white rounded-primary-full text-sm font-semibold touchable">
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
        {config.showBackButton && (
          <button
            onClick={handleBackClick}
            className="w-8 h-8 flex items-center justify-center text-xl text-text-primary touchable"
          >
            <IoChevronBackOutline className={getIconColor('IoChevronBackOutline', 'xl')} />
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
    </header>
  );
};

export default MobileHeader;