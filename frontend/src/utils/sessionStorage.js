import { v4 as uuidv4 } from 'uuid';

/**
 * 퀴즈 세션 관리 유틸리티
 * localStorage를 사용하여 퀴즈 세션 데이터를 관리합니다.
 */

const SESSION_PREFIX = 'quiz_session_';

/**
 * 카테고리 ID를 카테고리 번호로 매핑
 */
const CATEGORY_MAP = {
  1: { name: 'Model Example', category: 1 },
  2: { name: 'Small Talk', category: 2 },
  3: { name: 'Cases in Point', category: 3 },
  4: { name: 'Today Quiz', category: 4 },
  5: { name: 'Wrong Answers', category: 5 },
  6: { name: 'Favorites', category: 6 }
};

/**
 * 새로운 퀴즈 세션을 생성합니다.
 * @param {number} categoryId - 카테고리 ID (1-6)
 * @param {number} day - Day 번호 (기본값: 1)
 * @param {Array<number>} questionIds - 문제 ID 배열
 * @param {string} inputMode - 입력 모드 ('voice' | 'keyboard', 기본값: 'keyboard')
 * @returns {string} 생성된 세션 ID
 */
export const createSession = (categoryId, day = 1, questionIds = [], inputMode = 'keyboard') => {
  const sessionId = uuidv4();
  const categoryInfo = CATEGORY_MAP[categoryId];

  if (!categoryInfo) {
    throw new Error(`Invalid category ID: ${categoryId}`);
  }

  const session = {
    sessionId,
    category: categoryInfo.category,
    categoryName: categoryInfo.name,
    day,
    startTime: new Date().toISOString(),
    inputMode,

    // 문제 관리
    questionIds: questionIds,
    currentQuestionIndex: 0,
    currentQuestionId: questionIds[0] || null,
    completedQuestionIds: [],

    // 사용자 개인화 정보 (나중에 API에서 가져올 수 있음)
    userPreferences: {
      favoriteIds: [],
      starredIds: []
    }
  };

  // localStorage에 세션 저장
  const key = `${SESSION_PREFIX}${sessionId}`;
  localStorage.setItem(key, JSON.stringify(session));

  return sessionId;
};

/**
 * 세션 ID로 세션 데이터를 가져옵니다.
 * @param {string} sessionId - 세션 ID
 * @returns {Object|null} 세션 데이터 또는 null
 */
export const getSession = (sessionId) => {
  if (!sessionId) return null;

  const key = `${SESSION_PREFIX}${sessionId}`;
  const sessionData = localStorage.getItem(key);

  if (!sessionData) return null;

  try {
    return JSON.parse(sessionData);
  } catch (error) {
    console.error('Failed to parse session data:', error);
    return null;
  }
};

/**
 * 세션 데이터를 업데이트합니다.
 * @param {string} sessionId - 세션 ID
 * @param {Object} updates - 업데이트할 필드들
 * @returns {boolean} 성공 여부
 */
export const updateSession = (sessionId, updates) => {
  const session = getSession(sessionId);

  if (!session) {
    console.error('Session not found:', sessionId);
    return false;
  }

  // 업데이트 적용
  const updatedSession = {
    ...session,
    ...updates,
    // 중첩 객체는 별도로 처리
    userPreferences: updates.userPreferences
      ? { ...session.userPreferences, ...updates.userPreferences }
      : session.userPreferences
  };

  const key = `${SESSION_PREFIX}${sessionId}`;
  localStorage.setItem(key, JSON.stringify(updatedSession));

  return true;
};

/**
 * 다음 문제로 이동합니다.
 * @param {string} sessionId - 세션 ID
 * @returns {boolean} 성공 여부
 */
export const moveToNextQuestion = (sessionId) => {
  const session = getSession(sessionId);

  if (!session) return false;

  const nextIndex = session.currentQuestionIndex + 1;

  if (nextIndex >= session.questionIds.length) {
    return false;
  }

  const nextQuestionId = session.questionIds[nextIndex];
  const completed = session.completedQuestionIds.length;
  const total = session.questionIds.length;

  return updateSession(sessionId, {
    currentQuestionIndex: nextIndex,
    currentQuestionId: nextQuestionId,
    progress: {
      completed,
      total,
      percentage: Math.round((completed / total) * 100)
    }
  });
};

/**
 * 현재 문제를 완료 처리합니다.
 * @param {string} sessionId - 세션 ID
 * @param {number} questionId - 완료한 문제 ID
 * @returns {boolean} 성공 여부
 */
export const markQuestionCompleted = (sessionId, questionId) => {
  const session = getSession(sessionId);

  if (!session) return false;

  // 이미 완료된 문제인지 확인
  if (session.completedQuestionIds.includes(questionId)) {
    return true;
  }

  const completedQuestionIds = [...session.completedQuestionIds, questionId];
  const completed = completedQuestionIds.length;
  const total = session.questionIds.length;

  return updateSession(sessionId, {
    completedQuestionIds,
    progress: {
      completed,
      total,
      percentage: Math.round((completed / total) * 100)
    }
  });
};

/**
 * 퀴즈 완료 여부를 확인합니다.
 * @param {string} sessionId - 세션 ID
 * @returns {boolean} 완료 여부
 */
export const isQuizCompleted = (sessionId) => {
  const session = getSession(sessionId);

  if (!session) return false;

  return session.currentQuestionIndex >= session.questionIds.length - 1 &&
         session.completedQuestionIds.length === session.questionIds.length;
};

/**
 * 즐겨찾기를 토글합니다.
 * @param {string} sessionId - 세션 ID
 * @param {number} questionId - 문제 ID
 * @returns {boolean} 성공 여부
 */
export const toggleFavorite = (sessionId, questionId) => {
  const session = getSession(sessionId);

  if (!session) return false;

  // userPreferences가 없으면 초기화
  if (!session.userPreferences) {
    session.userPreferences = {
      favoriteIds: [],
      starredIds: []
    };
  }

  const favoriteIds = session.userPreferences.favoriteIds || [];
  const isFavorite = favoriteIds.includes(questionId);

  const updatedFavoriteIds = isFavorite
    ? favoriteIds.filter(id => id !== questionId)
    : [...favoriteIds, questionId];

  return updateSession(sessionId, {
    userPreferences: {
      ...session.userPreferences,
      favoriteIds: updatedFavoriteIds
    }
  });
};

/**
 * 별표(틀린문제)를 토글합니다.
 * @param {string} sessionId - 세션 ID
 * @param {number} questionId - 문제 ID
 * @returns {boolean} 성공 여부
 */
export const toggleStar = (sessionId, questionId) => {
  const session = getSession(sessionId);

  if (!session) return false;

  // userPreferences가 없으면 초기화
  if (!session.userPreferences) {
    session.userPreferences = {
      favoriteIds: [],
      starredIds: []
    };
  }

  const starredIds = session.userPreferences.starredIds || [];
  const isStarred = starredIds.includes(questionId);

  const updatedStarredIds = isStarred
    ? starredIds.filter(id => id !== questionId)
    : [...starredIds, questionId];

  return updateSession(sessionId, {
    userPreferences: {
      ...session.userPreferences,
      starredIds: updatedStarredIds
    }
  });
};

/**
 * 입력 모드를 변경합니다.
 * @param {string} sessionId - 세션 ID
 * @param {string} inputMode - 입력 모드 ('voice' | 'keyboard')
 * @returns {boolean} 성공 여부
 */
export const updateInputMode = (sessionId, inputMode) => {
  return updateSession(sessionId, { inputMode });
};

/**
 * 세션을 삭제합니다.
 * @param {string} sessionId - 세션 ID
 * @returns {boolean} 성공 여부
 */
export const deleteSession = (sessionId) => {
  if (!sessionId) return false;

  const key = `${SESSION_PREFIX}${sessionId}`;
  localStorage.removeItem(key);

  return true;
};
