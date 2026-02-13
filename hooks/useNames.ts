import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { getRecommendations, findSimilarNames } from '@/services/ai';
import { analytics } from '@/services/analytics';
import type { Name, UserFavorite } from '@/types/database';
import type { Country } from '@/store';

export const POPULARITY_COLUMN: Record<Country, string> = {
  US: 'popularity_rank_us',
  FR: 'popularity_rank_fr',
  UK: 'popularity_rank_uk',
  DE: 'popularity_rank_de',
  ES: 'popularity_rank_es',
  IT: 'popularity_rank_it',
};

// Query keys for cache management
export const nameKeys = {
  all: ['names'] as const,
  lists: () => [...nameKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...nameKeys.lists(), filters] as const,
  details: () => [...nameKeys.all, 'detail'] as const,
  detail: (id: string) => [...nameKeys.details(), id] as const,
  favorites: () => [...nameKeys.all, 'favorites'] as const,
  recommendations: () => [...nameKeys.all, 'recommendations'] as const,
  recommendation: (userId: string) => [...nameKeys.recommendations(), userId] as const,
  similar: (nameId: string) => [...nameKeys.all, 'similar', nameId] as const,
  swipeDeck: (filters: Record<string, any>) => [...nameKeys.all, 'swipeDeck', filters] as const,
};

// Daily seed: deterministic index that changes every day
function getDailySeed(): number {
  const now = new Date();
  // days since epoch — changes at midnight UTC
  return Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
}

// Fetch three "Names of the Day" — one per gender, rotating daily
export function useNamesOfTheDay(country: Country) {
  const seed = getDailySeed();
  const popColumn = POPULARITY_COLUMN[country];

  return useQuery({
    queryKey: [...nameKeys.all, 'nameOfTheDay', country, seed],
    queryFn: async () => {
      const genders = ['female', 'male', 'unisex'] as const;
      const results = await Promise.all(
        genders.map(async (gender, i) => {
          // Use a different offset per gender so they don't all rotate in sync
          const offset = (seed * 7 + i * 31) % 150;
          const { data, error } = await supabase
            .from('names')
            .select('*')
            .eq('gender', gender)
            .not(popColumn, 'is', null)
            .order(popColumn, { ascending: true })
            .range(offset, offset)
            .limit(1);

          if (error) throw error;
          // Fallback to offset 0 if out of bounds
          if (!data || data.length === 0) {
            const { data: fallback } = await supabase
              .from('names')
              .select('*')
              .eq('gender', gender)
              .not(popColumn, 'is', null)
              .order(popColumn, { ascending: true })
              .limit(1);
            return fallback?.[0] as Name | undefined;
          }
          return data[0] as Name;
        }),
      );
      return {
        girl: results[0],
        boy: results[1],
        unisex: results[2],
      };
    },
    staleTime: 30 * 60 * 1000, // 30 min — same day = same result
  });
}

// Fetch names with optional filters
export function useNames(filters?: {
  gender?: 'male' | 'female' | 'unisex';
  origins?: string[];
  search?: string;
  syllables?: number[];
  nameLength?: [number, number];
  popularityRange?: [number, number];
  country?: Country;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: nameKeys.list(filters || {}),
    queryFn: async () => {
      let query = supabase.from('names').select('*');
      const popColumn = POPULARITY_COLUMN[filters?.country || 'US'];

      if (filters?.gender) {
        query = query.eq('gender', filters.gender);
      }

      if (filters?.origins && filters.origins.length > 0) {
        query = query.overlaps('origins', filters.origins);
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters?.syllables && filters.syllables.length > 0) {
        query = query.in('syllables', filters.syllables);
      }

      if (filters?.nameLength) {
        query = query.gte('name_length', filters.nameLength[0]);
        query = query.lte('name_length', filters.nameLength[1]);
      }

      if (filters?.popularityRange) {
        query = query.gte(popColumn, filters.popularityRange[0]);
        query = query.lte(popColumn, filters.popularityRange[1]);
      }

      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;

      query = query
        .not(popColumn, 'is', null)
        .range(offset, offset + limit - 1)
        .order(popColumn, { ascending: true });

      const { data, error } = await query;

      if (error) throw error;
      return data as Name[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch unswiped names for the swipe deck
export function useSwipeDeck(
  userId: string | null,
  filters?: {
    gender?: 'male' | 'female' | 'unisex';
    country?: Country;
    limit?: number;
  }
) {
  const queryClient = useQueryClient();
  const country = filters?.country || 'US';
  const dbCountry = { US: 'USA', FR: 'FRA', UK: 'GBR', DE: 'DEU', ES: 'ESP', IT: 'ITA' }[country];

  const query = useQuery({
    queryKey: nameKeys.swipeDeck({ userId, gender: filters?.gender, country }),
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase.rpc('get_swipe_deck', {
        p_user_id: userId,
        p_country: dbCountry,
        p_gender: filters?.gender || null,
        p_limit: filters?.limit || 50,
        p_offset: 0,
      });

      if (error) throw error;
      return (data as Name[]) || [];
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const loadMore = () => {
    queryClient.invalidateQueries({ queryKey: nameKeys.swipeDeck({ userId, gender: filters?.gender, country }) });
  };

  return { ...query, loadMore };
}

// Fetch single name by ID
export function useName(nameId: string | null) {
  return useQuery({
    queryKey: nameKeys.detail(nameId || ''),
    queryFn: async () => {
      if (!nameId) return null;

      const { data, error } = await supabase
        .from('names')
        .select('*')
        .eq('id', nameId)
        .single();

      if (error) throw error;
      return data as Name;
    },
    enabled: !!nameId,
  });
}

// Fetch user's favorite names
export function useFavorites(userId: string | null) {
  return useQuery({
    queryKey: [...nameKeys.favorites(), userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_favorites')
        .select('*, names(*)')
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

// Add name to favorites
export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, nameId, nameName }: { userId: string; nameId: string; nameName?: string }) => {
      const { data, error } = await supabase
        .from('user_favorites')
        .insert({ user_id: userId, name_id: nameId })
        .select()
        .single();

      if (error) throw error;
      analytics.track('name_favorited', { nameId, name: nameName });
      return data as UserFavorite;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [...nameKeys.favorites(), data.user_id] });
    },
  });
}

// Remove name from favorites
export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, nameId, nameName }: { userId: string; nameId: string; nameName?: string }) => {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('name_id', nameId);

      if (error) throw error;
      analytics.track('name_unfavorited', { nameId, name: nameName });
      return { userId, nameId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [...nameKeys.favorites(), data.userId] });
    },
  });
}

// Get AI-powered recommendations for a user
export function useRecommendations(
  userId: string | null,
  options?: { country?: Country; gender?: string | null; limit?: number }
) {
  const country = options?.country || 'US';
  const dbCountry = { US: 'USA', FR: 'FRA', UK: 'GBR', DE: 'DEU', ES: 'ESP', IT: 'ITA' }[country];

  return useQuery({
    queryKey: nameKeys.recommendation(userId || ''),
    queryFn: async () => {
      if (!userId) return [];

      return getRecommendations({
        userId,
        country: dbCountry,
        gender: options?.gender,
        limit: options?.limit || 20,
      });
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes - refresh as user swipes
  });
}

// Get similar names based on vector similarity
export function useSimilarNames(nameId: string | null, limit?: number) {
  return useQuery({
    queryKey: nameKeys.similar(nameId || ''),
    queryFn: async () => {
      if (!nameId) return [];

      const similar = await findSimilarNames(nameId, limit || 10);
      return similar;
    },
    enabled: !!nameId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
