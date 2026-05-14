"""Usage tracking API endpoints."""

import logging
from uuid import UUID

from fastapi import APIRouter, Depends

from app.auth import require_auth, AuthUser
from app.services.usage import usage_tracker

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/usage", tags=["usage"])


@router.get("/summary")
async def get_usage_summary(
    current_user: AuthUser = Depends(require_auth),
) -> dict:
    """Get usage summary for the current user."""
    return usage_tracker.get_usage_summary(current_user.user_id)


@router.get("/monthly")
async def get_monthly_usage(
    current_user: AuthUser = Depends(require_auth),
) -> dict:
    """Get monthly usage statistics."""
    return usage_tracker.get_monthly_usage(current_user.user_id)


@router.get("/check/{action}")
async def check_action_limit(
    action: str,
    current_user: AuthUser = Depends(require_auth),
) -> dict:
    """Check if user can perform a specific action."""
    allowed, message, usage = usage_tracker.check_limit(current_user.user_id, action)
    return {
        "allowed": allowed,
        "message": message,
        "usage": usage,
    }


@router.post("/log")
async def log_action(
    action_type: str,
    current_user: AuthUser = Depends(require_auth),
    llm_provider: str | None = None,
    tokens_used: int | None = None,
    cost: float = 0,
) -> dict:
    """Manually log an action (for testing)."""
    usage_tracker.log_action(
        user_id=current_user.user_id,
        action_type=action_type,
        llm_provider=llm_provider,
        tokens_used=tokens_used,
        cost=cost,
    )
    return {"status": "logged"}