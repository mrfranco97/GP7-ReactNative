import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS } from '../config/api.js';
import { clearToken, getToken } from '../utils/tokenStorage.js';
import { normalizeApiError } from '../utils/apiErrors.js';

let onUnauthorized = null;

export function setOnUnauthorized(handler) {
  onUnauthorized = handler;
}

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

httpClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      await clearToken();
      if (typeof onUnauthorized === 'function') {
        onUnauthorized();
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export default httpClient;
