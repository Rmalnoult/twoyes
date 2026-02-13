-- =============================================================================
-- Migration: Add France country support + unique constraint for seed idempotency
-- =============================================================================

-- 1. Add popularity_rank_fr column to names table
ALTER TABLE public.names ADD COLUMN IF NOT EXISTS popularity_rank_fr INT;

CREATE INDEX IF NOT EXISTS idx_names_popularity_fr
  ON public.names(popularity_rank_fr) WHERE popularity_rank_fr IS NOT NULL;

-- 2. Add unique constraint on name_normalized for seed idempotency (ON CONFLICT)
ALTER TABLE public.names
  ADD CONSTRAINT names_name_normalized_unique UNIQUE (name_normalized);

-- 3. Update name_popularity country CHECK to include FRA
ALTER TABLE public.name_popularity
  DROP CONSTRAINT IF EXISTS name_popularity_country_check;

ALTER TABLE public.name_popularity
  ADD CONSTRAINT name_popularity_country_check
  CHECK (country IN ('USA', 'GBR', 'CAN', 'AUS', 'FRA'));

-- 4. Update get_recommendations to support country parameter
CREATE OR REPLACE FUNCTION public.get_recommendations(
  p_user_id uuid,
  p_country varchar DEFAULT 'USA',
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  name varchar,
  gender varchar,
  meaning text,
  popularity_rank int,
  score float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.name,
    n.gender,
    n.meaning,
    CASE p_country
      WHEN 'USA' THEN n.popularity_rank_us
      WHEN 'FRA' THEN n.popularity_rank_fr
      WHEN 'GBR' THEN n.popularity_rank_uk
      ELSE n.popularity_rank_us
    END as popularity_rank,
    RANDOM() as score
  FROM public.names n
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_swipes s
    WHERE s.user_id = p_user_id AND s.name_id = n.id
  )
  ORDER BY score DESC
  LIMIT p_limit;
END;
$$;
