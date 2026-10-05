// Per-weight imports: the package roots would bundle every weight of each family.
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { warmUpApi } from '@/api';
import { CACHE_BUSTER, queryClient, queryPersister } from '@/lib/query-client';
import { useSession } from '@/lib/session';
import { ToastHost, colors } from '@/ui';

void SplashScreen.preventAutoHideAsync();

// Render errors anywhere below the root land here instead of a blank screen.
export { ErrorFallback as ErrorBoundary } from '@/ui';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });
  const hydrated = useSession((s) => s.hydrated);
  const signedIn = useSession((s) => !!s.userId);
  // A font failure shouldn't brick the app — system fonts are an acceptable fallback.
  const ready = (fontsLoaded || !!fontError) && hydrated;

  // Start waking the API during the splash screen, not on the user's first tap.
  useEffect(() => warmUpApi(), []);

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: queryPersister, buster: CACHE_BUSTER, maxAge: 7 * 24 * 60 * 60 * 1000 }}
        >
          <StatusBar style="dark" />
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
            </Stack.Protected>
          </Stack>
          <ToastHost />
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
