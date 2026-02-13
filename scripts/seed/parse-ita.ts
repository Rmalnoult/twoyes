import * as fs from 'fs';
import * as path from 'path';
import { DATA_DIR, normalize, capitalize } from './utils';
import type { RawName, PopularityEntry } from './types';

const MAX_NAMES = 5000;

function capitalizeItalian(name: string): string {
  // Handle multi-part Italian names
  return name
    .split(/[\s-]+/)
    .map((part) => {
      if (!part) return part;
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(name.includes('-') ? '-' : ' ');
}

export function parseITA(): { names: RawName[]; popularity: PopularityEntry[] } {
  console.log('\n=== Parsing Italy ISTAT Data ===\n');

  const csvFile = path.join(DATA_DIR, 'istat_nomi.csv');

  if (!fs.existsSync(csvFile)) {
    console.log('  No Italy ISTAT data file found, skipping Italy');
    return { names: [], popularity: [] };
  }

  const content = fs.readFileSync(csvFile, 'utf-8');
  const lines = content.trim().split('\n');

  // Header: nome,tot,male,female
  const header = lines[0].toLowerCase();
  console.log(`  Header: ${header}`);

  const females: RawName[] = [];
  const males: RawName[] = [];
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim());
    if (parts.length < 4) continue;

    const [rawName, totStr, maleStr, femaleStr] = parts;
    const tot = parseInt(totStr);
    const maleCount = parseInt(maleStr);
    const femaleCount = parseInt(femaleStr);

    if (isNaN(tot) || tot <= 0) continue;

    // Skip compound names (e.g., "A IPPOLITO", "A. GIUSEPPE") and very short names
    if (rawName.includes('.') || rawName.length < 2) {
      skipped++;
      continue;
    }

    // Skip names with spaces that look like compound first names (unless they are common)
    // Allow short compounds like "ANNA MARIA" but skip initials like "A MARIA"
    if (rawName.includes(' ') && rawName.split(' ')[0].length <= 1) {
      skipped++;
      continue;
    }

    const name = capitalizeItalian(rawName);
    const norm = normalize(rawName);

    // Determine gender based on counts
    if (maleCount > 0 && femaleCount > 0) {
      // Present in both genders - assign to the dominant one
      if (maleCount >= femaleCount) {
        males.push({
          name,
          name_normalized: norm,
          gender: 'male',
          count: maleCount,
          rank: 0,
          country: 'ITA',
        });
      }
      if (femaleCount >= maleCount) {
        females.push({
          name,
          name_normalized: norm,
          gender: 'female',
          count: femaleCount,
          rank: 0,
          country: 'ITA',
        });
      }
    } else if (maleCount > 0) {
      males.push({
        name,
        name_normalized: norm,
        gender: 'male',
        count: maleCount,
        rank: 0,
        country: 'ITA',
      });
    } else if (femaleCount > 0) {
      females.push({
        name,
        name_normalized: norm,
        gender: 'female',
        count: femaleCount,
        rank: 0,
        country: 'ITA',
      });
    }
  }

  console.log(`  Parsed ${males.length} male + ${females.length} female entries (skipped ${skipped})`);

  // Sort and rank
  females.sort((a, b) => b.count - a.count);
  males.sort((a, b) => b.count - a.count);

  females.forEach((n, i) => (n.rank = i + 1));
  males.forEach((n, i) => (n.rank = i + 1));

  const topFemales = females.slice(0, MAX_NAMES);
  const topMales = males.slice(0, MAX_NAMES);
  const allNames = [...topFemales, ...topMales];

  console.log(`  Selected top ${topFemales.length} female + ${topMales.length} male = ${allNames.length} total`);

  // No year-based popularity data available for Italy (dataset is aggregate)
  // Generate a single-year entry for 2022 (approximate date of the data)
  const popularityData: PopularityEntry[] = allNames.map((n) => ({
    name_normalized: n.name_normalized,
    year: 2022,
    country: 'ITA' as const,
    rank: n.rank,
    count: n.count,
  }));

  console.log(`  Generated ${popularityData.length} popularity entries`);

  return { names: allNames, popularity: popularityData };
}
