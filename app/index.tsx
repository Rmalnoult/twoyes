import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useStore } from '@/store';

export default function Index() {
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Small delay to let auth state initialize from storage
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/welcome');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#ea546c" />
    </View>
  );
}
