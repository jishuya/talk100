import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useUpdateSettings } from '../../hooks/useApi';
import { getIcon } from '../../utils/iconMap';
import HamburgerMenu from './HamburgerMenu';
import { getSession } from '../../utils/sessionStorage';

const MobileHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, changeTheme } = useTheme();
  const updateSettingsMutation = useUpdateSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState('오늘의 퀴즈');

  // 세션 기반 퀴즈 제목 가져오기
  useEffect(() => {
    if (location.pathname === '/quiz') {
      const sessionId = searchParams.get('session');
      if (sessionId) {
        const session = getSession(sessionId);
        if (session) {
          const title = getCategoryTitle(session.category);
          setQuizTitle(title);
        }
      }
    }
  }, [location.pathname, searchParams]);

  // 카테고리 ID에 따른 제목 매핑
  const getCategoryTitle = (categoryId) => {
    const categoryMap = {
      1: 'Model Example',
      2: 'Small Talk',
      3: 'Cases in Point',
      4: '오늘의 퀴즈',
      5: '틀린 문제',
      6: '즐겨찾기'
    };
    return categoryMap[categoryId] || '퀴즈';
  };

  // 페이지별 헤더 설정
  const getHeaderConfig = () => {
    // 퀴즈 페이지들 처리 (세션 기반)
    if (location.pathname === '/quiz') {
      return {
        title: quizTitle,
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

  // 테마 토글 핸들러 (MyPage와 동일한 로직)
  const handleThemeToggle = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';

    try {
      // 즉시 테마 변경 (Optimistic UI)
      changeTheme(newTheme);

      // 백엔드 업데이트
      await updateSettingsMutation.mutateAsync({
        display: { theme: newTheme }
      });
    } catch (error) {
      console.error('Theme toggle error:', error);
      // 에러 발생 시 원래 테마로 롤백
      changeTheme(theme);
    }
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
              onClick={handleThemeToggle}
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