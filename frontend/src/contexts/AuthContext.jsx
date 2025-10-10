import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 로그인 상태 확인
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const userInfo = localStorage.getItem('user_info');

      if (token && userInfo) {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      setUser(null);
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_info');
    } finally {
      setLoading(false);
    }
  };

  // 로그인 처리 (OAuth 콜백에서 호출)
  const handleAuthSuccess = (token, userInfo) => {
    // 필요한 정보만 필터링하여 localStorage에 저장
    const filteredUserInfo = {
      uid: userInfo.uid,
      name: userInfo.name,
      voice_gender: userInfo.voice_gender,
      daily_goal: userInfo.daily_goal,
      level: userInfo.level
    };

    localStorage.setItem('jwt_token', token);
    localStorage.setItem('user_info', JSON.stringify(filteredUserInfo));
    setUser(filteredUserInfo);
    setError(null);
  };

  // 로그아웃
  const logout = async () => {
    try {
      // 간단한 로그아웃 처리 - localStorage만 정리
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_info');
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // 컴포넌트 마운트시 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // URL에서 인증 토큰 확인 (OAuth 콜백 처리)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userInfo = urlParams.get('user');

    if (token && userInfo) {
      try {
        const decodedUser = JSON.parse(decodeURIComponent(userInfo));
        handleAuthSuccess(token, decodedUser);

        // URL에서 파라미터 제거
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Failed to process auth callback:', error);
        setError('로그인 처리 중 오류가 발생했습니다.');
      }
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    logout,
    checkAuthStatus,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};