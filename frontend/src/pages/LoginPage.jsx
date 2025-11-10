import Logo from '../components/ui/Logo';

const LoginPage = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const handleNaverLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/naver`;
  };

  const handleKakaoLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/kakao`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#95D2B3] via-[#D8EFD3] to-[#F1F8E8] p-4">
      <div className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgba(85,173,155,0.2)] w-full max-w-md backdrop-blur-sm">
        {/* 로고 영역 */}
        <div className="text-center mb-10">
          <div className="flex justify-center">
            <Logo width={270} height={95} animated={true} />
          </div>
          <p className="text-text-secondary text-sm">
            영어문장 암기 학습 어플리케이션
          </p>
        </div>

        {/* 로그인 버튼들 */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl text-base font-semibold text-gray-700 hover:border-primary hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Google로 시작하기</span>
          </button>

          <button
            onClick={handleNaverLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#03C75A] border-2 border-[#03C75A] rounded-xl text-base font-semibold text-white hover:bg-[#02B350] focus:outline-none focus:ring-2 focus:ring-[#03C75A] focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
              <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"/>
            </svg>
            <span>네이버로 시작하기</span>
          </button>

          <button
            onClick={handleKakaoLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#FEE500] border-2 border-[#FEE500] rounded-xl text-base font-semibold text-[#191919] hover:bg-[#FDD835] focus:outline-none focus:ring-2 focus:ring-[#FEE500] focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#191919" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
            </svg>
            <span>카카오로 시작하기</span>
          </button>
        </div>

        {/* 설명 문구 */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-center text-xs text-text-secondary leading-relaxed">
            김재우의 영어회화 100 수강생을 위한<br />
            맞춤형 학습 플랫폼
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;