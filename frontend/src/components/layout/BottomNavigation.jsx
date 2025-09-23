import { useLocation, useNavigate } from 'react-router-dom';
import { getIcon } from '../../utils/iconMap';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      path: '/',
      icon: 'IoHomeOutline',
      activeIcon: 'IoHome',
      label: '홈',
      isActive: location.pathname === '/',
    },
    {
      path: '/quiz',
      icon: 'IoBookOutline',
      activeIcon: 'IoBook',
      label: '학습',
      isActive: location.pathname.startsWith('/quiz'),  // /quiz/daily, /quiz/review 허용
    },
    {
      path: '/status',
      icon: 'IoStatsChartOutline',
      activeIcon: 'IoStatsChart',
      label: '통계',
      isActive: location.pathname === '/status',
    },
    {
      path: '/mypage',
      icon: 'IoPersonOutline',
      activeIcon: 'IoPerson',
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
          className="flex-1 flex flex-col items-center justify-center gap-1 p-2 touchable transition-colors duration-300"
        >
          {getIcon(item.isActive ? item.activeIcon : item.icon, {
            size: '2xl',
            color: item.isActive ? 'text-primary' : 'text-gray-400'
          })}
          <span className={`text-xs font-medium ${
            item.isActive ? 'text-primary' : 'text-gray-400'
          }`}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNavigation;