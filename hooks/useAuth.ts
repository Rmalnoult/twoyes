import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { useStore } from '@/store';
import type { Profile } from '@/types/database';

// Query keys
export const authKeys = {
  session: ['auth', 'session'] as const,
  profile: (userId: string) => ['auth', 'profile', userId] as const,
};

// Get current session
export function useSession() {
  const setUser = useStore((state) => state.setUser);
  const setSession = useStore((state) => state.setSession);

  return useQuery({
    queryKey: authKeys.session,
    queryFn: async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      setSession(session);

      // If we have a session, fetch the user profile
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser(profile as Profile);
        }
      }

      return session;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

// Sign up with email and password
export function useSignUp() {
  return useMutation({
    mutationFn: async ({
      email,
      password,
      displayName,
    }: {
      email: string;
      password: string;
      displayName?: string;
    }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) throw error;
      return data;
    },
  });
}

// Sign in with email and password
export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Connection timed out. Please check your internet connection and try again.')), 15000)
      );

      const result = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        timeoutPromise,
      ]);

      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      // Refresh session query
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
  });
}

// Sign out
export function useSignOut() {
  const queryClient = useQueryClient();
  const logout = useStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
}

// Update user profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<Profile>;
    }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: authKeys.profile(data.id) });
      useStore.getState().setUser(data);
    },
  });
}
