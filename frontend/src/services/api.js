import axios from 'axios';

// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - JWT 토큰 자동 첨부
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 또는 인증 오류
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_info');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API 함수들
export const apiService = {
  // 헬스 체크
  healthCheck: () => api.get('/health'),

  // 인증 관련
  auth: {
    googleLogin: () => window.location.href = `${API_BASE_URL}/auth/google`,
    naverLogin: () => window.location.href = `${API_BASE_URL}/auth/naver`,
    logout: () => api.post('/auth/logout'),
    getCurrentUser: () => api.get('/auth/me'),
  },

  // 문제 관련
  questions: {
    getByCategory: (category, day) => api.get(`/api/questions/${category}/${day}`),
    getCategories: () => api.get('/api/categories'),
  },

  // 진행상황 관련
  progress: {
    submitAnswer: (data) => api.post('/api/progress/submit', data),
    getUserProgress: (userId) => api.get(`/api/progress/${userId}`),
    updateStatus: (data) => api.put('/api/progress/status', data),
  },

  // 복습 관련
  review: {
    getReviewQueue: (userId) => api.get(`/api/review/${userId}`),
    addToReview: (data) => api.post('/api/review/add', data),
    removeFromReview: (userId, questionId) =>
      api.delete(`/api/review/${userId}/${questionId}`),
  },

  // 사용자 통계
  user: {
    getProfile: (uid) => api.get(`/api/users/${uid}`),
    updateSettings: (uid, data) => api.put(`/api/users/${uid}`, data),
    getStats: (uid) => api.get(`/api/users/${uid}/stats`),
  },
};

export default api;