# Stripe Setup Guide

This guide walks you through setting up Stripe for handling subscriptions in Resume Matcher.

---

## Step 1: Create a Stripe Account

1. Go to [stripe.com](https://stripe.com) and sign up
2. Complete account verification (email, business info)
3. Enable test mode (toggle in top-right corner)

---

## Step 2: Get Your API Keys

1. Go to **Developers** → **API keys**
2. Copy the following:
   - **Publishable key** (starts with `pk_test_`) — for frontend
   - **Secret key** (starts with `sk_test_`) — for backend

Add to your `.env`:
```bash
STRIPE_API_KEY=sk_test_your-secret-key
```

---

## Step 3: Create Products

### Option A: Via Dashboard (Manual)

1. Go to **Products** → **Add product**
2. Create each tier:

| Product Name | Price | Billing | Features |
|-------------|-------|---------|----------|
| **Resume Matcher Free** | $0 | One-time | 3 resumes/month |
| **Resume Matcher Pro** | $9.00/month | Monthly | Unlimited resumes |
| **Resume Matcher Pro+** | $19.00/month | Monthly | Priority support |

3. Note the **Price ID** for each product (looks like `price_xxx`)

### Option B: Via API (Recommended)

Run this via Stripe CLI or in a Python script:

```python
import stripe

stripe.api_key = "sk_test_your-key"

# Create Free tier
free = stripe.Product.create(name="Resume Matcher Free")
stripe.Price.create(
    product=free.id,
    unit_amount=0,
    currency="usd",
    recurring={"interval": "month"}
)

# Create Pro tier
pro = stripe.Product.create(name="Resume Matcher Pro")
pro_price = stripe.Price.create(
    product=pro.id,
    unit_amount=900,  # $9.00
    currency="usd",
    recurring={"interval": "month"}
)
print(f"Pro Price ID: {pro_price.id}")

# Create Pro+ tier
pro_plus = stripe.Product.create(name="Resume Matcher Pro+")
pro_plus_price = stripe.Price.create(
    product=pro_plus.id,
    unit_amount=1900,  # $19.00
    currency="usd",
    recurring={"interval": "month"}
)
print(f"Pro+ Price ID: {pro_plus_price.id}")
```

Save the Price IDs — you'll need them in your backend config.

---

## Step 4: Configure Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your backend URL:
   ```
   https://your-domain.com/api/v1/payments/webhook
   ```
   (For local dev: use Stripe CLI — see below)
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

Add to your `.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your-signing-secret
```

---

## Step 5: Local Development (Stripe CLI)

For local webhook testing:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Listen to webhooks:
   ```bash
   stripe listen --forward-to localhost:8000/api/v1/payments/webhook
   ```
4. Copy the webhook secret shown (starts with `whsec_`)
5. Use this in your `.env` for local development

---

## Step 6: Add Your Price IDs to Config

In `apps/backend/app/config.py` or via environment variables:

```bash
STRIPE_PRICE_FREE=price_xxx
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_PRO_PLUS=price_xxx
```

---

## Testing the Flow

1. Use [Stripe Test Cards](https://stripe.com/docs/testing):
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0000 0000 3220`

2. Test webhook events:
   ```bash
   # Trigger a test checkout session
   stripe fixtures test-webhook-event.json
   ```

---

## Troubleshooting

### Webhook not reaching backend
- Check URL is correct (must be HTTPS in production)
- Verify firewall allows requests
- Use Stripe CLI to debug locally

### Price IDs not working
- Ensure they're in test mode (not live)
- Check format is `price_xxx` not `prod_xxx`

### Subscription not updating
- Verify webhook events are enabled
- Check Stripe dashboard for failed deliveries

---

## Security Notes

1. **Never expose secret key** in frontend code
2. **Use webhook signing** to verify request authenticity
3. **Enable Stripe Radar** for fraud protection (free)
4. **Set up alerts** for unusual activity

---

## Cost

| Item | Cost |
|------|------|
| Stripe fees | 2.9% + $0.30 per transaction |
| Radar (fraud) | Free |
| Additional features | Varies |

---

## Next Steps

After completing this guide:
1. Proceed to **03-frontend-auth.md** to add login/signup pages
2. Then **04-deployment.md** for deployment

---

## Need Help?

- Stripe docs: https://stripe.com/docs
- Stripe community: https://community.stripe.com/