import { supabase } from './supabase';
import type { Name } from '@/types/database';

export interface RecommendationParams {
  userId: string;
  country?: string;
  gender?: string | null;
  limit?: number;
}

/**
 * Get AI-powered name recommendations for a user
 * Uses pgvector centroid math in Postgres: computes weighted average of liked
 * embeddings, subtracts dislike signal, then finds closest unswiped names.
 */
export async function getRecommendations(
  params: RecommendationParams
): Promise<Name[]> {
  try {
    const { data, error } = await supabase.rpc('get_smart_recommendations', {
      p_user_id: params.userId,
      p_country: params.country || 'USA',
      p_gender: params.gender || null,
      p_limit: params.limit || 20,
    });

    if (error) throw error;

    return (data as Name[]) || [];
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return [];
  }
}

/**
 * Find similar names based on vector similarity
 * Uses pgvector's cosine distance for semantic similarity
 */
export async function findSimilarNames(
  nameId: string,
  limit: number = 10
): Promise<Name[]> {
  try {
    // First get the embedding of the reference name
    const { data: referenceName, error: refError } = await supabase
      .from('names')
      .select('embedding')
      .eq('id', nameId)
      .single();

    if (refError) throw refError;

    if (!referenceName?.embedding) {
      throw new Error('Reference name does not have an embedding');
    }

    // Find similar names using vector similarity
    const { data, error } = await supabase.rpc('match_names_by_embedding', {
      query_embedding: referenceName.embedding,
      match_threshold: 0.7,
      match_count: limit + 1, // +1 because the reference name itself will be included
    });

    if (error) throw error;

    // Filter out the reference name itself
    return (data || []).filter((name: Name) => name.id !== nameId);
  } catch (error) {
    console.error('Failed to find similar names:', error);
    return [];
  }
}
