import { ReactNode, useCallback } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  Extrapolation,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const SWIPE_UP_THRESHOLD = -120;
const MAX_ROTATION = 12; // degrees

const SPRING_CONFIG = {
  damping: 18,
  stiffness: 200,
  mass: 0.8,
};

const FLY_AWAY_SPRING = {
  damping: 20,
  stiffness: 120,
  mass: 0.6,
};

interface SwipeCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  accentColor?: string;
}

export function SwipeCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  accentColor = '#ea546c',
}: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardScale = useSharedValue(1);

  const triggerSwipeLeft = useCallback(() => {
    onSwipeLeft?.();
  }, [onSwipeLeft]);

  const triggerSwipeRight = useCallback(() => {
    onSwipeRight?.();
  }, [onSwipeRight]);

  const triggerSwipeUp = useCallback(() => {
    onSwipeUp?.();
  }, [onSwipeUp]);

  const pan = Gesture.Pan()
    .onStart(() => {
      cardScale.value = withSpring(1.02, { damping: 15, stiffness: 300 });
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const isSwipeUp = translateY.value < SWIPE_UP_THRESHOLD && Math.abs(translateX.value) < SWIPE_THRESHOLD;
      const isSwipeRight = translateX.value > SWIPE_THRESHOLD;
      const isSwipeLeft = translateX.value < -SWIPE_THRESHOLD;

      if (isSwipeUp) {
        // Fly up
        translateY.value = withSpring(-SCREEN_WIDTH * 1.5, FLY_AWAY_SPRING, () => {
          runOnJS(triggerSwipeUp)();
        });
        translateX.value = withSpring(0, FLY_AWAY_SPRING);
        cardScale.value = withSpring(0.8, FLY_AWAY_SPRING);
      } else if (isSwipeRight) {
        // Fly right
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, FLY_AWAY_SPRING, () => {
          runOnJS(triggerSwipeRight)();
        });
        cardScale.value = withSpring(0.8, FLY_AWAY_SPRING);
      } else if (isSwipeLeft) {
        // Fly left
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, FLY_AWAY_SPRING, () => {
          runOnJS(triggerSwipeLeft)();
        });
        cardScale.value = withSpring(0.8, FLY_AWAY_SPRING);
      } else {
        // Snap back
        translateX.value = withSpring(0, SPRING_CONFIG);
        translateY.value = withSpring(0, SPRING_CONFIG);
        cardScale.value = withSpring(1, SPRING_CONFIG);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-MAX_ROTATION, 0, MAX_ROTATION],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
        { scale: cardScale.value },
      ],
    };
  });

  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD * 0.6], [0, 1], Extrapolation.CLAMP),
  }));

  const nopeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -SWIPE_THRESHOLD * 0.6], [0, 1], Extrapolation.CLAMP),
  }));

  const superOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, SWIPE_UP_THRESHOLD * 0.6], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, animatedCardStyle]}>
        {/* LIKE overlay */}
        <Animated.View style={[styles.overlay, styles.likeOverlay, likeOverlayStyle]}>
          <View style={[styles.stampBorder, { borderColor: '#22c55e' }]}>
            <Text style={[styles.stampText, { color: '#22c55e' }]}>LOVE</Text>
          </View>
        </Animated.View>

        {/* NOPE overlay */}
        <Animated.View style={[styles.overlay, styles.nopeOverlay, nopeOverlayStyle]}>
          <View style={[styles.stampBorder, { borderColor: '#ef4444' }]}>
            <Text style={[styles.stampText, { color: '#ef4444' }]}>NOPE</Text>
          </View>
        </Animated.View>

        {/* SUPER overlay */}
        <Animated.View style={[styles.overlay, styles.superOverlay, superOverlayStyle]}>
          <View style={[styles.stampBorder, { borderColor: '#0ba5e9' }]}>
            <Text style={[styles.stampText, { color: '#0ba5e9' }]}>SUPER</Text>
          </View>
        </Animated.View>

        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    pointerEvents: 'none',
  },
  likeOverlay: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  nopeOverlay: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  superOverlay: {
    backgroundColor: 'rgba(11, 165, 233, 0.08)',
  },
  stampBorder: {
    borderWidth: 4,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    transform: [{ rotate: '-15deg' }],
  },
  stampText: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 4,
  },
});
