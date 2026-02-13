import { View, Text, ActivityIndicator } from 'react-native';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
}

export function LoadingState({ message = 'Loading...', size = 'large' }: LoadingStateProps) {
  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <ActivityIndicator size={size} color="#ea546c" />
      {message && (
        <Text className="text-gray-600 mt-4 text-center">{message}</Text>
      )}
    </View>
  );
}

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
      <View className="bg-white rounded-3xl p-8 items-center">
        <ActivityIndicator size="large" color="#ea546c" />
        {message && (
          <Text className="text-gray-900 mt-4 font-semibold">{message}</Text>
        )}
      </View>
    </View>
  );
}
