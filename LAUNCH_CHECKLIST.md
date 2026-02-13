# TwoYes - Launch Checklist

**Current Status**: 95% Complete • Ready for Beta Testing

## Pre-Launch Checklist

### Week 1: Assets & Setup

#### App Assets
- [ ] Create app icon (1024x1024px)
  - Use ASSETS_GUIDE.md for specifications
  - Tools: Figma, Canva, or App Icon Generator
  - Export all sizes with `npx expo-icon`

- [ ] Create splash screen
  - Design 1284x2778px image
  - Use brand colors (#ea546c)
  - Update assets folder

- [ ] Capture screenshots (5 required)
  - Welcome/Onboarding screen
  - Discover with AI recommendations
  - Swipe interface
  - Match celebration
  - Favorites list

- [ ] Design promotional banner
  - 1024x500px for featured placement
  - Show key features

#### Store Listings
- [ ] Write App Store description
  - Copy template from ASSETS_GUIDE.md
  - Customize as needed
  - Max 4,000 characters

- [ ] Write Google Play description
  - Similar to App Store
  - Optimize for keywords
  - Max 4,000 characters

- [ ] Select app category
  - Primary: Health & Fitness
  - Secondary: Lifestyle

- [ ] Choose keywords (iOS)
  - Max 100 characters
  - Research with App Store Connect

#### Legal & Privacy
- [ ] Create Privacy Policy
  - Use privacy policy generator
  - Host at twoyes.app/privacy
  - Cover: data collection, usage, sharing

- [ ] Create Terms of Service
  - Use ToS generator
  - Host at twoyes.app/terms
  - Cover: user obligations, limitations

- [ ] GDPR compliance
  - Data deletion request flow
  - Export user data feature
  - Cookie consent (web)

- [ ] CCPA compliance (California)
  - "Do Not Sell My Info" option
  - Data disclosure

### Week 2: Payment Integration

#### Stripe Setup (Recommended)
- [ ] Create Stripe account
- [ ] Set up products
  - Monthly Premium: $4.99
  - Annual Premium: $49.99
- [ ] Configure webhooks
- [ ] Test in sandbox mode
- [ ] Integrate with app

#### RevenueCat Alternative
- [ ] Create RevenueCat account
- [ ] Configure products
- [ ] Add SDK to app
- [ ] Test purchases
- [ ] Set up webhooks

#### In-App Purchases
- [ ] Create products in App Store Connect
  - Monthly subscription
  - Annual subscription
- [ ] Create products in Google Play Console
- [ ] Test with sandbox accounts
- [ ] Verify receipt validation

### Week 3: Beta Testing

#### TestFlight (iOS)
- [ ] Build with EAS
  ```bash
  eas build --platform ios --profile preview
  ```
- [ ] Upload to App Store Connect
- [ ] Add beta testers (max 10,000)
- [ ] Distribute build
- [ ] Collect feedback

#### Internal Testing (Android)
- [ ] Build with EAS
  ```bash
  eas build --platform android --profile preview
  ```
- [ ] Upload to Play Console
- [ ] Add internal testers
- [ ] Distribute build
- [ ] Collect feedback

#### Testing Checklist
- [ ] Sign up flow works
- [ ] Social auth (Apple, Google) works
- [ ] Onboarding saves preferences
- [ ] Search and filters work
- [ ] AI recommendations appear
- [ ] Swipe creates matches
- [ ] Favorites sync properly
- [ ] Partner invitation works
- [ ] Payment flow completes
- [ ] Premium features unlock
- [ ] No crashes or errors

### Week 4: Production Setup

#### Supabase Production
- [ ] Create production project
- [ ] Run migrations
  ```bash
  supabase db push
  ```
- [ ] Deploy edge functions
  ```bash
  supabase functions deploy generate-recommendations
  supabase functions deploy generate-embeddings
  ```
- [ ] Set environment secrets
  - OPENAI_API_KEY
  - STRIPE_SECRET_KEY (if using)
- [ ] Configure auth providers
  - Enable Apple Sign-In
  - Enable Google Sign-In
- [ ] Set up database backups
- [ ] Configure rate limiting

#### Environment Variables
- [ ] Update production .env
  - EXPO_PUBLIC_SUPABASE_URL (production)
  - EXPO_PUBLIC_SUPABASE_ANON_KEY (production)
  - SUPABASE_SERVICE_ROLE_KEY (secure storage)
  - OPENAI_API_KEY (secure storage)

#### Analytics Setup
- [ ] Choose analytics platform
  - Mixpanel (recommended)
  - Amplitude
  - PostHog
- [ ] Create account
- [ ] Add SDK to app
- [ ] Update services/analytics.ts
- [ ] Test event tracking

#### Error Monitoring
- [ ] Set up Sentry
  - Create account
  - Add SDK
  - Configure source maps
- [ ] Test error reporting
- [ ] Set up alerts

### Week 5: App Store Submission

#### iOS Submission
- [ ] Build production version
  ```bash
  eas build --platform ios --profile production
  ```
- [ ] Upload to App Store Connect
- [ ] Fill in app information
  - Name, subtitle, description
  - Keywords
  - Category
  - Age rating (4+)
- [ ] Upload screenshots
- [ ] Upload app icon
- [ ] Set pricing (Free with IAP)
- [ ] Add App Privacy details
- [ ] Submit for review
- [ ] Wait 1-3 days for approval

#### Android Submission
- [ ] Build production version
  ```bash
  eas build --platform android --profile production
  ```
- [ ] Create Play Console listing
- [ ] Fill in app information
  - Title, short description, full description
  - Screenshots
  - Feature graphic
- [ ] Set up pricing & distribution
- [ ] Fill in content rating questionnaire
- [ ] Add privacy policy link
- [ ] Submit for review
- [ ] Wait 1-3 days for approval

### Post-Launch

#### Monitoring
- [ ] Set up analytics dashboard
- [ ] Monitor crash reports
- [ ] Track key metrics
  - Daily active users
  - Sign-ups
  - Matches created
  - Premium conversions
  - Retention rate

#### Marketing
- [ ] Create landing page
  - twoyes.app
  - Show features
  - App store badges
  - Screenshots
- [ ] Social media accounts
  - Instagram
  - TikTok
  - Twitter/X
- [ ] Product Hunt launch
- [ ] Press kit
- [ ] App Store Optimization (ASO)
  - A/B test screenshots
  - Test descriptions
  - Optimize keywords

#### Support
- [ ] Set up support email
  - support@twoyes.app
- [ ] Create FAQ page
- [ ] Set up helpdesk (Zendesk, Intercom)
- [ ] Monitor reviews
- [ ] Respond to feedback

#### Updates
- [ ] Plan v1.1 features
- [ ] Fix bugs from user feedback
- [ ] Optimize performance
- [ ] Add requested features

## Critical Path

**Must Have Before Launch:**
1. ✅ Core features working
2. ⏳ Payment integration
3. ⏳ App store assets
4. ⏳ Privacy policy & ToS
5. ⏳ Beta testing complete
6. ⏳ No critical bugs

**Can Launch Without:**
- Audio pronunciations
- Advanced analytics
- Perfect UI polish
- All social features

## Launch Day Checklist

### Day Before
- [ ] Verify app is approved
- [ ] Prepare social media posts
- [ ] Email beta testers
- [ ] Check analytics are working
- [ ] Verify payment processing
- [ ] Test on multiple devices

### Launch Day
- [ ] Make app live in stores
- [ ] Post on social media
- [ ] Email waiting list
- [ ] Submit to Product Hunt
- [ ] Monitor closely for issues
- [ ] Respond to reviews
- [ ] Celebrate! 🎉

### First Week
- [ ] Daily metrics review
- [ ] Respond to all reviews
- [ ] Fix critical bugs immediately
- [ ] Gather user feedback
- [ ] Plan first update

## Success Metrics

### Week 1 Goals
- 100+ downloads
- 4.0+ star rating
- < 5% crash rate
- 1-2 premium conversions

### Month 1 Goals
- 1,000+ downloads
- 4.5+ star rating
- 25+ premium subscribers
- 50%+ Day 1 retention
- 20%+ Day 7 retention

### Month 3 Goals
- 10,000+ downloads
- 100+ premium subscribers
- Featured by App Store (goal)
- Break even on costs

## Budget Estimate

**One-Time Costs:**
- Apple Developer Program: $99/year
- Google Play Developer: $25 (one-time)
- Domain (twoyes.app): $12/year
- App icon design (optional): $0-100
- Landing page (optional): $0-50

**Monthly Costs:**
- Supabase Pro: $25/month
- OpenAI API: ~$10-50/month
- Analytics (optional): $0-50/month
- Error monitoring (optional): $0-29/month

**Total First Year:** ~$500-1,000

**Revenue Potential:**
- 100 premium subscribers × $4.99/month = $499/month
- Break even: ~20-50 subscribers

## Resources

### Tools
- EAS Build: https://docs.expo.dev/build/introduction/
- App Store Connect: https://appstoreconnect.apple.com
- Google Play Console: https://play.google.com/console
- Supabase: https://supabase.com

### Guides
- ASSETS_GUIDE.md - Asset creation
- PROJECT_STATUS.md - Feature status
- IMPLEMENTATION_SUMMARY.md - What's built
- NIGHT_IMPROVEMENTS.md - Recent updates

### Support
- Expo Discord: https://discord.gg/expo
- Supabase Discord: https://discord.supabase.com
- React Native Community: https://reactnative.dev/community

## Notes

- **Do not skip beta testing** - Critical for finding bugs
- **Privacy policy is required** - Apps get rejected without it
- **Test payments thoroughly** - Billing issues damage reputation
- **Respond to reviews quickly** - Shows you care about users
- **Monitor crashes** - Fix critical bugs within 24 hours

Good luck with the launch! 🚀
