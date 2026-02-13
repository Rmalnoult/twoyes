export interface RawName {
  name: string;
  name_normalized: string;
  gender: 'male' | 'female';
  count: number;
  rank: number;
  country: 'USA' | 'FRA' | 'GBR' | 'DEU' | 'ESP' | 'ITA';
}

export interface MergedName {
  name: string;
  name_normalized: string;
  gender: 'male' | 'female' | 'unisex';
  popularity_rank_us: number | null;
  popularity_rank_fr: number | null;
  popularity_rank_uk: number | null;
  popularity_rank_de: number | null;
  popularity_rank_es: number | null;
  popularity_rank_it: number | null;
  countries: string[];
}

export interface EnrichedName extends MergedName {
  meaning: string;
  etymology: string;
  origins: string[];
  pronunciation_ipa: string;
  metadata: {
    style_tags: string[];
    syllables: number;
    famous_people: string[];
  };
}

export interface PopularityEntry {
  name_normalized: string;
  year: number;
  country: 'USA' | 'FRA' | 'GBR' | 'DEU' | 'ESP' | 'ITA';
  rank: number | null;
  count: number;
}
