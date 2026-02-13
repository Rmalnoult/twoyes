-- Analytics event log for tracking user behavior over time
CREATE TABLE IF NOT EXISTS user_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event text NOT NULL,           -- e.g. 'swipe', 'recommendation_shown', 'recommendation_tap', 'favorite_add', 'favorite_remove'
  properties jsonb DEFAULT '{}', -- flexible payload per event type
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for querying by user
CREATE INDEX idx_user_events_user_id ON user_events (user_id, created_at DESC);

-- Index for querying by event type (analytics dashboards)
CREATE INDEX idx_user_events_event ON user_events (event, created_at DESC);

-- Enable RLS
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

-- Users can only insert their own events
CREATE POLICY "Users can insert own events"
  ON user_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own events (optional, for debugging)
CREATE POLICY "Users can read own events"
  ON user_events FOR SELECT
  USING (auth.uid() = user_id);
