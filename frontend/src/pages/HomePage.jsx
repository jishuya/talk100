import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const HomePage = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Talk100</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">안녕하세요, {user?.name}님!</span>
            <button className="text-blue-600 hover:text-blue-800">
              마이페이지
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 통계 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">출석률</h3>
            <p className="text-2xl font-bold text-blue-600">85%</p>
            <p className="text-xs text-gray-400">이번 주</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">정답률</h3>
            <p className="text-2xl font-bold text-green-600">73%</p>
            <p className="text-xs text-gray-400">전체 평균</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">연속 학습</h3>
            <p className="text-2xl font-bold text-purple-600">7일</p>
            <p className="text-xs text-gray-400">현재 스트릭</p>
          </div>
        </div>

        {/* 카테고리 선택 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">학습 카테고리</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Model Example */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">모범 예문</h3>
              <p className="text-gray-600 text-sm mb-4">일상에서 자주 사용되는 핵심 표현 학습</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">12문제</span>
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
                  시작하기
                </button>
              </div>
            </div>

            {/* Small Talk */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">스몰 토크</h3>
              <p className="text-gray-600 text-sm mb-4">실제 대화 상황 연습</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">6문제</span>
                <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm">
                  시작하기
                </button>
              </div>
            </div>

            {/* Cases in Point */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">사례 연구</h3>
              <p className="text-gray-600 text-sm mb-4">실제 상황에서의 장문 연습</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">2문제</span>
                <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-sm">
                  시작하기
                </button>
              </div>
            </div>

            {/* 복습하기 */}
            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">복습하기</h3>
              <p className="text-orange-600 text-sm mb-4">이전에 틀린 문제들을 다시 연습</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-orange-500">5문제 대기</span>
                <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm">
                  복습하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;