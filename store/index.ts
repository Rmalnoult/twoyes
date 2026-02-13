import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Profile } from '@/types/database';

// Auth slice
interface AuthState {
  user: Profile | null;
  session: any | null;
  isAuthenticated: boolean;
  setUser: (user: Profile | null) => void;
  setSession: (session: any | null) => void;
  logout: () => void;
}

// Gender preference
export type GenderPreference = 'all' | 'male' | 'female' | 'unisex';

// Country preference
export type Country = 'US' | 'FR' | 'UK' | 'DE' | 'ES' | 'IT';

export const COUNTRY_TO_DB: Record<Country, string> = {
  US: 'USA',
  FR: 'FRA',
  UK: 'GBR',
  DE: 'DEU',
  ES: 'ESP',
  IT: 'ITA',
};

export const COUNTRY_LABELS: Record<Country, string> = {
  US: 'United States',
  FR: 'France',
  UK: 'United Kingdom',
  DE: 'Germany',
  ES: 'Spain',
  IT: 'Italy',
};

// Preferences slice
interface PreferencesState {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  genderPreference: GenderPreference;
  country: Country;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setNotifications: (enabled: boolean) => void;
  setGenderPreference: (gender: GenderPreference) => void;
  setCountry: (country: Country) => void;
}

// Combine all slices
type StoreState = AuthState & PreferencesState;

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Auth state
      user: null,
      session: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set({ session, isAuthenticated: !!session?.user }),
      logout: () => set({ user: null, session: null, isAuthenticated: false }),

      // Preferences state
      theme: 'light',
      notifications: true,
      genderPreference: 'all',
      country: 'US',
      setTheme: (theme) => set({ theme }),
      setNotifications: (notifications) => set({ notifications }),
      setGenderPreference: (genderPreference) => set({ genderPreference }),
      setCountry: (country) => set({ country }),
    }),
    {
      name: 'twoyes-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist certain keys
      partialize: (state) => ({
        theme: state.theme,
        notifications: state.notifications,
        genderPreference: state.genderPreference,
        country: state.country,
      }),
    }
  )
);

// Individual selectors to prevent re-render issues
export const useUser = () => useStore((state) => state.user);
export const useSession = () => useStore((state) => state.session);
export const useIsAuthenticated = () => useStore((state) => state.isAuthenticated);
export const useSetUser = () => useStore((state) => state.setUser);
export const useSetSession = () => useStore((state) => state.setSession);
export const useLogout = () => useStore((state) => state.logout);

// Convenience hook that returns all auth state (use only when you need everything)
export const useAuth = () => {
  const user = useStore((state) => state.user);
  const session = useStore((state) => state.session);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const setUser = useStore((state) => state.setUser);
  const setSession = useStore((state) => state.setSession);
  const logout = useStore((state) => state.logout);

  return { user, session, isAuthenticated, setUser, setSession, logout };
};

export const usePreferences = () => {
  const theme = useStore((state) => state.theme);
  const notifications = useStore((state) => state.notifications);
  const setTheme = useStore((state) => state.setTheme);
  const setNotifications = useStore((state) => state.setNotifications);

  return { theme, notifications, setTheme, setNotifications };
};

export const useGenderPreference = () => {
  const genderPreference = useStore((state) => state.genderPreference);
  const setGenderPreference = useStore((state) => state.setGenderPreference);
  return { genderPreference, setGenderPreference };
};

export const useCountry = () => {
  const country = useStore((state) => state.country);
  const setCountry = useStore((state) => state.setCountry);
  return { country, setCountry };
};
