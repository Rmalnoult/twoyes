-- Function to fetch names the user hasn't swiped yet, ordered by popularity
CREATE OR REPLACE FUNCTION get_swipe_deck(
  p_user_id uuid,
  p_country text DEFAULT 'USA',
  p_gender text DEFAULT NULL,
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
)
RETURNS SETOF names
LANGUAGE sql
STABLE
AS $$
  SELECT n.*
  FROM names n
  WHERE n.id NOT IN (
    SELECT us.name_id FROM user_swipes us WHERE us.user_id = p_user_id
  )
  AND (p_gender IS NULL OR n.gender = p_gender)
  AND (
    CASE p_country
      WHEN 'USA' THEN n.popularity_rank_us
      WHEN 'FRA' THEN n.popularity_rank_fr
      WHEN 'GBR' THEN n.popularity_rank_uk
      WHEN 'DEU' THEN n.popularity_rank_de
      WHEN 'ESP' THEN n.popularity_rank_es
      WHEN 'ITA' THEN n.popularity_rank_it
    END
  ) IS NOT NULL
  ORDER BY (
    CASE p_country
      WHEN 'USA' THEN n.popularity_rank_us
      WHEN 'FRA' THEN n.popularity_rank_fr
      WHEN 'GBR' THEN n.popularity_rank_uk
      WHEN 'DEU' THEN n.popularity_rank_de
      WHEN 'ESP' THEN n.popularity_rank_es
      WHEN 'ITA' THEN n.popularity_rank_it
    END
  ) ASC
  LIMIT p_limit
  OFFSET p_offset;
$$;
