/// <reference types="expo/types" />

// Expo writes the reference above into expo-env.d.ts, but that file is gitignored and only
// appears after `expo start`. Without this, a clean checkout (CI) types process.env as any.

declare namespace NodeJS {
  interface ProcessEnv {
    /** API base URL baked into release builds. Unset in development, where Metro's host is used. */
    readonly EXPO_PUBLIC_API_URL?: string;
  }
}
