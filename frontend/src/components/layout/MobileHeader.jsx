import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

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
          <div className="flex items-center gap-3">
            {/* 알림 벨 */}
            <button className="w-8 h-8 flex items-center justify-center touchable">
              <span className="text-xl">🔔</span>
            </button>
            {/* 테마 토글 */}
            <button
              onClick={() => changeTheme(theme === 'light' ? 'dark' : 'light')}
              className="w-8 h-8 flex items-center justify-center touchable rounded-primary-sm"
            >
              <span className="text-lg">{theme === 'light' ? '🌙' : '☀️'}</span>
            </button>
          </div>
        );

      case 'settings':
        return (
          <button className="w-8 h-8 flex items-center justify-center touchable">
            <span className="text-xl">⚙️</span>
          </button>
        );

      case 'period':
        return (
          <div className="flex gap-2 bg-accent-pale px-2 py-1 rounded-primary-full">
            <button className="px-3 py-1 bg-white text-primary rounded-primary-full text-sm font-semibold">
              주간
            </button>
            <button className="px-3 py-1 text-text-secondary text-sm">
              월간
            </button>
            <button className="px-3 py-1 text-text-secondary text-sm">
              전체
            </button>
          </div>
        );

      case 'save':
        return (
          <button className="px-4 py-1 bg-primary text-text-on-primary rounded-primary-full text-sm font-semibold touchable">
            저장
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <header className="mobile-header fixed top-0 left-0 right-0 h-header bg-white shadow-primary z-50">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left Section */}
        <div className="flex items-center gap-2">
          {config.showBackButton && (
            <button
              onClick={handleBackClick}
              className="w-8 h-8 flex items-center justify-center touchable"
            >
              <span className="text-xl">←</span>
            </button>
          )}

          {config.showLogo ? (
            <h1 className="text-xl font-bold text-primary">talk100</h1>
          ) : (
            <h1 className="text-lg font-semibold text-text-primary">{config.title}</h1>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center">
          {renderRightContent()}
        </div>
      </div>

      {/* 홈페이지 전용 뱃지 섹션 */}
      {location.pathname === '/' && (
        <div className="absolute top-3 right-16 flex gap-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-accent-pale border border-primary-light rounded-primary-sm">
            <span className="text-sm">🏆</span>
            <span className="text-xs font-semibold text-primary">182</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-accent-pale border border-primary-light rounded-primary-sm">
            <span className="text-sm">⭐</span>
            <span className="text-xs font-semibold text-primary">4,203</span>
          </div>
        </div>
      )}
    </header>
  );
};

export default MobileHeader;