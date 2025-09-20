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
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => handleNavClick(item.path)}
          className={`nav-item touchable ${item.isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNavigation;