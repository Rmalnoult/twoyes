import { View, ViewProps } from 'react-native';

interface FadeInProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

// Simplified version - animations disabled for Expo Go compatibility
export function FadeIn({ children, delay = 0, duration = 300, style, ...props }: FadeInProps) {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  );
}
