import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Sparkles, TrendingUp, Heart, Brain, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, useGenderPreference, useCountry, COUNTRY_LABELS } from '@/store';
import { useNames, useRecommendations, useNamesOfTheDay } from '@/hooks/useNames';
import { analytics } from '@/services/analytics';
import GenderToggle from '@/components/GenderToggle';
import CountryPicker from '@/components/CountryPicker';
import { FadeIn, Skeleton } from '@/components/Animated';

export default function DiscoverScreen() {
  const { user } = useAuth();
  const { genderPreference } = useGenderPreference();
  const { country } = useCountry();

  const genderFilter = genderPreference === 'all' ? undefined : genderPreference;

  const { data: namesOfTheDay } = useNamesOfTheDay(country);
  const { data: trendingNames } = useNames({ gender: genderFilter, country, limit: 10 });
  const { data: popularNames } = useNames({ gender: genderFilter, country, limit: 6 });
  const { data: recommendations, isLoading: loadingRecommendations } = useRecommendations(
    user?.id || null,
    { country, gender: genderFilter, limit: 10 }
  );

  // Track when recommendations are shown
  const trackedRecsRef = useRef(false);
  useEffect(() => {
    if (recommendations && recommendations.length > 0 && !trackedRecsRef.current) {
      trackedRecsRef.current = true;
      analytics.track('recommendations_viewed', {
        count: recommendations.length,
        country,
        gender: genderFilter || 'all',
      });
    }
  }, [recommendations]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FAF8FC' }} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <LinearGradient
        colors={['#ffffff', '#FAF8FC']}
        style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 20 }}
      >
        <Text style={cs.greeting}>
          {user ? `Hello, ${user.display_name}` : 'Welcome'}
        </Text>
        <Text style={cs.title}>Discover Names</Text>

        {/* Gender Toggle */}
        <View style={{ marginTop: 16 }}>
          <GenderToggle />
        </View>

        {/* Country Picker */}
        <View style={{ marginTop: 12 }}>
          <CountryPicker />
        </View>
      </LinearGradient>

      {/* Names of the Day */}
      <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
        <View style={cs.sparklesRow}>
          <View style={cs.sparklesBadge}>
            <Sparkles size={14} color="#F472B6" />
          </View>
          <Text style={cs.notdSectionLabel}>Names of the Day</Text>
        </View>
        <View style={cs.notdRow}>
          {([
            { key: 'girl', name: namesOfTheDay?.girl, emoji: '\uD83C\uDF38', gradient: ['#F472B6', '#EC4899'] as const, accent: '#F472B6' },
            { key: 'boy', name: namesOfTheDay?.boy, emoji: '\uD83D\uDC99', gradient: ['#60A5FA', '#818CF8'] as const, accent: '#60A5FA' },
            { key: 'unisex', name: namesOfTheDay?.unisex, emoji: '\uD83C\uDF1F', gradient: ['#FBBF24', '#F59E0B'] as const, accent: '#F59E0B' },
          ] as const).map((item) => (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.9}
              style={{ flex: 1 }}
              onPress={() => item.name && router.push(`/name/${item.name.id}`)}
            >
              <LinearGradient
                colors={item.gradient as unknown as string[]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={cs.nameOfDayCard}
              >
                <Text style={cs.notdEmoji}>{item.emoji}</Text>
                <Text style={cs.nameOfDayName} numberOfLines={1}>
                  {item.name?.name || '...'}
                </Text>
                <Text style={cs.nameOfDayMeaning} numberOfLines={2}>
                  {item.name?.meaning || ''}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* AI Recommendations - For You */}
      {user && recommendations && recommendations.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <View style={cs.sectionHeader}>
            <View style={cs.sectionTitleRow}>
              <View style={cs.sectionIcon}>
                <Brain size={16} color="#7C3AED" />
              </View>
              <Text style={cs.sectionTitle}>For You</Text>
            </View>
            <View style={cs.aiBadge}>
              <Text style={cs.aiBadgeText}>AI Powered</Text>
            </View>
          </View>

          {loadingRecommendations ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              data={[1, 2, 3]}
              keyExtractor={(item) => item.toString()}
              renderItem={() => (
                <View style={cs.skeletonCard}>
                  <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
                  <Skeleton width="60%" height={14} style={{ marginBottom: 8 }} />
                  <Skeleton width="40%" height={12} />
                </View>
              )}
            />
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              data={recommendations.slice(0, 6)}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <FadeIn delay={index * 100}>
                  <TouchableOpacity
                    style={cs.recommendationCard}
                    onPress={() => {
                      analytics.track('recommendation_clicked', {
                        nameId: item.id,
                        name: item.name,
                        position: index,
                      });
                      router.push(`/name/${item.id}`);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={cs.recCardHeader}>
                      <Sparkles size={14} color="#7C3AED" />
                      <View style={cs.matchBadge}>
                        <Text style={cs.matchBadgeText}>Match</Text>
                      </View>
                    </View>
                    <Text style={cs.recCardName}>{item.name}</Text>
                    <Text style={cs.recCardMeaning} numberOfLines={2}>
                      {item.meaning}
                    </Text>
                    <View style={cs.recCardGender}>
                      <Text style={cs.recCardGenderText}>{item.gender}</Text>
                    </View>
                  </TouchableOpacity>
                </FadeIn>
              )}
            />
          )}
        </View>
      )}

      {/* Trending Names */}
      <View style={{ marginBottom: 24 }}>
        <View style={cs.sectionHeader}>
          <View style={cs.sectionTitleRow}>
            <View style={[cs.sectionIcon, { backgroundColor: '#FCE7F3' }]}>
              <TrendingUp size={16} color="#F472B6" />
            </View>
            <Text style={cs.sectionTitle}>Trending Now</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/browse')}
            style={cs.seeAllRow}
          >
            <Text style={cs.seeAllText}>See all</Text>
            <ArrowRight size={14} color="#F472B6" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          data={trendingNames?.slice(0, 6)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={cs.trendingCard}
              onPress={() => router.push(`/name/${item.id}`)}
              activeOpacity={0.7}
            >
              <Text style={cs.trendingName}>{item.name}</Text>
              <Text style={cs.trendingMeaning} numberOfLines={2}>
                {item.meaning}
              </Text>
              <View style={[cs.genderPill, { backgroundColor: item.gender === 'female' ? '#FFF0F6' : item.gender === 'male' ? '#EFF6FF' : '#FFFBEB' }]}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: item.gender === 'female' ? '#F472B6' : item.gender === 'male' ? '#60A5FA' : '#F59E0B', textTransform: 'capitalize' }}>
                  {item.gender}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Popular Names (filtered by gender preference) */}
      {popularNames && popularNames.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <View style={cs.sectionHeader}>
            <Text style={cs.sectionTitle}>
              {genderPreference === 'female' ? `Popular Girl Names in ${COUNTRY_LABELS[country]}` :
               genderPreference === 'male' ? `Popular Boy Names in ${COUNTRY_LABELS[country]}` :
               genderPreference === 'unisex' ? `Popular Unisex Names in ${COUNTRY_LABELS[country]}` :
               `Popular in ${COUNTRY_LABELS[country]}`}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/browse')}
              style={cs.seeAllRow}
            >
              <Text style={cs.seeAllText}>See all</Text>
              <ArrowRight size={14} color="#F472B6" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 20, gap: 10 }}>
            {popularNames.slice(0, 5).map((name) => (
              <TouchableOpacity
                key={name.id}
                style={cs.listCard}
                onPress={() => router.push(`/name/${name.id}`)}
                activeOpacity={0.7}
              >
                <View style={cs.listCardRow}>
                  <View style={[cs.nameInitial, {
                    backgroundColor: name.gender === 'female' ? '#FFF0F6' : name.gender === 'male' ? '#EFF6FF' : '#FFFBEB',
                  }]}>
                    <Text style={{
                      fontSize: 18, fontWeight: '700',
                      color: name.gender === 'female' ? '#F472B6' : name.gender === 'male' ? '#60A5FA' : '#F59E0B',
                    }}>
                      {name.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={cs.listCardName}>{name.name}</Text>
                    <Text style={cs.listCardMeaning} numberOfLines={1}>
                      {name.meaning}
                    </Text>
                  </View>
                  <ArrowRight size={16} color="#C2B8C9" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* CTA */}
      {!user && (
        <View style={{ marginHorizontal: 20, marginBottom: 32 }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(auth)/sign-up')}
          >
            <LinearGradient
              colors={['#F472B6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={cs.ctaButton}
            >
              <Heart size={20} color="white" fill="white" />
              <Text style={cs.ctaText}>Sign Up to Save Favorites</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const cs = StyleSheet.create({
  greeting: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F472B6',
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E1B3A',
    letterSpacing: -0.5,
  },
  notdRow: {
    flexDirection: 'row',
    gap: 10,
  },
  nameOfDayCard: {
    borderRadius: 18,
    padding: 14,
    minHeight: 140,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  sparklesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sparklesBadge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notdSectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E1B3A',
    marginLeft: 8,
  },
  notdEmoji: {
    fontSize: 20,
    marginBottom: 6,
  },
  nameOfDayName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  nameOfDayMeaning: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.85,
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1B3A',
    marginLeft: 8,
  },
  aiBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F472B6',
  },
  skeletonCard: {
    backgroundColor: '#F3F0F7',
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    width: 152,
    height: 140,
  },
  recommendationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    width: 152,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  recCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  matchBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
  },
  matchBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  recCardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1B3A',
    marginBottom: 4,
  },
  recCardMeaning: {
    fontSize: 13,
    color: '#6B5B8A',
    marginBottom: 12,
  },
  recCardGender: {
    backgroundColor: '#EDE9FE',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  recCardGenderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
    textTransform: 'capitalize',
  },
  trendingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    width: 152,
    borderWidth: 1,
    borderColor: '#F3F0F7',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  trendingName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1B3A',
    marginBottom: 4,
  },
  trendingMeaning: {
    fontSize: 13,
    color: '#6B5B8A',
    marginBottom: 12,
  },
  genderPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  listCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  listCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameInitial: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1B3A',
  },
  listCardMeaning: {
    fontSize: 14,
    color: '#6B5B8A',
  },
  ctaButton: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F472B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 8,
  },
});
