import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// 앱 상태 초기값
const initialState = {
  // 사용자 설정
  settings: {
    difficulty: 2, // 1: 초급, 2: 중급, 3: 고급
    dailyGoal: 2, // 일일 목표 Day 수
    monthlyGoal: 30, // 월간 목표일
    targetAccuracy: 80, // 목표 정답률
    autoPlay: false, // 자동 음성 재생
    playbackSpeed: 1.0, // 음성 재생 속도
    reviewCount: 6, // 복습 문제 개수
    notifications: {
      reminder: true,
      reminderTime: '20:00',
      reviewReminder: true,
      weeklyReport: false,
    },
  },

  // 현재 퀴즈 상태
  quiz: {
    mode: null, // 'daily', 'category', 'wrong', 'favorite'
    category: null,
    day: null,
    currentQuestion: 0,
    totalQuestions: 0,
    questions: [],
    answers: [],
    isActive: false,
  },

  // 학습 통계
  stats: {
    totalDays: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    accuracy: 0,
    lastStudyDate: null,
  },

  // UI 상태
  ui: {
    isLoading: false,
    error: null,
    activeModal: null,
    bottomNavVisible: true,
  },
};

// 액션 타입 정의
const ACTION_TYPES = {
  // 설정 관련
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  RESET_SETTINGS: 'RESET_SETTINGS',

  // 퀴즈 관련
  START_QUIZ: 'START_QUIZ',
  END_QUIZ: 'END_QUIZ',
  NEXT_QUESTION: 'NEXT_QUESTION',
  SUBMIT_ANSWER: 'SUBMIT_ANSWER',
  UPDATE_QUIZ_STATE: 'UPDATE_QUIZ_STATE',

  // 통계 관련
  UPDATE_STATS: 'UPDATE_STATS',

  // UI 관련
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SHOW_MODAL: 'SHOW_MODAL',
  HIDE_MODAL: 'HIDE_MODAL',
  TOGGLE_BOTTOM_NAV: 'TOGGLE_BOTTOM_NAV',
};

// 리듀서 함수
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case ACTION_TYPES.RESET_SETTINGS:
      return {
        ...state,
        settings: initialState.settings,
      };

    case ACTION_TYPES.START_QUIZ:
      return {
        ...state,
        quiz: {
          ...state.quiz,
          ...action.payload,
          isActive: true,
          currentQuestion: 0,
          answers: [],
        },
      };

    case ACTION_TYPES.END_QUIZ:
      return {
        ...state,
        quiz: {
          ...initialState.quiz,
          isActive: false,
        },
      };

    case ACTION_TYPES.NEXT_QUESTION:
      return {
        ...state,
        quiz: {
          ...state.quiz,
          currentQuestion: Math.min(
            state.quiz.currentQuestion + 1,
            state.quiz.totalQuestions - 1
          ),
        },
      };

    case ACTION_TYPES.SUBMIT_ANSWER:
      return {
        ...state,
        quiz: {
          ...state.quiz,
          answers: [...state.quiz.answers, action.payload],
        },
      };

    case ACTION_TYPES.UPDATE_QUIZ_STATE:
      return {
        ...state,
        quiz: {
          ...state.quiz,
          ...action.payload,
        },
      };

    case ACTION_TYPES.UPDATE_STATS:
      return {
        ...state,
        stats: {
          ...state.stats,
          ...action.payload,
        },
      };

    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        ui: {
          ...state.ui,
          isLoading: action.payload,
        },
      };

    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        ui: {
          ...state.ui,
          error: action.payload,
        },
      };

    case ACTION_TYPES.SHOW_MODAL:
      return {
        ...state,
        ui: {
          ...state.ui,
          activeModal: action.payload,
        },
      };

    case ACTION_TYPES.HIDE_MODAL:
      return {
        ...state,
        ui: {
          ...state.ui,
          activeModal: null,
        },
      };

    case ACTION_TYPES.TOGGLE_BOTTOM_NAV:
      return {
        ...state,
        ui: {
          ...state.ui,
          bottomNavVisible: action.payload ?? !state.ui.bottomNavVisible,
        },
      };

    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 로컬 스토리지에서 설정 불러오기
  useEffect(() => {
    const savedSettings = localStorage.getItem('talk100-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        dispatch({
          type: ACTION_TYPES.UPDATE_SETTINGS,
          payload: settings,
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  // 설정 변경시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('talk100-settings', JSON.stringify(state.settings));
  }, [state.settings]);

  // 액션 크리에이터들
  const actions = {
    updateSettings: (settings) => {
      dispatch({
        type: ACTION_TYPES.UPDATE_SETTINGS,
        payload: settings,
      });
    },

    resetSettings: () => {
      dispatch({ type: ACTION_TYPES.RESET_SETTINGS });
    },

    startQuiz: (quizData) => {
      dispatch({
        type: ACTION_TYPES.START_QUIZ,
        payload: quizData,
      });
    },

    endQuiz: () => {
      dispatch({ type: ACTION_TYPES.END_QUIZ });
    },

    nextQuestion: () => {
      dispatch({ type: ACTION_TYPES.NEXT_QUESTION });
    },

    submitAnswer: (answer) => {
      dispatch({
        type: ACTION_TYPES.SUBMIT_ANSWER,
        payload: answer,
      });
    },

    updateQuizState: (updates) => {
      dispatch({
        type: ACTION_TYPES.UPDATE_QUIZ_STATE,
        payload: updates,
      });
    },

    updateStats: (stats) => {
      dispatch({
        type: ACTION_TYPES.UPDATE_STATS,
        payload: stats,
      });
    },

    setLoading: (loading) => {
      dispatch({
        type: ACTION_TYPES.SET_LOADING,
        payload: loading,
      });
    },

    setError: (error) => {
      dispatch({
        type: ACTION_TYPES.SET_ERROR,
        payload: error,
      });
    },

    showModal: (modalType) => {
      dispatch({
        type: ACTION_TYPES.SHOW_MODAL,
        payload: modalType,
      });
    },

    hideModal: () => {
      dispatch({ type: ACTION_TYPES.HIDE_MODAL });
    },

    toggleBottomNav: (visible) => {
      dispatch({
        type: ACTION_TYPES.TOGGLE_BOTTOM_NAV,
        payload: visible,
      });
    },
  };

  const value = {
    state,
    actions,
    // 편의 접근자들
    settings: state.settings,
    quiz: state.quiz,
    stats: state.stats,
    ui: state.ui,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};