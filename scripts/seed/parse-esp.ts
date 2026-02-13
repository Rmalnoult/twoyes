import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { DATA_DIR, normalize, capitalize } from './utils';
import type { RawName, PopularityEntry } from './types';

const MAX_NAMES = 5000;

// Decade labels in the XLS file (used for popularity)
const DECADE_COLS = [
  { label: 'NACIDOS ANTES DE 1930', year: 1925 },
  { label: 'NACIDOS EN AÑOS 1930', year: 1935 },
  { label: 'NACIDOS EN AÑOS 1940', year: 1945 },
  { label: 'NACIDOS EN AÑOS 1950', year: 1955 },
  { label: 'NACIDOS EN AÑOS 1960', year: 1965 },
  { label: 'NACIDOS EN AÑOS 1970', year: 1975 },
  { label: 'NACIDOS EN AÑOS 1980', year: 1985 },
  { label: 'NACIDOS EN AÑOS 1990', year: 1995 },
  { label: 'NACIDOS EN AÑOS 2000', year: 2005 },
  { label: 'NACIDOS EN AÑOS 2010', year: 2015 },
  { label: 'NACIDOS EN AÑOS 2020', year: 2021 },
];

function capitalizeSpanish(name: string): string {
  return name
    .split(' ')
    .map((word) => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

function parseINECsv(filepath: string, gender: 'male' | 'female'): RawName[] {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.trim().split('\n');

  // Header: nombre,frec,edad_media
  const names: RawName[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim());
    if (parts.length < 2) continue;

    const rawName = parts[0];
    const freq = parseInt(parts[1]);

    if (!rawName || rawName.length < 2 || isNaN(freq) || freq <= 0) continue;

    names.push({
      name: capitalizeSpanish(rawName),
      name_normalized: normalize(rawName),
      gender,
      count: freq,
      rank: 0,
      country: 'ESP',
    });
  }

  return names;
}

function parseDecadePopularity(filepath: string): Map<string, Map<number, { rank: number; count: number }>> {
  const wb = XLSX.readFile(filepath);
  const popMap = new Map<string, Map<number, { rank: number; count: number }>>();

  for (const sheetName of ['ESPAÑA_hombres', 'ESPAÑA_mujeres']) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;

    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

    for (let dataRow = 5; dataRow < rows.length; dataRow++) {
      const row = rows[dataRow];
      if (!row || !row[0] || typeof row[0] !== 'number') continue;

      const rank = row[0] as number;

      for (let decIdx = 0; decIdx < DECADE_COLS.length; decIdx++) {
        const colStart = 1 + decIdx * 3;
        const name = row[colStart];
        const freq = row[colStart + 1];

        if (!name || typeof name !== 'string' || !freq) continue;

        const count = typeof freq === 'number' ? freq : parseInt(String(freq));
        if (isNaN(count)) continue;

        const norm = normalize(name);
        const decade = DECADE_COLS[decIdx];

        if (!popMap.has(norm)) {
          popMap.set(norm, new Map());
        }
        popMap.get(norm)!.set(decade.year, { rank, count });
      }
    }
  }

  return popMap;
}

export function parseESP(): { names: RawName[]; popularity: PopularityEntry[] } {
  console.log('\n=== Parsing Spain INE Data ===\n');

  const hombresFile = path.join(DATA_DIR, 'ine_hombres.csv');
  const mujeresFile = path.join(DATA_DIR, 'ine_mujeres.csv');
  const porFechaFile = path.join(DATA_DIR, 'ine_nombres_por_fecha.xls');

  if (!fs.existsSync(hombresFile) || !fs.existsSync(mujeresFile)) {
    console.log('  No Spain INE CSV files found, skipping Spain');
    return { names: [], popularity: [] };
  }

  // Parse primary CSV data (comprehensive name lists with frequency)
  const males = parseINECsv(hombresFile, 'male');
  const females = parseINECsv(mujeresFile, 'female');

  console.log(`  CSV data: ${males.length} male + ${females.length} female names`);

  // Sort and rank
  males.sort((a, b) => b.count - a.count);
  females.sort((a, b) => b.count - a.count);

  males.forEach((n, i) => (n.rank = i + 1));
  females.forEach((n, i) => (n.rank = i + 1));

  const topMales = males.slice(0, MAX_NAMES);
  const topFemales = females.slice(0, MAX_NAMES);
  const allNames = [...topFemales, ...topMales];

  console.log(`  Selected top ${topFemales.length} female + ${topMales.length} male = ${allNames.length} total`);

  // Parse decade-based popularity from XLS for historical trends
  const nameSet = new Set(allNames.map((n) => n.name_normalized));
  const popularityData: PopularityEntry[] = [];

  if (fs.existsSync(porFechaFile)) {
    const decadePopularity = parseDecadePopularity(porFechaFile);
    console.log(`  Decade popularity: ${decadePopularity.size} names with historical data`);

    for (const [norm, decades] of decadePopularity) {
      if (!nameSet.has(norm)) continue;
      for (const [year, data] of decades) {
        popularityData.push({
          name_normalized: norm,
          year,
          country: 'ESP',
          rank: data.rank,
          count: data.count,
        });
      }
    }
  }

  // Add current overall popularity as a single year entry for names without decade data
  for (const n of allNames) {
    popularityData.push({
      name_normalized: n.name_normalized,
      year: 2022,
      country: 'ESP',
      rank: n.rank,
      count: n.count,
    });
  }

  console.log(`  Generated ${popularityData.length} popularity entries`);

  return { names: allNames, popularity: popularityData };
}
