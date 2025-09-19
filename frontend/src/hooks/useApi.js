import { useState, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';

const useApi = () => {
  const { actions } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    actions.setLoading(true);

    try {
      const response = await apiCall();
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || '요청 중 오류가 발생했습니다.';
      setError(errorMessage);
      actions.setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
      actions.setLoading(false);
    }
  }, [actions]);

  const clearError = useCallback(() => {
    setError(null);
    actions.setError(null);
  }, [actions]);

  return {
    loading,
    error,
    request,
    clearError,
  };
};

export default useApi;