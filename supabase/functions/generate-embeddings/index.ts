import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Get all names without embeddings
    const { data: names, error: fetchError } = await supabaseClient
      .from('names')
      .select('id, name, meaning, origins, metadata')
      .is('embedding', null)
      .limit(100);

    if (fetchError) throw fetchError;

    if (!names || names.length === 0) {
      return new Response(
        JSON.stringify({ message: 'All names already have embeddings' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Generate embeddings for each name
    const updates = [];

    for (const name of names) {
      // Create a rich text representation for embedding
      const styleTags = name.metadata?.style_tags?.join(', ') || '';
      const textToEmbed = `${name.name}. Meaning: ${name.meaning}. Origins: ${name.origins.join(', ')}. Style: ${styleTags}`;

      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: textToEmbed,
          model: 'text-embedding-3-small',
        }),
      });

      if (!response.ok) {
        console.error(`Failed to generate embedding for ${name.name}`);
        continue;
      }

      const result = await response.json();
      const embedding = result.data[0].embedding;

      updates.push({
        id: name.id,
        embedding: embedding,
      });
    }

    // Batch update embeddings
    for (const update of updates) {
      await supabaseClient
        .from('names')
        .update({ embedding: update.embedding })
        .eq('id', update.id);
    }

    return new Response(
      JSON.stringify({
        message: `Generated embeddings for ${updates.length} names`,
        processed: updates.length,
        total: names.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
