import { useEffect } from 'react';
import { analytics } from '@/services/analytics';
import { useAuth } from '@/store';

/**
 * Initialize analytics when user signs in
 */
export function useInitializeAnalytics() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      analytics.setUserId(user.id);
      analytics.setUserProperties({
        email: user.email,
        displayName: user.display_name,
        premiumTier: user.premium_tier,
        hasPartner: !!user.partner_id,
      });
    } else {
      analytics.reset();
    }
  }, [user]);
}

/**
 * Track screen views automatically
 */
export function useTrackScreen(screenName: string, properties?: Record<string, any>) {
  useEffect(() => {
    analytics.screen(screenName, properties);
  }, [screenName]);
}
