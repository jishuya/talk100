import React from 'react';
import { MOCK_HOME_DATA } from '../../mocks/homePageData';
import { HistoryCard } from '../ui';
import { getIcon } from '../../utils/iconMap.jsx';

// 아이콘별 색상 매핑 (Card.jsx와 동일)
const getIconColor = (iconName) => {
  const colorMap = {
    'BiBulb': 'text-xl text-yellow-500',        // 전구 - 노란색 (아이디어)
    'BiChat': 'text-xl text-blue-500',          // 채팅 - 파란색 (소통)
    'BiDetail': 'text-xl text-purple-500',      // 상세 - 보라색 (전문성)
    'MdOutlineStar': 'text-xl text-orange-500', // 별 - 주황색 (틀린문제)
    'AiFillHeart': 'text-xl text-red-500',      // 하트 - 빨간색 (즐겨찾기)
    'IoTrophy': 'text-xl text-yellow-600',      // 트로피 - 금색
    'IoStar': 'text-xl text-yellow-500'         // 별 - 노란색
  };
  return colorMap[iconName] || 'text-xl text-gray-400';
};

const StudyHistorySection = ({ historyItems, onHistoryItemClick }) => {
  // Mock 데이터를 fallback으로 사용 (API 실패시)
  const history = historyItems || MOCK_HOME_DATA.history;

  const handleItemClick = (item) => {
    if (onHistoryItemClick) {
      onHistoryItemClick(item);
    }
  };

  const getScoreColorClass = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="px-4 pb-5">
      <h2 className="text-base font-bold mb-3 text-text-primary">최근 학습</h2>
      <HistoryCard>
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center py-3 border-b border-gray-border last:border-b-0 touchable"
            onClick={() => handleItemClick(item)}
          >
            <div className="w-10 h-10 bg-accent-pale rounded-full flex items-center justify-center mr-3">
              {typeof item.icon === 'string' ? getIcon(item.icon, getIconColor(item.icon)) : item.icon}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-text-primary mb-0.5">{item.title}</div>
              <div className="text-xs text-text-secondary">{item.time}</div>
            </div>
            <div className={`text-sm font-bold ${getScoreColorClass(item.score)}`}>
              {item.score}%
            </div>
          </div>
        ))}
      </HistoryCard>
    </div>
  );
};

export default StudyHistorySection;