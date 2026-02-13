/**
 * Script to generate embeddings for all names in the database
 * Run with: pnpm tsx scripts/generate-embeddings.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openaiKey = process.env.OPENAI_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateEmbeddings() {
  console.log('🔍 Fetching names without embeddings...');

  // Get all names without embeddings
  const { data: names, error: fetchError } = await supabase
    .from('names')
    .select('id, name, meaning, origins, metadata')
    .is('embedding', null)
    .limit(100);

  if (fetchError) {
    console.error('❌ Error fetching names:', fetchError);
    process.exit(1);
  }

  if (!names || names.length === 0) {
    console.log('✅ All names already have embeddings!');
    return;
  }

  console.log(`📊 Found ${names.length} names to process`);

  let processed = 0;
  let failed = 0;

  for (const name of names) {
    try {
      // Create a rich text representation for embedding
      const styleTags = name.metadata?.style_tags?.join(', ') || '';
      const textToEmbed = `${name.name}. Meaning: ${name.meaning}. Origins: ${name.origins.join(', ')}. Style: ${styleTags}`;

      console.log(`\n🔄 Processing: ${name.name}`);
      console.log(`   Text: ${textToEmbed.substring(0, 100)}...`);

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
        const error = await response.text();
        console.error(`   ❌ OpenAI API error: ${error}`);
        failed++;
        continue;
      }

      const result = await response.json();
      const embedding = result.data[0].embedding;

      // Update name with embedding
      const { error: updateError } = await supabase
        .from('names')
        .update({ embedding })
        .eq('id', name.id);

      if (updateError) {
        console.error(`   ❌ Database update error:`, updateError);
        failed++;
        continue;
      }

      processed++;
      console.log(`   ✅ Embedded successfully (${processed}/${names.length})`);

      // Rate limiting - wait 100ms between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`   ❌ Unexpected error:`, error);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Completed! Processed: ${processed}, Failed: ${failed}`);
  console.log('='.repeat(50));
}

generateEmbeddings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
