import { supabase } from './supabase';

export interface SubscriptionPlan {
  id: string;
  name: string;
  stripe_price_id: string | null;
  price_monthly: number;
  price_yearly: number;
  features: {
    ai_recommendations_per_day: number;
    max_favorites: number; // -1 = unlimited
    advanced_filters: boolean;
    name_pronunciation: boolean;
    partner_collaboration: boolean;
    custom_lists: number; // -1 = unlimited
    priority_support?: boolean;
    early_access?: boolean;
  };
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'expired';
  billing_period: 'monthly' | 'yearly';
  started_at: string;
  expires_at: string | null;
  canceled_at: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
}

/**
 * Get all available subscription plans
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('price_monthly', { ascending: true });

  if (error) throw error;
  return data as SubscriptionPlan[];
}

/**
 * Get user's active subscription
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data as UserSubscription | null;
}

/**
 * Check if user has premium subscription
 */
export async function isPremiumUser(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_premium', { user_id: userId });

  if (error) {
    console.error('Failed to check premium status:', error);
    return false;
  }

  return data as boolean;
}

/**
 * Check if user can access a premium feature
 */
export async function canAccessFeature(
  userId: string,
  feature: keyof SubscriptionPlan['features']
): Promise<boolean> {
  try {
    const subscription = await getUserSubscription(userId);

    if (!subscription) {
      // Get free plan features
      const plans = await getSubscriptionPlans();
      const freePlan = plans.find((p) => p.name === 'free');
      return freePlan?.features[feature] === true || freePlan?.features[feature] === -1;
    }

    // Get user's plan
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('features')
      .eq('id', subscription.plan_id)
      .single();

    if (!plan) return false;

    const featureValue = (plan.features as SubscriptionPlan['features'])[feature];
    return featureValue === true || featureValue === -1;
  } catch (error) {
    console.error('Failed to check feature access:', error);
    return false;
  }
}

/**
 * Get user's feature limits
 */
export async function getFeatureLimits(userId: string): Promise<SubscriptionPlan['features']> {
  try {
    const subscription = await getUserSubscription(userId);

    if (!subscription) {
      // Get free plan features
      const plans = await getSubscriptionPlans();
      const freePlan = plans.find((p) => p.name === 'free');
      return freePlan?.features as SubscriptionPlan['features'];
    }

    // Get user's plan features
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('features')
      .eq('id', subscription.plan_id)
      .single();

    return (plan?.features || {}) as SubscriptionPlan['features'];
  } catch (error) {
    console.error('Failed to get feature limits:', error);
    // Return free plan limits as fallback
    return {
      ai_recommendations_per_day: 10,
      max_favorites: 50,
      advanced_filters: false,
      name_pronunciation: false,
      partner_collaboration: true,
      custom_lists: 1,
    };
  }
}

/**
 * Check if user has reached their daily AI recommendation limit
 */
export async function hasReachedRecommendationLimit(userId: string): Promise<boolean> {
  try {
    const limits = await getFeatureLimits(userId);

    // Premium users have unlimited or high limits
    if (limits.ai_recommendations_per_day === -1 || limits.ai_recommendations_per_day >= 100) {
      return false;
    }

    // Count today's recommendation requests
    // This would need a separate table to track API calls
    // For now, return false (no limit)
    return false;
  } catch (error) {
    console.error('Failed to check recommendation limit:', error);
    return false;
  }
}
