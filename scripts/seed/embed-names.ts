import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { sleep, progress } from './utils';

const BATCH_SIZE = 100;
const DELAY_BETWEEN_BATCHES_MS = 100;

export async function embedNames() {
  console.log('\n=== Generating Embeddings ===\n');

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const openaiKey = process.env.OPENAI_API_KEY!;

  if (!supabaseUrl || !supabaseKey || !openaiKey) {
    throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or OPENAI_API_KEY');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Count total names without embeddings
  const { count } = await supabase
    .from('names')
    .select('id', { count: 'exact', head: true })
    .is('embedding', null);

  if (!count || count === 0) {
    console.log('  All names already have embeddings!');
    return;
  }

  console.log(`  Found ${count} names without embeddings`);

  let processed = 0;
  let failed = 0;

  while (true) {
    // Fetch batch of names without embeddings
    const { data: names, error: fetchError } = await supabase
      .from('names')
      .select('id, name, meaning, origins, metadata')
      .is('embedding', null)
      .limit(BATCH_SIZE);

    if (fetchError) {
      console.error('\n  Error fetching names:', fetchError);
      break;
    }

    if (!names || names.length === 0) break;

    // Build text representations for all names in batch
    const texts = names.map((name) => {
      const styleTags = (name.metadata as any)?.style_tags?.join(', ') || '';
      const origins = Array.isArray(name.origins) ? name.origins.join(', ') : '';
      return `${name.name}. Meaning: ${name.meaning || 'Unknown'}. Origins: ${origins}. Style: ${styleTags}`;
    });

    try {
      // Batch embedding request to OpenAI
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: texts,
          model: 'text-embedding-3-small',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`\n  OpenAI API error: ${error}`);
        failed += names.length;
        await sleep(1000);
        continue;
      }

      const result = await response.json();

      // Update each name with its embedding
      for (let i = 0; i < names.length; i++) {
        const embedding = result.data[i]?.embedding;
        if (!embedding) {
          failed++;
          continue;
        }

        const { error: updateError } = await supabase
          .from('names')
          .update({ embedding })
          .eq('id', names[i].id);

        if (updateError) {
          failed++;
        } else {
          processed++;
        }
      }

      progress(processed + failed, count, `embedded (${failed} failed)`);
      await sleep(DELAY_BETWEEN_BATCHES_MS);
    } catch (error) {
      console.error('\n  Batch embedding error:', error);
      failed += names.length;
      await sleep(1000);
    }
  }

  console.log(`\n  Embedding complete: ${processed} successful, ${failed} failed`);
}
