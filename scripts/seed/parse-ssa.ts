import * as fs from 'fs';
import * as path from 'path';
import { DATA_DIR, normalize, capitalize, progress } from './utils';
import type { RawName, PopularityEntry } from './types';

const MAX_NAMES = 5000;

export function parseSSA(): { names: RawName[]; popularity: PopularityEntry[] } {
  console.log('\n=== Parsing US SSA Data ===\n');

  const ssaDir = path.join(DATA_DIR, 'ssa');
  const yobFiles = fs.readdirSync(ssaDir)
    .filter((f) => f.match(/^yob\d{4}\.txt$/))
    .sort();

  if (yobFiles.length === 0) {
    throw new Error('No SSA yobYYYY.txt files found. Run download first.');
  }

  // Use most recent year for ranking
  const latestFile = yobFiles[yobFiles.length - 1];
  const latestYear = parseInt(latestFile.replace('yob', '').replace('.txt', ''));
  console.log(`Using latest year: ${latestYear} (${latestFile})`);

  // Parse the latest year file for rankings
  const content = fs.readFileSync(path.join(ssaDir, latestFile), 'utf-8');
  const lines = content.trim().split('\n');

  const females: RawName[] = [];
  const males: RawName[] = [];

  for (const line of lines) {
    const parts = line.trim().split(',');
    if (parts.length !== 3) continue;

    const [name, genderCode, countStr] = parts;
    const count = parseInt(countStr);
    const gender = genderCode === 'F' ? 'female' : 'male';

    const entry: RawName = {
      name: capitalize(name),
      name_normalized: normalize(name),
      gender: gender as 'male' | 'female',
      count,
      rank: 0, // assigned below
      country: 'USA',
    };

    if (gender === 'female') {
      females.push(entry);
    } else {
      males.push(entry);
    }
  }

  // Sort by count descending and assign ranks
  females.sort((a, b) => b.count - a.count);
  males.sort((a, b) => b.count - a.count);

  females.forEach((n, i) => (n.rank = i + 1));
  males.forEach((n, i) => (n.rank = i + 1));

  // Take top N per gender
  const topFemales = females.slice(0, MAX_NAMES);
  const topMales = males.slice(0, MAX_NAMES);
  const allNames = [...topFemales, ...topMales];

  console.log(`  Parsed ${females.length} female + ${males.length} male names`);
  console.log(`  Selected top ${topFemales.length} female + ${topMales.length} male = ${allNames.length} total`);

  // Parse historical popularity (last 10 years)
  const nameSet = new Set(allNames.map((n) => n.name_normalized));
  const popularityData: PopularityEntry[] = [];
  const recentFiles = yobFiles.slice(-10);

  console.log(`  Parsing ${recentFiles.length} years of historical data...`);

  for (let i = 0; i < recentFiles.length; i++) {
    const file = recentFiles[i];
    const year = parseInt(file.replace('yob', '').replace('.txt', ''));
    const yearContent = fs.readFileSync(path.join(ssaDir, file), 'utf-8');
    const yearLines = yearContent.trim().split('\n');

    // Track ranks per gender
    const femaleRank = new Map<string, { rank: number; count: number }>();
    const maleRank = new Map<string, { rank: number; count: number }>();

    let fRank = 0;
    let mRank = 0;

    for (const line of yearLines) {
      const parts = line.trim().split(',');
      if (parts.length !== 3) continue;
      const [name, genderCode, countStr] = parts;
      const normalized = normalize(name);
      const count = parseInt(countStr);

      if (genderCode === 'F') {
        fRank++;
        if (nameSet.has(normalized)) {
          femaleRank.set(normalized, { rank: fRank, count });
        }
      } else {
        mRank++;
        if (nameSet.has(normalized)) {
          maleRank.set(normalized, { rank: mRank, count });
        }
      }
    }

    // Combine into popularity entries using the name's gender
    for (const name of allNames) {
      const data = name.gender === 'female'
        ? femaleRank.get(name.name_normalized)
        : maleRank.get(name.name_normalized);

      if (data) {
        popularityData.push({
          name_normalized: name.name_normalized,
          year,
          country: 'USA',
          rank: data.rank,
          count: data.count,
        });
      }
    }

    progress(i + 1, recentFiles.length, 'historical years');
  }

  console.log(`  Generated ${popularityData.length} popularity entries`);

  return { names: allNames, popularity: popularityData };
}
