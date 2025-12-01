import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getIcon } from '../../utils/iconMap';

const HamburgerMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      id: 'home',
      title: '홈',
      icon: 'IoHomeOutline',
      path: '/',
      description: '대시보드'
    },
    {
      id: 'today-quiz',
      title: '오늘의 퀴즈',
      icon: 'IoBookOutline',
      path: '/today-quiz',
      description: '일일 학습 목표'
    },
    {
      id: 'wrong-answers',
      title: '틀린 문제',
      icon: 'fluent:star-24-regular',
      path: '/wrong-answers',
      description: '복습이 필요한 문제들'
    },
    {
      id: 'favorites',
      title: '즐겨찾기',
      icon: 'IoHeartOutline',
      path: '/favorites',
      description: '중요 표시한 문제들'
    },
    {
      id: 'status',
      title: '학습 통계',
      icon: 'IoStatsChartOutline',
      path: '/status',
      description: '학습 진행도 및 통계'
    },
    {
      id: 'mypage',
      title: '마이페이지',
      icon: 'IoPersonOutline',
      path: '/mypage',
      description: '프로필 및 설정'
    },
    {
      id: 'settings',
      title: '설정',
      icon: 'IoSettingsOutline',
      path: '/settings',
      description: '앱 설정'
    }
  ];

  const handleMenuClick = async (item) => {
    onClose();

    // 특별한 처리가 필요한 메뉴들
    if (item.id === 'today-quiz') {
      // 홈페이지로 이동한 후 오늘의 퀴즈 클릭 효과
      navigate('/');
      setTimeout(() => {
        const todayQuizButton = document.querySelector('.btn-start-learning');
        if (todayQuizButton) {
          todayQuizButton.click();
        }
      }, 100);
      return;
    }

    if (item.id === 'wrong-answers' || item.id === 'favorites') {
      // HomePage로 이동한 후 해당 퀴즈 섹션 찾아서 클릭
      navigate('/');
      setTimeout(() => {
        const categoryId = item.id === 'wrong-answers' ? 5 : 6;
        const quizCard = document.querySelector(`[data-category-id="${categoryId}"]`);
        if (quizCard) {
          quizCard.click();
        }
      }, 100);
      return;
    }

    // 나머지 메뉴는 일반적인 네비게이션
    navigate(item.path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      onClose();
    } catch {
      // Logout failed
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[200] animate-fade-in"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div className="fixed top-0 left-0 md:left-1/2 md:-translate-x-1/2 md:ml-[-240px] lg:ml-[-280px] h-full w-80 max-w-[85vw] bg-white z-[210] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-border bg-primary text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-2xl">
              {user?.avatar || '👤'}
            </div>
            <div>
              <div className="font-semibold text-sm">{user?.nickname || '사용자'}</div>
              <div className="text-xs opacity-90">talk100</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            {getIcon('IoCloseOutline', { size: '2xl', color: 'text-white/80 hover:text-white' })}
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 py-2 bg-white">
          {menuItems.map((item) => {
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item)}
                className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-accent-pale transition-colors group"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-gray-light rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                  {getIcon(item.icon, { size: 'lg', className: 'group-hover:text-white' })}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-text-primary text-sm">{item.title}</div>
                  <div className="text-xs text-text-secondary">{item.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-border p-4 bg-gray-light">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-red-200"
          >
            {/* {getIcon('noto:door', { size: 'md' })} */}
            <span className="font-medium">로그아웃</span>
          </button>

          <div className="text-center text-xs text-text-secondary mt-3">
            talk100 v1.0.0
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default HamburgerMenu;