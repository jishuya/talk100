import { ENV } from '../config/environment';

// 기본 서비스 클래스 - Mock/Real API 전환 로직
export class BaseService {
  constructor(mockData = {}) {
    this.mockData = mockData;
  }

  // Mock 데이터에서 nested key 값 추출
  getMockData(mockKey) {
    const keys = mockKey.split('.');
    let data = this.mockData;

    for (const key of keys) {
      if (data && typeof data === 'object' && key in data) {
        data = data[key];
      } else {
        return null;
      }
    }

    return data;
  }

  // Mock 데이터와 실제 API 호출을 선택적으로 사용
  async request(apiCall, mockKey, delay = 500) {
    const mockData = this.getMockData(mockKey);

    if (ENV.USE_MOCK_DATA && mockData) {
      // 개발 환경: Mock 데이터 반환 (네트워크 지연 시뮬레이션)
      return new Promise(resolve =>
        setTimeout(() => resolve(mockData), delay)
      );
    }

    // 프로덕션: 실제 API 호출
    try {
      return await apiCall();
    } catch (error) {
      // API 실패시 Mock 데이터로 fallback (선택적)
      if (mockData) {
        console.warn(`API call failed, using mock data for ${mockKey}:`, error);
        return mockData;
      }
      throw error;
    }
  }

  // 에러 처리 헬퍼
  handleError(error, context = '') {
    console.error(`${context} error:`, error);

    // 에러 타입별 처리
    if (error.response?.status === 401) {
      // 인증 에러 - 로그인 페이지로 리다이렉트
      window.location.href = '/login';
      return;
    }

    if (error.response?.status >= 500) {
      // 서버 에러
      throw new Error('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }

    // 기타 에러
    throw new Error(error.message || '알 수 없는 오류가 발생했습니다.');
  }
}