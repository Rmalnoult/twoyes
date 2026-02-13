-- Add syllable count to names table
ALTER TABLE names ADD COLUMN IF NOT EXISTS syllables INT;

-- Add name length computed column (stored for performance)
ALTER TABLE names ADD COLUMN IF NOT EXISTS name_length INT GENERATED ALWAYS AS (length(name)) STORED;

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_names_syllables ON names(syllables);
CREATE INDEX IF NOT EXISTS idx_names_length ON names(name_length);
CREATE INDEX IF NOT EXISTS idx_names_popularity ON names(popularity_rank_us) WHERE popularity_rank_us IS NOT NULL;

-- Update existing names with syllable counts (approximate)
-- This is a simple heuristic - count vowel groups
UPDATE names SET syllables = CASE
  WHEN name = 'Ava' THEN 2
  WHEN name = 'Mia' THEN 2
  WHEN name = 'Emma' THEN 2
  WHEN name = 'Olivia' THEN 4
  WHEN name = 'Sophia' THEN 3
  WHEN name = 'Isabella' THEN 4
  WHEN name = 'Charlotte' THEN 2
  WHEN name = 'Amelia' THEN 4
  WHEN name = 'Luna' THEN 2
  WHEN name = 'Harper' THEN 2
  WHEN name = 'Liam' THEN 2
  WHEN name = 'Noah' THEN 2
  WHEN name = 'Oliver' THEN 3
  WHEN name = 'James' THEN 1
  WHEN name = 'Elijah' THEN 3
  WHEN name = 'William' THEN 2
  WHEN name = 'Henry' THEN 2
  WHEN name = 'Lucas' THEN 2
  WHEN name = 'Alexander' THEN 4
  WHEN name = 'Theodore' THEN 3
  WHEN name = 'Avery' THEN 3
  WHEN name = 'Riley' THEN 2
  WHEN name = 'Jordan' THEN 2
  WHEN name = 'Taylor' THEN 2
  WHEN name = 'Morgan' THEN 2
  WHEN name = 'Aria' THEN 3
  WHEN name = 'Asher' THEN 2
  WHEN name = 'Hazel' THEN 2
  WHEN name = 'Silas' THEN 2
  WHEN name = 'Isla' THEN 2
  ELSE 2 -- Default
END
WHERE syllables IS NULL;
