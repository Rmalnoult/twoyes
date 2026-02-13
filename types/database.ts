// Database types will be generated from Supabase schema
// For now, defining basic types manually

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          premium_tier: 'free' | 'premium' | 'family';
          preferences: Json;
          partner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          premium_tier?: 'free' | 'premium' | 'family';
          preferences?: Json;
          partner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          premium_tier?: 'free' | 'premium' | 'family';
          preferences?: Json;
          partner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      names: {
        Row: {
          id: string;
          name: string;
          name_normalized: string;
          gender: 'male' | 'female' | 'unisex';
          origins: string[];
          meaning: string | null;
          etymology: string | null;
          pronunciation_ipa: string | null;
          audio_url: string | null;
          popularity_rank_us: number | null;
          popularity_rank_uk: number | null;
          popularity_rank_fr: number | null;
          popularity_rank_de: number | null;
          popularity_rank_es: number | null;
          popularity_rank_it: number | null;
          popularity_trend: 'rising' | 'stable' | 'falling' | null;
          rarity_score: number | null;
          embedding: number[] | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_normalized: string;
          gender: 'male' | 'female' | 'unisex';
          origins: string[];
          meaning?: string | null;
          etymology?: string | null;
          pronunciation_ipa?: string | null;
          audio_url?: string | null;
          popularity_rank_us?: number | null;
          popularity_rank_uk?: number | null;
          popularity_rank_fr?: number | null;
          popularity_rank_de?: number | null;
          popularity_rank_es?: number | null;
          popularity_rank_it?: number | null;
          popularity_trend?: 'rising' | 'stable' | 'falling' | null;
          rarity_score?: number | null;
          embedding?: number[] | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_normalized?: string;
          gender?: 'male' | 'female' | 'unisex';
          origins?: string[];
          meaning?: string | null;
          etymology?: string | null;
          pronunciation_ipa?: string | null;
          audio_url?: string | null;
          popularity_rank_us?: number | null;
          popularity_rank_uk?: number | null;
          popularity_rank_fr?: number | null;
          popularity_rank_de?: number | null;
          popularity_rank_es?: number | null;
          popularity_rank_it?: number | null;
          popularity_trend?: 'rising' | 'stable' | 'falling' | null;
          rarity_score?: number | null;
          embedding?: number[] | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_favorites: {
        Row: {
          id: string;
          user_id: string;
          name_id: string;
          notes: string | null;
          rank_order: number;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name_id: string;
          notes?: string | null;
          rank_order?: number;
          added_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name_id?: string;
          notes?: string | null;
          rank_order?: number;
          added_at?: string;
        };
      };
      user_swipes: {
        Row: {
          id: string;
          user_id: string;
          name_id: string;
          action: 'like' | 'dislike' | 'super_like';
          swiped_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name_id: string;
          action: 'like' | 'dislike' | 'super_like';
          swiped_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name_id?: string;
          action?: 'like' | 'dislike' | 'super_like';
          swiped_at?: string;
        };
      };
      partner_matches: {
        Row: {
          id: string;
          user_a_id: string;
          user_b_id: string;
          name_id: string;
          matched_at: string;
          status: 'active' | 'archived' | 'chosen';
        };
        Insert: {
          id?: string;
          user_a_id: string;
          user_b_id: string;
          name_id: string;
          matched_at?: string;
          status?: 'active' | 'archived' | 'chosen';
        };
        Update: {
          id?: string;
          user_a_id?: string;
          user_b_id?: string;
          name_id?: string;
          matched_at?: string;
          status?: 'active' | 'archived' | 'chosen';
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Name = Database['public']['Tables']['names']['Row'];
export type UserFavorite = Database['public']['Tables']['user_favorites']['Row'];
export type UserSwipe = Database['public']['Tables']['user_swipes']['Row'];
export type PartnerMatch = Database['public']['Tables']['partner_matches']['Row'];
