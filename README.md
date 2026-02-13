# TwoYes - Baby Name Generator App

> AI-powered baby name discovery app with partner collaboration

## 🚀 Quick Start

### Prerequisites

- **macOS** (for iOS development)
- **Node.js 20+** and **pnpm**
- **OrbStack** - Fast Docker alternative for macOS
- **Supabase CLI** - Local backend development
- **Expo CLI** - Mobile app development

### Installation

```bash
# Install OrbStack
brew install orbstack

# Install Supabase CLI
brew install supabase/tap/supabase

# Install dependencies
pnpm install

# Start Supabase (first time)
supabase start

# Copy environment variables
cp .env.example .env
# Then edit .env with your actual values
```

### Running Locally

```bash
# Terminal 1: Start Supabase backend
supabase start

# Terminal 2: Start Expo dev server
pnpm start

# Run on iOS simulator
pnpm ios

# Run on Android emulator
pnpm android
```

### Access Local Services

- **Supabase Studio**: http://localhost:54323
- **API**: http://localhost:54321
- **PostgreSQL**: `postgresql://postgres:postgres@localhost:54322/postgres`

## 📋 Environment Variables

All environment variables are documented in `.env.example`. Copy it to `.env` and fill in your values:

### ✅ Already Configured

- `EXPO_PROJECT_ID` - Your Expo project
- `OPENAI_API_KEY` - OpenAI API for AI features
- `APPLE_TEAM_ID` - Apple Developer Team ID (5HP7WW3SA3)
- `APPLE_KEY_ID` - Apple Sign-In Key ID (PG2U82423U)
- `APPLE_PRIVATE_KEY` - Apple Sign-In private key (from AuthKey_PG2U82423U.p8)

### 🔄 Auto-Generated (when you run `supabase start`)

Run `supabase status` to get these values:

```bash
supabase status
```

Then add to `.env`:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### ⏳ Optional (Add Later)

- `GOOGLE_CLIENT_ID` - Google Sign-In (Week 3+)
- `GOOGLE_CLIENT_SECRET` - Google Sign-In (Week 3+)
- `ELEVENLABS_API_KEY` - Text-to-speech (Week 6+)

## 🏗️ Tech Stack

### Frontend (Mobile App)
- **React Native** 0.73+ with Expo SDK 50+
- **TypeScript** for type safety
- **NativeWind** (Tailwind CSS for React Native)
- **React Navigation** for routing
- **TanStack Query** for server state
- **Zustand** for client state

### Backend (Supabase)
- **PostgreSQL 15** with pgvector extension
- **Supabase Auth** (Email, Apple, Google Sign-In)
- **Supabase Storage** (pronunciation audio files)
- **Supabase Realtime** (partner matching)
- **PostgREST** (auto-generated REST API)

### AI & Services
- **OpenAI** (embeddings + GPT-4o-mini)
- **ElevenLabs or OpenAI TTS** (pronunciations, optional)

## 📁 Project Structure

```
twoyes/
├── app/                    # Expo app (to be created)
├── components/             # Reusable React components
├── screens/                # App screens
├── services/               # API clients, Supabase integration
├── hooks/                  # Custom React hooks
├── utils/                  # Utility functions
├── types/                  # TypeScript types
├── supabase/               # Supabase migrations & functions
│   ├── migrations/         # Database migrations
│   └── functions/          # Edge functions (optional)
├── .env                    # Environment variables (DO NOT COMMIT)
├── .env.example            # Environment variables template
└── TWOYES_FULL_SPEC.md    # Complete technical specification
```

## 🔐 Security Notes

### Never Commit These Files
- `.env` - Contains secrets
- `*.p8` - Apple private keys
- `*.key`, `*.pem` - Any private keys

### Already Protected
All sensitive files are in `.gitignore`

### Apple Sign-In Private Key
Your Apple private key (AuthKey_PG2U82423U.p8) is embedded in `.env` as `APPLE_PRIVATE_KEY`. The original `.p8` file can be safely stored elsewhere.

## 📖 Documentation

- [Complete Technical Specification](./TWOYES_FULL_SPEC.md) - Full product spec, architecture, and user stories
- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [Expo Documentation](https://docs.expo.dev/)

## 🎯 Development Roadmap

### Sprint 1: Foundation (Week 1-2) - 21 SP
- [x] Environment setup (.env, .gitignore)
- [ ] React Native + Expo project
- [ ] Supabase local setup
- [ ] Database schema & migrations
- [ ] CI/CD pipeline

### Sprint 2: Authentication (Week 3-4) - 27 SP
- [ ] Email/Password auth
- [ ] Apple Sign-In
- [ ] Onboarding flow
- [ ] User preferences

### Sprint 3: Name Database (Week 5-6)
- [ ] Import name dataset (50K+ names)
- [ ] Name search & filters
- [ ] Name detail page
- [ ] Favorites system

See [TWOYES_FULL_SPEC.md](./TWOYES_FULL_SPEC.md) for full sprint planning.

## 🆘 Troubleshooting

### Supabase won't start
```bash
# Reset Supabase
supabase stop
supabase start
```

### OrbStack issues
```bash
# Restart OrbStack
orbstack restart
```

### Environment variables not loading
Make sure you have a `.env` file (copy from `.env.example`)

## 📝 License

Private - Not for distribution

---

**Built with ❤️ for expecting parents**
