import React from 'react';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Talk100</h1>
          <p className="text-gray-600 mt-2">영어문장 암기 학습 어플리케이션</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            구글로 로그인
          </button>

          <button
            onClick={handleNaverLogin}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <span className="text-xl font-bold mr-2">N</span>
            네이버로 로그인
          </button>

          <button
            onClick={handleKakaoLogin}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
          >
            <span className="text-xl font-bold mr-2">K</span>
            카카오로 로그인
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>김재우의 영어회화 수강생을 위한</p>
          <p>맞춤형 학습 플랫폼</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;