import React from 'react';
import { useLocation } from 'react-router-dom';
import MobileHeader from './MobileHeader';
import BottomNavigation from './BottomNavigation';
import { useApp } from '../../contexts/AppContext';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const { ui } = useApp();

  // 헤더/네비게이션을 숨길 페이지들 (로그인 등)
  const hideLayoutPages = ['/login'];
  const shouldHideLayout = hideLayoutPages.includes(location.pathname);

  // 하단 네비게이션을 숨길 페이지들 (퀴즈 진행 중 등)
  const hideBottomNavPages = ['/quiz'];
  const shouldHideBottomNav = hideBottomNavPages.some(path =>
    location.pathname.startsWith(path)
  ) || !ui.bottomNavVisible;

  if (shouldHideLayout) {
    return (
      <div className="app min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <div className="app min-h-screen flex flex-col">
      {/* Mobile Header */}
      <MobileHeader />

      {/* Main Content */}
      <main className={`
        main-content flex-1 overflow-y-auto -webkit-overflow-scrolling-touch
        ${shouldHideBottomNav ? 'pb-5' : 'pb-bottom-nav'}
      `}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {!shouldHideBottomNav && <BottomNavigation />}
    </div>
  );
};

export default AppLayout;