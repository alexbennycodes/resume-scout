# Resume Matcher - SaaS Build Progress

> Build a paid SaaS product for matching resumes to job descriptions using AI.
> **Tech Stack**: Vercel (frontend) + Railway (backend) + Supabase (PostgreSQL + Auth) + Stripe (payments) + DeepSeek (AI)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Vercel)                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐   │
│  │ Landing │ │ Pricing │ │Dashboard│ │ Settings│ │ Auth (Supabase) │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │    BACKEND (Railway) │
                    │  ┌─────────────────┐ │
                    │  │  FastAPI Server  │ │
                    │  ├─────────────────┤ │
                    │  │  • Resume API    │ │
                    │  │  • Jobs API       │ │
                    │  │  • Payments API   │ │
                    │  │  • Usage API      │ │
                    │  │  • DeepSeek LLM   │ │
                    │  └─────────────────┘ │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────┴───────┐    ┌─────────┴─────────┐    ┌───────┴───────┐
│ SUPABASE      │    │    STRIPE         │    │   DEEPSEEK   │
│ (PostgreSQL)  │    │    (Payments)     │    │   (LLM API)  │
│ • Auth        │    │ • Checkout        │    │              │
│ • Database    │    │ • Webhooks        │    │              │
│ • RLS         │    │ • Subscriptions   │    │              │
└───────────────┘    └───────────────────┘    └──────────────┘
```

---

## Database Schema (Supabase PostgreSQL)

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile linked to Supabase Auth |
| `resumes` | User's uploaded resumes |
| `jobs` | Job descriptions for matching |
| `improvements` | AI-improved resume versions |
| `usage_logs` | Track user actions for rate limiting |
| `user_api_keys` | User-provided API keys (if needed) |

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only see their own data
- Service role bypasses RLS for admin operations

---

## Subscription Tiers

| Feature | Free | Pro ($9/mo) | Pro+ ($19/mo) |
|---------|:----:|:-----------:|:-------------:|
| Resume Tailoring / month | 3 | Unlimited | Unlimited |
| Resumes stored | 1 | 5 | Unlimited |
| Cover Letters | ❌ | ✅ | ✅ |
| PDF Export | ✅ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ |

### Stripe Price IDs
- **Free**: N/A (default tier)
- **Pro**: `price_xxx` (placeholder)
- **Pro+**: `price_xxx` (placeholder)

---

## Week-by-Week Progress

### ✅ Week 1: Database & Authentication
**Goal**: Set up PostgreSQL database with Supabase and implement authentication

#### Completed Tasks

| Task | File | Description |
|------|------|-------------|
| PostgreSQL Schema | `docs/saas-setup/supabase-schema.sql` | SQL schema with all tables, RLS policies |
| SQLAlchemy Models | `apps/backend/app/db_postgres.py` | Python models using SQLAlchemy async |
| Database Connection | `apps/backend/app/database.py` | Async database connection setup |
| Auth Middleware | `apps/backend/app/auth.py` | JWT verification with Supabase |
| Supabase Config | `apps/backend/app/config.py` | Environment variables for Supabase |

#### Key Code - Database Connection
```python
# apps/backend/app/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

DATABASE_URL = os.getenv("DATABASE_URL", "")
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
```

#### Key Code - Auth Middleware
```python
# apps/backend/app/auth.py
async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization")
    token = auth_header.replace("Bearer ", "")
    # Verify with Supabase JWT secret
    return payload
```

---

### ✅ Week 2: Frontend Authentication
**Goal**: Implement login/signup pages with Supabase Auth

#### Completed Tasks

| Task | File | Description |
|------|------|-------------|
| Supabase Client | `apps/frontend/lib/supabase/client.ts` | Browser Supabase client |
| Auth Context | `apps/frontend/lib/context/auth-context.tsx` | React context for auth state |
| Protected Routes | `app/middleware.ts` | Middleware for protected pages |
| Login Page | `app/(default)/login/page.tsx` | Login form with Google OAuth |
| Signup Page | `app/(default)/signup/page.tsx` | Signup form |

#### Key Features
- ✅ Google OAuth tested and working
- ✅ Session persistence with cookies
- ✅ Protected dashboard and settings pages
- ✅ Auth state in React context

#### Auth Flow
```
User → Login Page → Google OAuth → Supabase → Return token → Store in cookie
                                                              ↓
Protected Page Request → Middleware → Verify token → Allow/Deny
```

---

### ✅ Week 3: Stripe Payments
**Goal**: Implement subscription payments with Stripe

#### Completed Tasks

| Task | File | Description |
|------|------|-------------|
| Stripe Config | `apps/backend/app/config.py` | Stripe API keys |
| Payments Router | `apps/backend/app/routers/payments.py` | Checkout, webhooks, portal |
| Pricing Page | `apps/frontend/app/(default)/pricing/page.tsx` | Pricing UI |
| Payment API | `apps/frontend/lib/api/payments.ts` | Frontend payment functions |
| Feature Gating | `apps/frontend/lib/feature-gates.ts` | Tier-based feature access |

#### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payments/checkout` | POST | Create Stripe checkout session |
| `/api/payments/portal` | POST | Create customer portal session |
| `/api/payments/status` | GET | Get current subscription status |
| `/api/payments/webhook` | POST | Handle Stripe webhooks |

#### Webhook Events Handled
- `checkout.session.completed` - Activate subscription
- `customer.subscription.updated` - Update tier
- `customer.subscription.deleted` - Downgrade to free

#### Stripe Integration Flow
```
User clicks "Upgrade" → Backend creates Checkout Session → Return URL
    ↓
User pays on Stripe → Stripe redirects to success URL
    ↓
Stripe sends webhook → Backend updates profile.tier → Database updated
```

---

### ✅ Week 4: Usage Tracking & Rate Limiting
**Goal**: Track user actions and enforce subscription limits

#### Completed Tasks

| Task | File | Description |
|------|------|-------------|
| Usage Service | `apps/backend/app/services/usage.py` | Usage logging and limits |
| Usage Router | `apps/backend/app/routers/usage.py` | Usage API endpoints |
| Frontend API | `apps/frontend/lib/api/usage.ts` | Usage API client |
| Usage Display | `apps/frontend/components/settings/usage-display.tsx` | UI component |
| Settings Update | `apps/frontend/app/(default)/settings/page.tsx` | Added usage section |

#### Usage Limits Implementation

```python
# apps/backend/app/services/usage.py
TIER_LIMITS = {
    "free": {
        "resume_tailor": 3,
        "resume_upload": 1,
        "cover_letters": False,
    },
    "pro": {
        "resume_tailor": "unlimited",
        "resume_upload": 5,
        "cover_letters": True,
    },
    "pro_plus": {
        "resume_tailor": "unlimited",
        "resume_upload": "unlimited",
        "cover_letters": True,
    },
}
```

#### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/usage/summary` | GET | Full usage summary with limits |
| `/api/usage/monthly` | GET | Current month usage stats |
| `/api/usage/check/{action}` | GET | Check if action is allowed |

#### Frontend Usage Display
- Shows current tier and status
- Displays remaining quota for each action
- Shows feature availability (cover letters, etc.)
- Upgrade prompt for free users

---

### ✅ Week 5: DeepSeek LLM Integration
**Goal**: Integrate DeepSeek AI for resume improvement

#### Completed Tasks

| Task | File | Description |
|------|------|-------------|
| LLM Service | `apps/backend/app/services/llm_service.py` | Wrapper with cost tracking |
| DeepSeek Config | `apps/backend/app/config.py` | Default provider set to deepseek |
| Usage Integration | `apps/backend/app/routers/resumes.py` | Auth + rate limiting on improve endpoints |
| Matching Endpoint | `apps/backend/app/routers/matching.py` | Resume-to-job scoring API |
| Frontend API | `apps/frontend/lib/api/resume.ts` | Added scoreResumeJobMatch function |

#### LLM Pricing (DeepSeek)

```python
# apps/backend/app/services/llm_service.py
DEEPSEEK_PRICING = {
    "deepseek-chat": {"input": 0.27, "output": 1.10},
    "deepseek-reasoner": {"input": 0.55, "output": 2.19},
}
```

#### New Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/matching/score/{resume_id}/{job_id}` | POST | Score resume-job match |
| `/api/v1/usage/check/{action}` | GET | Check if action allowed |

#### Auth Integration
- All improve endpoints now require authentication
- Usage limits checked before allowing resume tailoring
- Actions logged for rate limiting

---

### ✅ Week 6: Deployment
**Goal**: Deploy to production on Vercel + Railway

#### Completed Tasks

| Task | File | Description |
|------|------|-------------|
| Railway Config | `apps/backend/railway.json` | Railway deployment settings |
| Vercel Config | `apps/frontend/vercel.json` | Vercel build settings |
| Env Template | `apps/backend/.env.production.example` | Production env vars |
| Deploy Guide | `docs/saas-setup/DEPLOYMENT_GUIDE.md` | Step-by-step instructions |

#### Deployment Architecture
```
Vercel (Frontend) → Railway (Backend) → Supabase + Stripe + DeepSeek
```

#### Environment Variables

**Railway (Backend)**:
- `DATABASE_URL` - Supabase PostgreSQL
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET` - Auth
- `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` - Payments
- `DEEPSEEK_API_KEY` - AI (REQUIRED)
- `FRONTEND_BASE_URL` - Your Vercel URL

**Vercel (Frontend)**:
- `NEXT_PUBLIC_API_URL` - Railway backend URL
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

#### Estimated Monthly Cost: $10-30

---

## Project Structure

```
Resume-Matcher/
├── apps/
│   ├── backend/
│   │   ├── app/
│   │   │   ├── __init__.py
│   │   │   ├── main.py              # FastAPI entry point
│   │   │   ├── config.py           # Environment config
│   │   │   ├── database.py         # Database connection
│   │   │   ├── db_postgres.py       # SQLAlchemy models
│   │   │   ├── auth.py              # JWT auth middleware
│   │   │   ├── dependencies.py     # FastAPI dependencies
│   │   │   ├── routers/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── health.py        # Health check
│   │   │   │   ├── resumes.py       # Resume CRUD
│   │   │   │   ├── jobs.py          # Job CRUD
│   │   │   │   ├── enrichment.py    # AI enrichment
│   │   │   │   ├── payments.py      # Stripe payments
│   │   │   │   └── usage.py         # Usage tracking
│   │   │   └── services/
│   │   │       ├── __init__.py
│   │   │       ├── usage.py         # Usage service
│   │   │       └── llm.py           # LLM service (future)
│   │   ├── requirements.txt
│   │   └── railway.json
│   │
│   └── frontend/
│       ├── app/
│       │   ├── (default)/
│       │   │   ├── page.tsx          # Landing page
│       │   │   ├── login/
│       │   │   ├── signup/
│       │   │   ├── pricing/
│       │   │   ├── dashboard/
│       │   │   └── settings/
│       │   ├── api/                  # Next.js API routes
│       │   └── layout.tsx
│       ├── components/
│       │   ├── ui/                   # UI components
│       │   └── settings/
│       │       └── usage-display.tsx
│       ├── lib/
│       │   ├── api/                  # Frontend API clients
│       │   │   ├── client.ts
│       │   │   ├── payments.ts
│       │   │   ├── usage.ts
│       │   │   └── ...
│       │   ├── supabase/
│       │   ├── context/
│       │   └── config/
│       └── package.json
│
├── docs/
│   └── saas-setup/
│       └── supabase-schema.sql
│
├── package.json
└── README.md
```

---

## Current Status

### ✅ Completed (Weeks 1-5)

1. **Database**: PostgreSQL schema with all tables and RLS
2. **Auth**: Supabase Auth with Google OAuth
3. **Payments**: Stripe checkout, webhooks, subscription management
4. **Usage**: Tracking, rate limiting, usage display
5. **DeepSeek Integration**: LLM service with cost tracking, resume matching

### ⏳ Ready for Deployment (Week 6)

1. **All code complete** - Ready to deploy to Railway + Vercel
2. **Follow deployment guide** - `docs/saas-setup/DEPLOYMENT_GUIDE.md`

---

## Required API Keys (Blocking Items)

To continue, the following keys are needed:

| Key | Where to Get | Purpose |
|-----|--------------|---------|
| `STRIPE_API_KEY` | Stripe Dashboard | Process payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard | Verify webhook events |
| `DEEPSEEK_API_KEY` | DeepSeek Platform | AI resume improvements |

---

## Next Steps

1. Get Stripe and DeepSeek API keys from user
2. Implement DeepSeek LLM integration (Week 5)
3. Deploy to Railway + Vercel (Week 6)

---

## Notes

- Direct PostgreSQL connection fails in sandbox (network restrictions) - used Supabase REST API to verify tables
- Supabase connection string uses pooler format for production
- Feature gating implemented with tier-based limits
- Google OAuth tested and working