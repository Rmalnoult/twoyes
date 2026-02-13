import { Pressable, PressableProps } from 'react-native';

interface ScaleInProps extends PressableProps {
  children: React.ReactNode;
  delay?: number;
}

// Simplified version - animations disabled for Expo Go compatibility
export function ScaleIn({ children, delay = 0, style, ...props }: ScaleInProps) {
  return (
    <Pressable style={style} {...props}>
      {children}
    </Pressable>
  );
}
