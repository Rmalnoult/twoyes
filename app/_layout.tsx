import { useEffect, useRef } from 'react';
import { Stack, useSegments, useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { useStore } from '@/store';
import { useSession } from '@/hooks/useAuth';
import { useInitializeAnalytics } from '@/hooks/useAnalytics';
import '../global.css';

const queryClient = new QueryClient();

function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useStore((state) => state.setUser);
  const setSession = useStore((state) => state.setSession);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const logout = useStore((state) => state.logout);
  const segments = useSegments();
  const router = useRouter();
  const initialized = useRef(false);

  // Initialize session on mount
  useSession();
  useInitializeAnalytics();

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);

        if (session?.user) {
          // Fetch profile with timeout — don't let it block auth flow
          try {
            const profilePromise = supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            const timeout = new Promise<{ data: null; error: null }>((resolve) =>
              setTimeout(() => resolve({ data: null, error: null }), 5000)
            );

            const { data: profile } = await Promise.race([profilePromise, timeout]);
            if (profile) {
              setUser(profile);
            }
          } catch {
            // Profile fetch failed — user is still authenticated, profile will load later
          }
        } else {
          if (event !== 'INITIAL_SESSION') {
            logout();
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setSession, logout]);

  // Navigate based on auth state changes
  useEffect(() => {
    // Skip the very first render to let the root index handle initial routing
    if (!initialized.current) {
      initialized.current = true;
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup && segments[0] === '(tabs)') {
      router.replace('/(auth)/welcome');
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
