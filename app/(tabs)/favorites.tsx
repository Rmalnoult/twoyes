import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Heart, Trash2, Search } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/store';
import { useFavorites, useRemoveFavorite } from '@/hooks/useNames';
import { FadeIn, SkeletonNameCard } from '@/components/Animated';

export default function FavoritesScreen() {
  const { user } = useAuth();
  const { data: favorites, isLoading } = useFavorites(user?.id || null);
  const removeFavorite = useRemoveFavorite();

  const handleRemove = async (nameId: string) => {
    if (!user) return;
    try {
      await removeFavorite.mutateAsync({ userId: user.id, nameId });
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  if (!user) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <View style={s.emptyIcon}>
          <Heart size={32} color="#ea546c" />
        </View>
        <Text className="text-2xl font-bold text-gray-900 mt-6 mb-2">Save Your Favorites</Text>
        <Text className="text-center text-gray-500 mb-8 text-base leading-relaxed">
          Sign in to save names and{'\n'}share with your partner
        </Text>
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/(auth)/sign-in')}>
          <LinearGradient colors={['#ea546c', '#d5294d']} style={s.ctaBtn}>
            <Text className="text-white font-bold text-lg">Sign In</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View style={s.header}>
          <Text className="text-2xl font-bold text-gray-900" style={{ letterSpacing: -0.5 }}>
            Favorites
          </Text>
        </View>
        <View className="px-5 pt-4">
          {[1, 2, 3].map((i) => (
            <SkeletonNameCard key={i} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View style={s.header}>
        <Text className="text-2xl font-bold text-gray-900" style={{ letterSpacing: -0.5 }}>
          Favorites
        </Text>
        <View style={s.countBadge}>
          <Text style={s.countText}>
            {favorites?.length || 0}
          </Text>
        </View>
      </View>

      {favorites && favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          renderItem={({ item, index }) => (
            <FadeIn delay={index * 50}>
              <TouchableOpacity
                style={s.card}
                onPress={() => router.push(`/name/${item.name_id}`)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <View style={s.heartBadge}>
                    <Heart size={16} color="#ea546c" fill="#ea546c" />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-lg font-bold text-gray-900 mb-0.5">
                      {item.names?.name}
                    </Text>
                    <Text className="text-sm text-gray-500" numberOfLines={1}>
                      {item.names?.meaning}
                    </Text>
                    {item.notes && (
                      <View style={s.noteWrap}>
                        <Text className="text-xs text-gray-500 italic">{item.notes}</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    style={s.deleteBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemove(item.name_id);
                    }}
                    activeOpacity={0.6}
                  >
                    <Trash2 size={16} color="#f87171" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </FadeIn>
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <View style={s.emptyIcon}>
            <Search size={32} color="#d1d5db" />
          </View>
          <Text className="text-xl font-bold text-gray-900 mt-6 mb-2">No favorites yet</Text>
          <Text className="text-center text-gray-500 mb-8 text-base">
            Start exploring and save names you love!
          </Text>
          <TouchableOpacity
            style={s.outlineBtn}
            onPress={() => router.push('/(tabs)/browse')}
            activeOpacity={0.7}
          >
            <Text className="text-primary-600 font-semibold text-base">Browse Names</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 10,
  },
  countBadge: {
    backgroundColor: '#fef2f3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ea546c',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  heartBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fef2f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteWrap: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtn: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    shadowColor: '#ea546c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  outlineBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fde6e7',
    backgroundColor: '#ffffff',
  },
});
