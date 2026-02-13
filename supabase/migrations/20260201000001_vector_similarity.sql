-- Add vector similarity search function
CREATE OR REPLACE FUNCTION match_names_by_embedding(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 20
)
RETURNS SETOF names
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM names
  WHERE embedding IS NOT NULL
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION match_names_by_embedding TO authenticated;
GRANT EXECUTE ON FUNCTION match_names_by_embedding TO anon;
