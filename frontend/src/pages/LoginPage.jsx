import { ENV } from '../config/environment';

const LoginPage = () => {
  const API_BASE_URL = ENV.API_BASE_URL;

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
    <main className="relative min-h-[100svh] overflow-hidden bg-[#F4FAF5] text-text-primary lg:flex lg:items-center lg:justify-center lg:p-8">
      <div className="pointer-events-none absolute -left-28 -top-28 h-72 w-72 rounded-full bg-[#D8EFD3]/70 blur-2xl" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-[#95D2B3]/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-white/80 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col lg:min-h-0 lg:flex-row lg:items-stretch lg:overflow-hidden lg:rounded-[36px] lg:bg-white/55 lg:shadow-[0_28px_90px_rgba(44,62,80,0.12)] lg:backdrop-blur-xl">
        <section className="relative flex flex-1 flex-col items-center justify-center px-6 pb-6 pt-8 text-center sm:py-10 lg:min-h-[620px] lg:px-16 lg:py-12">
          <div className="absolute left-8 top-24 hidden -rotate-6 rounded-2xl border border-white/80 bg-white/55 px-5 py-4 shadow-[0_14px_35px_rgba(85,173,155,0.12)] backdrop-blur-sm lg:block">
            <div className="mb-2 flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary/35" />
              <span className="h-2 w-2 rounded-full bg-primary/55" />
              <span className="h-2 w-2 rounded-full bg-primary/75" />
            </div>
            <div className="h-1.5 w-20 rounded-full bg-[#D8EFD3]" />
          </div>

          <div className="relative mb-3 h-32 w-32 sm:h-40 sm:w-40 lg:mb-6 lg:h-52 lg:w-52">
            <div className="absolute inset-2 rounded-full bg-[#D8EFD3]/80 blur-xl" />
            <div className="absolute inset-0 rounded-full border border-white/80 bg-white/45 shadow-[0_20px_55px_rgba(85,173,155,0.16)]" />
            <img
              src="/logo.png"
              alt="웃고 있는 talk100 마이크 캐릭터"
              className="relative h-full w-full scale-[0.84] object-contain drop-shadow-[0_14px_16px_rgba(66,138,123,0.16)]"
            />
          </div>

          <div className="mb-2 flex items-center justify-center">
            <span
              className="text-4xl font-semibold tracking-[-0.04em] text-primary sm:text-5xl"
              style={{ fontFamily: 'Fredoka, sans-serif' }}
            >
              talk100
            </span>
          </div>

          <h1 className="text-[26px] font-extrabold leading-[1.35] tracking-[-0.04em] text-[#243B37] sm:text-3xl lg:text-4xl">
            매일 한 문장,<br />
            <span className="text-primary-dark">영어가 습관이 되다</span>
          </h1>
        </section>

        <section className="relative mt-auto w-full rounded-t-[32px] bg-white px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-7 shadow-[0_-16px_45px_rgba(44,62,80,0.08)] sm:px-10 lg:mt-0 lg:flex lg:max-w-[480px] lg:items-center lg:rounded-none lg:px-14 lg:py-12 lg:shadow-none">
          <div className="mx-auto w-full max-w-sm">
            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                className="relative flex h-14 w-full items-center justify-center rounded-2xl border border-[#DDE5E2] bg-white px-6 text-[15px] font-bold text-[#3D4946] shadow-[0_5px_18px_rgba(44,62,80,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-[#BFCBC7] hover:shadow-[0_9px_22px_rgba(44,62,80,0.09)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:translate-y-0"
              >
                <svg className="absolute left-5 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Google로 계속하기</span>
              </button>

              <button
                onClick={handleNaverLogin}
                className="relative flex h-14 w-full items-center justify-center rounded-2xl bg-[#03C75A] px-6 text-[15px] font-bold text-white shadow-[0_7px_20px_rgba(3,199,90,0.18)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#02B350] hover:shadow-[0_10px_24px_rgba(3,199,90,0.24)] focus:outline-none focus:ring-2 focus:ring-[#03C75A] focus:ring-offset-2 active:translate-y-0"
              >
                <svg className="absolute left-5 h-5 w-5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
                </svg>
                <span>네이버로 계속하기</span>
              </button>

              <button
                onClick={handleKakaoLogin}
                className="relative flex h-14 w-full items-center justify-center rounded-2xl bg-[#FEE500] px-6 text-[15px] font-bold text-[#191919] shadow-[0_7px_20px_rgba(68,57,0,0.12)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#F8DF00] hover:shadow-[0_10px_24px_rgba(68,57,0,0.16)] focus:outline-none focus:ring-2 focus:ring-[#E6CF00] focus:ring-offset-2 active:translate-y-0"
              >
                <svg className="absolute left-5 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#191919" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
                </svg>
                <span>카카오로 계속하기</span>
              </button>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
