"""Health check and status endpoints."""

from fastapi import APIRouter

from app.database import db
from app.schemas import HealthResponse, StatusResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Lightweight liveness check for Docker HEALTHCHECK."""
    return HealthResponse(status="healthy")


@router.get("/status", response_model=StatusResponse)
async def get_status() -> StatusResponse:
    """Get comprehensive application status."""
    db_stats = db.get_stats()

    return StatusResponse(
        status="ready" if db_stats["has_master_resume"] else "setup_required",
        has_master_resume=db_stats["has_master_resume"],
        database_stats=db_stats,
    )
