/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CSS 변수를 Tailwind 테마로 통합
        primary: {
          DEFAULT: 'var(--primary-color)',
          dark: 'var(--primary-dark)',
          light: 'var(--primary-light)',
        },
        accent: {
          mint: 'var(--accent-mint)',
          pale: 'var(--accent-pale)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          'on-primary': 'var(--text-on-primary)',
        },
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
      backgroundImage: {
        'gradient-primary': 'var(--bg-gradient)',
        'gradient-soft': 'var(--bg-gradient-soft)',
        'gradient-mint': 'var(--bg-gradient-mint)',
        'gradient-fresh': 'var(--bg-gradient-fresh)',
      },
      boxShadow: {
        'primary': 'var(--shadow)',
        'primary-lg': 'var(--shadow-lg)',
      },
      borderRadius: {
        'primary': 'var(--radius)',
        'primary-sm': 'var(--radius-small)',
        'primary-full': 'var(--radius-full)',
      },
      spacing: {
        'header': 'var(--header-height)',
        'bottom-nav': 'var(--bottom-nav-height)',
        'safe': 'var(--safe-area-inset)',
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
        'pulse-primary': 'pulse 1.5s infinite',
      },
      transitionProperty: {
        'touch': 'transform, opacity, background-color',
      },
    },
  },
  plugins: [
    // 커스텀 플러그인으로 touchable 클래스 추가
    function({ addUtilities }) {
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
    }
  ],
}