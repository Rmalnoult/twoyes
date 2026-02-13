/**
 * Seed Pipeline Orchestrator
 *
 * Downloads government baby name data (US SSA, France INSEE, UK ONS,
 * Germany Cologne, Spain INE, Italy ISTAT), merges across countries,
 * enriches with OpenAI, and generates SQL.
 *
 * Usage:
 *   pnpm tsx scripts/seed/index.ts --step=all
 *   pnpm tsx scripts/seed/index.ts --step=download
 *   pnpm tsx scripts/seed/index.ts --step=parse
 *   pnpm tsx scripts/seed/index.ts --step=merge
 *   pnpm tsx scripts/seed/index.ts --step=enrich
 *   pnpm tsx scripts/seed/index.ts --step=sql
 *   pnpm tsx scripts/seed/index.ts --step=embed
 */

import 'dotenv/config';
import * as path from 'path';
import { downloadSources } from './download-sources';
import { parseSSA } from './parse-ssa';
import { parseINSEE } from './parse-insee';
import { parseONS } from './parse-ons';
import { parseDEU } from './parse-deu';
import { parseESP } from './parse-esp';
import { parseITA } from './parse-ita';
import { mergeNames } from './merge-names';
import { enrichWithOpenAI } from './enrich-openai';
import { generateSQL } from './generate-sql';
import { embedNames } from './embed-names';
import { DATA_DIR, readJsonFile, writeJsonFile, ensureDirs } from './utils';
import type { RawName, MergedName, EnrichedName, PopularityEntry } from './types';

// Parse CLI args
const args = process.argv.slice(2);
const stepArg = args.find((a) => a.startsWith('--step='));
const step = stepArg ? stepArg.split('=')[1] : 'all';

const PARSED_FILE = path.join(DATA_DIR, 'parsed-names.json');
const MERGED_FILE = path.join(DATA_DIR, 'merged-names.json');
const ENRICHED_FILE = path.join(DATA_DIR, 'enriched-names.json');
const POPULARITY_FILE = path.join(DATA_DIR, 'popularity-data.json');

interface ParsedData {
  us: RawName[];
  fr: RawName[];
  uk: RawName[];
  de: RawName[];
  es: RawName[];
  it: RawName[];
}

async function main() {
  console.log('========================================');
  console.log('  TwoYes Seed Pipeline');
  console.log(`  Step: ${step}`);
  console.log('========================================');

  ensureDirs();

  const shouldRun = (s: string) => step === 'all' || step === s;

  // Step 1: Download
  if (shouldRun('download')) {
    await downloadSources();
  }

  // Step 2: Parse
  let usData: { names: RawName[]; popularity: PopularityEntry[] } | null = null;
  let frData: { names: RawName[]; popularity: PopularityEntry[] } | null = null;
  let ukData: { names: RawName[]; popularity: PopularityEntry[] } | null = null;
  let deData: { names: RawName[]; popularity: PopularityEntry[] } | null = null;
  let esData: { names: RawName[]; popularity: PopularityEntry[] } | null = null;
  let itData: { names: RawName[]; popularity: PopularityEntry[] } | null = null;
  let allPopularity: PopularityEntry[] = [];

  if (shouldRun('parse')) {
    usData = parseSSA();
    frData = parseINSEE();
    ukData = parseONS();
    deData = parseDEU();
    esData = parseESP();
    itData = parseITA();

    allPopularity = [
      ...usData.popularity,
      ...frData.popularity,
      ...ukData.popularity,
      ...deData.popularity,
      ...esData.popularity,
      ...itData.popularity,
    ];

    // Cache parsed data
    writeJsonFile(PARSED_FILE, {
      us: usData.names,
      fr: frData.names,
      uk: ukData.names,
      de: deData.names,
      es: esData.names,
      it: itData.names,
    });
    writeJsonFile(POPULARITY_FILE, allPopularity);

    console.log(`\n  Total popularity entries: ${allPopularity.length}`);
  }

  // Step 3: Merge
  let merged: MergedName[] = [];

  if (shouldRun('merge')) {
    // Load parsed data if not in memory
    if (!usData || !frData || !ukData) {
      const parsed = readJsonFile<ParsedData>(PARSED_FILE);
      if (!parsed) throw new Error('No parsed data found. Run --step=parse first.');
      usData = { names: parsed.us, popularity: [] };
      frData = { names: parsed.fr, popularity: [] };
      ukData = { names: parsed.uk, popularity: [] };
      deData = { names: parsed.de || [], popularity: [] };
      esData = { names: parsed.es || [], popularity: [] };
      itData = { names: parsed.it || [], popularity: [] };
    }

    const result = mergeNames(
      usData.names,
      frData.names,
      ukData.names,
      deData?.names || [],
      esData?.names || [],
      itData?.names || []
    );
    merged = result.merged;

    writeJsonFile(MERGED_FILE, merged);
  }

  // Step 4: Enrich
  let enriched: EnrichedName[] = [];

  if (shouldRun('enrich')) {
    if (merged.length === 0) {
      merged = readJsonFile<MergedName[]>(MERGED_FILE) || [];
      if (merged.length === 0) throw new Error('No merged data found. Run --step=merge first.');
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) throw new Error('OPENAI_API_KEY required for enrichment');

    enriched = await enrichWithOpenAI(merged, openaiKey);
    writeJsonFile(ENRICHED_FILE, enriched);
  }

  // Step 5: Generate SQL
  if (shouldRun('sql')) {
    if (enriched.length === 0) {
      enriched = readJsonFile<EnrichedName[]>(ENRICHED_FILE) || [];
      if (enriched.length === 0) throw new Error('No enriched data found. Run --step=enrich first.');
    }

    if (allPopularity.length === 0) {
      allPopularity = readJsonFile<PopularityEntry[]>(POPULARITY_FILE) || [];
    }

    generateSQL(enriched, allPopularity);
  }

  // Step 6: Embed (requires data in database)
  if (shouldRun('embed')) {
    await embedNames();
  }

  console.log('\n========================================');
  console.log('  Pipeline complete!');
  console.log('========================================\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\nFatal error:', error);
    process.exit(1);
  });
