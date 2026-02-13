# TwoYes - Complete Technical Specification

> Baby Name Generator App - Full documentation bundle for development
> Last Updated: 2026-02-01 | **Architecture: Supabase + OrbStack (Local-First)**

---

## 🚀 Quick Start - What You Need

### ✅ Required Accounts (All Free to Start!)

1. **Expo Account** - expo.dev (Required Week 1)
   - For mobile app development
   - Free tier: Unlimited development builds

2. **OpenAI Account** - platform.openai.com (Required Week 1)
   - For AI recommendations
   - Pay-as-you-go: ~$5-10/month for development
   - Environment variable: `OPENAI_API_KEY`

3. **Apple Developer Account** - developer.apple.com (Required Week 3)
   - ✅ **You already have this!**
   - For Apple Sign-In configuration
   - $99/year (you're already paying this)

4. **Google Cloud Console** - console.cloud.google.com (Required Week 3)
   - For Google Sign-In OAuth credentials
   - **100% Free** - no credit card needed for OAuth
   - Get: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

### 🛠️ Development Tools (Install Locally - Free)

1. **OrbStack** - orbstack.dev
   - Replaces Docker Desktop on macOS
   - Free for personal use
   - Command: `brew install orbstack`

2. **Supabase CLI** - supabase.com/docs/guides/cli
   - Local backend development (no cloud account needed!)
   - Free, open source
   - Command: `brew install supabase/tap/supabase`

### 💰 Total Cost Estimate

- **Development (Months 1-3)**: $5-15/month (just OpenAI API usage)
- **Production Launch**: ~$50-75/month (Supabase Pro $25 + Expo $29 + OpenAI)
- **No AWS costs!** 🎉

---

## 📋 Architecture Changes from Original Spec

**Original**: AWS Serverless (Lambda, RDS, Cognito, S3, CloudFront, ElastiCache)
**Updated**: Supabase (PostgreSQL, Auth, Storage, Realtime) + OrbStack for local dev

**Benefits**:
- ✅ Develop 100% locally (no cloud account needed initially)
- ✅ 70% faster setup (21 SP vs 34 SP for foundation)
- ✅ 90% cost reduction during development ($5/mo vs $50-100/mo)
- ✅ Simpler architecture (1 service vs 7+ AWS services)
- ✅ Built-in real-time features (perfect for partner matching!)
- ✅ Easy migration path: Local → Supabase Cloud → Self-hosted VPS

---

# Product Brief


## Product Vision
Create the most intelligent, delightful, and collaborative baby name discovery experience. We help expecting parents find the perfect name through AI-powered personalization, rich cultural insights, and shared decision-making tools.

### Mission Statement
To transform the emotional journey of choosing a baby name from overwhelming to joyful, helping parents discover names they never knew they would love.

## Strategic Goals
1. Become the #1 rated baby name app in US/EU app stores within 18 months
1. Achieve 500K MAU within first year with 15% premium conversion
1. Build a recognizable brand that parents recommend to other expecting parents
1. Create defensible moat through AI personalization and community data

## Target Audience

### Primary: Expecting Parents (25-38 years)
- First-time parents feeling overwhelmed by choices
- Couples who disagree and need a neutral tool
- Parents wanting unique but not weird names
- Multicultural families balancing traditions

### Secondary Audiences
- Writers/creatives seeking character names
- Pet owners (growth market)
- Name enthusiasts and hobbyists

## Core Value Propositions
1. AI-Powered Discovery: Smart recommendations that learn your style and surprise you with perfect matches
1. Partner Collaboration: Swipe independently, celebrate matches, end the debates
1. Name Intelligence: Deep insights on meaning, popularity trends, cultural fit, and practical considerations
1. Beautiful Experience: Premium, joyful design that matches the excitement of naming your child

## Business Model

### Freemium Model
Free Tier:
- Browse names with basic filters
- Save up to 20 favorites
- Basic partner sync (limited swipes)
- Name of the Day
Premium Tier ($4.99/month or $29.99/year):
- Unlimited AI-powered recommendations
- Advanced filters (meaning, origin, sound)
- Full partner collaboration features
- Sibling name matching
- Last name compatibility analysis
- Pronunciation audio
- Export and share features
- Ad-free experience

### Revenue Projections (Year 1)
- Target: 500K MAU, 15% premium conversion = 75K subscribers
- ARPU: ~$25/year (mix of monthly/annual)
- Year 1 revenue target: $1.5M - $2M
- Secondary: Affiliate partnerships (baby registries, parenting products)

## Success Metrics

### Engagement Metrics
- DAU/MAU ratio: Target 25%+ (high engagement category)
- Session length: 8+ minutes average
- Names saved per user: 15+ in first week
- Partner invite rate: 40%+ of users

### Business Metrics
- Free-to-Premium conversion: 15% within 30 days
- Premium retention: 70% through pregnancy (6+ months)
- App Store rating: 4.7+ stars
- NPS: 50+ (high referral potential)
- CAC: <$3 (organic-first strategy)

## MVP Scope (V1.0)
Must Have:
- Name database with 50K+ names
- Basic filters (gender, letter, length, origin)
- Name details (meaning, popularity, origin)
- Favorites list with sync
- Partner swipe matching
- Basic AI recommendations
Nice to Have (V1.1+):
- Pronunciation audio
- Sibling name matching
- Family/friend voting
- Advanced AI personalization
- Last name analysis

## Risks & Mitigations
- Risk: Crowded market → Mitigation: Differentiate on AI and UX quality
- Risk: Short user lifecycle (9 months) → Mitigation: Maximize value extraction, referral program
- Risk: Free alternatives → Mitigation: Premium features worth paying for
- Risk: Cultural sensitivity issues → Mitigation: Diverse advisory board, community reporting

## Next Steps
1. Create detailed PRD with user stories and technical requirements
1. Design brand identity and UI mockups
1. Build name database from public sources
1. Prototype AI recommendation engine
1. Conduct user research with expecting parents

## Naming & Domain Ideas
| Name | Style | .com | .fr | .app | Notes |
|---|---|---|---|---|---|
| Prenomia | Inventé FR | ❓ | ❓ | ❓ | Prénom + IA, parfait |
| Prenomy | Inventé FR | ❓ | ❓ | ❓ | Prénom + y, doux |
| Littlnom | Inventé | ❓ | ❓ | ❓ | Little + nom, mignon |
| Nompetit | Descriptif FR | ❓ | ❓ | ❓ | Nom pour petit, FR |
| Namebub | Métaphore | ❌ | ❓ | ❓ | Name + bubble, doux |
| Babynym | Inventé EN | ❌ | ❓ | ❓ | Baby + nym (name) |

---

# PRD - Product Requirements Document

> 📋 Product Requirements Document - Baby Name Generator v1.0
Last Updated: January 2026 | Status: Draft

# 1. Problem Statement & User Needs

## 1.1 Problem Statement
Choosing a baby name is one of the most emotionally significant decisions expecting parents make, yet the current landscape of tools fails them in critical ways:
- Overwhelm: Parents face 50,000+ name options with no intelligent way to narrow down
- Partner Conflict: 83% of couples make this decision together, but lack tools to collaborate effectively
- Shallow Information: Existing apps provide surface-level details, leaving parents anxious about hidden meanings, cultural issues, or future implications
- Dated Experience: Most baby name apps feel like they were built in 2010 - cluttered with ads, poor UX, no personalization
- Cultural Complexity: Multicultural families struggle to find names that honor multiple heritages

## 1.2 User Needs (Discovery Research)
Based on market research and simulated user interviews, we identified these core user needs:
1. Reduce Cognitive Load - I want to discover names I would love, not scroll through thousands of options I dont care about
1. Collaborate Seamlessly - My partner and I need to independently explore and then see where we naturally agree
1. Make Confident Decisions - I want to know EVERYTHING about a name before committing: meaning, associations, how it sounds, potential issues
1. Honor Heritage - We want a name that works in both our cultures and does not sound wrong in either language
1. Enjoy the Process - This should be fun and exciting, not stressful and overwhelming

---


# 2. User Personas
Based on simulated user interviews with three representative personas, we identified key behaviors, pain points, and desires.

## 2.1 Persona: Sarah & Tom - First-Time Parents
> 👶 Sarah (32, Marketing Manager) & Tom (34, Software Engineer)
Location: Austin, TX | Due Date: 6 months | First child, girl

### Simulated Interview Insights
> We started with a list of 50 names each and quickly realized we only agreed on 3. Now we argue every time the topic comes up. I wish there was a way to find common ground without the emotional debates.
Behaviors:
- Browses name apps 20-30 mins daily, mostly during lunch breaks and before bed
- Uses 3 different apps but finds none satisfying; often searches Google for specific name meanings
- Shares screenshots with partner via iMessage, leading to disorganized conversations
Pain Points:
- Apps feel like endless scrolling with no personalization
- No way to sync favorites with partner in real-time
- Worried about choosing a name thats too common or too weird
Desired Features:
- Tinder-style swiping with partner matching (like Kinder but better)
- AI that learns their style and suggests names they would never have found
- Popularity trends showing if a name is about to explode
> I would definitely pay for an app that actually understood what we like and helped us find THE name. This decision feels too important for a free app full of ads.

---


## 2.2 Persona: Maria & Kenji - Multicultural Couple
> 🌍 Maria (29, UX Designer, Mexican-American) & Kenji (31, Architect, Japanese)
Location: San Francisco, CA | Due Date: 4 months | First child, gender unknown

### Simulated Interview Insights
> Finding a name that works in Spanish, Japanese, AND English feels impossible. My mother insists on a name with a Spanish origin, his parents want something that sounds natural in Japanese. We just want something beautiful that doesnt get butchered in any language.
Behaviors:
- Researches names across multiple cultural databases (Japanese, Spanish, general American)
- Tests names by saying them aloud with different accents
- Frequently googles what names mean in other languages to avoid embarrassment
Pain Points:
- No app supports searching for names that work across multiple cultures
- Cannot find pronunciation guides in different languages
- Family pressure adds stress to the decision
Desired Features:
- Cross-cultural name finder - names that work in multiple languages
- Pronunciation audio in different accents
- Cultural sensitivity checker - does this name mean something bad elsewhere?
- International variants (show related names across cultures)
> Id pay premium for an app that truly understands multicultural families. Right now we spend hours doing manual research that an AI could do in seconds.

---


## 2.3 Persona: Jessica & David - Second-Time Parents
> 👨‍👩‍👧 Jessica (36, Pediatrician) & David (38, Financial Analyst)
Location: Denver, CO | Due Date: 3 months | Second child (boy), first child is Emma (3)

### Simulated Interview Insights
> With Emma, we spent months agonizing. This time we want something that matches - not too similar, not too different. The hard part is we already used our favorite name! Now we need a boys name that sounds like a sibling to Emma.
Behaviors:
- Experienced users - know what they want but struggle to find sibling-appropriate names
- Time-constrained with a toddler; needs efficient browsing experience
- Already has strong opinions about what works and what doesnt
Pain Points:
- No app offers sibling name matching as a core feature
- Worried about initials creating awkward combinations (E.S. and ???)
- Less time available for research compared to first pregnancy
Desired Features:
- Sibling name matching - enter existing childs name, get complementary suggestions
- Style consistency analysis - same vibe without being matchy-matchy
- Quick filters to eliminate names that dont work (too long, starts with E, etc.)
> The sibling matching feature alone would make me switch apps immediately. Its the ONE thing I need and nobody does it well.

---


# 3. Feature Requirements
Features are prioritized using MoSCoW framework based on user needs, business value, and technical feasibility.

## 3.1 Must Have (MVP - V1.0)
Core features required for launch. Without these, the product cannot succeed.

### F1: Name Database & Search
- 50,000+ names from diverse cultural origins
- Each name includes: meaning, origin, gender, popularity rank
- Search by name with autocomplete
- Filter by: gender (boy/girl/unisex), first letter, origin, name length

### F2: Name Details Page
- Etymology and meaning explanation
- Popularity trend chart (last 50 years)
- Current rank in US/UK/Canada
- Similar names suggestions
- Famous namesakes

### F3: Favorites System
- Save names to favorites (up to 20 free, unlimited premium)
- Add personal notes to saved names
- Sort and organize favorites
- Cloud sync across devices

### F4: Partner Swipe Matching
- Invite partner via link/email
- Swipe interface (like/dislike/save for later)
- Its a Match! celebration when both like same name
- View shared matches list

---

# UX Design

> 🎨 Phase 3 Deliverable: UX Design for Baby Name Generator App. This document defines the information architecture, user flows, wireframe concepts, and design principles.

# 1. Information Architecture
The app is structured around five primary navigation destinations, designed for quick access to core functionality while keeping the interface clean and focused.

## 1.1 Navigation Structure
Bottom Tab Bar (5 items) - Primary navigation for mobile:
1. Discover (Home) - AI recommendations, Name of the Day, trending names
1. Browse - Search, filters, alphabetical browsing, cultural categories
1. Swipe - Partner matching experience, card-based swiping
1. Favorites - Saved names, matches with partner, organized lists
1. Profile - Settings, partner link, premium status, preferences

## 1.2 Screen Hierarchy

### Level 1: Primary Screens (Tab Destinations)
- Discover Home - Personalized feed, daily highlights
- Browse Index - Search bar, filter chips, category tiles
- Swipe Mode - Full-screen card interface
- Favorites Hub - My Saves, Partner Matches, Shared Lists
- Profile & Settings - Account, preferences, subscription

### Level 2: Detail & Action Screens
- Name Detail Page - Full name information, actions
- Filter Sheet - Advanced filter bottom sheet
- Name Results List - Filtered/searched results
- It is a Match Screen - Partner match celebration
- Partner Invite Flow - Share link/invite partner

### Level 3: Overlays & Modals
- Add Note Modal - Quick note on saved name
- Premium Upsell Sheet - Feature gate with upgrade
- Share Sheet - Native share with custom preview
- Pronunciation Player - Audio playback overlay

## 1.3 Content Map
Name Entity Structure (Core Data Object):
- Primary: Name string, Gender tag, Origin culture(s)
- Descriptive: Meaning, Etymology, Pronunciation (IPA + audio)
- Analytics: Popularity rank, Trend direction, Rarity score
- Related: Similar names, International variants, Famous namesakes
- AI-Generated: Style tags (elegant, strong, playful), Sibling matches

---


# 2. User Flows
The following user flows represent the key journeys through the application, designed for the three primary personas identified in the PRD.

## 2.1 First-Time User Onboarding
> 🎯 Goal: Get user to their first saved name within 2 minutes, personalize experience for AI recommendations.
Flow Steps:
1. App Launch → Splash screen with app logo (2s)
1. Welcome Screen → Value proposition, Get Started button
1. Quick Preferences (Optional) → Gender preference, Due date (for timeline)
1. Style Quiz (3 questions) → Quick swipes on name pairs to learn preferences
1. Account Creation → Email/Apple/Google sign-in (or Skip for now)
1. Discover Home → Personalized recommendations based on quiz + Name of the Day
1. First Save Prompt → Tooltip encouraging user to save their first favorite

## 2.2 Partner Matching Flow
> 💑 Goal: Enable couples to independently discover names, then celebrate mutual matches. Reduce decision conflict through gamification.
Flow Steps:
1. Partner Invite → User A taps Invite Partner from Profile/Favorites
1. Share Link → Generate unique link, share via messages/email
1. Partner Joins → User B opens link, creates account, auto-linked
1. Connected Confirmation → Both users see Connected with [Partner Name] badge
1. Independent Swiping → Each user swipes on Swipe tab (like/dislike/maybe)
1. Match Detection → When both like same name, trigger Match celebration
1. It is a Match! Screen → Confetti animation, name displayed, Add to Shortlist CTA
1. Matches List → View all mutual matches in Favorites > Partner Matches tab

## 2.3 Name Deep Dive Flow
> 🔍 Goal: Provide comprehensive name information to enable confident decision-making.
Flow Steps:
1. Entry Point → Tap name from any list, search result, or recommendation
1. Name Detail Header → Large name display, pronunciation button, gender/origin tags
1. Quick Actions Bar → Save (heart), Share, Add Note floating buttons
1. Meaning Section → Etymology, historical meaning, cultural significance
1. Popularity Section → Trend chart (50 years), current rank, rarity score
1. Famous Namesakes → Notable people with this name (cards with photos)
1. Similar Names → Horizontal scroll of related names user might like
1. International Variants → Same name in different cultures (John/Juan/Giovanni)

## 2.4 Filtered Search Flow
> 🔎 Goal: Help users narrow down from 50K names to a manageable, relevant subset quickly.
1. Browse Tab → Landing with search bar, quick filter chips, category tiles
1. Quick Filters → Tap chips: Boy/Girl/Unisex, A-Z letter selector
1. Advanced Filters → Tap filter icon to open bottom sheet
1. Filter Options → Origin/culture, Length (1-4 syllables), Popularity range, Meaning themes
1. Apply Filters → Results update live, count shown (237 names match)
1. Results View → Scrollable list with name cards, quick-save button on each
1. Sort Options → Dropdown: Popularity, A-Z, Trending, Relevance

---


# 3. Wireframe Descriptions
Low-fidelity wireframe concepts for key screens. These serve as guidance for visual design phase.

## 3.1 Discover Home Screen
Layout: Single-column scrollable feed
- Header: App logo left, notification bell right, subtle partner status indicator
- Hero Card: Name of the Day - Large typography, gradient background, tap to expand
- Section 1: For You - AI recommendations carousel (horizontal scroll, 3 visible)
- Section 2: Trending Now - Vertical list of 5 rising names with trend arrows
- Section 3: Explore by Theme - Category tiles (Nature, Vintage, Strong, Unique)
- Footer: Bottom tab bar with 5 icons (Discover highlighted)

## 3.2 Swipe Screen
Layout: Full-screen immersive card stack
- Header: Minimal - back arrow, progress indicator (X of Y today), partner avatar
- Card Stack: Primary card large (80% screen), peek of next card behind
- Card Content: Name in large serif font, origin badge, short meaning preview
- Card Interaction: Swipe right (like/green), swipe left (pass/red), swipe up (super like/gold)
- Action Buttons: Circular buttons below card - X (pass), ? (more info), Heart (like)
- More Info: Tap card or ? to expand with full details without leaving swipe mode

## 3.3 Name Detail Screen

---

# Architecture

> 🏗️ Phase 4 Deliverable: Technical Architecture for Baby Name Generator App
Document Status: Draft | Last Updated: January 2026

# 1. Executive Summary
This document outlines the technical architecture for the Baby Name Generator app, a mobile-first application designed to help expecting parents discover, evaluate, and collaboratively select baby names. The architecture prioritizes real-time partner synchronization, AI-powered recommendations, and a scalable data infrastructure capable of serving 50,000+ names with rich metadata.

## 1.1 Key Architectural Decisions
- Cross-platform mobile development using React Native for iOS/Android code sharing
- **Supabase** for backend (PostgreSQL, Auth, Storage, Real-time) - Local development via OrbStack
- PostgreSQL with pgvector extension for AI-powered name similarity and recommendations
- Supabase Realtime for live partner matching updates (WebSocket-based)
- Supabase Storage for pronunciation audio files with CDN
- Node.js/Express backend for custom business logic and AI integrations

---


# 2. System Architecture Overview

---


# 3. Technology Stack

## 3.1 Frontend Technologies
> 📱 Mobile-First Cross-Platform Development
- React Native 0.73+ - Cross-platform mobile framework with New Architecture enabled
- TypeScript 5.x - Type safety and improved developer experience
- Expo SDK 50+ - Managed workflow for faster iteration, OTA updates
- React Navigation 6.x - Native navigation with bottom tabs and stack navigators
- Reanimated 3.x - 60fps swipe card animations running on UI thread
- TanStack Query (React Query) - Server state management with caching and background refetch
- Zustand - Lightweight client state management
- NativeWind (Tailwind CSS) - Utility-first styling with consistent design tokens

## 3.2 Backend Technologies
> 🐳 Local-First Development with Supabase + OrbStack
- **Supabase Local** (via OrbStack/Docker) - Complete backend stack for local development
  - PostgreSQL 15 with pgvector extension - Vector similarity search for AI recommendations
  - Supabase Auth - Built-in authentication with social providers (Apple, Google, Email)
  - Supabase Storage - File storage for pronunciation audio with automatic CDN
  - Supabase Realtime - WebSocket-based real-time subscriptions for partner matching
  - PostgREST - Auto-generated REST API from database schema
- **Node.js/Express API** (TypeScript) - Custom business logic server running in OrbStack
  - AI integration endpoints (OpenAI embeddings, recommendations)
  - Custom recommendation algorithms
  - Advanced name matching logic
- **OrbStack** - Fast, lightweight Docker alternative for macOS (replaces Docker Desktop)
- **Redis** (Optional, via OrbStack) - Caching layer for AI responses and rate limiting
- **Expo Push Notifications** - Native push notifications (no Firebase needed)

## 3.3 Database & Storage
> 🗄️ Supabase PostgreSQL as Single Source of Truth
- **PostgreSQL 15** (via Supabase) - ACID-compliant relational database for all structured data
- **pgvector extension** - Vector similarity search for AI-powered name recommendations
- **Full-text search** - PostgreSQL tsvector for name search with autocomplete
- **JSONB columns** - Flexible storage for name metadata, cultural variations
- **Row Level Security (RLS)** - Built-in security policies for user data isolation
- **Supabase Storage** - S3-compatible object storage for pronunciation audio files
- **Database Migrations** - Managed via Supabase CLI or Drizzle ORM

---


# 4. External Services & API Keys Required
The following third-party services and API keys are required for full application functionality:

## 4.1 Backend Infrastructure (Required Day 1)
- **Supabase** (Free tier available, ~$25/month for production)
-   • Local development: Free via Supabase CLI + OrbStack
-   • Cloud hosting: supabase.com (optional, for production deployment)
-   • Provides: PostgreSQL, Auth, Storage, Realtime, Auto-generated REST API
-   • Keys: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

## 4.2 AI & Machine Learning (Required Week 2)
- **OpenAI API** (Pay-as-you-go, ~$5-10/month for development)
-   • text-embedding-3-small for name embeddings (~$0.02/1M tokens)
-   • GPT-4o-mini for generating name insights, sibling matching ($0.15/1M input tokens)
-   • Key Environment Variable: OPENAI_API_KEY

## 4.3 Text-to-Speech (Optional - Week 6+)
- **ElevenLabs API** or **OpenAI TTS** (Recommended for MVP)
-   • High-quality neural voices for name pronunciations
-   • ~$0.30/1K characters (ElevenLabs) or $0.015/1K chars (OpenAI)
-   • Pre-generate audio files and store in Supabase Storage
-   • Alternative: Browser Web Speech API (free, client-side only)

## 4.4 Authentication Providers (Required Week 3)
- **Supabase Auth** (Built-in, no separate service needed!)
-   • Handles Apple Sign-In and Google Sign-In configuration
-   • Configure in Supabase Dashboard → Authentication → Providers
- **Apple Sign-In** (Required for App Store)
-   • Apple Developer account required (you have this!)
-   • Configure in Supabase: APPLE_CLIENT_ID, APPLE_KEY_ID, APPLE_TEAM_ID
- **Google Sign-In** (Required)
-   • Google Cloud Console OAuth 2.0 credentials (free)
-   • Configure in Supabase: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

## 4.5 Development Tools (Required Day 1)
- **OrbStack** (Free for personal use, $8/month for teams)
-   • Replaces Docker Desktop on macOS
-   • Runs Supabase local stack
-   • Download: orbstack.dev
- **Expo Account** (Free tier available, ~$29/month for teams)
-   • expo.dev - Mobile app development and deployment
-   • EAS Build for iOS/Android builds

---


# 5. Data Models & Schemas

## 5.1 Users Table (Public Schema)
```sql
-- Note: Supabase Auth handles authentication in auth.users table
-- This is our public profile table that extends auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  premium_tier VARCHAR(20) DEFAULT 'free',  -- free, premium, family
  preferences JSONB DEFAULT '{}'::jsonb,
  -- preferences: { gender: 'girl', origins: ['english', 'spanish'], due_date: '2026-06' }
  partner_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) - Users can only access their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_partner ON public.profiles(partner_id);
```

## 5.2 Names Table
```sql
CREATE TABLE names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  name_normalized VARCHAR(100) NOT NULL,  -- lowercase, no accents
  gender VARCHAR(10) NOT NULL,  -- male, female, unisex
  origins TEXT[] NOT NULL,  -- {english, hebrew, greek}
  meaning TEXT,
  etymology TEXT,
  pronunciation_ipa VARCHAR(100),
  audio_url VARCHAR(500),
  
  -- Popularity data
  popularity_rank_us INT,
  popularity_rank_uk INT,
  popularity_trend VARCHAR(20),  -- rising, stable, falling
  rarity_score DECIMAL(3,2),  -- 0.00 to 1.00
  
  -- AI-generated embeddings for similarity search
  embedding vector(1536),  -- OpenAI text-embedding-3-small
  
  -- Flexible metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  -- metadata: { famous_people: [...], style_tags: [...], syllables: 2 }
  
  search_vector tsvector,  -- Full-text search
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_names_search ON names USING GIN(search_vector);
CREATE INDEX idx_names_embedding ON names USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_names_gender ON names(gender);
CREATE INDEX idx_names_origins ON names USING GIN(origins);
```

## 5.3 User Swipes & Favorites
```sql
CREATE TABLE user_swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name_id UUID NOT NULL REFERENCES names(id),
  action VARCHAR(20) NOT NULL,  -- like, dislike, super_like
  swiped_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name_id)
);

CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name_id UUID NOT NULL REFERENCES names(id),
  notes TEXT,
  rank_order INT DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name_id)
);

CREATE TABLE partner_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID NOT NULL REFERENCES users(id),
  user_b_id UUID NOT NULL REFERENCES users(id),
  name_id UUID NOT NULL REFERENCES names(id),
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active',  -- active, archived, chosen
  UNIQUE(user_a_id, user_b_id, name_id)
);

CREATE INDEX idx_swipes_user ON user_swipes(user_id, swiped_at DESC);
CREATE INDEX idx_favorites_user ON user_favorites(user_id, rank_order);
CREATE INDEX idx_matches_users ON partner_matches(user_a_id, user_b_id);
```

## 5.4 Name Popularity History
```sql
CREATE TABLE name_popularity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_id UUID NOT NULL REFERENCES names(id),
  year INT NOT NULL,
  country VARCHAR(3) NOT NULL,  -- USA, GBR, CAN
  rank INT,
  count INT,
  UNIQUE(name_id, year, country)
);

CREATE INDEX idx_popularity_name_year ON name_popularity(name_id, year DESC);
```

---


# 6. Security Considerations

## 6.1 Authentication & Authorization
- **Supabase Auth**: Built-in JWT token management with automatic refresh
  - Short-lived access tokens (60 min), refresh tokens with automatic rotation
  - OAuth 2.0 PKCE flow for Apple/Google Sign-In (mobile-optimized)
  - Email verification with magic links or OTP codes
- **Row-Level Security (RLS)**: PostgreSQL policies enforce data isolation
  - Users can only access their own profiles, favorites, and swipes
  - Partner matching queries verified server-side
- **Partner Linking**: Time-limited invite tokens (24h expiry), single-use, cryptographically random

## 6.2 Data Protection
- **Encryption at Rest**: Supabase PostgreSQL encryption (AES-256)
- **Encryption in Transit**: TLS 1.3 enforced for all API endpoints
- **PII Handling**: Email stored in auth.users (managed by Supabase), minimal PII in public tables
- **Data Retention**: User data cascade-deleted on account deletion (GDPR compliance)
- **Supabase Storage**: Encrypted file storage with signed URLs for audio files

## 6.3 API Security
- **Rate Limiting**: Supabase built-in rate limiting + custom Express middleware
  - 100 requests/min for free tier
  - 1000 requests/min for premium tier
- **Input Validation**: Zod schemas for all request payloads, strict type checking
- **SQL Injection Prevention**: PostgREST parameterized queries + RLS policies
- **CORS**: Configured in Supabase dashboard, restricted to mobile app origins

## 6.4 Infrastructure Security
- **Environment Isolation**:
  - Local development: Supabase CLI + OrbStack (isolated containers)
  - Production: Supabase Cloud (managed infrastructure)
- **Secrets Management**: Environment variables (.env.local, never committed)
  - Local: .env.local file (gitignored)
  - Production: Supabase Dashboard → Project Settings → API
- **Audit Logging**: Supabase Dashboard audit logs for sensitive operations
- **Dependency Scanning**: Dependabot + npm audit for vulnerability detection

## 6.5 Privacy & Compliance
- GDPR: Data export, deletion requests, consent management
- CCPA: Do Not Sell toggle, California resident rights
- App Store Guidelines: Privacy nutrition labels, App Tracking Transparency support
- COPPA: 13+ age gate (app targets expecting parents, not children)

---


# 7. Deployment Strategy

## 7.1 Environment Architecture

### Local Development Environment
**Purpose**: Individual developer setup for feature development and testing

**Infrastructure**:
- **OrbStack** running on macOS
  - Supabase Stack (PostgreSQL, Auth, Storage, Realtime, PostgREST)
  - Redis container (optional, for caching)
  - Node.js/Express API container
- **Expo Go** or **iOS Simulator** for mobile app testing
- **Supabase Studio** (Web UI at localhost:54323) for database management

**Setup Commands**:
```bash
# Install OrbStack
brew install orbstack

# Install Supabase CLI
brew install supabase/tap/supabase

# Initialize Supabase project
supabase init

# Start local Supabase stack
supabase start

# Access Supabase Studio: http://localhost:54323
# Access API: http://localhost:54321
# PostgreSQL: postgresql://postgres:postgres@localhost:54322/postgres
```

**Mobile App Development**:
```bash
# Install dependencies
pnpm install

# Start Expo dev server
pnpm start

# Run on iOS simulator
pnpm ios

# Run on Android emulator
pnpm android
```

### Staging/Production Deployment
**Option 1: Supabase Cloud (Recommended for MVP)**
- **Database**: Managed PostgreSQL on Supabase infrastructure
- **Auth/Storage/Realtime**: Fully managed by Supabase
- **Custom API**: Deploy Node.js/Express to Vercel, Railway, or Render
- **Mobile App**: EAS Build → TestFlight/App Store
- **Cost**: ~$25/month (Supabase Pro) + ~$5-10/month (API hosting)

**Option 2: Self-Hosted on Your VPS (Later)**
- **Migrate from Supabase Cloud to VPS when needed**
- Use `supabase db dump` to export data
- Self-host Supabase stack via Docker Compose
- Full control, ~$10-20/month total cost

## 7.2 Deployment Pipeline

### Mobile App (Expo/EAS)
```yaml
# .github/workflows/mobile-deploy.yml
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
      - run: pnpm install
      - run: eas build --platform ios --non-interactive
```

### Backend API
```yaml
# Deploy to Railway/Render/Vercel
# Automatic deployment on git push to main
```

### Database Migrations
```bash
# Local development
supabase db diff --file new_migration

# Apply to production
supabase db push
```

---

# Epics & Stories

> 🎯 This document breaks down the Baby Name Generator product into actionable Epics and User Stories. Each story includes acceptance criteria, story point estimates, and dependency mapping for sprint planning.

# Executive Summary

## Story Point Reference
- 1 SP = ~2-4 hours (trivial task, well-defined)
- 2 SP = ~4-8 hours (small task, clear requirements)
- 3 SP = ~1-2 days (medium task, some complexity)
- 5 SP = ~2-3 days (larger task, moderate complexity)
- 8 SP = ~3-5 days (complex task, multiple components)
- 13 SP = ~1 week+ (very complex, consider splitting)

## Epic Overview
Total: 9 Epics | 52 User Stories | ~280 Story Points | Est. 12-14 weeks (2 developers)
1. Epic 1: Foundation & Infrastructure — 26 SP (Priority: P0 - Critical Path)
1. Epic 2: User Authentication & Onboarding — 34 SP (Priority: P0 - Critical Path)
1. Epic 3: Name Database & Core Data — 29 SP (Priority: P0 - Critical Path)
1. Epic 4: Name Discovery & Browsing — 37 SP (Priority: P1 - Essential)
1. Epic 5: Favorites & Organization — 24 SP (Priority: P1 - Essential)
1. Epic 6: Partner Collaboration — 42 SP (Priority: P1 - Essential)
1. Epic 7: AI Recommendations — 35 SP (Priority: P2 - Important)
1. Epic 8: Premium & Monetization — 28 SP (Priority: P2 - Important)
1. Epic 9: Polish & Launch Prep — 25 SP (Priority: P3 - Launch)

---


# Epic 1: Foundation & Infrastructure
> 🏗️ Set up the technical foundation for development including project scaffolding, CI/CD pipelines, database infrastructure, and core architecture patterns. This epic blocks all other work.
Total: 26 SP | Priority: P0 | Dependencies: None | Blocks: All other epics

## Story 1.1: React Native Project Setup
As a developer, I need a properly configured React Native project with TypeScript, navigation, and core dependencies so that I can begin building features.
Story Points: 5 | Priority: P0 | Depends on: None
Acceptance Criteria:
- Expo SDK 50+ project initialized with TypeScript template
- React Navigation 6.x configured with bottom tab navigator (5 tabs)
- NativeWind (Tailwind CSS) configured and working
- Reanimated 3.x installed and configured for gesture handling
- ESLint + Prettier configured with consistent rules
- App builds and runs on iOS Simulator and Android Emulator

## Story 1.2: State Management & Data Layer
As a developer, I need a consistent state management pattern and data fetching layer so that components can access and mutate data predictably.
Story Points: 3 | Priority: P0 | Depends on: 1.1
Acceptance Criteria:
- Zustand store configured with typed slices pattern
- TanStack Query (React Query) configured with default options
- API client wrapper created with axios + interceptors
- AsyncStorage integration for persistence
- Example query and mutation hooks documented

## Story 1.3: Supabase Local Setup with OrbStack
As a developer, I need Supabase running locally via OrbStack so that I can develop backend features without cloud dependencies.
Story Points: 3 | Priority: P0 | Depends on: None
Acceptance Criteria:
- OrbStack installed and running on macOS
- Supabase CLI installed via Homebrew
- Local Supabase stack started (PostgreSQL, Auth, Storage, Realtime, Studio)
- pgvector extension enabled in local PostgreSQL
- Supabase Studio accessible at localhost:54323
- Environment variables configured (.env.local with SUPABASE_URL, SUPABASE_ANON_KEY)
- Database connection verified from mobile app
- Basic API request working (e.g., fetch names from database)

## Story 1.4: Database Schema & Migrations
As a developer, I need the core database schema implemented so that I can persist user data and name information.
Story Points: 5 | Priority: P0 | Depends on: 1.3
Acceptance Criteria:
- Profiles table (extends auth.users) with preferences, partner_id
- Names table with all metadata fields and vector embeddings (pgvector)
- User_favorites table with notes field
- User_swipes table for like/dislike tracking
- Name_popularity table for historical trends
- Row Level Security (RLS) policies for all user-facing tables
- Database trigger to auto-create profile on user signup
- Migration files created via `supabase db diff`
- Indexes on frequently queried columns (email, partner_id, name search)

## Story 1.5: CI/CD Pipeline
As a developer, I need automated build, test, and deployment pipelines so that code changes are deployed safely and quickly.
Story Points: 5 | Priority: P0 | Depends on: 1.1, 1.3
Acceptance Criteria:
- GitHub Actions workflow for PR checks (lint, type-check, tests)
- EAS Build configured for iOS and Android builds
- Automated deployment to dev environment on main branch merge
- Manual promotion workflow to staging and production
- Backend Lambda deployment via CDK/SAM
- Database migration runs as part of deployment

---


# Epic 2: User Authentication & Onboarding
> 🔐 Implement secure user authentication with social login options and create a delightful onboarding experience that captures user preferences for AI personalization.
Total: 34 SP | Priority: P0 | Dependencies: Epic 1 | Blocks: Epics 5, 6, 7

## Story 2.1: Email/Password Authentication
As a user, I want to create an account with my email so that I can save my data and sync across devices.
Story Points: 3 | Priority: P0 | Depends on: 1.3, 1.4
Acceptance Criteria:
- Supabase Auth configured for email/password authentication
- Sign up form with email, password (8+ chars validation)
- Email verification flow with magic link or OTP code
- Login form with email/password
- Forgot password flow using Supabase password reset
- JWT tokens automatically managed by Supabase client (@supabase/supabase-js)
- Auto-login on app reopen using Supabase session persistence
- User profile automatically created in profiles table via database trigger

## Story 2.2: Apple Sign-In
As an iOS user, I want to sign in with Apple so that I can create an account quickly and securely.
Story Points: 3 | Priority: P0 | Depends on: 2.1
Acceptance Criteria:
- Apple Sign-In provider enabled in Supabase Dashboard → Authentication → Providers
- Apple Developer credentials configured (Client ID, Team ID, Key ID from Apple Developer account)
- Apple Sign-In button visible on auth screens (iOS only)
- Native iOS integration using `expo-apple-authentication`
- Hide My Email option works correctly
- User profile automatically created in profiles table on first sign-in
- Subsequent logins recognize existing user via Supabase session

## Story 2.3: Google Sign-In

---

# Implementation Readiness

> ✅ Implementation Readiness Assessment - Baby Name Generator v1.0
Review Date: January 2026 | Status: FINAL QUALITY GATE

# 1. Executive Summary
The Baby Name Generator project has completed all pre-development phases including Product Brief, PRD with user personas, UX Design with user flows, Technical Architecture, and Epics & Stories breakdown. This assessment evaluates the completeness and consistency of all artifacts to determine development readiness.

## Key Findings
- All 5 required documents are present and substantially complete
- 52 user stories identified across 9 epics with ~280 story points
- Clear technology stack: React Native + AWS Lambda + PostgreSQL
- All external services and API keys documented
- User stories have acceptance criteria, story points, and dependencies
- Estimated delivery: 12-14 weeks with 2 developers

---


# 2. Documentation Completeness Checklist

## 2.1 Product Brief
- ✅ Product Vision & Mission Statement
- ✅ Strategic Goals (4 defined with metrics)
- ✅ Target Audience (Primary: 25-38 year old expecting parents; Secondary defined)
- ✅ Core Value Propositions (4 pillars: AI Discovery, Partner Collaboration, Name Intelligence, Beautiful Experience)
- ✅ Business Model (Freemium: $4.99/month or $29.99/year)
- ✅ Success Metrics (DAU/MAU, conversion rates, retention, NPS targets)
- ✅ MVP Scope (Must Have vs Nice to Have clearly defined)
- ✅ Risks & Mitigations (4 key risks identified)

## 2.2 PRD (Product Requirements Document)
- ✅ Problem Statement (5 core problems identified)
- ✅ User Needs from Discovery Research (5 needs)
- ✅ User Personas (3 detailed personas: Sarah & Tom, Maria & Kenji, Jessica & David)
- ✅ Feature Requirements (MoSCoW prioritized)
- ✅ MVP Features (F1-F4: Name Database, Name Details, Favorites, Partner Matching)

## 2.3 UX Design
- ✅ Information Architecture (Navigation structure, Screen hierarchy, Content map)
- ✅ User Flows (First-time onboarding, Partner matching, Name deep dive, Filtered search)
- ✅ Wireframe Descriptions (Discover Home, Swipe Screen, Name Detail)

## 2.4 Architecture
- ✅ System Architecture Overview (Mobile + Supabase + OrbStack)
- ✅ Technology Stack (React Native, Expo, Supabase, Node.js/Express, PostgreSQL)
- ✅ External Services & API Keys (Supabase, OpenAI, Apple Sign-In, Google Sign-In)
- ✅ Data Models (Profiles, Names, Favorites, Swipes, Popularity)
- ✅ Security Considerations (Supabase Auth, RLS, Data protection, GDPR/CCPA)
- ✅ Deployment Strategy (Local via OrbStack, Cloud via Supabase)

## 2.5 Epics & Stories
- ✅ Story Point Reference (1-13 scale defined)
- ✅ Epic Overview (9 epics with priorities P0-P3)
- ✅ User Stories with Acceptance Criteria (verified for all stories)
- ✅ Story Point Estimates (280 SP total)
- ✅ Dependencies Mapped (blocking relationships defined)

---


# 3. Technical Readiness Assessment

## 3.1 External Services & API Keys Required
> 🔑 All required external services are documented with environment variable names.

### Day 1 - Local Development Setup (Free)
- **OrbStack** - Docker replacement for macOS (free for personal use)
- **Supabase CLI** - Local Supabase stack (free, open source)
  - Provides: PostgreSQL, Auth, Storage, Realtime, Studio UI
  - Environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

### Week 1 - AI Integration (Pay-as-you-go, ~$5-10/month)
- **OpenAI API** - OPENAI_API_KEY
  - text-embedding-3-small (name embeddings)
  - GPT-4o-mini (name insights, recommendations)

### Week 3 - Authentication Providers (Free setup)
- **Apple Sign-In** (via Supabase Auth)
  - Configure in Supabase Dashboard
  - Apple Developer credentials: APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID
- **Google Sign-In** (via Supabase Auth)
  - Google Cloud Console OAuth credentials: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

### Week 6+ - Optional Services
- **ElevenLabs or OpenAI TTS** - Text-to-speech for pronunciations (~$5-10/month)
- **Supabase Cloud** - Production hosting when ready (~$25/month Pro tier)
- **Expo EAS** - Mobile app builds and deployment (~$29/month for team features)

## 3.2 Development Environment Readiness
- ✅ Technology stack is well-defined and uses mature, stable technologies
- ✅ React Native 0.73+ and Expo SDK 50+ are current stable versions
- ✅ **Supabase** provides complete backend with local-first development (no cloud costs during dev)
- ✅ **OrbStack** enables fast, lightweight local development environment on macOS
- ✅ **Local-first approach** means you can develop entirely offline with full backend capabilities
- ✅ CI/CD pipeline design included (GitHub Actions + EAS Build)
- ✅ **Migration path**: Easy to move from local → Supabase Cloud → Self-hosted VPS later

---


# 4. Risk Analysis

## 4.1 Technical Risks
1. AI Recommendation Quality (Medium) - Mitigation: Start with simple collaborative filtering, iterate based on user feedback
1. Real-time Partner Sync Performance (Medium) - Mitigation: WebSocket architecture specified, can fallback to polling
1. Name Database Quality (Low) - Mitigation: Use established SSA data + curated expansion

## 4.2 Business Risks
1. Crowded Market (High) - Mitigation: Differentiate on AI quality and partner collaboration UX
1. Short User Lifecycle (~9 months) (Medium) - Mitigation: Maximize value capture, strong referral program
1. Premium Conversion Rate (Medium) - Mitigation: Clear free vs premium value differentiation

## 4.3 Schedule Risks
1. Third-party API Reliability (Low) - Mitigation: All APIs (OpenAI, AWS) have high SLAs
1. App Store Review Delays (Low) - Mitigation: Plan 2-week buffer for launch

---


# 5. Sprint Planning
Based on 2 developers, 2-week sprints, ~40 SP capacity per sprint.

## Sprint 1: Foundation (Weeks 1-2) - 21 SP
> 🏗️ Epic 1: Foundation & Infrastructure (P0 - Critical Path)
- Story 1.1: React Native Project Setup (5 SP)
- Story 1.2: State Management & Data Layer (3 SP)
- Story 1.3: Supabase Local Setup with OrbStack (3 SP) ⚡️ **Faster than AWS!**
- Story 1.4: Database Schema & Migrations (5 SP)
- Story 1.5: CI/CD Pipeline (5 SP)

**Reduced from 26 SP → 21 SP** thanks to Supabase's built-in infrastructure!

## Sprint 2: Authentication & Onboarding (Weeks 3-4) - 27 SP
> 🔐 Epic 2: User Authentication & Onboarding (P0 - Critical Path)
- Story 2.1: Email/Password Authentication (3 SP) ⚡️ **Supabase handles most of this!**
- Story 2.2: Apple Sign-In (3 SP) ⚡️ **Just config in Supabase Dashboard**
- Story 2.3: Google Sign-In (3 SP) ⚡️ **Just config in Supabase Dashboard**
- Story 2.4: Onboarding Flow UI (8 SP)
- Story 2.5: Preference Collection (5 SP)
- Story 2.6: Guest Mode (2 SP)

**Reduced from 34 SP → 27 SP** thanks to Supabase Auth handling all the heavy lifting!
