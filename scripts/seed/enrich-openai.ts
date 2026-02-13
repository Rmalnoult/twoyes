import * as path from 'path';
import { DATA_DIR, sleep, readJsonFile, writeJsonFile, progress } from './utils';
import type { MergedName, EnrichedName } from './types';

const BATCH_SIZE = 20;
const MAX_CONCURRENT = 5;
const DELAY_BETWEEN_BATCHES_MS = 200;
const MAX_RETRIES = 3;

const PROGRESS_FILE = path.join(DATA_DIR, 'enrichment-progress.json');

interface EnrichmentResult {
  name: string;
  meaning: string;
  etymology: string;
  origins: string[];
  pronunciation_ipa: string;
  style_tags: string[];
  syllables: number;
  famous_people: string[];
}

function buildPrompt(names: MergedName[]): string {
  const nameList = names
    .map((n) => {
      const countries = n.countries.join(', ');
      return `- ${n.name} (${n.gender}, popular in: ${countries})`;
    })
    .join('\n');

  return `For each baby name below, provide enrichment data. Return a JSON object with a "names" array.

Names:
${nameList}

For each name, provide:
- "name": the exact name as given
- "meaning": 1-2 sentence meaning of the name
- "etymology": 1-2 sentence historical/linguistic origin
- "origins": array of cultural origins (e.g., ["french", "latin", "germanic"]). Use lowercase.
- "pronunciation_ipa": IPA pronunciation (e.g., "/ˈɛmə/")
- "style_tags": array from these options: classic, modern, unique, vintage, elegant, strong, gentle, royal, nature, literary, mythological, biblical, artistic, musical, scientific, sporty
- "syllables": number of syllables
- "famous_people": up to 3 famous people with this name (e.g., ["Emma Watson", "Emma Stone"])

Return ONLY valid JSON. No markdown, no explanation.`;
}

async function callOpenAI(
  prompt: string,
  openaiKey: string
): Promise<EnrichmentResult[]> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a baby name expert. Return only valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${error}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;
  const parsed = JSON.parse(content);

  return parsed.names || parsed.results || Object.values(parsed);
}

async function enrichBatchWithRetry(
  batch: MergedName[],
  openaiKey: string,
  retries = MAX_RETRIES
): Promise<EnrichmentResult[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await callOpenAI(buildPrompt(batch), openaiKey);
    } catch (error) {
      if (attempt === retries) {
        console.error(`\n  Failed after ${retries} retries:`, error);
        return [];
      }
      const delay = Math.pow(2, attempt) * 1000;
      console.warn(`\n  Retry ${attempt}/${retries} in ${delay}ms...`);
      await sleep(delay);
    }
  }
  return [];
}

export async function enrichWithOpenAI(
  names: MergedName[],
  openaiKey: string
): Promise<EnrichedName[]> {
  console.log('\n=== Enriching Names with OpenAI ===\n');

  if (!openaiKey) {
    throw new Error('OPENAI_API_KEY is required for enrichment');
  }

  // Load checkpoint
  const checkpoint = readJsonFile<Record<string, EnrichmentResult>>(PROGRESS_FILE) || {};
  const alreadyDone = Object.keys(checkpoint).length;

  if (alreadyDone > 0) {
    console.log(`  Resuming from checkpoint: ${alreadyDone} names already enriched`);
  }

  // Filter out already-enriched names
  const remaining = names.filter((n) => !checkpoint[n.name_normalized]);
  console.log(`  Names to enrich: ${remaining.length} (${alreadyDone} cached)`);

  // Process in batches
  const batches: MergedName[][] = [];
  for (let i = 0; i < remaining.length; i += BATCH_SIZE) {
    batches.push(remaining.slice(i, i + BATCH_SIZE));
  }

  let processed = alreadyDone;
  const total = names.length;

  // Process batches with concurrency limit
  for (let i = 0; i < batches.length; i += MAX_CONCURRENT) {
    const concurrentBatches = batches.slice(i, i + MAX_CONCURRENT);

    const results = await Promise.all(
      concurrentBatches.map((batch) => enrichBatchWithRetry(batch, openaiKey))
    );

    // Save results to checkpoint
    for (const batchResults of results) {
      for (const result of batchResults) {
        if (result && result.name) {
          const normalized = result.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
          checkpoint[normalized] = result;
        }
      }
    }

    processed += concurrentBatches.reduce((sum, b) => sum + b.length, 0);
    progress(Math.min(processed, total), total, 'enriched');

    // Save checkpoint after each concurrent group
    writeJsonFile(PROGRESS_FILE, checkpoint);

    await sleep(DELAY_BETWEEN_BATCHES_MS);
  }

  // Merge enrichment data with merged names
  const enriched: EnrichedName[] = names.map((name) => {
    const enrichment = checkpoint[name.name_normalized];

    return {
      ...name,
      meaning: enrichment?.meaning || '',
      etymology: enrichment?.etymology || '',
      origins: enrichment?.origins || [],
      pronunciation_ipa: enrichment?.pronunciation_ipa || '',
      metadata: {
        style_tags: enrichment?.style_tags || [],
        syllables: enrichment?.syllables || 0,
        famous_people: enrichment?.famous_people || [],
      },
    };
  });

  const withMeaning = enriched.filter((n) => n.meaning).length;
  console.log(`\n  Enrichment complete: ${withMeaning}/${enriched.length} have meanings`);

  return enriched;
}
