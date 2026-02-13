import * as fs from 'fs';
import * as path from 'path';
import { OUTPUT_DIR, ensureDirs, escapeSql } from './utils';
import type { EnrichedName, PopularityEntry } from './types';

function buildNameInsert(name: EnrichedName): string {
  const origins = `{${name.origins.map((o) => escapeSql(o)).join(',')}}`;
  const metadata = JSON.stringify(name.metadata).replace(/'/g, "''");

  const rankUs = name.popularity_rank_us !== null ? name.popularity_rank_us.toString() : 'NULL';
  const rankUk = name.popularity_rank_uk !== null ? name.popularity_rank_uk.toString() : 'NULL';
  const rankFr = name.popularity_rank_fr !== null ? name.popularity_rank_fr.toString() : 'NULL';
  const rankDe = name.popularity_rank_de !== null ? name.popularity_rank_de.toString() : 'NULL';
  const rankEs = name.popularity_rank_es !== null ? name.popularity_rank_es.toString() : 'NULL';
  const rankIt = name.popularity_rank_it !== null ? name.popularity_rank_it.toString() : 'NULL';

  // Calculate rarity score based on best rank across countries
  const bestRank = Math.min(
    name.popularity_rank_us ?? 99999,
    name.popularity_rank_fr ?? 99999,
    name.popularity_rank_uk ?? 99999,
    name.popularity_rank_de ?? 99999,
    name.popularity_rank_es ?? 99999,
    name.popularity_rank_it ?? 99999
  );
  let rarityScore: string;
  if (bestRank <= 10) rarityScore = '0.05';
  else if (bestRank <= 50) rarityScore = '0.10';
  else if (bestRank <= 100) rarityScore = '0.15';
  else if (bestRank <= 500) rarityScore = '0.25';
  else if (bestRank <= 1000) rarityScore = '0.35';
  else if (bestRank <= 2000) rarityScore = '0.50';
  else rarityScore = '0.70';

  // Determine popularity trend (simplified)
  let trend = 'stable';
  if (bestRank <= 100) trend = 'rising';
  else if (bestRank > 3000) trend = 'falling';

  return `('${escapeSql(name.name)}', '${escapeSql(name.name_normalized)}', '${name.gender}', '${origins}', ${name.meaning ? `'${escapeSql(name.meaning)}'` : 'NULL'}, ${name.etymology ? `'${escapeSql(name.etymology)}'` : 'NULL'}, ${name.pronunciation_ipa ? `'${escapeSql(name.pronunciation_ipa)}'` : 'NULL'}, ${rankUs}, ${rankUk}, ${rankFr}, ${rankDe}, ${rankEs}, ${rankIt}, '${trend}', ${rarityScore}, '${metadata}'::jsonb)`;
}

export function generateSQL(
  names: EnrichedName[],
  popularityData: PopularityEntry[]
) {
  ensureDirs();
  console.log('\n=== Generating SQL Files ===\n');

  // 1. Names SQL
  const namesFile = path.join(OUTPUT_DIR, '01-names.sql');
  let namesSql = `-- Generated seed data: ${names.length} names
-- Run with: psql $SUPABASE_DB_URL -f scripts/seed/output/01-names.sql

`;

  // Process in chunks of 100 to keep SQL manageable
  const CHUNK_SIZE = 100;

  for (let i = 0; i < names.length; i += CHUNK_SIZE) {
    const chunk = names.slice(i, i + CHUNK_SIZE);
    namesSql += `INSERT INTO public.names (name, name_normalized, gender, origins, meaning, etymology, pronunciation_ipa, popularity_rank_us, popularity_rank_uk, popularity_rank_fr, popularity_rank_de, popularity_rank_es, popularity_rank_it, popularity_trend, rarity_score, metadata)
VALUES
${chunk.map(buildNameInsert).join(',\n')}
ON CONFLICT (name_normalized) DO UPDATE SET
  popularity_rank_us = COALESCE(EXCLUDED.popularity_rank_us, names.popularity_rank_us),
  popularity_rank_uk = COALESCE(EXCLUDED.popularity_rank_uk, names.popularity_rank_uk),
  popularity_rank_fr = COALESCE(EXCLUDED.popularity_rank_fr, names.popularity_rank_fr),
  popularity_rank_de = COALESCE(EXCLUDED.popularity_rank_de, names.popularity_rank_de),
  popularity_rank_es = COALESCE(EXCLUDED.popularity_rank_es, names.popularity_rank_es),
  popularity_rank_it = COALESCE(EXCLUDED.popularity_rank_it, names.popularity_rank_it),
  meaning = COALESCE(EXCLUDED.meaning, names.meaning),
  etymology = COALESCE(EXCLUDED.etymology, names.etymology),
  pronunciation_ipa = COALESCE(EXCLUDED.pronunciation_ipa, names.pronunciation_ipa),
  origins = CASE WHEN array_length(EXCLUDED.origins, 1) > 0 THEN EXCLUDED.origins ELSE names.origins END,
  metadata = names.metadata || EXCLUDED.metadata,
  popularity_trend = EXCLUDED.popularity_trend,
  rarity_score = EXCLUDED.rarity_score,
  updated_at = NOW();\n\n`;
  }

  fs.writeFileSync(namesFile, namesSql, 'utf-8');
  const namesSizeMB = (Buffer.byteLength(namesSql, 'utf-8') / 1024 / 1024).toFixed(1);
  console.log(`  Written: 01-names.sql (${namesSizeMB} MB, ${names.length} names)`);

  // 2. Popularity SQL
  if (popularityData.length > 0) {
    const popFile = path.join(OUTPUT_DIR, '02-popularity.sql');
    let popSql = `-- Generated popularity data: ${popularityData.length} entries
-- Run after 01-names.sql

`;

    for (let i = 0; i < popularityData.length; i += CHUNK_SIZE) {
      const chunk = popularityData.slice(i, i + CHUNK_SIZE);
      popSql += `INSERT INTO public.name_popularity (name_id, year, country, rank, count)
SELECT n.id, v.year, v.country, v.rank, v.count
FROM (VALUES
${chunk
  .map(
    (p) =>
      `  ('${escapeSql(p.name_normalized)}', ${p.year}, '${p.country}', ${p.rank ?? 'NULL'}, ${p.count})`
  )
  .join(',\n')}
) AS v(name_normalized, year, country, rank, count)
JOIN public.names n ON n.name_normalized = v.name_normalized
ON CONFLICT (name_id, year, country) DO UPDATE SET
  rank = EXCLUDED.rank,
  count = EXCLUDED.count;\n\n`;
    }

    fs.writeFileSync(popFile, popSql, 'utf-8');
    const popSizeMB = (Buffer.byteLength(popSql, 'utf-8') / 1024 / 1024).toFixed(1);
    console.log(`  Written: 02-popularity.sql (${popSizeMB} MB, ${popularityData.length} entries)`);
  }

  console.log('\n  SQL generation complete!');
}
