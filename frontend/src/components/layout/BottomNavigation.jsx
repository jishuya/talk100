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
      isActive: location.pathname.startsWith('/quiz'),
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
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 h-bottom-nav bg-white flex justify-around items-center shadow-primary z-40">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => handleNavClick(item.path)}
          className={`
            nav-item flex-1 flex flex-col items-center justify-center gap-1 py-2 touchable
            transition-colors duration-200
            ${item.isActive
              ? 'text-primary'
              : 'text-text-secondary hover:text-text-primary'
            }
          `}
        >
          <span className="nav-icon text-2xl">{item.icon}</span>
          <span className="nav-label text-xs font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNavigation;