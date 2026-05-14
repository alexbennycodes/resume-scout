"""Usage tracking service for monitoring API usage and enforcing limits."""

import logging
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from sqlalchemy import select, func

from app.db_postgres import db, UsageLog, Profile

logger = logging.getLogger(__name__)


class UsageTracker:
    """Track and limit user API usage."""

    # Action types
    ACTION_RESUME_TAILOR = "resume_tailor"
    ACTION_COVER_LETTER = "cover_letter"
    ACTION_PDF_EXPORT = "pdf_export"
    ACTION_RESUME_UPLOAD = "resume_upload"
    ACTION_JOB_UPLOAD = "job_upload"

    def __init__(self):
        pass

    def log_action(
        self,
        user_id: UUID,
        action_type: str,
        llm_provider: str | None = None,
        tokens_used: int | None = None,
        cost: float = 0,
    ) -> UsageLog:
        """Log an action for usage tracking."""
        return db.log_usage(
            user_id=user_id,
            action_type=action_type,
            llm_provider=llm_provider,
            tokens_used=tokens_used,
            cost=cost,
        )

    def get_monthly_usage(self, user_id: UUID) -> dict[str, Any]:
        """Get usage statistics for the current month."""
        from datetime import date

        month_start = date.today().replace(day=1)
        month_start_dt = datetime(month_start.year, month_start.month, 1, tzinfo=timezone.utc)

        with db.session as session:
            # Count by action type
            result = session.execute(
                select(UsageLog.action_type, func.count(UsageLog.id))
                .where(UsageLog.user_id == user_id, UsageLog.created_at >= month_start_dt)
                .group_by(UsageLog.action_type)
            )
            action_counts = {row[0]: row[1] for row in result}

            # Total cost
            result = session.execute(
                select(func.coalesce(func.sum(UsageLog.cost), 0))
                .where(UsageLog.user_id == user_id, UsageLog.created_at >= month_start_dt)
            )
            total_cost = float(result.scalar() or 0)

            # Total tokens
            result = session.execute(
                select(func.coalesce(func.sum(UsageLog.tokens_used), 0))
                .where(UsageLog.user_id == user_id, UsageLog.created_at >= month_start_dt)
            )
            total_tokens = int(result.scalar() or 0)

        return {
            "action_counts": action_counts,
            "total_cost": total_cost,
            "total_tokens": total_tokens,
            "month": f"{month_start.year}-{month_start.month:02d}",
        }

    def check_limit(self, user_id: UUID, action_type: str) -> tuple[bool, str, dict[str, Any]]:
        """Check if user has reached their limit for an action.

        Returns:
            (allowed: bool, message: str, usage: dict)
        """
        profile = db.get_profile(user_id)
        if not profile:
            return False, "User profile not found", {}

        usage = self.get_monthly_usage(user_id)
        action_count = usage["action_counts"].get(action_type, 0)

        # Get limits based on tier
        limits = self.get_tier_limits(profile.subscription_tier)

        if action_type == self.ACTION_RESUME_TAILOR:
            limit = limits["resume_tailor"]
            if limit != float("inf") and action_count >= limit:
                return False, f"Monthly limit reached. Upgrade to Pro for unlimited tailoring.", usage

        elif action_type == self.ACTION_RESUME_UPLOAD:
            limit = limits["resume_upload"]
            if limit != float("inf") and action_count >= limit:
                return False, f"Resume limit reached. Upgrade to Pro for more resumes.", usage

        elif action_type == self.ACTION_COVER_LETTER:
            if not limits["cover_letters"]:
                return False, "Cover letters require Pro subscription.", usage

        return True, "", usage

    def get_tier_limits(self, tier: str) -> dict[str, Any]:
        """Get usage limits for a subscription tier."""
        limits = {
            "free": {
                "resume_tailor": 3,
                "resume_upload": 1,
                "cover_letters": False,
                "pdf_export": float("inf"),
            },
            "pro": {
                "resume_tailor": float("inf"),
                "resume_upload": 5,
                "cover_letters": True,
                "pdf_export": float("inf"),
            },
            "pro_plus": {
                "resume_tailor": float("inf"),
                "resume_upload": float("inf"),
                "cover_letters": True,
                "pdf_export": float("inf"),
            },
        }
        return limits.get(tier, limits["free"])

    def get_usage_summary(self, user_id: UUID) -> dict[str, Any]:
        """Get a complete usage summary for a user."""
        profile = db.get_profile(user_id)
        if not profile:
            return {"error": "Profile not found"}

        monthly_usage = self.get_monthly_usage(user_id)
        limits = self.get_tier_limits(profile.subscription_tier)

        return {
            "tier": profile.subscription_tier,
            "status": profile.subscription_status,
            "monthly_limits": limits,
            "current_usage": monthly_usage,
            "remaining": {
                "resume_tailor": (
                    "unlimited"
                    if limits["resume_tailor"] == float("inf")
                    else max(0, limits["resume_tailor"] - monthly_usage["action_counts"].get(self.ACTION_RESUME_TAILOR, 0))
                ),
                "resumes": (
                    "unlimited"
                    if limits["resume_upload"] == float("inf")
                    else max(0, limits["resume_upload"] - monthly_usage["action_counts"].get(self.ACTION_RESUME_UPLOAD, 0))
                ),
            },
        }


# Global instance
usage_tracker = UsageTracker()