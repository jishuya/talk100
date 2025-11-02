import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStatisticsData, useWeeklyChart, useCategoryProgress, useLearningPattern, useBadgesAchievements, useSummaryStats, useStreakData } from '../hooks/useApi';
import SummaryCard from '../components/stats/SummaryCard';
import StreakSection from '../components/stats/StreakSection';
import WeeklyChart from '../components/stats/WeeklyChart';
import CategoryProgress from '../components/stats/CategoryProgress';
import LearningPattern from '../components/stats/LearningPattern';
import BadgesSection from '../components/stats/BadgesSection';
import PeriodSelector from '../components/stats/PeriodSelector';

const StatusPage = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // 통계 데이터 훅들
  const { data: statisticsData, isLoading: statsLoading, error: statsError } = useStatisticsData(selectedPeriod);
  const { data: weeklyData, isLoading: weeklyLoading } = useWeeklyChart(selectedPeriod);
  const { data: categoryData, isLoading: categoryLoading } = useCategoryProgress();
  const { data: patternData, isLoading: patternLoading } = useLearningPattern();
  const { data: badgesData, isLoading: badgesLoading } = useBadgesAchievements();
  const { data: summaryData, isLoading: summaryLoading } = useSummaryStats(selectedPeriod);
  const { data: streakData, isLoading: streakLoading } = useStreakData();


  // Mock 데이터에서 값 추출
  const summary = summaryData || statisticsData?.summaryStats?.[selectedPeriod];
  const streak = streakData || statisticsData?.streak;
  const weeklyPattern = weeklyData || statisticsData?.weeklyPattern?.[selectedPeriod];
  const categoryProgress = categoryData;
  const learningPattern = patternData?.[selectedPeriod];
  const badges = badgesData || statisticsData?.badges;

  // 통합 로딩 상태
  const isLoading = statsLoading || weeklyLoading || categoryLoading || patternLoading || badgesLoading || summaryLoading || streakLoading;
  const error = statsError;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">통계를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">통계 데이터를 불러오는데 실패했습니다.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-primary text-white rounded"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  return (
    <div className="min-h-screen bg-accent-pale">
      <main className="p-4 pb-20 md:p-6">
        {/* 기간 선택 */}
        <div className="mb-5">
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
          />
        </div>

        {/* 전체 요약 카드 */}
        <SummaryCard data={summary} />

        {/* 연속 학습 */}
        <StreakSection data={streak} />

        {/* 요일별 학습 문제 */}
        <WeeklyChart data={weeklyPattern} period={selectedPeriod} />

        {/* 카테고리별 진행률 */}
        <CategoryProgress data={categoryProgress} />

        {/* 학습 패턴 분석 */}
        <LearningPattern data={learningPattern} />

        {/* 성취 뱃지 */}
        <BadgesSection data={badges} />
      </main>
    </div>
  );
};

export default StatusPage;