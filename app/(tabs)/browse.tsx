import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Search, ArrowRight, SlidersHorizontal, X, RotateCcw } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { useNames } from '@/hooks/useNames';
import { useGenderPreference, useCountry, COUNTRY_LABELS } from '@/store';
import type { Country } from '@/store';

const POPULARITY_KEY: Record<Country, 'popularity_rank_us' | 'popularity_rank_fr' | 'popularity_rank_uk'> = {
  US: 'popularity_rank_us',
  FR: 'popularity_rank_fr',
  UK: 'popularity_rank_uk',
};
import GenderToggle from '@/components/GenderToggle';
import { FadeIn, SkeletonNameCard } from '@/components/Animated';

const ORIGINS = [
  'english', 'french', 'german', 'italian', 'spanish', 'greek',
  'hebrew', 'latin', 'irish', 'scottish', 'welsh', 'scandinavian',
];
const SYLLABLE_OPTIONS = [1, 2, 3, 4, 5];

export default function BrowseScreen() {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { genderPreference } = useGenderPreference();
  const { country } = useCountry();

  // Advanced filters (local state)
  const [syllables, setSyllables] = useState<number[]>([]);
  const [nameLength, setNameLength] = useState<[number, number]>([3, 12]);
  const [popularityRange, setPopularityRange] = useState<[number, number]>([1, 1000]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);

  const genderFilter = genderPreference === 'all' ? undefined : genderPreference;

  // Count active filters
  const activeFilterCount =
    (syllables.length > 0 ? 1 : 0) +
    (nameLength[0] !== 3 || nameLength[1] !== 12 ? 1 : 0) +
    (popularityRange[0] !== 1 || popularityRange[1] !== 1000 ? 1 : 0) +
    (selectedOrigins.length > 0 ? 1 : 0);

  const { data: names, isLoading } = useNames({
    search,
    gender: genderFilter,
    country,
    syllables: syllables.length > 0 ? syllables : undefined,
    nameLength: (nameLength[0] !== 3 || nameLength[1] !== 12) ? nameLength : undefined,
    popularityRange: (popularityRange[0] !== 1 || popularityRange[1] !== 1000) ? popularityRange : undefined,
    origins: selectedOrigins.length > 0 ? selectedOrigins : undefined,
    limit: 50,
  });

  const toggleSyllable = (count: number) => {
    setSyllables((prev) =>
      prev.includes(count) ? prev.filter((s) => s !== count) : [...prev, count]
    );
  };

  const toggleOrigin = (origin: string) => {
    setSelectedOrigins((prev) =>
      prev.includes(origin) ? prev.filter((o) => o !== origin) : [...prev, origin]
    );
  };

  const resetFilters = () => {
    setSyllables([]);
    setNameLength([3, 12]);
    setPopularityRange([1, 1000]);
    setSelectedOrigins([]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Browse Names</Text>

        {/* Search + Filter Row */}
        <View style={s.searchRow}>
          <View style={s.searchBar}>
            <Search size={18} color="#9CA3AF" />
            <TextInput
              style={s.searchInput}
              placeholder="Search names..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="words"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.6}>
                <X size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[s.filterBtn, showFilters && s.filterBtnActive]}
            onPress={() => setShowFilters(!showFilters)}
            activeOpacity={0.7}
          >
            <SlidersHorizontal size={18} color={showFilters ? '#ffffff' : '#6b7280'} />
            {activeFilterCount > 0 && (
              <View style={s.filterBadge}>
                <Text style={s.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Gender Toggle */}
        <GenderToggle />
      </View>

      {/* Collapsible Filter Panel */}
      {showFilters && (
        <View style={s.filterPanel}>
          {/* Reset row */}
          <View style={s.filterPanelHeader}>
            <Text style={s.filterPanelTitle}>Filters</Text>
            <TouchableOpacity onPress={resetFilters} style={s.resetBtn} activeOpacity={0.6}>
              <RotateCcw size={14} color="#ea546c" />
              <Text style={s.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Syllables */}
          <View style={s.filterSection}>
            <Text style={s.filterLabel}>Syllables</Text>
            <View style={s.pillRow}>
              {SYLLABLE_OPTIONS.map((count) => {
                const active = syllables.includes(count);
                return (
                  <TouchableOpacity
                    key={count}
                    style={[s.filterPill, active && s.filterPillActive]}
                    onPress={() => toggleSyllable(count)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.filterPillText, active && s.filterPillTextActive]}>
                      {count}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Name Length */}
          <View style={s.filterSection}>
            <View style={s.filterLabelRow}>
              <Text style={s.filterLabel}>Name Length</Text>
              <Text style={s.filterValue}>{nameLength[0]}-{nameLength[1]} letters</Text>
            </View>
            <Slider
              minimumValue={3}
              maximumValue={15}
              step={1}
              value={nameLength[1]}
              onValueChange={(value) => setNameLength([nameLength[0], value])}
              minimumTrackTintColor="#ea546c"
              maximumTrackTintColor="#e5e7eb"
              thumbTintColor="#ea546c"
            />
          </View>

          {/* Popularity */}
          <View style={s.filterSection}>
            <View style={s.filterLabelRow}>
              <Text style={s.filterLabel}>Popularity</Text>
              <Text style={s.filterValue}>Top {popularityRange[0]}-{popularityRange[1]}</Text>
            </View>
            <Slider
              minimumValue={1}
              maximumValue={1000}
              step={10}
              value={popularityRange[1]}
              onValueChange={(value) => setPopularityRange([popularityRange[0], value])}
              minimumTrackTintColor="#ea546c"
              maximumTrackTintColor="#e5e7eb"
              thumbTintColor="#ea546c"
            />
          </View>

          {/* Origins */}
          <View style={s.filterSection}>
            <Text style={s.filterLabel}>Cultural Origins</Text>
            <View style={s.pillRow}>
              {ORIGINS.map((origin) => {
                const active = selectedOrigins.includes(origin);
                return (
                  <TouchableOpacity
                    key={origin}
                    style={[s.filterPill, active && s.filterPillActive]}
                    onPress={() => toggleOrigin(origin)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.filterPillText, active && s.filterPillTextActive, { textTransform: 'capitalize' }]}>
                      {origin}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      )}

      {/* Results */}
      {isLoading ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonNameCard key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={names}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          renderItem={({ item, index }) => (
            <FadeIn delay={index * 50}>
              <TouchableOpacity
                style={s.nameCard}
                onPress={() => router.push(`/name/${item.id}`)}
                activeOpacity={0.7}
              >
                <View style={s.nameCardRow}>
                  <View style={[s.initial, { backgroundColor: item.gender === 'female' ? '#fef2f3' : item.gender === 'male' ? '#f0f9ff' : '#fefce8' }]}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: item.gender === 'female' ? '#ea546c' : item.gender === 'male' ? '#0ba5e9' : '#ca8a04' }}>
                      {item.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.nameTxt}>{item.name}</Text>
                    <Text style={s.meaningTxt} numberOfLines={1}>
                      {item.meaning}
                    </Text>
                    <View style={s.badgeRow}>
                      <View style={[s.badge, { backgroundColor: item.gender === 'female' ? '#fef2f3' : item.gender === 'male' ? '#f0f9ff' : '#fefce8' }]}>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: item.gender === 'female' ? '#ea546c' : item.gender === 'male' ? '#0ba5e9' : '#ca8a04', textTransform: 'capitalize' }}>
                          {item.gender}
                        </Text>
                      </View>
                      {(() => {
                        const rank = item[POPULARITY_KEY[country]] as number | null;
                        return rank && rank <= 100 ? (
                          <View style={[s.badge, { backgroundColor: '#fffbeb' }]}>
                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#ca8a04' }}>
                              Top {rank}
                            </Text>
                          </View>
                        ) : null;
                      })()}
                    </View>
                  </View>
                  <ArrowRight size={16} color="#d1d5db" />
                </View>
              </TouchableOpacity>
            </FadeIn>
          )}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <View style={s.emptyIcon}>
                <Search size={28} color="#d1d5db" />
              </View>
              <Text style={s.emptyTitle}>No names found</Text>
              <Text style={s.emptySubtitle}>Try adjusting your search or filters</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#ea546c',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ea546c',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  // Filter Panel
  filterPanel: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  filterPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterPanelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ea546c',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  filterValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9ca3af',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: '#f3f4f6',
  },
  filterPillActive: {
    backgroundColor: '#ea546c',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterPillTextActive: {
    color: '#ffffff',
  },
  // Name Cards
  nameCard: {
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
  nameCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  initial: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameTxt: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  meaningTxt: {
    fontSize: 14,
    color: '#6b7280',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
});
