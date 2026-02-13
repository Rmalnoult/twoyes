import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecommendationRequest {
  userId: string;
  limit?: number;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { userId, limit = 20 } = (await req.json()) as RecommendationRequest;

    if (userId !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user preferences
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('preferences')
      .eq('id', userId)
      .single();

    // Get user's favorite names to find similar ones
    const { data: favorites } = await supabaseClient
      .from('user_favorites')
      .select('name_id, names(embedding)')
      .eq('user_id', userId)
      .limit(5);

    // Get user's liked names from swipes
    const { data: likes } = await supabaseClient
      .from('user_swipes')
      .select('name_id, names(embedding)')
      .eq('user_id', userId)
      .in('action', ['like', 'super_like'])
      .limit(10);

    // Build preference-based filter
    const preferences = profile?.preferences || {};
    let query = supabaseClient
      .from('names')
      .select('*')
      .limit(limit);

    // Apply gender filter
    if (preferences.gender && preferences.gender !== 'any') {
      query = query.in('gender', [preferences.gender, 'unisex']);
    }

    // Apply origin filter
    if (preferences.origins && preferences.origins.length > 0) {
      query = query.overlaps('origins', preferences.origins);
    }

    // Apply style filter
    if (preferences.styles && preferences.styles.length > 0) {
      // Filter based on metadata style_tags
      query = query.contains('metadata', { style_tags: preferences.styles });
    }

    // If user has favorites or likes, use vector similarity
    const allLikedNames = [...(favorites || []), ...(likes || [])];

    if (allLikedNames.length > 0) {
      // Calculate average embedding from liked names
      const embeddings = allLikedNames
        .map((item) => item.names?.embedding)
        .filter(Boolean);

      if (embeddings.length > 0) {
        // For now, just use the first embedding as reference
        // In production, you'd calculate the centroid
        const referenceEmbedding = embeddings[0];

        // Use pgvector similarity search
        query = query
          .rpc('match_names_by_embedding', {
            query_embedding: referenceEmbedding,
            match_threshold: 0.7,
            match_count: limit,
          });
      }
    }

    // Exclude names the user has already seen
    const { data: seenNames } = await supabaseClient
      .from('user_swipes')
      .select('name_id')
      .eq('user_id', userId);

    const seenNameIds = seenNames?.map((s) => s.name_id) || [];

    if (seenNameIds.length > 0) {
      query = query.not('id', 'in', `(${seenNameIds.join(',')})`);
    }

    const { data: recommendations, error } = await query;

    if (error) throw error;

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
