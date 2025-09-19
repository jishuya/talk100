import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider } from './contexts/AppContext';
import AppLayout from './components/layout/AppLayout';

// 페이지 컴포넌트들
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import StatusPage from './pages/StatusPage';
import MyPage from './pages/MyPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';

// 스타일 import
import './styles/globals.css';

// React Query 클라이언트 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5분
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <ThemeProvider>
            <Router>
              <div className="app-container min-h-screen bg-accent-pale">
                <AppLayout>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<HomePage />} />
                    <Route path="/quiz" element={<QuizPage />} />
                    <Route path="/quiz/:category" element={<QuizPage />} />
                    <Route path="/quiz/:category/:day" element={<QuizPage />} />
                    <Route path="/status" element={<StatusPage />} />
                    <Route path="/mypage" element={<MyPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </AppLayout>
              </div>
            </Router>
          </ThemeProvider>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App
