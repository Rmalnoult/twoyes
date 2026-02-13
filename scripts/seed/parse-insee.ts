import * as fs from 'fs';
import * as path from 'path';
import { DATA_DIR, normalize, progress } from './utils';
import type { RawName, PopularityEntry } from './types';

const MAX_NAMES = 5000;

// INSEE sexe codes
const GENDER_MAP: Record<string, 'male' | 'female'> = {
  '1': 'male',
  '2': 'female',
};

function capitalizeFrench(name: string): string {
  // Handle hyphenated French names: Jean-Pierre, Marie-Claire
  return name
    .split('-')
    .map((part) => {
      if (!part) return part;
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join('-');
}

function readInseeFile(): string {
  const inseeDir = path.join(DATA_DIR, 'insee');
  const files = fs.readdirSync(inseeDir);

  // Look for the CSV file (could be nat2022.csv or similar)
  const csvFile = files.find((f) => f.endsWith('.csv') && f.startsWith('nat'));
  if (csvFile) {
    return fs.readFileSync(path.join(inseeDir, csvFile), 'utf-8');
  }

  // Try reading any CSV in the directory
  const anyCSV = files.find((f) => f.endsWith('.csv'));
  if (anyCSV) {
    return fs.readFileSync(path.join(inseeDir, anyCSV), 'utf-8');
  }

  throw new Error(`No INSEE CSV file found in ${inseeDir}. Files: ${files.join(', ')}`);
}

export function parseINSEE(): { names: RawName[]; popularity: PopularityEntry[] } {
  console.log('\n=== Parsing France INSEE Data ===\n');

  const content = readInseeFile();
  const lines = content.trim().split('\n');

  // First line is header: sexe;preusuel;annais;nombre
  const header = lines[0].toLowerCase();
  console.log(`  Header: ${header}`);

  // Determine separator (semicolon or tab)
  const sep = header.includes(';') ? ';' : '\t';

  // Parse all records
  interface YearEntry {
    name: string;
    gender: 'male' | 'female';
    year: number;
    count: number;
  }

  const entries: YearEntry[] = [];
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(sep);
    if (parts.length < 4) continue;

    const [sexe, preusuel, annais, nombre] = parts;
    const gender = GENDER_MAP[sexe.trim()];
    if (!gender) continue;

    const name = preusuel.trim();

    // Skip aggregate/rare entries
    if (name === '_PRENOMS_RARES' || name === '' || name === 'XXXX') {
      skipped++;
      continue;
    }

    const year = parseInt(annais.trim());
    const count = parseInt(nombre.trim());

    if (isNaN(year) || isNaN(count)) continue;

    entries.push({ name, gender, year, count });
  }

  console.log(`  Parsed ${entries.length} records (skipped ${skipped} rare/aggregate entries)`);

  // Aggregate recent years (2017-2021) for ranking
  const recentYears = entries.filter((e) => e.year >= 2017 && e.year <= 2021);
  console.log(`  Recent entries (2017-2021): ${recentYears.length}`);

  // Sum counts per name+gender
  const aggregated = new Map<string, { name: string; gender: 'male' | 'female'; totalCount: number }>();

  for (const entry of recentYears) {
    const key = `${normalize(entry.name)}_${entry.gender}`;
    const existing = aggregated.get(key);
    if (existing) {
      existing.totalCount += entry.count;
      // Prefer the original casing from the data
      if (!existing.name || entry.name.length > existing.name.length) {
        existing.name = entry.name;
      }
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
    const displayName = capitalizeFrench(data.name);
    const entry: RawName = {
      name: displayName,
      name_normalized: normalize(data.name),
      gender: data.gender,
      count: data.totalCount,
      rank: 0,
      country: 'FRA',
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

  // Historical popularity (year-by-year for recent decade)
  const nameSet = new Set(allNames.map((n) => n.name_normalized));
  const popularityData: PopularityEntry[] = [];

  const yearRange = [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021];

  for (const year of yearRange) {
    const yearEntries = entries.filter((e) => e.year === year);

    // Rank by gender for this year
    const femaleEntries = yearEntries.filter((e) => e.gender === 'female').sort((a, b) => b.count - a.count);
    const maleEntries = yearEntries.filter((e) => e.gender === 'male').sort((a, b) => b.count - a.count);

    femaleEntries.forEach((e, i) => {
      const norm = normalize(e.name);
      if (nameSet.has(norm)) {
        popularityData.push({
          name_normalized: norm,
          year,
          country: 'FRA',
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
          country: 'FRA',
          rank: i + 1,
          count: e.count,
        });
      }
    });
  }

  console.log(`  Generated ${popularityData.length} popularity entries`);

  return { names: allNames, popularity: popularityData };
}
