import httpClient from './httpClient.js';

export async function move({ vx, vy, vyaw }) {
  const { data } = await httpClient.post('/move', { vx, vy, vyaw });
  return data;
}

export async function stop() {
  const { data } = await httpClient.post('/stop');
  return data;
}

export async function standup() {
  const { data } = await httpClient.post('/standup');
  return data;
}

export async function sitdown() {
  const { data } = await httpClient.post('/sitdown');
  return data;
}
