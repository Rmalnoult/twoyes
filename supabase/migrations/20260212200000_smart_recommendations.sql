-- Smart AI recommendations using pgvector centroid math
-- Computes average of liked embeddings (super_likes/favorites counted twice),
-- subtracts dislike signal, then finds closest unswiped names via cosine similarity.

CREATE OR REPLACE FUNCTION get_smart_recommendations(
  p_user_id uuid,
  p_country text DEFAULT 'USA',
  p_gender text DEFAULT NULL,
  p_limit int DEFAULT 20
)
RETURNS SETOF names
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_positive_centroid vector(1536);
  v_negative_centroid vector(1536);
  v_query_vector vector(1536);
  v_positive_count int;
  v_negative_count int;
BEGIN
  -- Step 1: Compute positive centroid from likes, super_likes, and favorites
  -- Super_likes and favorites are duplicated to give them 2x weight in the average
  SELECT
    AVG(e)::vector(1536),
    COUNT(*)
  INTO v_positive_centroid, v_positive_count
  FROM (
    -- Regular likes (counted once)
    SELECT n.embedding AS e
    FROM user_swipes s
    JOIN names n ON n.id = s.name_id
    WHERE s.user_id = p_user_id AND s.action = 'like' AND n.embedding IS NOT NULL
    UNION ALL
    -- Super likes (counted twice for 2x weight)
    SELECT n.embedding AS e
    FROM user_swipes s
    JOIN names n ON n.id = s.name_id
    WHERE s.user_id = p_user_id AND s.action = 'super_like' AND n.embedding IS NOT NULL
    UNION ALL
    SELECT n.embedding AS e
    FROM user_swipes s
    JOIN names n ON n.id = s.name_id
    WHERE s.user_id = p_user_id AND s.action = 'super_like' AND n.embedding IS NOT NULL
    UNION ALL
    -- Favorites (counted twice for 2x weight)
    SELECT n.embedding AS e
    FROM user_favorites f
    JOIN names n ON n.id = f.name_id
    WHERE f.user_id = p_user_id AND n.embedding IS NOT NULL
    UNION ALL
    SELECT n.embedding AS e
    FROM user_favorites f
    JOIN names n ON n.id = f.name_id
    WHERE f.user_id = p_user_id AND n.embedding IS NOT NULL
  ) positive_embeddings;

  -- Step 2: Compute negative centroid from dislikes
  SELECT
    AVG(n.embedding)::vector(1536),
    COUNT(*)
  INTO v_negative_centroid, v_negative_count
  FROM user_swipes s
  JOIN names n ON n.id = s.name_id
  WHERE s.user_id = p_user_id
    AND s.action = 'dislike'
    AND n.embedding IS NOT NULL;

  -- Step 3: Combine into query vector
  -- Push away from dislikes: positive_centroid - 0.3 * negative_centroid
  -- Since pgvector doesn't support scalar * vector, we use AVG trick:
  -- AVG of [7 copies of pos, 3 copies of (pos - neg)]
  -- = (7*pos + 3*(pos - neg)) / 10 = (10*pos - 3*neg) / 10 = pos - 0.3*neg
  IF v_positive_centroid IS NOT NULL AND v_negative_centroid IS NOT NULL THEN
    SELECT AVG(v)::vector(1536)
    INTO v_query_vector
    FROM (
      SELECT v_positive_centroid AS v FROM generate_series(1, 7)
      UNION ALL
      SELECT (v_positive_centroid - v_negative_centroid) AS v FROM generate_series(1, 3)
    ) parts;
  ELSIF v_positive_centroid IS NOT NULL THEN
    v_query_vector := v_positive_centroid;
  END IF;

  -- Step 4: Return recommendations
  IF v_query_vector IS NOT NULL THEN
    -- Vector similarity search (excludes already-swiped and favorited names)
    RETURN QUERY
    SELECT n.*
    FROM names n
    WHERE n.embedding IS NOT NULL
      AND n.id NOT IN (
        SELECT name_id FROM user_swipes WHERE user_id = p_user_id
      )
      AND n.id NOT IN (
        SELECT name_id FROM user_favorites WHERE user_id = p_user_id
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
    ORDER BY n.embedding <=> v_query_vector
    LIMIT p_limit;
  ELSE
    -- Fallback: no swipe history, return popular names
    RETURN QUERY
    SELECT n.*
    FROM names n
    WHERE n.embedding IS NOT NULL
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
    LIMIT p_limit;
  END IF;
END;
$$;
