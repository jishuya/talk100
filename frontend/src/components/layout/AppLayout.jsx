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
      <div className="w-full min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen md:max-w-[768px] lg:max-w-[900px] mx-auto md:shadow-medium flex flex-col bg-background">
      {/* Mobile Header */}
      <MobileHeader />

      {/* Main Content */}
      <main className={`
        flex-1 overflow-y-auto pt-header min-h-[calc(100vh-theme(spacing.header))]
        ${shouldHideBottomNav ? 'pb-5' : 'pb-[calc(theme(spacing.bottom-nav)+theme(spacing.safe))]'}
      `}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {!shouldHideBottomNav && <BottomNavigation />}
    </div>
  );
};

export default AppLayout;