import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage.js';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status !== 401 || originalRequest?._retry || originalRequest?.url === '/api/auth/refresh') {
      return Promise.reject(error);
    }

    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      tokenStorage.clear();
      window.dispatchEvent(new Event('fasoconnect:unauthorized'));
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise =
        refreshPromise ||
        axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken }).finally(() => {
          refreshPromise = null;
        });

      const { data } = await refreshPromise;
      tokenStorage.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      tokenStorage.clear();
      window.dispatchEvent(new Event('fasoconnect:unauthorized'));
      return Promise.reject(refreshError);
    }
  },
);

export const getApiErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Une erreur est survenue.';
