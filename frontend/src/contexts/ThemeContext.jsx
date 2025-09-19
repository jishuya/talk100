import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // 로컬 스토리지에서 테마 설정 불러오기
    if (typeof window !== 'undefined') {
      return localStorage.getItem('talk100-theme') || 'light';
    }
    return 'light';
  });

  // 시스템 다크모드 감지
  const [systemTheme, setSystemTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // 실제 적용되는 테마 계산
  const effectiveTheme = theme === 'auto' ? systemTheme : theme;

  // 테마 변경 함수
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('talk100-theme', newTheme);
    }
  };

  // DOM에 테마 적용
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-theme', effectiveTheme);

      // 메타 테마 컬러 업데이트 (모바일 상단바)
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content',
          effectiveTheme === 'dark' ? '#0F172A' : '#F1F8E8'
        );
      }
    }
  }, [effectiveTheme]);

  // 시스템 테마 변경 감지
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        setSystemTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const value = {
    theme,
    effectiveTheme,
    systemTheme,
    changeTheme,
    isDark: effectiveTheme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};