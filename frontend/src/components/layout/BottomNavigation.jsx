import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      path: '/',
      icon: '🏠',
      label: '홈',
      isActive: location.pathname === '/',
    },
    {
      path: '/quiz',
      icon: '📚',
      label: '학습',
      isActive: location.pathname.startsWith('/quiz'),  // /quiz/daily, /quiz/review 허용
    },
    {
      path: '/status',
      icon: '📊',
      label: '통계',
      isActive: location.pathname === '/status',
    },
    {
      path: '/mypage',
      icon: '👤',
      label: '마이',
      isActive: location.pathname === '/mypage',
    },
  ];

  const handleNavClick = (path) => {
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:w-[768px] lg:w-[900px] h-[calc(theme(spacing.bottom-nav)+theme(spacing.safe))] bg-white flex justify-around items-center pb-safe shadow-[0_-2px_8px_rgba(0,0,0,0.08)] z-[100]">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => handleNavClick(item.path)}
          className={`flex-1 flex flex-col items-center justify-center gap-1 p-2 touchable transition-colors duration-300 ${
            item.isActive ? 'text-primary' : 'text-text-secondary'
          }`}
        >
          <span className="text-2xl">{item.icon}</span>
          <span className="text-xs font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNavigation;