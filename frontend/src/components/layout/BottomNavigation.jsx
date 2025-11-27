import { useLocation, useNavigate } from 'react-router-dom';
import { getIcon } from '../../utils/iconMap';
import { ENV } from '../../config/environment';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
      console.log('🔍 [DEBUG] ENV.API_BASE_URL:', ENV.API_BASE_URL);
      console.log('🔍 [DEBUG] Full URL:', `${ENV.API_BASE_URL}/api/quiz/daily`);
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${ENV.API_BASE_URL}/api/quiz/daily`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quiz');
      }

      const result = await response.json();

      if (result.success && result.data && result.data.questions) {
        const { questions } = result.data;

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
          alert('더 이상 풀 문제가 없습니다.');
        }
      }
    } catch (error) {
      console.error('Failed to start quiz:', error);
      alert('퀴즈를 불러오는데 실패했습니다.');
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
    </nav>
  );
};

export default BottomNavigation;