import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getIcon } from '../../utils/iconMap';
import { api } from '../../services/apiService';
import AlertModal from '../ui/AlertModal';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', icon: '' });

  const navItems = [
    {
      path: '/',
      icon: 'Home',
      activeIcon: 'Home',
      label: '홈',
      isActive: location.pathname === '/',
    },
    {
      path: '/quiz',
      icon: 'IoBookOutline',
      activeIcon: 'IoBookOutline',
      label: '학습',
      isActive: location.pathname.startsWith('/quiz'),  // /quiz/daily, /quiz/review 허용
    },
    {
      path: '/status',
      icon: 'IoStatsChartOutline',
      activeIcon: 'IoStatsChartOutline',
      label: '통계',
      isActive: location.pathname === '/status',
    },
    {
      path: '/mypage',
      icon: 'IoPersonOutline',
      activeIcon: 'IoPersonOutline',
      label: '마이',
      isActive: location.pathname === '/mypage',
    },
  ];

  // 오늘의 퀴즈 시작
  const startTodayQuiz = async () => {
    try {
      // api.apiCall()을 사용하여 ENV.API_BASE_URL을 runtime에 가져옴
      const result = await api.apiCall('/api/quiz/daily', { method: 'GET' });

      if (result && result.questions) {
        const { questions } = result;

        if (questions.length > 0) {
          // 세션 생성 (HomePage와 동일한 방식)
          const questionIds = questions.map(q => q.question_id);
          const sessionId = `session_${Date.now()}`;
          const newSession = {
            sessionId,
            category: 4,
            questionIds,
            questions,
            progress: { completed: 0, total: questions.length, percentage: 0 },
            currentQuestionIndex: 0,
            completedQuestionIds: [],
            inputMode: 'keyboard',
            createdAt: Date.now()
          };

          localStorage.setItem(`quiz_session_${sessionId}`, JSON.stringify(newSession));
          navigate(`/quiz?session=${sessionId}`);
        } else {
          setAlertModal({ isOpen: true, message: '더 이상 풀 문제가 없습니다.', icon: '📭' });
        }
      }
    } catch {
      setAlertModal({ isOpen: true, message: '퀴즈를 불러오는데 실패했습니다.', icon: '❌' });
    }
  };

  const handleNavClick = (path) => {
    // '학습' 버튼을 클릭한 경우 오늘의 퀴즈 시작
    if (path === '/quiz') {
      startTodayQuiz();
    } else {
      navigate(path);
    }
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

      {/* Alert 모달 */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, message: '', icon: '' })}
        message={alertModal.message}
        icon={alertModal.icon}
      />
    </nav>
  );
};

export default BottomNavigation;