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
          <div className="header-right">
            {/* 알림 벨 */}
            <button className="notification-btn touchable">
              <span>🔔</span>
            </button>
            {/* 테마 토글 */}
            <button
              onClick={() => changeTheme(theme === 'light' ? 'dark' : 'light')}
              className="notification-btn touchable"
            >
              <span>{theme === 'light' ? '🌙' : '☀️'}</span>
            </button>
          </div>
        );

      case 'settings':
        return (
          <button className="header-btn touchable">
            <span>⚙️</span>
          </button>
        );

      case 'period':
        return (
          <div className="period-toggle">
            <button className="period-btn active">
              주간
            </button>
            <button className="period-btn">
              월간
            </button>
            <button className="period-btn">
              전체
            </button>
          </div>
        );

      case 'save':
        return (
          <button className="save-btn touchable">
            저장
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <header className="mobile-header">
      {/* Left Section */}
      <div className="header-left">
        {config.showBackButton && (
          <button
            onClick={handleBackClick}
            className="menu-btn touchable"
          >
            <span>←</span>
          </button>
        )}

        {config.showLogo ? (
          <span className="logo-text">talk100</span>
        ) : (
          <span className="header-title">{config.title}</span>
        )}
      </div>

      {/* Right Section */}
      <div className="header-right">
        {renderRightContent()}
      </div>
    </header>
  );
};

export default MobileHeader;