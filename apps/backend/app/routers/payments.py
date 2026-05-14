"""Stripe payment and subscription handling."""

import logging
from typing import Any
from uuid import UUID

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from app.auth import require_auth, AuthUser
from app.config import settings
from app.db_postgres import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payments", tags=["payments"])

stripe.api_key = settings.stripe_api_key

# Price IDs - these would come from environment in production
PRICE_IDS = {
    "free": "price_free",
    "pro": "price_pro",
    "pro_plus": "price_pro_plus",
}


class CreateCheckoutRequest(BaseModel):
    """Request to create a checkout session."""

    price_id: str
    success_url: str = "http://localhost:3000/dashboard?subscription=success"
    cancel_url: str = "http://localhost:3000/pricing?subscription=cancelled"


class CheckoutResponse(BaseModel):
    """Response from creating a checkout session."""

    checkout_url: str


class PortalResponse(BaseModel):
    """Response from creating a customer portal session."""

    portal_url: str


class SubscriptionStatusResponse(BaseModel):
    """Response with subscription status."""

    tier: str
    status: str
    current_period_end: str | None = None


@router.post("/create-checkout", response_model=CheckoutResponse)
async def create_checkout(
    request: CreateCheckoutRequest,
    current_user: AuthUser = Depends(require_auth),
) -> CheckoutResponse:
    """Create a Stripe checkout session for subscription."""
    if not settings.stripe_api_key:
        raise HTTPException(status_code=400, detail="Stripe not configured")

    try:
        profile = db.get_profile(current_user.user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        # Create or get Stripe customer
        customer_id = profile.stripe_customer_id
        if not customer_id:
            customer = stripe.Customer.create(
                email=current_user.email,
                metadata={"user_id": str(current_user.user_id)},
            )
            customer_id = customer.id
            db.update_profile(current_user.user_id, stripe_customer_id=customer_id)

        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            mode="subscription",
            payment_method_types=["card"],
            line_items=[
                {
                    "price": request.price_id,
                    "quantity": 1,
                }
            ],
            success_url=request.success_url,
            cancel_url=request.cancel_url,
            metadata={"user_id": str(current_user.user_id)},
        )

        return CheckoutResponse(checkout_url=checkout_session.url)

    except stripe.error.StripeError as e:
        logger.error(f"Stripe checkout error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/create-portal", response_model=PortalResponse)
async def create_portal(
    request: Request,
    current_user: AuthUser = Depends(require_auth),
) -> PortalResponse:
    """Create a Stripe customer portal session."""
    if not settings.stripe_api_key:
        raise HTTPException(status_code=400, detail="Stripe not configured")

    try:
        profile = db.get_profile(current_user.user_id)
        if not profile or not profile.stripe_customer_id:
            raise HTTPException(status_code=400, detail="No active subscription")

        portal_session = stripe.billing_portal.Session.create(
            customer=profile.stripe_customer_id,
            return_url=str(request.url_for("dashboard")),
        )

        return PortalResponse(portal_url=portal_session.url)

    except stripe.error.StripeError as e:
        logger.error(f"Stripe portal error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/status", response_model=SubscriptionStatusResponse)
async def get_subscription_status(
    current_user: AuthUser = Depends(require_auth),
) -> SubscriptionStatusResponse:
    """Get the current user's subscription status."""
    profile = db.get_profile(current_user.user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # If no Stripe subscription, return free tier
    if not profile.stripe_subscription_id:
        return SubscriptionStatusResponse(
            tier=profile.subscription_tier,
            status="inactive",
        )

    try:
        # Get subscription details from Stripe
        subscription = stripe.Subscription.retrieve(profile.stripe_subscription_id)
        return SubscriptionStatusResponse(
            tier=profile.subscription_tier,
            status=subscription.status,
            current_period_end=str(subscription.current_period_end),
        )
    except stripe.error.StripeError:
        # If we can't reach Stripe, return stored status
        return SubscriptionStatusResponse(
            tier=profile.subscription_tier,
            status=profile.subscription_status,
        )


@router.post("/webhook")
async def stripe_webhook(request: Request) -> dict[str, str]:
    """Handle Stripe webhook events."""
    if not settings.stripe_webhook_secret:
        raise HTTPException(status_code=400, detail="Webhook not configured")

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        await handle_checkout_completed(session)

    elif event["type"] == "customer.subscription.updated":
        subscription = event["data"]["object"]
        await handle_subscription_updated(subscription)

    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        await handle_subscription_deleted(subscription)

    elif event["type"] == "invoice.payment_succeeded":
        invoice = event["data"]["object"]
        await handle_payment_succeeded(invoice)

    elif event["type"] == "invoice.payment_failed":
        invoice = event["data"]["object"]
        await handle_payment_failed(invoice)

    return {"status": "received"}


async def handle_checkout_completed(session: dict[str, Any]) -> None:
    """Handle successful checkout session."""
    user_id = session.get("metadata", {}).get("user_id")
    if not user_id:
        logger.warning("Checkout completed without user_id in metadata")
        return

    subscription_id = session.get("subscription")
    customer_id = session.get("customer")

    if not subscription_id:
        logger.warning("Checkout completed without subscription_id")
        return

    try:
        subscription = stripe.Subscription.retrieve(subscription_id)
        tier = get_tier_from_price(subscription["items"]["data"][0]["price"]["id"])

        db.update_profile(
            UUID(user_id),
            stripe_subscription_id=subscription_id,
            stripe_customer_id=customer_id,
            subscription_tier=tier,
            subscription_status="active",
        )
        logger.info(f"Profile updated for user {user_id}: {tier} tier")
    except Exception as e:
        logger.error(f"Error handling checkout completed: {e}")


async def handle_subscription_updated(subscription: dict[str, Any]) -> None:
    """Handle subscription updates."""
    customer_id = subscription.get("customer")
    if not customer_id:
        return

    # Find user by customer_id
    from sqlalchemy import select

    from app.db_postgres import Profile

    with db.session as session:
        result = session.execute(
            select(Profile).where(Profile.stripe_customer_id == customer_id)
        )
        profile = result.scalar_one_or_none()

    if not profile:
        logger.warning(f"No profile found for customer {customer_id}")
        return

    tier = get_tier_from_price(subscription["items"]["data"][0]["price"]["id"])
    status = subscription.get("status", "active")

    db.update_profile(
        profile.id,
        subscription_tier=tier,
        subscription_status=status,
    )
    logger.info(f"Subscription updated for user {profile.id}: {tier} tier, status: {status}")


async def handle_subscription_deleted(subscription: dict[str, Any]) -> None:
    """Handle subscription cancellation."""
    customer_id = subscription.get("customer")
    if not customer_id:
        return

    from sqlalchemy import select

    from app.db_postgres import Profile

    with db.session as session:
        result = session.execute(
            select(Profile).where(Profile.stripe_customer_id == customer_id)
        )
        profile = result.scalar_one_or_none()

    if not profile:
        return

    db.update_profile(
        profile.id,
        subscription_tier="free",
        subscription_status="cancelled",
    )
    logger.info(f"Subscription cancelled for user {profile.id}")


async def handle_payment_succeeded(invoice: dict[str, Any]) -> None:
    """Handle successful payment."""
    logger.info(f"Payment succeeded for invoice {invoice.get('id')}")


async def handle_payment_failed(invoice: dict[str, Any]) -> None:
    """Handle failed payment."""
    customer_id = invoice.get("customer")
    if not customer_id:
        return

    from sqlalchemy import select

    from app.db_postgres import Profile

    with db.session as session:
        result = session.execute(
            select(Profile).where(Profile.stripe_customer_id == customer_id)
        )
        profile = result.scalar_one_or_none()

    if not profile:
        return

    db.update_profile(profile.id, subscription_status="past_due")
    logger.warning(f"Payment failed for user {profile.id}")


def get_tier_from_price(price_id: str) -> str:
    """Map Stripe price ID to subscription tier."""
    # This would be configured with actual price IDs from Stripe
    price_to_tier = {
        "price_pro": "pro",
        "price_pro_plus": "pro_plus",
    }
    return price_to_tier.get(price_id, "free")