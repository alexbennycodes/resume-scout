# Supabase Setup Guide

This guide walks you through setting up Supabase for the Resume Matcher SaaS backend.

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Fill in the details:
   - **Name:** Resume Matcher
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose closest to your users
4. Click **Create new project**
5. Wait for project to provision (~2 minutes)

---

## Step 2: Get Your Credentials

Once created, go to **Project Settings** → **API**:

| Setting | Value | Where to find |
|---------|-------|---------------|
| **Project URL** | `https://xxxxx.supabase.co` | Project Settings → General |
| **anon key** | `eyJ...` | Project Settings → API → Project API keys |
| **service_role key** | `eyJ...` | Project Settings → API → Project API keys (avoid using in frontend) |

---

## Step 3: Configure Authentication

### Enable Google OAuth

1. Go to **Authentication** → **Providers**
2. Click **Google**
3. Enable it with these steps:

**In Google Cloud Console:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Go to **APIs & Services** → **OAuth consent screen**
4. Configure:
   - User Type: External
   - App name: Resume Matcher
   - Support email: your email
5. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
6. Application type: Web
7. Authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
8. Copy **Client ID** and **Client Secret**

**Back in Supabase:**
1. Paste the Client ID and Client Secret
2. Add to **Site URL**: `http://localhost:3000` (for dev) or your production URL
3. Click **Save**

---

## Step 4: Run the Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Copy the contents from `docs/saas-setup/supabase-schema.sql`
3. Paste into the SQL Editor
4. Click **Run**

You should see success messages for each table created.

---

## Step 5: Configure Environment Variables

Create or update your `.env` file in `apps/backend/`:

```bash
# Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_JWT_SECRET=[YOUR-SERVICE-ROLE-KEY]

# Stripe (add later)
# STRIPE_API_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...

# Platform LLM
DEEPSEEK_API_KEY=[YOUR-DEEPSEEK-KEY]
```

---

## Step 6: Test the Connection

From the `apps/backend` directory:

```bash
# Install dependencies
uv sync

# Try to start the server (should connect to Supabase)
uv run uvicorn app.main:app --reload
```

If it starts without errors, you're connected!

---

## Quick Reference

| Item | Where to Find |
|------|---------------|
| Project URL | Project Settings → General |
| anon key | Project Settings → API → anon |
| service_role key | Project Settings → API → service_role |
| Database password | You set this in Step 1 |

---

## Troubleshooting

### "Connection refused"
- Check DATABASE_URL format is correct
- Ensure your IP is allowed in **Settings → Database → Connection Pooler**

### "Auth token expired"
- JWT_SECRET might be wrong — use service_role key
- Check SUPABASE_JWT_SECRET matches Supabase settings

### "Row Level Security blocked"
- Make sure RLS policies are enabled (Step 4 should have done this)
- Check the SQL ran successfully

---

## Next Steps

After completing this guide:
1. Proceed to **02-stripe-setup.md** for payments
2. Then **03-frontend-auth.md** to update the frontend
3. Finally **04-deployment.md** for Vercel + Railway deployment

---

## Need Help?

- Supabase docs: https://supabase.com/docs
- Resume Matcher issues: https://github.com/srbhr/Resume-Matcher/issues