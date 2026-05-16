"""PostgreSQL database layer using SQLAlchemy."""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    create_engine,
    select,
    update,
    delete,
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

from app.config import settings

logger = logging.getLogger(__name__)


class Base(DeclarativeBase):
    """Base class for all models."""

    pass


class Profile(Base):
    """User profile table."""

    __tablename__ = "profiles"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255))
    avatar_url: Mapped[str | None] = mapped_column(Text)
    subscription_tier: Mapped[str] = mapped_column(String(50), default="free")
    subscription_status: Mapped[str] = mapped_column(String(50), default="active")
    stripe_customer_id: Mapped[str | None] = mapped_column(String(255))
    stripe_subscription_id: Mapped[str | None] = mapped_column(String(255))
    monthly_resume_limit: Mapped[int] = mapped_column(Integer, default=3)
    monthly_resume_used: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )


class Resume(Base):
    """Resume table."""

    __tablename__ = "resumes"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[dict] = mapped_column(JSON, nullable=False)
    file_url: Mapped[str | None] = mapped_column(Text)
    is_master: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )


class Job(Base):
    """Job description table."""

    __tablename__ = "jobs"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Improvement(Base):
    """Improvement results table."""

    __tablename__ = "improvements"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    resume_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True))
    job_id: Mapped[UUID | None] = mapped_column(PGUUID(as_uuid=True))
    diff_content: Mapped[dict] = mapped_column(JSON, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    llm_provider: Mapped[str | None] = mapped_column(String(50))
    llm_cost: Mapped[float] = mapped_column(Numeric(10, 6), default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class UsageLog(Base):
    """Usage tracking table."""

    __tablename__ = "usage_logs"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    action_type: Mapped[str] = mapped_column(String(50), nullable=False)
    llm_provider: Mapped[str | None] = mapped_column(String(50))
    tokens_used: Mapped[int | None] = mapped_column(Integer)
    cost: Mapped[float] = mapped_column(Numeric(10, 6), default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class UserApiKey(Base):
    """User-provided API keys table."""

    __tablename__ = "user_api_keys"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), nullable=False)
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    encrypted_key: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )


class Database:
    """PostgreSQL database wrapper using SQLAlchemy."""

    _instance = None
    _engine = None
    _async_engine = None
    _session_maker = None
    _async_session_maker = None
    _master_resume_lock = asyncio.Lock()

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, db_url: str | None = None):
        if self._engine is not None:
            return

        database_url = db_url or settings.database_url
        if not database_url:
            raise ValueError("DATABASE_URL environment variable is required")

        # Sync engine for some operations
        self._engine = create_engine(database_url.replace("postgresql://", "postgresql+psycopg2://"), pool_pre_ping=True)

        # Async engine for better performance
        async_url = database_url.replace("postgresql://", "postgresql+asyncpg://")
        self._async_engine = create_async_engine(async_url, pool_pre_ping=True, pool_size=10, max_overflow=20)

        self._session_maker = sessionmaker(bind=self._engine, expire_on_commit=False)
        self._async_session_maker = async_sessionmaker(bind=self._async_engine, expire_on_commit=False)

    def create_tables(self) -> None:
        """Create all tables."""
        Base.metadata.create_all(self._engine)
        logger.info("Database tables created")

    @property
    def session(self):
        """Sync session."""
        return self._session_maker()

    @property
    def async_session(self):
        """Async session."""
        return self._async_session_maker()

    def close(self) -> None:
        """Close database connections."""
        if self._engine:
            self._engine.dispose()
        if self._async_engine:
            self._async_engine.dispose()
        logger.info("Database connections closed")

    # Profile operations
    def get_profile(self, user_id: UUID) -> Profile | None:
        """Get profile by user ID."""
        with self.session as session:
            return session.get(Profile, user_id)

    def create_profile(self, user_id: UUID, email: str, full_name: str | None = None, avatar_url: str | None = None) -> Profile:
        """Create a new profile."""
        profile = Profile(id=user_id, email=email, full_name=full_name, avatar_url=avatar_url)
        with self.session as session:
            session.add(profile)
            session.commit()
            session.refresh(profile)
        return profile

    def update_profile(self, user_id: UUID, **kwargs) -> Profile | None:
        """Update profile fields."""
        with self.session as session:
            profile = session.get(Profile, user_id)
            if not profile:
                return None
            for key, value in kwargs.items():
                if hasattr(profile, key):
                    setattr(profile, key, value)
            session.commit()
            session.refresh(profile)
            return profile

    def check_usage_limit(self, user_id: UUID) -> tuple[bool, int, int]:
        """Check if user has available usage quota."""
        with self.session as session:
            profile = session.get(Profile, user_id)
            if not profile:
                return False, 0, 0

            if profile.subscription_tier == "free":
                limit = profile.monthly_resume_limit
                used = profile.monthly_resume_used
                return used < limit, limit, used

            return True, -1, 0  # Unlimited for paid tiers

    def increment_usage(self, user_id: UUID) -> None:
        """Increment monthly usage count."""
        with self.session as session:
            profile = session.get(Profile, user_id)
            if profile:
                profile.monthly_resume_used += 1
                session.commit()

    # Resume operations
    def create_resume(
        self,
        user_id: UUID,
        title: str,
        content: dict,
        file_url: str | None = None,
        is_master: bool = False,
    ) -> Resume:
        """Create a new resume."""
        resume = Resume(user_id=user_id, title=title, content=content, file_url=file_url, is_master=is_master)
        with self.session as session:
            if is_master:
                # Unset any existing master
                session.execute(update(Resume).where(Resume.user_id == user_id, Resume.is_master == True).values(is_master=False))
            session.add(resume)
            session.commit()
            session.refresh(resume)
        return resume

    async def create_resume_atomic_master(
        self,
        user_id: UUID,
        title: str,
        content: dict,
        file_url: str | None = None,
    ) -> Resume:
        """Create a new resume with atomic master assignment."""
        async with self._async_session_maker() as session:
            async with self._master_resume_lock:
                # Check for existing master
                result = await session.execute(
                    select(Resume).where(Resume.user_id == user_id, Resume.is_master == True)
                )
                existing_master = result.scalar_one_or_none()

                is_master = existing_master is None

                # If existing master is stuck, reset it
                if existing_master:
                    # Could add logic here for failed states
                    pass

                resume = Resume(user_id=user_id, title=title, content=content, file_url=file_url, is_master=is_master)
                if is_master:
                    # Unset any existing master
                    await session.execute(
                        update(Resume).where(Resume.user_id == user_id, Resume.is_master == True).values(is_master=False)
                    )

                session.add(resume)
                await session.commit()
                await session.refresh(resume)
                return resume

    def get_resume(self, resume_id: UUID, user_id: UUID) -> Resume | None:
        """Get resume by ID (with user validation)."""
        with self.session as session:
            return session.get(Resume, resume_id)

    def get_master_resume(self, user_id: UUID) -> Resume | None:
        """Get the master resume for a user."""
        with self.session as session:
            result = session.execute(
                select(Resume).where(Resume.user_id == user_id, Resume.is_master == True)
            )
            return result.scalar_one_or_none()

    def update_resume(self, resume_id: UUID, user_id: UUID, **kwargs) -> Resume | None:
        """Update resume by ID (with user validation)."""
        with self.session as session:
            resume = session.get(Resume, resume_id)
            if not resume or resume.user_id != user_id:
                return None
            for key, value in kwargs.items():
                if hasattr(resume, key):
                    setattr(resume, key, value)
            session.commit()
            session.refresh(resume)
            return resume

    def delete_resume(self, resume_id: UUID, user_id: UUID) -> bool:
        """Delete resume by ID (with user validation)."""
        with self.session as session:
            resume = session.get(Resume, resume_id)
            if not resume or resume.user_id != user_id:
                return False
            session.delete(resume)
            session.commit()
            return True

    def list_resumes(self, user_id: UUID) -> list[Resume]:
        """List all resumes for a user."""
        with self.session as session:
            result = session.execute(select(Resume).where(Resume.user_id == user_id))
            return list(result.scalars().all())

    def set_master_resume(self, resume_id: UUID, user_id: UUID) -> bool:
        """Set a resume as master, unsetting any existing master."""
        with self.session as session:
            resume = session.get(Resume, resume_id)
            if not resume or resume.user_id != user_id:
                return False

            # Unset current master
            session.execute(update(Resume).where(Resume.user_id == user_id, Resume.is_master == True).values(is_master=False))

            # Set new master
            resume.is_master = True
            session.commit()
            return True

    # Job operations
    def create_job(self, user_id: UUID, title: str, content: str) -> Job:
        """Create a new job description."""
        job = Job(user_id=user_id, title=title, content=content)
        with self.session as session:
            session.add(job)
            session.commit()
            session.refresh(job)
        return job

    def get_job(self, job_id: UUID, user_id: UUID) -> Job | None:
        """Get job by ID (with user validation)."""
        with self.session as session:
            return session.get(Job, job_id)

    def list_jobs(self, user_id: UUID) -> list[Job]:
        """List all jobs for a user."""
        with self.session as session:
            result = session.execute(select(Job).where(Job.user_id == user_id))
            return list(result.scalars().all())

    def delete_job(self, job_id: UUID, user_id: UUID) -> bool:
        """Delete job by ID (with user validation)."""
        with self.session as session:
            job = session.get(Job, job_id)
            if not job or job.user_id != user_id:
                return False
            session.delete(job)
            session.commit()
            return True

    # Improvement operations
    def create_improvement(
        self,
        user_id: UUID,
        resume_id: UUID,
        job_id: UUID,
        diff_content: dict,
        llm_provider: str | None = None,
        llm_cost: float = 0,
    ) -> Improvement:
        """Create an improvement result."""
        improvement = Improvement(
            user_id=user_id,
            resume_id=resume_id,
            job_id=job_id,
            diff_content=diff_content,
            llm_provider=llm_provider,
            llm_cost=llm_cost,
        )
        with self.session as session:
            session.add(improvement)
            session.commit()
            session.refresh(improvement)
        return improvement

    def get_improvement(self, improvement_id: UUID, user_id: UUID) -> Improvement | None:
        """Get improvement by ID (with user validation)."""
        with self.session as session:
            result = session.execute(
                select(Improvement).where(Improvement.id == improvement_id, Improvement.user_id == user_id)
            )
            return result.scalar_one_or_none()

    def list_improvements(self, user_id: UUID, resume_id: UUID | None = None) -> list[Improvement]:
        """List improvements for a user."""
        with self.session as session:
            query = select(Improvement).where(Improvement.user_id == user_id)
            if resume_id:
                query = query.where(Improvement.resume_id == resume_id)
            result = session.execute(query)
            return list(result.scalars().all())

    def update_improvement_status(self, improvement_id: UUID, user_id: UUID, status: str) -> bool:
        """Update improvement status."""
        with self.session as session:
            result = session.execute(
                update(Improvement).where(Improvement.id == improvement_id, Improvement.user_id == user_id).values(status=status)
            )
            session.commit()
            return result.rowcount > 0

    # Usage logging
    def log_usage(
        self,
        user_id: UUID,
        action_type: str,
        llm_provider: str | None = None,
        tokens_used: int | None = None,
        cost: float = 0,
    ) -> UsageLog:
        """Log an action for usage tracking."""
        log = UsageLog(user_id=user_id, action_type=action_type, llm_provider=llm_provider, tokens_used=tokens_used, cost=cost)
        with self.session as session:
            session.add(log)
            session.commit()
            session.refresh(log)
        return log

    # User API keys
    def save_user_api_key(self, user_id: UUID, provider: str, encrypted_key: str) -> UserApiKey:
        """Save or update user's API key."""
        with self.session as session:
            # Check existing
            result = session.execute(
                select(UserApiKey).where(UserApiKey.user_id == user_id, UserApiKey.provider == provider)
            )
            existing = result.scalar_one_or_none()

            if existing:
                existing.encrypted_key = encrypted_key
                session.commit()
                session.refresh(existing)
                return existing

            key = UserApiKey(user_id=user_id, provider=provider, encrypted_key=encrypted_key)
            session.add(key)
            session.commit()
            session.refresh(key)
            return key

    def get_user_api_key(self, user_id: UUID, provider: str) -> UserApiKey | None:
        """Get user's API key for a provider."""
        with self.session as session:
            result = session.execute(
                select(UserApiKey).where(UserApiKey.user_id == user_id, UserApiKey.provider == provider)
            )
            return result.scalar_one_or_none()

    def delete_user_api_key(self, user_id: UUID, provider: str) -> bool:
        """Delete user's API key for a provider."""
        with self.session as session:
            result = session.execute(
                delete(UserApiKey).where(UserApiKey.user_id == user_id, UserApiKey.provider == provider)
            )
            session.commit()
            return result.rowcount > 0

    # Stats
    def get_stats(self, user_id: UUID) -> dict[str, Any]:
        """Get database statistics for a user."""
        with self.session as session:
            resume_count = session.execute(select(Resume).where(Resume.user_id == user_id)).scalar()
            job_count = session.execute(select(Job).where(Job.user_id == user_id)).scalar()
            improvement_count = session.execute(select(Improvement).where(Improvement.user_id == user_id)).scalar()
            has_master = session.execute(
                select(Resume).where(Resume.user_id == user_id, Resume.is_master == True)
            ).scalar_one_or_none() is not None

            return {
                "total_resumes": resume_count,
                "total_jobs": job_count,
                "total_improvements": improvement_count,
                "has_master_resume": has_master,
            }


# Global database instance
db = Database()


def create_sessionmaker(bind=None):
    """Create a session maker."""
    from sqlalchemy.orm import sessionmaker

    return sessionmaker(bind=bind, expire_on_commit=False)


def create_async_sessionmaker(bind=None):
    """Create an async session maker."""
    return async_sessionmaker(bind=bind, expire_on_commit=False)