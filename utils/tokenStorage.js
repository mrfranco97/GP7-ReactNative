import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'unitree_access_token';

let memoryToken = null;

export async function saveToken(token) {
  memoryToken = token;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  if (memoryToken) {
    return memoryToken;
  }
  const stored = await SecureStore.getItemAsync(TOKEN_KEY);
  memoryToken = stored;
  return stored;
}

export async function clearToken() {
  memoryToken = null;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

