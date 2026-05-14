# SaaS Deployment Checklist

Use this checklist to track your progress through the deployment.

---

## Prerequisites (Complete These First)

- [ ] Vercel account (https://vercel.com)
- [ ] Railway account (https://railway.app)
- [ ] Supabase account (https://supabase.com)
- [ ] Google Cloud account (for OAuth)
- [ ] Stripe account (https://stripe.com)
- [ ] DeepSeek API key (https://platform.deepseek.com)

---

## Week 1: Database & Auth

- [x] **Database Schema** — Created at `docs/saas-setup/supabase-schema.sql`
- [x] **SQLAlchemy Models** — Created at `app/db_postgres.py`
- [x] **Auth Middleware** — Created at `app/auth.py`
- [x] **Config Updates** — Added Supabase & Stripe settings to `config.py`

### Your Action Items:
1. [ ] Create Supabase project (see `01-supabase-setup.md`)
2. [ ] Run SQL schema in Supabase SQL Editor
3. [ ] Configure Google OAuth in Supabase
4. [ ] Get Supabase credentials
5. [ ] Update `.env` with DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_JWT_SECRET
6. [ ] Add DeepSeek API key to `.env` (DEEPSEEK_API_KEY)

---

## Week 2: Frontend Auth (Not Started)

- [ ] Create login page
- [ ] Create signup page
- [ ] Add Supabase Auth to frontend
- [ ] Create auth context provider
- [ ] Add protected routes

---

## Week 3: Payments (Not Started)

- [ ] Create Stripe products
- [ ] Add checkout API endpoint
- [ ] Create webhook handler
- [ ] Add subscription status to user model
- [ ] Implement tier-based feature gating

---

## Week 4: Usage Tracking (Not Started)

- [ ] Add usage logging to all LLM calls
- [ ] Create usage dashboard API
- [ ] Implement rate limiting
- [ ] Add usage visualization in frontend

---

## Week 5: LLM Integration (Not Started)

- [ ] Update LLM service for DeepSeek
- [ ] Add MiniMax as fallback
- [ ] Implement cost tracking per request
- [ ] Add admin cost monitoring

---

## Week 6: Deployment (Not Started)

- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Configure environment variables
- [ ] Set up custom domain (optional)

---

## Quick Start Commands

```bash
# Backend
cd apps/backend
uv sync
uv run uvicorn app.main:app --reload

# Frontend
cd apps/frontend
npm install
npm run dev
```

---

## Environment Variables Summary

| Variable | Where to Get | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Supabase → Settings → Database | Yes |
| `SUPABASE_URL` | Supabase → Settings → General | Yes |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API | Yes |
| `SUPABASE_JWT_SECRET` | Supabase → Settings → API | Yes |
| `DEEPSEEK_API_KEY` | DeepSeek Platform | Yes |
| `STRIPE_API_KEY` | Stripe Dashboard | Yes (Week 3) |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhooks | Yes (Week 3) |

---

## Files Changed

### Created Files
- `docs/saas-setup/supabase-schema.sql` — Database schema
- `app/db_postgres.py` — SQLAlchemy database module
- `app/auth.py` — Authentication middleware
- `docs/saas-setup/00-quickstart.md` — This checklist
- `docs/saas-setup/01-supabase-setup.md` — Supabase guide
- `docs/saas-setup/02-stripe-setup.md` — Stripe guide

### Modified Files
- `pyproject.toml` — Added PostgreSQL, Supabase, Stripe dependencies
- `.env.example` — Added new environment variables
- `config.py` — Added Supabase, Stripe settings

---

## What's Next?

1. **Complete Supabase Setup** — Follow `01-supabase-setup.md`
2. **Get API Keys** — Gather all required credentials
3. **Test Locally** — Run backend with new PostgreSQL connection
4. **Move to Week 2** — Add frontend authentication

---

## Support

- Issues: https://github.com/srbhr/Resume-Matcher/issues
- Documentation: https://docs.resumematcher.fyi