-- Add premium subscription tables

-- Subscription plans table
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  stripe_price_id VARCHAR(100),
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  features JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User subscriptions table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, canceled, expired
  billing_period VARCHAR(20) NOT NULL, -- monthly, yearly
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  stripe_subscription_id VARCHAR(100),
  stripe_customer_id VARCHAR(100),
  UNIQUE(user_id, plan_id)
);

-- Payment history table
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) NOT NULL, -- succeeded, failed, pending
  stripe_payment_intent_id VARCHAR(100),
  paid_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_payments_user ON payment_history(user_id);

-- Row Level Security
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Anyone can read subscription plans
CREATE POLICY "Subscription plans are viewable by everyone"
  ON subscription_plans FOR SELECT
  USING (true);

-- Users can only read their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only read their own payment history
CREATE POLICY "Users can view own payments"
  ON payment_history FOR SELECT
  USING (auth.uid() = user_id);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price_monthly, price_yearly, features) VALUES
  ('free', 0, 0, '{
    "ai_recommendations_per_day": 10,
    "max_favorites": 50,
    "advanced_filters": false,
    "name_pronunciation": false,
    "partner_collaboration": true,
    "custom_lists": 1
  }'::jsonb),
  ('premium', 4.99, 49.99, '{
    "ai_recommendations_per_day": 100,
    "max_favorites": -1,
    "advanced_filters": true,
    "name_pronunciation": true,
    "partner_collaboration": true,
    "custom_lists": -1,
    "priority_support": true,
    "early_access": true
  }'::jsonb);

-- Function to check if user has premium
CREATE OR REPLACE FUNCTION is_premium(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  has_active_subscription BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = $1
      AND us.status = 'active'
      AND sp.name != 'free'
      AND (us.expires_at IS NULL OR us.expires_at > NOW())
  ) INTO has_active_subscription;

  RETURN has_active_subscription;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION is_premium TO authenticated;
GRANT EXECUTE ON FUNCTION is_premium TO anon;
