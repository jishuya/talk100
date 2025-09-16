import React from 'react';
import { useParams } from 'react-router-dom';

const TestPage = () => {
  const { category, day } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            테스트 페이지 - {category}
            {day && ` Day ${day}`}
          </h1>
          <p className="text-gray-600">구현 예정</p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;