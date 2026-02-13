import * as fs from 'fs';
import * as path from 'path';
import { DATA_DIR, normalize, capitalize } from './utils';
import type { RawName, PopularityEntry } from './types';

const MAX_NAMES = 5000;

function parseONSCsv(filepath: string, gender: 'male' | 'female'): RawName[] {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.trim().split('\n');

  const names: RawName[] = [];

  // ONS CSV format varies - detect header and parse accordingly
  // Common format: Rank, Name, Count (or Name, Count, Rank)
  // Skip metadata lines at the top (lines that don't look like data)
  let dataStarted = false;
  let nameCol = -1;
  let countCol = -1;
  let rankCol = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',').map((p) => p.trim().replace(/"/g, ''));

    // Try to detect header row
    if (!dataStarted) {
      const lower = parts.map((p) => p.toLowerCase());
      const nameIdx = lower.findIndex((p) => p === 'name' || p === 'names');
      const countIdx = lower.findIndex((p) => p === 'count' || p === 'number' || p === 'total');
      const rankIdx = lower.findIndex((p) => p === 'rank' || p === 'position');

      if (nameIdx >= 0) {
        nameCol = nameIdx;
        countCol = countIdx >= 0 ? countIdx : -1;
        rankCol = rankIdx >= 0 ? rankIdx : -1;
        dataStarted = true;
        continue;
      }

      // Fallback: try to detect data row (first column is a number = rank)
      if (parts.length >= 3 && /^\d+$/.test(parts[0]) && /^[A-Za-z]/.test(parts[1])) {
        // Format: Rank, Name, Count
        rankCol = 0;
        nameCol = 1;
        countCol = 2;
        dataStarted = true;
        // Don't continue - process this line
      } else {
        continue;
      }
    }

    if (dataStarted && nameCol >= 0) {
      const name = parts[nameCol];
      if (!name || !/^[A-Za-z]/.test(name)) continue;

      const count = countCol >= 0 ? parseInt(parts[countCol]) : 0;
      const rank = rankCol >= 0 ? parseInt(parts[rankCol]) : names.length + 1;

      if (name.length > 1) {
        names.push({
          name: capitalize(name),
          name_normalized: normalize(name),
          gender,
          count: isNaN(count) ? 0 : count,
          rank: isNaN(rank) ? names.length + 1 : rank,
          country: 'GBR',
        });
      }
    }
  }

  return names;
}

export function parseONS(): { names: RawName[]; popularity: PopularityEntry[] } {
  console.log('\n=== Parsing UK ONS Data ===\n');

  // Try 2024 first, fall back to 2022
  const boysFile = fs.existsSync(path.join(DATA_DIR, 'ons-boys-2024.csv'))
    ? path.join(DATA_DIR, 'ons-boys-2024.csv')
    : path.join(DATA_DIR, 'ons-boys-2022.csv');
  const girlsFile = fs.existsSync(path.join(DATA_DIR, 'ons-girls-2024.csv'))
    ? path.join(DATA_DIR, 'ons-girls-2024.csv')
    : path.join(DATA_DIR, 'ons-girls-2022.csv');

  if (!fs.existsSync(boysFile) || !fs.existsSync(girlsFile)) {
    throw new Error('ONS CSV files not found. Run download first.');
  }

  const males = parseONSCsv(boysFile, 'male');
  const females = parseONSCsv(girlsFile, 'female');

  console.log(`  Parsed ${males.length} male + ${females.length} female names`);

  // Sort by count descending and re-rank
  males.sort((a, b) => b.count - a.count);
  females.sort((a, b) => b.count - a.count);

  males.forEach((n, i) => (n.rank = i + 1));
  females.forEach((n, i) => (n.rank = i + 1));

  const topMales = males.slice(0, MAX_NAMES);
  const topFemales = females.slice(0, MAX_NAMES);
  const allNames = [...topFemales, ...topMales];

  console.log(`  Selected top ${topFemales.length} female + ${topMales.length} male = ${allNames.length} total`);

  // Simple popularity data from the single year we have
  const popularityData: PopularityEntry[] = allNames.map((n) => ({
    name_normalized: n.name_normalized,
    year: 2024,
    country: 'GBR' as const,
    rank: n.rank,
    count: n.count,
  }));

  console.log(`  Generated ${popularityData.length} popularity entries`);

  return { names: allNames, popularity: popularityData };
}
