import { useState, useCallback, memo } from 'react';
import { View, Text, Pressable, Dimensions, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { X, Heart, Info, Sparkles, Shuffle, Star, MapPin, Music2, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  runOnJS,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useAuth, useGenderPreference, useCountry, COUNTRY_LABELS } from '@/store';
import { useSwipeDeck, POPULARITY_COLUMN } from '@/hooks/useNames';
import GenderToggle from '@/components/GenderToggle';
import { supabase } from '@/services/supabase';
import { analytics } from '@/services/analytics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.88;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const SWIPE_UP_THRESHOLD = -100;
const MAX_ROTATION = 12;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const GENDER_COLORS = {
  female: { bg: '#FFF0F6', accent: '#F472B6', gradient: ['#F472B6', '#EC4899'] as const },
  male: { bg: '#EFF6FF', accent: '#60A5FA', gradient: ['#60A5FA', '#818CF8'] as const },
  unisex: { bg: '#FFFBEB', accent: '#F59E0B', gradient: ['#FBBF24', '#F59E0B'] as const },
};

const SPRING_SNAP = { damping: 18, stiffness: 200, mass: 0.8 };
const SPRING_FLY = { damping: 20, stiffness: 120, mass: 0.6 };
const SPRING_BUTTON = { damping: 12, stiffness: 300, mass: 0.5 };

// ─── Pre-rendered card content (memoized to avoid CLS) ─────────────
interface NameCardProps {
  name: any;
  popColumn: string;
  country: string;
}

const NameCard = memo(function NameCard({ name, popColumn, country }: NameCardProps) {
  const metadata = name.metadata as any;
  const colors = GENDER_COLORS[name.gender as keyof typeof GENDER_COLORS] || GENDER_COLORS.unisex;
  const rank = name[popColumn as keyof typeof name] as number | null;
  const famousPeople: string[] = metadata?.famous_people || [];

  return (
    <View style={s.card}>
      <LinearGradient
        colors={colors.gradient as unknown as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.accentBar}
      />

      <View style={s.cardContent}>
        <Text style={s.cardName}>{name.name}</Text>

        {name.pronunciation_ipa && (
          <Text style={s.pronunciation}>/{name.pronunciation_ipa}/</Text>
        )}

        <View style={s.pillRow}>
          <View style={[s.pill, { backgroundColor: colors.bg }]}>
            <Text style={[s.pillText, { color: colors.accent }]}>
              {name.gender}
            </Text>
          </View>
          {name.origins?.slice(0, 2).map((origin: string) => (
            <View key={origin} style={[s.pill, { backgroundColor: '#F3F0F7' }]}>
              <MapPin size={10} color="#8B7FA3" style={{ marginRight: 4 }} />
              <Text style={[s.pillText, { color: '#6B5B8A' }]}>{origin}</Text>
            </View>
          ))}
        </View>

        <View style={s.meaningBox}>
          <Text style={s.meaningText}>{name.meaning}</Text>
        </View>

        {/* Famous people */}
        {famousPeople.length > 0 && (
          <View style={s.famousRow}>
            <User size={11} color="#8B7FA3" />
            <Text style={s.famousText} numberOfLines={1}>
              {famousPeople.slice(0, 2).join(', ')}
            </Text>
          </View>
        )}

        {rank != null && rank <= 100 && (
          <View style={s.popularityBadge}>
            <Star size={12} color="#F59E0B" fill="#F59E0B" />
            <Text style={s.popularityText}>
              Top {rank} in {COUNTRY_LABELS[country]}
            </Text>
          </View>
        )}

        {metadata?.style_tags && metadata.style_tags.length > 0 && (
          <View style={s.tagsRow}>
            {metadata.style_tags.slice(0, 3).map((tag: string, idx: number) => (
              <View key={idx} style={s.tag}>
                <Music2 size={10} color="#8b5cf6" style={{ marginRight: 4 }} />
                <Text style={s.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <Pressable
        style={s.detailsLink}
        onPress={() => router.push(`/name/${name.id}`)}
      >
        <Info size={14} color="#A78BFA" />
        <Text style={s.detailsLinkText}>View Full Details</Text>
      </Pressable>
    </View>
  );
});

// ─── Main swipe screen ─────────────────────────────────────────────
export default function SwipeScreen() {
  const { user } = useAuth();
  const { genderPreference } = useGenderPreference();
  const { country } = useCountry();
  const [currentIndex, setCurrentIndex] = useState(0);
  const isAnimating = useSharedValue(false);

  const genderFilter = genderPreference === 'all' ? undefined : genderPreference;
  const { data: names, loadMore, isLoading } = useSwipeDeck(user?.id || null, {
    gender: genderFilter,
    country,
    limit: 50,
  });

  const popColumn = POPULARITY_COLUMN[country];

  // Card animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const nextCardProgress = useSharedValue(0);

  // Button scales
  const skipScale = useSharedValue(1);
  const superScale = useSharedValue(1);
  const loveScale = useSharedValue(1);

  const resetCard = useCallback(() => {
    translateX.value = 0;
    translateY.value = 0;
    cardScale.value = 1;
    nextCardProgress.value = 0;
    isAnimating.value = false;
  }, []);

  const advanceCard = useCallback(() => {
    if (!names) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex >= names.length) {
      analytics.track('deck_exhausted' as any, { batchSize: names.length, country });
      setCurrentIndex(0);
      loadMore();
    } else {
      setCurrentIndex(nextIndex);
    }
    resetCard();
  }, [names, currentIndex, loadMore, resetCard, country]);

  const handleSwipe = useCallback(async (action: 'like' | 'dislike' | 'super_like') => {
    if (!user || !names || currentIndex >= names.length) return;
    const currentName = names[currentIndex];

    // Track swipe event
    const eventName = action === 'like' ? 'name_liked' : action === 'dislike' ? 'name_disliked' : 'name_super_liked';
    analytics.track(eventName as any, {
      nameId: currentName.id,
      name: currentName.name,
      gender: currentName.gender,
      country,
      deckPosition: currentIndex,
      deckSize: names.length,
    });

    try {
      await supabase.from('user_swipes').upsert({
        user_id: user.id,
        name_id: currentName.id,
        action,
      });
      if (action === 'like' || action === 'super_like') {
        const { data: matches } = await supabase
          .from('partner_matches')
          .select('*')
          .eq('name_id', currentName.id)
          .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
          .order('matched_at', { ascending: false })
          .limit(1);
        if (matches && matches.length > 0) {
          analytics.track('match_created', {
            nameId: currentName.id,
            name: currentName.name,
          });
          Alert.alert(
            "It's a Match! \u{1F389}",
            `You both love ${currentName.name}!\n\n"${currentName.meaning}"`,
            [{ text: 'Amazing!', style: 'default' }]
          );
        }
      }
    } catch (error) {
      console.error('Failed to record swipe:', error);
    }
  }, [user, names, currentIndex]);

  const onSwipeComplete = useCallback((action: 'like' | 'dislike' | 'super_like') => {
    handleSwipe(action);
    advanceCard();
  }, [handleSwipe, advanceCard]);

  const animateSwipe = useCallback((direction: 'left' | 'right' | 'up') => {
    if (isAnimating.value) return;
    isAnimating.value = true;

    const action = direction === 'right' ? 'like' : direction === 'up' ? 'super_like' : 'dislike';
    Haptics.impactAsync(
      action === 'super_like' ? Haptics.ImpactFeedbackStyle.Heavy :
      action === 'like' ? Haptics.ImpactFeedbackStyle.Medium :
      Haptics.ImpactFeedbackStyle.Light
    );

    if (direction === 'right') {
      translateX.value = withSpring(SCREEN_WIDTH * 1.5, SPRING_FLY, () => {
        runOnJS(onSwipeComplete)('like');
      });
      cardScale.value = withSpring(0.85, SPRING_FLY);
    } else if (direction === 'left') {
      translateX.value = withSpring(-SCREEN_WIDTH * 1.5, SPRING_FLY, () => {
        runOnJS(onSwipeComplete)('dislike');
      });
      cardScale.value = withSpring(0.85, SPRING_FLY);
    } else {
      translateY.value = withSpring(-SCREEN_HEIGHT, SPRING_FLY, () => {
        runOnJS(onSwipeComplete)('super_like');
      });
      cardScale.value = withSpring(0.85, SPRING_FLY);
    }
    nextCardProgress.value = withTiming(1, { duration: 300 });
  }, [onSwipeComplete]);

  // Gesture
  const pan = Gesture.Pan()
    .onStart(() => {
      if (isAnimating.value) return;
      cardScale.value = withSpring(1.02, { damping: 15, stiffness: 300 });
    })
    .onUpdate((e) => {
      if (isAnimating.value) return;
      translateX.value = e.translationX;
      translateY.value = e.translationY;
      const progress = Math.min(
        1,
        Math.max(
          Math.abs(e.translationX) / SWIPE_THRESHOLD,
          Math.abs(e.translationY) / Math.abs(SWIPE_UP_THRESHOLD),
        ),
      );
      nextCardProgress.value = progress;
    })
    .onEnd(() => {
      if (isAnimating.value) return;
      const isUp = translateY.value < SWIPE_UP_THRESHOLD && Math.abs(translateX.value) < SWIPE_THRESHOLD;
      const isRight = translateX.value > SWIPE_THRESHOLD;
      const isLeft = translateX.value < -SWIPE_THRESHOLD;

      if (isUp) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
        translateY.value = withSpring(-SCREEN_HEIGHT, SPRING_FLY, () => {
          runOnJS(onSwipeComplete)('super_like');
        });
        translateX.value = withSpring(0, SPRING_FLY);
        cardScale.value = withSpring(0.85, SPRING_FLY);
        nextCardProgress.value = withTiming(1, { duration: 200 });
      } else if (isRight) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, SPRING_FLY, () => {
          runOnJS(onSwipeComplete)('like');
        });
        cardScale.value = withSpring(0.85, SPRING_FLY);
        nextCardProgress.value = withTiming(1, { duration: 200 });
      } else if (isLeft) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, SPRING_FLY, () => {
          runOnJS(onSwipeComplete)('dislike');
        });
        cardScale.value = withSpring(0.85, SPRING_FLY);
        nextCardProgress.value = withTiming(1, { duration: 200 });
      } else {
        translateX.value = withSpring(0, SPRING_SNAP);
        translateY.value = withSpring(0, SPRING_SNAP);
        cardScale.value = withSpring(1, SPRING_SNAP);
        nextCardProgress.value = withSpring(0, SPRING_SNAP);
      }
    });

  // Animated styles
  const cardAnimStyle = useAnimatedStyle(() => {
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
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD * 0.7], [0, 1], Extrapolation.CLAMP),
  }));
  const nopeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -SWIPE_THRESHOLD * 0.7], [0, 1], Extrapolation.CLAMP),
  }));
  const superOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, SWIPE_UP_THRESHOLD * 0.7], [0, 1], Extrapolation.CLAMP),
  }));

  // Card 1 (behind current) - animates forward during swipe
  const card1Style = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(nextCardProgress.value, [0, 1], [0.94, 1], Extrapolation.CLAMP) },
      { translateY: interpolate(nextCardProgress.value, [0, 1], [12, 0], Extrapolation.CLAMP) },
    ],
    opacity: interpolate(nextCardProgress.value, [0, 1], [0.6, 1], Extrapolation.CLAMP),
  }));

  // Card 2 (deepest) - slightly animates when card 1 moves
  const card2Style = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(nextCardProgress.value, [0, 1], [0.88, 0.94], Extrapolation.CLAMP) },
      { translateY: interpolate(nextCardProgress.value, [0, 1], [24, 12], Extrapolation.CLAMP) },
    ],
    opacity: interpolate(nextCardProgress.value, [0, 1], [0.3, 0.6], Extrapolation.CLAMP),
  }));

  // Button animated styles
  const skipAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: skipScale.value }],
  }));
  const superAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: superScale.value }],
  }));
  const loveAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: loveScale.value }],
  }));

  const handleButtonPress = useCallback((type: 'skip' | 'super' | 'love') => {
    const scaleVal = type === 'skip' ? skipScale : type === 'super' ? superScale : loveScale;
    scaleVal.value = withSequence(
      withSpring(0.85, SPRING_BUTTON),
      withSpring(1, SPRING_BUTTON),
    );
    const direction = type === 'skip' ? 'left' : type === 'love' ? 'right' : 'up';
    animateSwipe(direction);
  }, [animateSwipe]);

  // --- Empty / Auth states ---
  if (!user) {
    return (
      <View style={s.emptyContainer}>
        <LinearGradient colors={['#FFF0F6', '#FAF5FF']} style={s.emptyGradient}>
          <View style={s.emptyIconWrap}>
            <Shuffle size={32} color="#F472B6" />
          </View>
          <Text style={s.emptyTitle}>Start Swiping</Text>
          <Text style={s.emptySubtitle}>
            Sign in to swipe with your partner{'\n'}and find matches together
          </Text>
          <Pressable onPress={() => router.push('/(auth)/sign-in')}>
            <LinearGradient colors={['#F472B6', '#EC4899']} style={s.ctaBtn}>
              <Text style={s.ctaBtnText}>Sign In</Text>
            </LinearGradient>
          </Pressable>
        </LinearGradient>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={s.emptyContainer}>
        <LinearGradient colors={['#EFF6FF', '#FAF5FF']} style={s.emptyGradient}>
          <View style={[s.emptyIconWrap, { backgroundColor: '#E0E7FF' }]}>
            <Shuffle size={32} color="#818CF8" />
          </View>
          <Text style={s.emptyTitle}>Loading names...</Text>
          <Text style={s.emptySubtitle}>Finding new names for you to discover</Text>
        </LinearGradient>
      </View>
    );
  }

  if (!names || names.length === 0) {
    return (
      <View style={s.emptyContainer}>
        <LinearGradient colors={['#FFF0F6', '#FAF5FF']} style={s.emptyGradient}>
          <View style={[s.emptyIconWrap, { backgroundColor: '#FCE7F3' }]}>
            <Heart size={32} color="#F472B6" fill="#F472B6" />
          </View>
          <Text style={s.emptyTitle}>You've seen them all!</Text>
          <Text style={s.emptySubtitle}>
            You've swiped through every name.{'\n'}Check your favorites or try a different filter!
          </Text>
          <Pressable onPress={() => router.push('/(tabs)/favorites')}>
            <LinearGradient colors={['#F472B6', '#EC4899']} style={s.ctaBtn}>
              <Text style={s.ctaBtnText}>View Favorites</Text>
            </LinearGradient>
          </Pressable>
        </LinearGradient>
      </View>
    );
  }

  const currentName = names[currentIndex];
  const nextName = currentIndex + 1 < names.length ? names[currentIndex + 1] : null;
  const thirdName = currentIndex + 2 < names.length ? names[currentIndex + 2] : null;

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Swipe</Text>
          <Text style={s.headerCounter}>
            {currentIndex + 1} of {names.length}
          </Text>
        </View>
        <GenderToggle />
      </View>

      {/* Progress Bar */}
      <View style={s.progressOuter}>
        <LinearGradient
          colors={['#F472B6', '#A78BFA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[s.progressInner, { width: `${((currentIndex + 1) / names.length) * 100}%` }]}
        />
      </View>

      {/* Cards Stack */}
      <View style={s.cardsArea}>
        {/* Card 2 - deepest in stack (fully pre-rendered) */}
        {thirdName && (
          <Animated.View style={[s.stackCard, card2Style]} pointerEvents="none">
            <NameCard name={thirdName} popColumn={popColumn} country={country} />
          </Animated.View>
        )}

        {/* Card 1 - behind current (fully pre-rendered) */}
        {nextName && (
          <Animated.View style={[s.stackCard, card1Style]} pointerEvents="none">
            <NameCard name={nextName} popColumn={popColumn} country={country} />
          </Animated.View>
        )}

        {/* Card 0 - current (swipeable) */}
        <GestureDetector gesture={pan}>
          <Animated.View style={[s.cardOuter, cardAnimStyle]}>
            {/* LOVE overlay */}
            <Animated.View style={[s.overlay, s.likeOverlay, likeOverlayStyle]} pointerEvents="none">
              <View style={[s.stampBorder, { borderColor: '#34D399' }]}>
                <Text style={[s.stampText, { color: '#34D399' }]}>LOVE</Text>
              </View>
            </Animated.View>
            {/* NOPE overlay */}
            <Animated.View style={[s.overlay, s.nopeOverlay, nopeOverlayStyle]} pointerEvents="none">
              <View style={[s.stampBorder, { borderColor: '#FB7185' }]}>
                <Text style={[s.stampText, { color: '#FB7185' }]}>NOPE</Text>
              </View>
            </Animated.View>
            {/* SUPER overlay */}
            <Animated.View style={[s.overlay, s.superOverlay, superOverlayStyle]} pointerEvents="none">
              <View style={[s.stampBorder, { borderColor: '#818CF8' }]}>
                <Text style={[s.stampText, { color: '#818CF8' }]}>SUPER</Text>
              </View>
            </Animated.View>

            <NameCard name={currentName} popColumn={popColumn} country={country} />
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Swipe hint */}
      <Text style={s.swipeHint}>Swipe or use buttons below</Text>

      {/* Action Buttons */}
      <View style={s.actions}>
        <View style={s.actionCol}>
          <AnimatedPressable
            style={[s.actionDislike, skipAnimStyle]}
            onPress={() => handleButtonPress('skip')}
          >
            <X size={28} color="#C2B8C9" strokeWidth={2.5} />
          </AnimatedPressable>
          <Text style={s.actionLabel}>Skip</Text>
        </View>

        <View style={s.actionCol}>
          <AnimatedPressable
            onPress={() => handleButtonPress('super')}
            style={[s.actionSuperWrap, superAnimStyle]}
          >
            <LinearGradient
              colors={['#818CF8', '#7C3AED']}
              style={s.actionSuperGradient}
            >
              <Sparkles size={30} color="white" />
            </LinearGradient>
          </AnimatedPressable>
          <Text style={[s.actionLabel, { color: '#818CF8' }]}>Super</Text>
        </View>

        <View style={s.actionCol}>
          <AnimatedPressable
            onPress={() => handleButtonPress('love')}
            style={[s.actionLikeWrap, loveAnimStyle]}
          >
            <LinearGradient
              colors={['#FF6B8A', '#F472B6']}
              style={s.actionLikeGradient}
            >
              <Heart size={28} color="white" fill="white" />
            </LinearGradient>
          </AnimatedPressable>
          <Text style={[s.actionLabel, { color: '#F472B6' }]}>Love</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF8FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E1B3A',
    letterSpacing: -0.5,
  },
  headerCounter: {
    fontSize: 13,
    color: '#8B7FA3',
    fontWeight: '500',
    marginTop: 2,
  },
  progressOuter: {
    height: 4,
    backgroundColor: '#F3F0F7',
    marginHorizontal: 24,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressInner: {
    height: 4,
    borderRadius: 2,
  },
  // Cards
  cardsArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stackCard: {
    position: 'absolute',
    width: CARD_WIDTH,
  },
  cardOuter: {
    width: CARD_WIDTH,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  likeOverlay: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
  },
  nopeOverlay: {
    backgroundColor: 'rgba(251, 113, 133, 0.1)',
  },
  superOverlay: {
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
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
  // Card content
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  accentBar: {
    height: 5,
    width: '100%',
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
    alignItems: 'center',
  },
  cardName: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1E1B3A',
    letterSpacing: -2,
    marginBottom: 8,
    textAlign: 'center',
  },
  pronunciation: {
    fontSize: 16,
    color: '#8B7FA3',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  meaningBox: {
    backgroundColor: '#FAF8FC',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 12,
    width: '100%',
  },
  meaningText: {
    fontSize: 16,
    color: '#4A3D6A',
    textAlign: 'center',
    lineHeight: 24,
  },
  // Famous people
  famousRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  famousText: {
    fontSize: 13,
    color: '#6B5B8A',
    fontWeight: '500',
    flexShrink: 1,
  },
  popularityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    gap: 6,
    marginBottom: 12,
  },
  popularityText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8b5cf6',
    textTransform: 'capitalize',
  },
  detailsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F0F7',
    gap: 6,
  },
  detailsLinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A78BFA',
  },
  swipeHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#C2B8C9',
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 2,
  },
  // Actions
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 36,
    paddingHorizontal: 24,
    paddingBottom: 120,
    paddingTop: 12,
  },
  actionCol: {
    alignItems: 'center',
    gap: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B7FA3',
  },
  actionDislike: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F0F7',
  },
  actionSuperWrap: {
    width: 76,
    height: 76,
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#818CF8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  actionSuperGradient: {
    width: 76,
    height: 76,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLikeWrap: {
    width: 64,
    height: 64,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#F472B6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  actionLikeGradient: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Empty states
  emptyContainer: {
    flex: 1,
  },
  emptyGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E1B3A',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B5B8A',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  ctaBtn: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    shadowColor: '#F472B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  ctaBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});
