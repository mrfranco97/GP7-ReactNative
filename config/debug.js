export const DEBUG = {
  autoConnect: process.env.EXPO_PUBLIC_AUTO_CONNECT === 'true',
  robotType: process.env.EXPO_PUBLIC_ROBOT_TYPE ?? 'go2',
  networkInterface: process.env.EXPO_PUBLIC_NETWORK_INTERFACE ?? 'eth0',
  serverIp: process.env.EXPO_PUBLIC_API_HOST ?? '192.168.100.52',
};
