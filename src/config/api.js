// Centralized API Configuration for iTopper Frontend
// All API endpoints across the application use this single source of truth.

const getDefaultApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  // Old Backend URLs:
  // return 'https://itopperbackend.vercel.app';
  // return 'https://itopperbackend-beta.vercel.app';
  return 'https://itopper-backend-kq8f.vercel.app';
};

export const API_BASE_URL = getDefaultApiUrl().replace(/\/+$/, '');

export const getApiUrl = (endpoint = '') => {
  if (!endpoint) return API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export default API_BASE_URL;
