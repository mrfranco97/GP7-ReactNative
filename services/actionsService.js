import httpClient from './httpClient.js';

export async function getActions() {
  const { data } = await httpClient.get('/actions');
  return data;
}

export async function runAction(actionName) {
  const { data } = await httpClient.post(`/action/${encodeURIComponent(actionName)}`);
  return data;
}
