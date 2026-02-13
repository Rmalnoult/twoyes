-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =============================================================================
-- PROFILES TABLE (extends auth.users)
-- =============================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  premium_tier VARCHAR(20) DEFAULT 'free' CHECK (premium_tier IN ('free', 'premium', 'family')),
  preferences JSONB DEFAULT '{}'::jsonb,
  partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for profiles
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_partner ON public.profiles(partner_id);

-- Row Level Security for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Helper function to get partner_id without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_my_partner_id()
RETURNS UUID AS $$
  SELECT partner_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "Users can view partner profile"
  ON public.profiles FOR SELECT
  USING (id = public.get_my_partner_id());

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- NAMES TABLE
-- =============================================================================
CREATE TABLE public.names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  name_normalized VARCHAR(100) NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'unisex')),
  origins TEXT[] NOT NULL,
  meaning TEXT,
  etymology TEXT,
  pronunciation_ipa VARCHAR(100),
  audio_url VARCHAR(500),

  -- Popularity data
  popularity_rank_us INT,
  popularity_rank_uk INT,
  popularity_trend VARCHAR(20) CHECK (popularity_trend IN ('rising', 'stable', 'falling')),
  rarity_score DECIMAL(3,2) CHECK (rarity_score >= 0 AND rarity_score <= 1),

  -- AI-generated embeddings for similarity search (1536 dimensions for OpenAI text-embedding-3-small)
  embedding vector(1536),

  -- Flexible metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Full-text search
  search_vector tsvector,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for names
CREATE INDEX idx_names_search ON public.names USING GIN(search_vector);
CREATE INDEX idx_names_embedding ON public.names USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_names_gender ON public.names(gender);
CREATE INDEX idx_names_origins ON public.names USING GIN(origins);
CREATE INDEX idx_names_name_normalized ON public.names(name_normalized);
CREATE INDEX idx_names_popularity_us ON public.names(popularity_rank_us);

-- Trigger to update search_vector automatically
CREATE OR REPLACE FUNCTION public.names_search_trigger()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.name, '') || ' ' || COALESCE(NEW.meaning, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER names_search_update
  BEFORE INSERT OR UPDATE ON public.names
  FOR EACH ROW EXECUTE FUNCTION public.names_search_trigger();

CREATE TRIGGER names_updated_at
  BEFORE UPDATE ON public.names
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Row Level Security for names (public read access)
ALTER TABLE public.names ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Names are publicly readable"
  ON public.names FOR SELECT
  USING (true);

-- =============================================================================
-- USER_FAVORITES TABLE
-- =============================================================================
CREATE TABLE public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name_id UUID NOT NULL REFERENCES public.names(id) ON DELETE CASCADE,
  notes TEXT,
  rank_order INT DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name_id)
);

-- Indexes for user_favorites
CREATE INDEX idx_favorites_user ON public.user_favorites(user_id, rank_order);
CREATE INDEX idx_favorites_name ON public.user_favorites(name_id);

-- Row Level Security
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON public.user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own favorites"
  ON public.user_favorites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- USER_SWIPES TABLE
-- =============================================================================
CREATE TABLE public.user_swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name_id UUID NOT NULL REFERENCES public.names(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('like', 'dislike', 'super_like')),
  swiped_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name_id)
);

-- Indexes for user_swipes
CREATE INDEX idx_swipes_user ON public.user_swipes(user_id, swiped_at DESC);
CREATE INDEX idx_swipes_name ON public.user_swipes(name_id);
CREATE INDEX idx_swipes_action ON public.user_swipes(user_id, action);

-- Row Level Security
ALTER TABLE public.user_swipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own swipes"
  ON public.user_swipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own swipes"
  ON public.user_swipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view partner swipes for matching"
  ON public.user_swipes FOR SELECT
  USING (
    auth.uid() IN (
      SELECT partner_id FROM public.profiles WHERE id = user_id
    )
  );

-- =============================================================================
-- PARTNER_MATCHES TABLE
-- =============================================================================
CREATE TABLE public.partner_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name_id UUID NOT NULL REFERENCES public.names(id) ON DELETE CASCADE,
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'chosen')),
  UNIQUE(user_a_id, user_b_id, name_id),
  CHECK (user_a_id < user_b_id) -- Ensure consistent ordering
);

-- Indexes for partner_matches
CREATE INDEX idx_matches_users ON public.partner_matches(user_a_id, user_b_id);
CREATE INDEX idx_matches_name ON public.partner_matches(name_id);
CREATE INDEX idx_matches_status ON public.partner_matches(status);

-- Row Level Security
ALTER TABLE public.partner_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matches"
  ON public.partner_matches FOR SELECT
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "Users can update own matches"
  ON public.partner_matches FOR UPDATE
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Function to detect and create partner matches
CREATE OR REPLACE FUNCTION public.create_partner_match()
RETURNS TRIGGER AS $$
DECLARE
  partner UUID;
  match_exists BOOLEAN;
BEGIN
  -- Only process 'like' and 'super_like' actions
  IF NEW.action NOT IN ('like', 'super_like') THEN
    RETURN NEW;
  END IF;

  -- Get user's partner
  SELECT partner_id INTO partner
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- If no partner, return
  IF partner IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if partner also liked this name
  SELECT EXISTS (
    SELECT 1 FROM public.user_swipes
    WHERE user_id = partner
      AND name_id = NEW.name_id
      AND action IN ('like', 'super_like')
  ) INTO match_exists;

  -- If both liked, create match
  IF match_exists THEN
    INSERT INTO public.partner_matches (user_a_id, user_b_id, name_id)
    VALUES (
      LEAST(NEW.user_id, partner),
      GREATEST(NEW.user_id, partner),
      NEW.name_id
    )
    ON CONFLICT (user_a_id, user_b_id, name_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER check_partner_match
  AFTER INSERT OR UPDATE ON public.user_swipes
  FOR EACH ROW EXECUTE FUNCTION public.create_partner_match();

-- =============================================================================
-- NAME_POPULARITY TABLE (Historical trends)
-- =============================================================================
CREATE TABLE public.name_popularity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_id UUID NOT NULL REFERENCES public.names(id) ON DELETE CASCADE,
  year INT NOT NULL CHECK (year >= 1900 AND year <= 2100),
  country VARCHAR(3) NOT NULL CHECK (country IN ('USA', 'GBR', 'CAN', 'AUS')),
  rank INT,
  count INT,
  UNIQUE(name_id, year, country)
);

-- Indexes for name_popularity
CREATE INDEX idx_popularity_name_year ON public.name_popularity(name_id, year DESC);
CREATE INDEX idx_popularity_country ON public.name_popularity(country, year DESC);

-- Row Level Security (public read)
ALTER TABLE public.name_popularity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Popularity data is publicly readable"
  ON public.name_popularity FOR SELECT
  USING (true);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to search names with vector similarity
CREATE OR REPLACE FUNCTION public.search_similar_names(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name varchar,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    names.id,
    names.name,
    1 - (names.embedding <=> query_embedding) as similarity
  FROM public.names
  WHERE names.embedding IS NOT NULL
    AND 1 - (names.embedding <=> query_embedding) > match_threshold
  ORDER BY names.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to get personalized name recommendations
CREATE OR REPLACE FUNCTION public.get_recommendations(
  p_user_id uuid,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  name varchar,
  gender varchar,
  meaning text,
  popularity_rank_us int,
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
    n.popularity_rank_us,
    RANDOM() as score -- Simplified scoring (will be enhanced with AI)
  FROM public.names n
  WHERE NOT EXISTS (
    -- Exclude already swiped names
    SELECT 1 FROM public.user_swipes s
    WHERE s.user_id = p_user_id AND s.name_id = n.id
  )
  ORDER BY score DESC
  LIMIT p_limit;
END;
$$;
