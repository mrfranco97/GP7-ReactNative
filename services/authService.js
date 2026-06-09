import httpClient from './httpClient.js';
import { clearToken, saveToken } from '../utils/tokenStorage.js';

export async function register({ username, email, password }) {
  const { data } = await httpClient.post('/auth/register', {
    username,
    email,
    password,
  });
  return data;
}

export async function login({ identifier, password }) {
  const { data } = await httpClient.post('/auth/token', {
    identifier,
    password,
  });

  if (!data?.access_token) {
    throw new Error('La respuesta del servidor no contiene un token de acceso.');
  }
  await saveToken(data.access_token);
  return data;
}

export async function logout() {
  await clearToken();
}
