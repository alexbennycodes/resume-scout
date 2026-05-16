"""Authentication middleware for Supabase JWT verification."""

import logging
from typing import Callable
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from supabase import create_client
from supabase.client import Client as SupabaseClient

from app.config import settings

logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer(auto_error=False)

# Supabase client cache
_supabase_client: SupabaseClient | None = None


def get_supabase_client() -> SupabaseClient:
    """Get or create Supabase client."""
    global _supabase_client
    if _supabase_client is None:
        if not settings.supabase_url or not settings.supabase_anon_key:
            raise ValueError("Supabase URL andAnon Key must be configured")
        _supabase_client = create_client(settings.supabase_url, settings.supabase_anon_key)
    return _supabase_client


class AuthUser:
    """Authenticated user object."""

    def __init__(self, user_id: UUID, email: str, role: str = "authenticated"):
        self.user_id = user_id
        self.email = email
        self.role = role


async def verify_token(token: str) -> dict | None:
    """Verify JWT token from Supabase."""
    if not token:
        return None

    try:
        # Try to verify with Supabase
        client = get_supabase_client()
        user = client.auth.get_user(token)
        if user and user.user:
            return {
                "id": user.user.id,
                "email": user.user.email,
                "role": user.user.role,
            }
    except Exception as e:
        logger.debug(f"Supabase token verification failed: {e}")

        # Fallback: Manual JWT verification
        try:
            payload = jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=["HS256", "RS256"],
                audience=settings.supabase_audience,
            )
            return payload
        except JWTError:
            logger.warning(f"JWT verification failed: {e}")

    return None


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> AuthUser:
    """Get current authenticated user from request.

    Extracts token from:
    1. Authorization header (Bearer token)
    2. Cookie (sb-access-token)
    """
    token = None

    # Try Authorization header first
    if credentials:
        token = credentials.credentials
    else:
        # Try cookie
        token = request.cookies.get("sb-access-token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify token
    payload = await verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token",
        )

    return AuthUser(
        user_id=user_uuid,
        email=payload.get("email", ""),
        role=payload.get("role", "authenticated"),
    )


async def get_current_user_optional(
    current_user: AuthUser | None = Depends(get_current_user),
) -> AuthUser | None:
    """Get current user if authenticated, otherwise return None."""
    return current_user


def require_auth(current_user: AuthUser = Depends(get_current_user)) -> AuthUser:
    """Dependency that requires authentication."""
    return current_user


def require_tier(tier: str):
    """Dependency factory that requires a minimum subscription tier."""

    async def check_tier(current_user: AuthUser = Depends(get_current_user)):
        from app.db_postgres import db

        profile = db.get_profile(current_user.user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found",
            )

        tier_hierarchy = {"free": 0, "pro": 1, "pro_plus": 2}
        current_tier_level = tier_hierarchy.get(profile.subscription_tier, 0)
        required_tier_level = tier_hierarchy.get(tier, 0)

        if current_tier_level < required_tier_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires {tier} subscription",
            )

        return current_user

    return check_tier


async def require_usage_quota(current_user: AuthUser = Depends(get_current_user)):
    """Check if user has available quota for the action."""
    from app.db_postgres import db

    has_quota, limit, used = db.check_usage_limit(current_user.user_id)
    if not has_quota:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Monthly limit reached. Upgrade to Pro for unlimited access.",
        )

    return current_user


def create_access_token(data: dict, expires_in: int = 3600) -> str:
    """Create a Supabase-compatible JWT token (for testing)."""
    from datetime import datetime, timedelta

    from jose import jwt

    payload = data.copy()
    expire = datetime.utcnow() + timedelta(seconds=expires_in)
    payload.update({"exp": expire, "iat": datetime.utcnow()})

    return jwt.encode(payload, settings.supabase_jwt_secret, algorithm="HS256")