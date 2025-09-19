import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Navigate } from 'react-router-dom';

const HomePage = () => {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { theme, changeTheme } = useTheme();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent-pale">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-accent-pale">
      {/* 헤더 */}
      <header className="bg-white shadow-primary">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">talk100</h1>
          <div className="flex items-center space-x-4">
            <span className="text-text-secondary">안녕하세요, {user?.name || '학습자'}님!</span>
            <button
              onClick={() => changeTheme(theme === 'light' ? 'dark' : 'light')}
              className="text-primary hover:text-primary-dark touchable px-2 py-1 rounded-primary-sm"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button
              onClick={logout}
              className="bg-error text-white px-4 py-2 rounded-primary-sm hover:opacity-90 touchable transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Phase 1 테스트 - 새로운 테마 시스템 데모 */}
        <div className="bg-white p-6 rounded-primary shadow-primary mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">🎨 Phase 1 완료: 테마 시스템</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-primary rounded-primary-sm text-center">
              <div className="text-text-on-primary font-semibold">Primary</div>
              <div className="text-text-on-primary text-sm opacity-90">#55AD9B</div>
            </div>
            <div className="p-4 bg-primary-light rounded-primary-sm text-center">
              <div className="text-text-primary font-semibold">Primary Light</div>
              <div className="text-text-secondary text-sm">#95D2B3</div>
            </div>
            <div className="p-4 bg-accent-mint rounded-primary-sm text-center">
              <div className="text-text-primary font-semibold">Accent Mint</div>
              <div className="text-text-secondary text-sm">#D8EFD3</div>
            </div>
            <div className="p-4 bg-accent-pale rounded-primary-sm text-center border border-gray-border">
              <div className="text-text-primary font-semibold">Accent Pale</div>
              <div className="text-text-secondary text-sm">#F1F8E8</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-light rounded-primary-sm">
            <p className="text-text-primary">✅ CSS 변수 → Tailwind 테마 통합</p>
            <p className="text-text-primary">✅ 다크모드 지원</p>
            <p className="text-text-primary">✅ 터치 피드백 (.touchable)</p>
            <p className="text-text-primary">✅ talk100 디자인 시스템 적용</p>
          </div>
        </div>

        {/* 임시 네비게이션 (Phase 2에서 proper 구현) */}
        <div className="bg-white p-6 rounded-primary shadow-primary mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">페이지 네비게이션 테스트</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/quiz"
              className="touchable p-4 bg-primary text-text-on-primary rounded-primary-sm text-center hover:bg-primary-dark transition-colors"
            >
              📚 퀴즈
            </a>
            <a
              href="/status"
              className="touchable p-4 bg-info text-white rounded-primary-sm text-center hover:opacity-90 transition-colors"
            >
              📊 통계
            </a>
            <a
              href="/mypage"
              className="touchable p-4 bg-warning text-white rounded-primary-sm text-center hover:opacity-90 transition-colors"
            >
              👤 마이페이지
            </a>
            <a
              href="/settings"
              className="touchable p-4 bg-text-secondary text-white rounded-primary-sm text-center hover:opacity-90 transition-colors"
            >
              ⚙️ 설정
            </a>
          </div>
        </div>

        <div className="text-center text-text-secondary">
          <p>🚧 Phase 2에서 공통 컴포넌트 & 레이아웃 구현 예정</p>
        </div>
      </main>
    </div>
  );
};

export default HomePage;