/**
 * Analytics service — persists events to Supabase user_events table
 * and optionally forwards to external providers (Mixpanel, Amplitude, etc.)
 */
import { supabase } from './supabase';

export type AnalyticsEvent =
  // Auth events
  | 'sign_up_started'
  | 'sign_up_completed'
  | 'sign_in_completed'
  | 'sign_out'
  | 'social_auth_completed'
  // Onboarding events
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'onboarding_step_completed'
  // Name discovery events
  | 'name_viewed'
  | 'name_searched'
  | 'name_filtered'
  // Swipe events
  | 'name_liked'
  | 'name_disliked'
  | 'name_super_liked'
  | 'match_created'
  // Favorite events
  | 'name_favorited'
  | 'name_unfavorited'
  | 'favorites_viewed'
  // Partner events
  | 'partner_invite_sent'
  | 'partner_invite_accepted'
  | 'partner_connected'
  // AI events
  | 'recommendations_viewed'
  | 'recommendation_clicked'
  | 'similar_names_viewed'
  // Deck events
  | 'deck_loaded'
  | 'deck_exhausted';

export interface AnalyticsProperties {
  [key: string]: string | number | boolean | undefined;
}

class AnalyticsService {
  private enabled: boolean = true;
  private userId: string | null = null;

  /**
   * Initialize analytics with optional external provider config
   */
  initialize(config: { apiKey?: string; userId?: string } = {}) {
    if (config.userId) {
      this.setUserId(config.userId);
    }
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  setUserProperties(_properties: AnalyticsProperties) {
    // Ready for external provider integration
  }

  /**
   * Track an event — persists to Supabase user_events table (fire-and-forget)
   */
  track(event: AnalyticsEvent, properties?: AnalyticsProperties) {
    if (!this.enabled || !this.userId) return;

    // Persist to Supabase (fire-and-forget, never blocks UI)
    supabase
      .from('user_events')
      .insert({
        user_id: this.userId,
        event,
        properties: properties ?? {},
      })
      .then(({ error }) => {
        if (error) console.warn('[analytics]', event, error.message);
      });

    if (__DEV__) {
      console.log('[analytics]', event, properties);
    }
  }

  /**
   * Track screen view
   */
  screen(screenName: string, properties?: AnalyticsProperties) {
    this.track('name_viewed' as AnalyticsEvent, {
      screen: screenName,
      ...properties,
    });
  }

  /**
   * Reset analytics (on sign out)
   */
  reset() {
    this.userId = null;
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

/**
 * Convenience hooks for common events
 */
export const trackSignUp = (method: 'email' | 'apple' | 'google') =>
  analytics.track('sign_up_completed', { method });

export const trackSignIn = (method: 'email' | 'apple' | 'google') =>
  analytics.track('sign_in_completed', { method });

export const trackNameAction = (
  action: 'like' | 'dislike' | 'super_like' | 'favorite',
  nameId: string,
  nameName: string
) =>
  analytics.track(
    action === 'favorite' ? 'name_favorited' : (`name_${action}d` as AnalyticsEvent),
    { nameId, name: nameName }
  );

export const trackMatch = (nameId: string, nameName: string) =>
  analytics.track('match_created', { nameId, name: nameName });

