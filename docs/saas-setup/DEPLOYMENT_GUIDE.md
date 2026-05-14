# Deployment Guide - Resume Matcher SaaS

## Architecture

```
┌─────────────────┐          ┌─────────────────┐
│   Vercel        │          │    Railway     │
│  (Frontend)    │  ----->   │   (Backend)    │
│   Next.js      │  API      │   FastAPI      │
└─────────────────┘          └─────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
    ┌────┴────┐               ┌──────┴──────┐             ┌──────┴──────┐
    │Supabase │               │   Stripe    │             │  DeepSeek   │
    │PostgreSQL│               │  (Payments) │             │    (LLM)    │
    └─────────┘               └─────────────┘             └─────────────┘
```

---

## Prerequisites

1. **Supabase Project** - Create at supabase.com
2. **Stripe Account** - Create at stripe.com
3. **DeepSeek Account** - Create at platform.deepseek.com
4. **Railway Account** - Create at railway.app
5. **Vercel Account** - Create at vercel.com

---

## Step 1: Supabase Setup

### 1.1 Create Project
1. Go to supabase.com and create new project
2. Note your project ID (e.g., `abc123...`)

### 1.2 Run Database Schema
1. Go to SQL Editor in Supabase dashboard
2. Copy contents from `docs/saas-setup/supabase-schema.sql`
3. Run the SQL to create all tables with RLS

### 1.3 Get Credentials
- **Database URL**: Settings → Database → Connection string (use pooler)
- **SUPABASE_URL**: Settings → General → Project URL
- **SUPABASE_ANON_KEY**: Settings → API → `anon` key
- **SUPABASE_JWT_SECRET**: Settings → API → JWT Settings → JWT Secret

---

## Step 2: Stripe Setup

### 2.1 Get API Keys
1. Go to stripe.com → Developers → API keys
2. Copy **Secret Key** (starts with `sk_test_...`)

### 2.2 Get Webhook Secret
1. Go to Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://your-railway-app.railway.app/api/v1/payments/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy webhook secret (starts with `whsec_...`)

### 2.3 Create Products (in Stripe Dashboard)
1. Products → Add product
2. **Pro**: $9/month, recurring
3. **Pro+**: $19/month, recurring
4. Copy the Price IDs (`price_xxx...`)

---

## Step 3: DeepSeek Setup

### 3.1 Get API Key
1. Go to platform.deepseek.com
2. API Keys → Create new key
3. Copy the key (starts with `sk-...`)

---

## Step 4: Railway Backend Deployment

### 4.1 Connect Repository
1. Go to railway.app → New Project
2. Connect your GitHub repository
3. Select the `apps/backend` directory

### 4.2 Configure Environment
Add these variables in Railway dashboard:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | From Supabase (pooler format) |
| `SUPABASE_URL` | From Supabase |
| `SUPABASE_ANON_KEY` | From Supabase |
| `SUPABASE_JWT_SECRET` | From Supabase |
| `STRIPE_API_KEY` | From Stripe |
| `STRIPE_WEBHOOK_SECRET` | From Stripe |
| `DEEPSEEK_API_KEY` | From DeepSeek |
| `FRONTEND_BASE_URL` | Your Vercel URL (see below) |

### 4.3 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Note your Railway URL (e.g., `https://resume-matcher-backend.up.railway.app`)

---

## Step 5: Vercel Frontend Deployment

### 5.1 Connect Repository
1. Go to vercel.com → New Project
2. Import your GitHub repository
3. Select `apps/frontend` as root directory

### 5.2 Configure Environment
Add these variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | Your Railway backend URL |
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | From Stripe (starts with `pk_test_...`) |

### 5.3 Deploy
1. Click "Deploy"
2. Note your Vercel URL

### 5.4 Update Backend
After frontend deploys, update `FRONTEND_BASE_URL` in Railway with your Vercel URL.

---

## Step 6: Update Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Update endpoint URL to use your Railway URL
3. Redeploy Railway if needed

---

## Estimated Monthly Costs

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Supabase | 500MB DB (free) | $0 |
| Railway | $5/server | $5-10 |
| Vercel | Frontend (free) | $0 |
| DeepSeek | Usage-based | $5-20 |
| Stripe | 0% (pass through) | $0 |
| **Total** | **~$5** | **~$10-30** |

---

## Troubleshooting

### Backend won't start
- Check all environment variables are set
- Verify DATABASE_URL is correct (use pooler format, port 6543)
- Check Railway logs

### Auth not working
- Verify SUPABASE_JWT_SECRET matches Supabase
- Check CORS_ORIGINS includes your Vercel URL

### Payments failing
- Verify STRIPE_API_KEY is correct
- Check webhook is configured
- Verify PRICE_IDS in payments.py match Stripe

### LLM not working
- Verify DEEPSEEK_API_KEY is set
- Check DeepSeek account has credits
- Check Railway logs for errors