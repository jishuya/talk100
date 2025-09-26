import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider } from './contexts/AppContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

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

/**QueryClient (데이터 관리-서버상태)
   └── Auth (로그인 관리)
     └── App (앱 전역 상태)
       └── Theme (테마/색상 관리)
         └── Router (페이지 이동)
           └── Layout (공통 레이아웃)
             └── 실제 페이지들
*/
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider> 
        <AppProvider>
          <ThemeProvider>
            <Router>
              <div className="app-container min-h-screen bg-background">
                <AppLayout>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={
                      <ProtectedRoute>
                        <HomePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/quiz" element={
                      <ProtectedRoute>
                        <QuizPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/quiz/:category" element={
                      <ProtectedRoute>
                        <QuizPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/quiz/:category/:day" element={
                      <ProtectedRoute>
                        <QuizPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/status" element={
                      <ProtectedRoute>
                        <StatusPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/mypage" element={
                      <ProtectedRoute>
                        <MyPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    } />
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
