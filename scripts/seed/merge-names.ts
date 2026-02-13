import type { RawName, MergedName, PopularityEntry } from './types';

type CountryCode = 'USA' | 'FRA' | 'GBR' | 'DEU' | 'ESP' | 'ITA';

const RANK_KEYS: Record<CountryCode, keyof MergedName> = {
  USA: 'popularity_rank_us',
  FRA: 'popularity_rank_fr',
  GBR: 'popularity_rank_uk',
  DEU: 'popularity_rank_de',
  ESP: 'popularity_rank_es',
  ITA: 'popularity_rank_it',
};

export function mergeNames(
  usNames: RawName[],
  frNames: RawName[],
  ukNames: RawName[],
  deNames: RawName[] = [],
  esNames: RawName[] = [],
  itNames: RawName[] = []
): { merged: MergedName[]; popularity: PopularityEntry[] } {
  console.log('\n=== Merging Names Across Countries ===\n');

  console.log(`  Input: ${usNames.length} US + ${frNames.length} FR + ${ukNames.length} UK + ${deNames.length} DE + ${esNames.length} ES + ${itNames.length} IT`);

  // Build a map keyed by name_normalized
  const nameMap = new Map<
    string,
    {
      name: string; // display name
      genders: Set<string>;
      popularity_rank_us: number | null;
      popularity_rank_fr: number | null;
      popularity_rank_uk: number | null;
      popularity_rank_de: number | null;
      popularity_rank_es: number | null;
      popularity_rank_it: number | null;
      countries: Set<string>;
      hasAccents: boolean;
    }
  >();

  function addNames(names: RawName[], country: CountryCode) {
    const rankKey = RANK_KEYS[country];
    for (const n of names) {
      const key = n.name_normalized;
      const existing = nameMap.get(key);

      if (existing) {
        existing.genders.add(n.gender);
        existing.countries.add(country);

        // Prefer accented version (from France, Spain, Italy, Germany)
        if (['FRA', 'ESP', 'ITA', 'DEU'].includes(country) && n.name !== n.name_normalized) {
          existing.name = n.name;
          existing.hasAccents = true;
        }

        // Set popularity rank for this country
        (existing as any)[rankKey] = n.rank;
      } else {
        nameMap.set(key, {
          name: n.name,
          genders: new Set([n.gender]),
          popularity_rank_us: country === 'USA' ? n.rank : null,
          popularity_rank_fr: country === 'FRA' ? n.rank : null,
          popularity_rank_uk: country === 'GBR' ? n.rank : null,
          popularity_rank_de: country === 'DEU' ? n.rank : null,
          popularity_rank_es: country === 'ESP' ? n.rank : null,
          popularity_rank_it: country === 'ITA' ? n.rank : null,
          countries: new Set([country]),
          hasAccents: ['FRA', 'ESP', 'ITA', 'DEU'].includes(country) && n.name !== n.name_normalized,
        });
      }
    }
  }

  addNames(usNames, 'USA');
  addNames(frNames, 'FRA');
  addNames(ukNames, 'GBR');
  addNames(deNames, 'DEU');
  addNames(esNames, 'ESP');
  addNames(itNames, 'ITA');

  // Convert to MergedName array
  const merged: MergedName[] = [];

  for (const [normalized, data] of nameMap) {
    // Determine gender: if appears in both male and female, mark unisex
    let gender: 'male' | 'female' | 'unisex';
    if (data.genders.has('male') && data.genders.has('female')) {
      gender = 'unisex';
    } else if (data.genders.has('female')) {
      gender = 'female';
    } else {
      gender = 'male';
    }

    merged.push({
      name: data.name,
      name_normalized: normalized,
      gender,
      popularity_rank_us: data.popularity_rank_us,
      popularity_rank_fr: data.popularity_rank_fr,
      popularity_rank_uk: data.popularity_rank_uk,
      popularity_rank_de: data.popularity_rank_de,
      popularity_rank_es: data.popularity_rank_es,
      popularity_rank_it: data.popularity_rank_it,
      countries: Array.from(data.countries),
    });
  }

  // Sort by combined popularity (names popular in more countries first)
  merged.sort((a, b) => {
    const aCountries = a.countries.length;
    const bCountries = b.countries.length;
    if (aCountries !== bCountries) return bCountries - aCountries;

    // Then by best rank across all countries
    const aRank = Math.min(
      a.popularity_rank_us ?? 99999,
      a.popularity_rank_fr ?? 99999,
      a.popularity_rank_uk ?? 99999,
      a.popularity_rank_de ?? 99999,
      a.popularity_rank_es ?? 99999,
      a.popularity_rank_it ?? 99999
    );
    const bRank = Math.min(
      b.popularity_rank_us ?? 99999,
      b.popularity_rank_fr ?? 99999,
      b.popularity_rank_uk ?? 99999,
      b.popularity_rank_de ?? 99999,
      b.popularity_rank_es ?? 99999,
      b.popularity_rank_it ?? 99999
    );
    return aRank - bRank;
  });

  // Stats
  const multiCountry = merged.filter((n) => n.countries.length > 1).length;
  const unisexCount = merged.filter((n) => n.gender === 'unisex').length;

  console.log(`  Merged: ${merged.length} unique names`);
  console.log(`  Multi-country overlap: ${multiCountry} names appear in 2+ countries`);
  console.log(`  Gender: ${merged.filter((n) => n.gender === 'female').length} female, ${merged.filter((n) => n.gender === 'male').length} male, ${unisexCount} unisex`);

  return { merged, popularity: [] }; // popularity handled separately
}
