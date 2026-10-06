import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type Theme as NavigationTheme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { warmUpApi } from '@/api';
import { useHints } from '@/features/hints';
import { CACHE_BUSTER, queryClient, queryPersister } from '@/lib/query-client';
import { useSession } from '@/lib/session';
import { SplashOverlay, ToastHost, fontAssets, useTheme, type Theme } from '@/ui';

void SplashScreen.preventAutoHideAsync();

/** Navigator chrome (screen backgrounds during transitions) in Olive's colours. */
const navigationTheme = ({ scheme, colors }: Theme): NavigationTheme => {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.bg,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.warm,
    },
  };
};

// Render errors anywhere below the root land here instead of a blank screen.
export { ErrorFallback as ErrorBoundary } from '@/ui';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const theme = useTheme();
  const { colors } = theme;
  const navTheme = useMemo(() => navigationTheme(theme), [theme]);
  const hydrated = useSession((s) => s.hydrated);
  const signedIn = useSession((s) => !!s.userId);
  // The animated splash plays over the first render, then unmounts itself.
  const [introDone, setIntroDone] = useState(false);
  const finishIntro = useCallback(() => {
    setIntroDone(true);
    useHints.getState().setReady();
  }, []);
  // Hand off from the OS splash only once our own splash has painted, so there is no flash between them.
  const hideNativeSplash = useCallback(() => void SplashScreen.hideAsync(), []);
  // A font failure shouldn't brick the app - system fonts are an acceptable fallback.
  const ready = (fontsLoaded || !!fontError) && hydrated;

  // Start waking the API during the splash screen, not on the user's first tap.
  useEffect(() => warmUpApi(), []);

  // The root view shows behind the keyboard and screen transitions; keep it on the page colour.
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.bg);
  }, [colors.bg]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: queryPersister, buster: CACHE_BUSTER, maxAge: 7 * 24 * 60 * 60 * 1000 }}
        >
          <ThemeProvider value={navTheme}>
            <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
              <Stack.Protected guard={!signedIn}>
                <Stack.Screen name="welcome" />
              </Stack.Protected>
              <Stack.Protected guard={signedIn}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="meal/new" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
                <Stack.Screen name="meal/[id]" />
                <Stack.Screen name="report/new" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
                <Stack.Screen name="report/[id]" />
                <Stack.Screen name="marker/[key]" />
                <Stack.Screen name="chat/[id]" />
              </Stack.Protected>
            </Stack>
            <ToastHost />
            {introDone ? null : <SplashOverlay onReady={hideNativeSplash} onDone={finishIntro} />}
          </ThemeProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
