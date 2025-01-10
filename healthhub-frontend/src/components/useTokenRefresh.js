import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const useTokenRefresh = () => {
  const navigate = useNavigate();

  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        return false;
      }

      const response = await fetch('https://anochat.in/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Refresh-Token': refreshToken, 
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('access_token', data.data.access_token);
        if (data.data.refresh_token) {
          localStorage.setItem('refresh_token', data.data.refresh_token);
        }
        return true;
      }

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return false;
    }
  }, []);

  useEffect(() => {
    const REFRESH_INTERVAL = 13 * 60 * 1000; 
    let refreshInterval;

    const setupTokenRefresh = async () => {
      const success = await refreshAccessToken();
      if (!success) {
        navigate('/auth');
        return;
      }

      refreshInterval = setInterval(async () => {
        const success = await refreshAccessToken();
        if (!success) {
          clearInterval(refreshInterval);
          navigate('/auth');
        }
      }, REFRESH_INTERVAL);
    };

    if (localStorage.getItem('access_token')) {
      setupTokenRefresh();
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshAccessToken, navigate]);

  return refreshAccessToken;
};

export default useTokenRefresh;