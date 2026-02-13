import { useQuery } from '@tanstack/react-query';
import {
  getSubscriptionPlans,
  getUserSubscription,
  isPremiumUser,
  canAccessFeature,
  getFeatureLimits,
  type SubscriptionPlan,
} from '@/services/premium';

// Query keys
export const premiumKeys = {
  all: ['premium'] as const,
  plans: () => [...premiumKeys.all, 'plans'] as const,
  subscription: (userId: string) => [...premiumKeys.all, 'subscription', userId] as const,
  status: (userId: string) => [...premiumKeys.all, 'status', userId] as const,
  limits: (userId: string) => [...premiumKeys.all, 'limits', userId] as const,
};

/**
 * Get all subscription plans
 */
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: premiumKeys.plans(),
    queryFn: getSubscriptionPlans,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Get user's active subscription
 */
export function useUserSubscription(userId: string | null) {
  return useQuery({
    queryKey: premiumKeys.subscription(userId || ''),
    queryFn: async () => {
      if (!userId) return null;
      return getUserSubscription(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Check if user has premium
 */
export function useIsPremium(userId: string | null) {
  return useQuery({
    queryKey: premiumKeys.status(userId || ''),
    queryFn: async () => {
      if (!userId) return false;
      return isPremiumUser(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get user's feature limits
 */
export function useFeatureLimits(userId: string | null) {
  return useQuery({
    queryKey: premiumKeys.limits(userId || ''),
    queryFn: async () => {
      if (!userId) {
        return {
          ai_recommendations_per_day: 10,
          max_favorites: 50,
          advanced_filters: false,
          name_pronunciation: false,
          partner_collaboration: true,
          custom_lists: 1,
        };
      }
      return getFeatureLimits(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Check if user can access a specific feature
 */
export function useCanAccessFeature(
  userId: string | null,
  feature: keyof SubscriptionPlan['features']
) {
  return useQuery({
    queryKey: [...premiumKeys.status(userId || ''), feature],
    queryFn: async () => {
      if (!userId) return false;
      return canAccessFeature(userId, feature);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
