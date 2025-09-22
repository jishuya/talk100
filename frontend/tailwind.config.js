/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',    // 현재 커스텀 CSS와 일치
      'lg': '1024px',   // 현재 커스텀 CSS와 일치
      'xl': '1280px',
    },
    extend: {
      colors: {
        // CSS 변수를 Tailwind 테마로 통합
        primary: {
          DEFAULT: 'var(--primary-color)',
          dark: 'var(--primary-dark)',
          light: 'var(--primary-light)',
        },
        // 배경/표면 색상 - 용도 기반 네이밍
        surface: 'var(--accent-mint)',         // 카드, 컴포넌트 배경
        background: 'var(--accent-pale)',      // 전체 페이지 배경
        // 직접 사용 가능한 accent 색상
        'accent-mint': 'var(--accent-mint)',
        'accent-pale': 'var(--accent-pale)',
        // 텍스트 색상 - 간결한 네이밍
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-on-primary': 'var(--text-on-primary)',
        gray: {
          light: 'var(--gray-light)',
          border: 'var(--gray-border)',
        },
        success: 'var(--success)',
        error: 'var(--error)',
        warning: 'var(--warning)',
        info: 'var(--info)',
        white: 'var(--white)',
      },
      boxShadow: {
        'soft': 'var(--shadow)',               // 기본 소프트 그림자
        'medium': 'var(--shadow-lg)',          // 강조용 그림자
      },
      borderRadius: {
        'brand': 'var(--radius)',              // 브랜드 기본 라운드
        'brand-sm': 'var(--radius-small)',     // 작은 라운드
        'brand-full': 'var(--radius-full)',    // 완전 라운드
      },
      spacing: {
        'header': 'var(--header-height)',
        'bottom-nav': 'var(--bottom-nav-height)',
        'safe': 'var(--safe-area-inset)',
        '25': '100px',  // character-avatar
        '30': '120px',  // progress-circle
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Noto Sans KR',
          'sans-serif'
        ],
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
    },
  },
  plugins: [
    // 커스텀 플러그인으로 touchable 클래스 추가
    function({ addUtilities, addComponents }) {
      const touchableUtilities = {
        '.touchable': {
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
        },
        '.touchable:active': {
          transform: 'scale(0.98)',
          opacity: '0.8',
        },
      }
      addUtilities(touchableUtilities)

      // 필요 시 추가 컴포넌트 클래스 정의 가능
    }
  ],
}