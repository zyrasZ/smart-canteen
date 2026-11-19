import axios from 'axios';
import { setupMockAdapter } from './mockAdapter';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const defaultAdapter = api.defaults.adapter;
let isMockAdapterAttached = false;

export const isMockModeEnabled = (): boolean =>
  import.meta.env.VITE_USE_MOCK === 'true' ||
  (typeof window !== 'undefined' && localStorage.getItem('use_mock_mode') === 'true');

export function enableMockMode(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('use_mock_mode', 'true');
  }
  if (!isMockAdapterAttached) {
    setupMockAdapter(api);
    isMockAdapterAttached = true;
    console.info('[Smart Canteen] Đang chạy chế độ Mock Data');
  }
}

export function disableMockMode(): void {
  if (import.meta.env.VITE_USE_MOCK === 'true') return;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('use_mock_mode');
  }
  if (isMockAdapterAttached) {
    api.defaults.adapter = defaultAdapter;
    isMockAdapterAttached = false;
  }
}

if (isMockModeEnabled()) {
  enableMockMode();
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
