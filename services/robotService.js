import httpClient from './httpClient.js';

export async function connect({ robotType, networkInterface }) {
  const body = { robot_type: robotType };
  if (networkInterface) {
    body.network_interface = networkInterface;
  }
  const { data } = await httpClient.post('/connect', body);
  return data;
}

export async function disconnect() {
  const { data } = await httpClient.post('/disconnect');
  return data;
}

export async function getStatus() {
  const { data } = await httpClient.get('/status');
  return data;
}
