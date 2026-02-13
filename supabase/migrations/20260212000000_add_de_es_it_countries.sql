-- Add Germany, Spain, Italy support

ALTER TABLE public.names ADD COLUMN IF NOT EXISTS popularity_rank_de integer;
ALTER TABLE public.names ADD COLUMN IF NOT EXISTS popularity_rank_es integer;
ALTER TABLE public.names ADD COLUMN IF NOT EXISTS popularity_rank_it integer;

-- Update the name_popularity country CHECK constraint to include new countries
ALTER TABLE public.name_popularity DROP CONSTRAINT IF EXISTS name_popularity_country_check;
ALTER TABLE public.name_popularity ADD CONSTRAINT name_popularity_country_check
  CHECK (country IN ('USA', 'GBR', 'FRA', 'DEU', 'ESP', 'ITA'));
