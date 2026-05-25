import { Platform } from 'react-native';
import { DEBUG } from './debug.js';

const DEV_HOST = Platform.select({
  android: '10.0.2.2',
  ios: 'localhost',
  default: 'localhost',
});

export const API_HOST_OVERRIDE = null;

export const API_PORT = 8000;

export function getApiBaseUrl() {
  const host = DEBUG.serverIp ?? API_HOST_OVERRIDE ?? DEV_HOST;
  if (host.startsWith('http')) return host;
  return `http://${host}:${API_PORT}`;
}

export const API_BASE_URL = getApiBaseUrl();

export const API_TIMEOUT_MS = 15000;
