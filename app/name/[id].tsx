import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Heart, Share2, TrendingUp, TrendingDown, Sparkles, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useName, useSimilarNames } from '@/hooks/useNames';
import { useAuth, useCountry } from '@/store';
import { useAddFavorite, useRemoveFavorite, useFavorites } from '@/hooks/useNames';

export default function NameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { country } = useCountry();
  const { data: name, isLoading } = useName(id);
  const { data: favorites } = useFavorites(user?.id || null);
  const { data: similarNames } = useSimilarNames(id, 5);
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const isFavorited = favorites?.some((fav: any) => fav.name_id === id);

  const handleToggleFavorite = async () => {
    if (!user || !id) return;

    try {
      if (isFavorited) {
        await removeFavorite.mutateAsync({ userId: user.id, nameId: id });
      } else {
        await addFavorite.mutateAsync({ userId: user.id, nameId: id });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#ea546c" />
      </View>
    );
  }

  if (!name) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Name not found</Text>
      </View>
    );
  }

  const metadata = name.metadata as any;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.headerBtn} activeOpacity={0.6}>
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>
        <View className="flex-row gap-3">
          <TouchableOpacity onPress={handleToggleFavorite} style={s.headerBtn} activeOpacity={0.6}>
            <Heart size={20} color="#ea546c" fill={isFavorited ? '#ea546c' : 'transparent'} />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerBtn} activeOpacity={0.6}>
            <Share2 size={20} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Name Hero */}
        <View style={s.heroSection}>
          <Text style={s.heroName}>{name.name}</Text>
          <View className="flex-row items-center gap-2 mb-3">
            <View style={[s.pill, { backgroundColor: '#fef2f3' }]}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#ea546c', textTransform: 'capitalize' }}>
                {name.gender}
              </Text>
            </View>
            {name.origins?.map((origin) => (
              <View key={origin} style={[s.pill, { backgroundColor: '#f3f4f6' }]}>
                <Text style={{ fontSize: 13, fontWeight: '500', color: '#6b7280', textTransform: 'capitalize' }}>
                  {origin}
                </Text>
              </View>
            ))}
          </View>
          {name.pronunciation_ipa && (
            <Text className="text-base text-gray-400 italic">/{name.pronunciation_ipa}/</Text>
          )}
        </View>

        {/* Meaning */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Meaning</Text>
          <Text className="text-base text-gray-700 leading-relaxed">{name.meaning}</Text>
        </View>

        {/* Etymology */}
        {name.etymology && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Origin & History</Text>
            <Text className="text-base text-gray-700 leading-relaxed">{name.etymology}</Text>
          </View>
        )}

        {/* Popularity */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Popularity</Text>
          <View style={s.statsGrid}>
            {name.popularity_rank_us && (
              <View style={s.statCard}>
                <Text style={s.statLabel}>{'\u{1F1FA}\u{1F1F8}'} US Rank</Text>
                <View className="flex-row items-center gap-2">
                  <Text style={s.statValue}>#{name.popularity_rank_us}</Text>
                  {country === 'US' && name.popularity_trend === 'rising' && <TrendingUp size={16} color="#10b981" />}
                  {country === 'US' && name.popularity_trend === 'falling' && <TrendingDown size={16} color="#ef4444" />}
                </View>
              </View>
            )}
            {name.popularity_rank_fr && (
              <View style={s.statCard}>
                <Text style={s.statLabel}>{'\u{1F1EB}\u{1F1F7}'} France Rank</Text>
                <View className="flex-row items-center gap-2">
                  <Text style={s.statValue}>#{name.popularity_rank_fr}</Text>
                  {country === 'FR' && name.popularity_trend === 'rising' && <TrendingUp size={16} color="#10b981" />}
                  {country === 'FR' && name.popularity_trend === 'falling' && <TrendingDown size={16} color="#ef4444" />}
                </View>
              </View>
            )}
            {name.popularity_rank_uk && (
              <View style={s.statCard}>
                <Text style={s.statLabel}>{'\u{1F1EC}\u{1F1E7}'} UK Rank</Text>
                <View className="flex-row items-center gap-2">
                  <Text style={s.statValue}>#{name.popularity_rank_uk}</Text>
                  {country === 'UK' && name.popularity_trend === 'rising' && <TrendingUp size={16} color="#10b981" />}
                  {country === 'UK' && name.popularity_trend === 'falling' && <TrendingDown size={16} color="#ef4444" />}
                </View>
              </View>
            )}
            {name.popularity_trend && (
              <View style={s.statCard}>
                <Text style={s.statLabel}>Trend</Text>
                <View
                  style={[s.trendPill, {
                    backgroundColor: name.popularity_trend === 'rising' ? '#ecfdf5' : name.popularity_trend === 'falling' ? '#fef2f2' : '#f3f4f6',
                  }]}
                >
                  <Text
                    style={{
                      fontSize: 13, fontWeight: '600', textTransform: 'capitalize',
                      color: name.popularity_trend === 'rising' ? '#10b981' : name.popularity_trend === 'falling' ? '#ef4444' : '#6b7280',
                    }}
                  >
                    {name.popularity_trend}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Famous People */}
        {metadata?.famous_people && metadata.famous_people.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Famous Namesakes</Text>
            <View className="gap-2">
              {metadata.famous_people.map((person: string, idx: number) => (
                <View key={idx} style={s.listItem}>
                  <View style={s.listDot} />
                  <Text className="text-base text-gray-700 flex-1">{person}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Style Tags */}
        {metadata?.style_tags && metadata.style_tags.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Vibe</Text>
            <View className="flex-row flex-wrap gap-2">
              {metadata.style_tags.map((tag: string, idx: number) => (
                <View key={idx} style={s.vibePill}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#0ba5e9', textTransform: 'capitalize' }}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Similar Names */}
        {similarNames && similarNames.length > 0 && (
          <View style={s.section}>
            <View className="flex-row items-center mb-4">
              <Sparkles size={18} color="#0ba5e9" />
              <Text style={[s.sectionTitle, { marginBottom: 0, marginLeft: 8 }]}>Similar Names</Text>
            </View>
            <View className="gap-3">
              {similarNames.map((similarName) => (
                <TouchableOpacity
                  key={similarName.id}
                  style={s.similarCard}
                  onPress={() => router.push(`/name/${similarName.id}`)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-gray-900 mb-0.5">
                        {similarName.name}
                      </Text>
                      <Text className="text-sm text-gray-500" numberOfLines={1}>
                        {similarName.meaning}
                      </Text>
                    </View>
                    <View style={[s.pill, { backgroundColor: '#f0f9ff', marginLeft: 12 }]}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#0ba5e9', textTransform: 'capitalize' }}>
                        {similarName.gender}
                      </Text>
                    </View>
                    <ArrowRight size={16} color="#d1d5db" style={{ marginLeft: 8 }} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      {user && (
        <View style={s.bottomCta}>
          <TouchableOpacity onPress={handleToggleFavorite} activeOpacity={0.85}>
            {isFavorited ? (
              <View style={s.removeFavBtn}>
                <Heart size={20} color="#6b7280" />
                <Text style={s.removeFavText}>Remove from Favorites</Text>
              </View>
            ) : (
              <LinearGradient
                colors={['#ea546c', '#d5294d']}
                style={s.addFavBtn}
              >
                <Heart size={20} color="white" fill="white" />
                <Text style={s.addFavText}>Add to Favorites</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  heroName: {
    fontSize: 48,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -2,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  statsGrid: {
    gap: 10,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 16,
  },
  statLabel: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  trendPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ea546c',
    marginRight: 12,
  },
  vibePill: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  similarCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
  },
  bottomCta: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  addFavBtn: {
    flexDirection: 'row',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#ea546c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  addFavText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  removeFavBtn: {
    flexDirection: 'row',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f3f4f6',
  },
  removeFavText: {
    color: '#6b7280',
    fontSize: 17,
    fontWeight: '600',
  },
});
