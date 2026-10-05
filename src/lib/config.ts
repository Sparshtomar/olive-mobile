import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEV_API_PORT = 4010;

/**
 * Release builds bake EXPO_PUBLIC_API_URL in at build time. In development the API
 * runs on the same machine as Metro, so we reuse Metro's host — that makes a
 * physical phone on the same Wi-Fi work with zero config.
 */
const resolveApiUrl = (): string => {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  if (Platform.OS === 'web') return `http://localhost:${DEV_API_PORT}`;
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host) return `http://${host}:${DEV_API_PORT}`;
  return Platform.OS === 'android' ? `http://10.0.2.2:${DEV_API_PORT}` : `http://localhost:${DEV_API_PORT}`;
};

export const API_URL = resolveApiUrl();
