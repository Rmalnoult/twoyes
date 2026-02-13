import * as fs from 'fs';
import * as path from 'path';
import { DATA_DIR, normalize, capitalize } from './utils';
import type { RawName, PopularityEntry } from './types';

const MAX_NAMES = 5000;

// Cologne CSV gender codes
const GENDER_MAP: Record<string, 'male' | 'female'> = {
  m: 'male',
  w: 'female',
};

interface CologneEntry {
  year: number;
  name: string;
  count: number;
  gender: 'male' | 'female';
  position: number;
}

function parseCologneCSV(filepath: string, defaultYear?: number): CologneEntry[] {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.replace(/^\uFEFF/, '').trim().split('\n');
  const header = lines[0].toLowerCase();
  const sep = ';';
  const cols = header.split(sep).map((c) => c.trim());

  const jahrIdx = cols.indexOf('jahr');
  const vornameIdx = cols.indexOf('vorname');
  const anzahlIdx = cols.indexOf('anzahl');
  const geschlechtIdx = cols.indexOf('geschlecht');
  const positionIdx = cols.indexOf('position');

  const entries: CologneEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(sep).map((p) => p.trim());
    if (parts.length < 3) continue;

    const gender = GENDER_MAP[parts[geschlechtIdx]];
    if (!gender) continue;

    const name = parts[vornameIdx];
    if (!name || name.length < 2) continue;

    const count = parseInt(parts[anzahlIdx]);
    if (isNaN(count) || count <= 0) continue;

    const year = jahrIdx >= 0 ? parseInt(parts[jahrIdx]) : defaultYear || 2023;
    if (isNaN(year)) continue;

    const position = positionIdx >= 0 ? parseInt(parts[positionIdx]) : 1;

    entries.push({ year, name, count, gender, position });
  }

  return entries;
}

export function parseDEU(): { names: RawName[]; popularity: PopularityEntry[] } {
  console.log('\n=== Parsing Germany Cologne Data ===\n');

  const entries: CologneEntry[] = [];

  // Load 2019-2022 data
  const file2019 = path.join(DATA_DIR, 'vornamen_koeln_2019_2022.csv');
  if (fs.existsSync(file2019)) {
    const parsed = parseCologneCSV(file2019);
    entries.push(...parsed);
    console.log(`  2019-2022 file: ${parsed.length} records`);
  }

  // Load 2023 data
  const file2023 = path.join(DATA_DIR, 'vornamen_koeln_2023.csv');
  if (fs.existsSync(file2023)) {
    const parsed = parseCologneCSV(file2023, 2023);
    entries.push(...parsed);
    console.log(`  2023 file: ${parsed.length} records`);
  }

  if (entries.length === 0) {
    console.log('  No Cologne data files found, skipping Germany');
    return { names: [], popularity: [] };
  }

  console.log(`  Total records: ${entries.length}`);

  // Filter to first names only (position=1) for primary ranking
  const firstNames = entries.filter((e) => e.position === 1);
  console.log(`  First-name entries (position=1): ${firstNames.length}`);

  // Aggregate recent years (2020-2023) for ranking
  const recentYears = firstNames.filter((e) => e.year >= 2020);
  console.log(`  Recent entries (2020-2023): ${recentYears.length}`);

  // Sum counts per name+gender
  const aggregated = new Map<string, { name: string; gender: 'male' | 'female'; totalCount: number }>();

  for (const entry of recentYears) {
    const key = `${normalize(entry.name)}_${entry.gender}`;
    const existing = aggregated.get(key);
    if (existing) {
      existing.totalCount += entry.count;
    } else {
      aggregated.set(key, {
        name: entry.name,
        gender: entry.gender,
        totalCount: entry.count,
      });
    }
  }

  // Separate by gender, sort, rank
  const females: RawName[] = [];
  const males: RawName[] = [];

  for (const [, data] of aggregated) {
    const displayName = capitalize(data.name);
    const entry: RawName = {
      name: displayName,
      name_normalized: normalize(data.name),
      gender: data.gender,
      count: data.totalCount,
      rank: 0,
      country: 'DEU',
    };

    if (data.gender === 'female') {
      females.push(entry);
    } else {
      males.push(entry);
    }
  }

  females.sort((a, b) => b.count - a.count);
  males.sort((a, b) => b.count - a.count);

  females.forEach((n, i) => (n.rank = i + 1));
  males.forEach((n, i) => (n.rank = i + 1));

  const topFemales = females.slice(0, MAX_NAMES);
  const topMales = males.slice(0, MAX_NAMES);
  const allNames = [...topFemales, ...topMales];

  console.log(`  Ranked: ${females.length} female + ${males.length} male names`);
  console.log(`  Selected top ${topFemales.length} female + ${topMales.length} male = ${allNames.length} total`);

  // Historical popularity per year
  const nameSet = new Set(allNames.map((n) => n.name_normalized));
  const popularityData: PopularityEntry[] = [];

  const years = [...new Set(firstNames.map((e) => e.year))].sort();

  for (const year of years) {
    const yearEntries = firstNames.filter((e) => e.year === year);

    const femaleEntries = yearEntries.filter((e) => e.gender === 'female').sort((a, b) => b.count - a.count);
    const maleEntries = yearEntries.filter((e) => e.gender === 'male').sort((a, b) => b.count - a.count);

    femaleEntries.forEach((e, i) => {
      const norm = normalize(e.name);
      if (nameSet.has(norm)) {
        popularityData.push({
          name_normalized: norm,
          year,
          country: 'DEU',
          rank: i + 1,
          count: e.count,
        });
      }
    });

    maleEntries.forEach((e, i) => {
      const norm = normalize(e.name);
      if (nameSet.has(norm)) {
        popularityData.push({
          name_normalized: norm,
          year,
          country: 'DEU',
          rank: i + 1,
          count: e.count,
        });
      }
    });
  }

  console.log(`  Generated ${popularityData.length} popularity entries`);

  return { names: allNames, popularity: popularityData };
}
