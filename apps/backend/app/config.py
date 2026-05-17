"""Application configuration using pydantic-settings."""

import json
from pathlib import Path
from typing import Any, Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


CONFIG_FILE_PATH = Path(__file__).parent.parent / "data" / "config.json"
ALLOWED_LOG_LEVELS = ("CRITICAL", "ERROR", "WARNING", "INFO", "DEBUG")


def load_config_file() -> dict[str, Any]:
    """Load configuration from config.json file."""
    if CONFIG_FILE_PATH.exists():
        try:
            return json.loads(CONFIG_FILE_PATH.read_text())
        except (json.JSONDecodeError, OSError):
            return {}
    return {}


def save_config_file(config: dict[str, Any]) -> None:
    """Save configuration to config.json file."""
    CONFIG_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
    CONFIG_FILE_PATH.write_text(json.dumps(config, indent=2))


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # LLM Configuration (hardcoded to DeepSeek/MiniMax via env vars)
    llm_provider: Literal["deepseek", "minimax"] = "deepseek"
    llm_model: str = "deepseek-chat"
    llm_api_key: str = ""
    llm_api_base: str | None = None
    log_llm: Literal["CRITICAL", "ERROR", "WARNING", "INFO", "DEBUG"] = "WARNING"

    @field_validator("llm_provider", mode="before")
    @classmethod
    def set_default_provider(cls, v: Any) -> str:
        """Handle empty string provider by defaulting to deepseek."""
        if not v or (isinstance(v, str) and not v.strip()):
            return "deepseek"
        return v

    @field_validator("log_llm", mode="before")
    @classmethod
    def normalize_log_llm_level(cls, v: Any) -> str:
        """Normalize LiteLLM log level from environment values."""
        value = "WARNING" if not v else str(v).strip().upper()
        if value not in ALLOWED_LOG_LEVELS:
            raise ValueError(f"Invalid LOG_LLM: {value}. Allowed: {ALLOWED_LOG_LEVELS}")
        return value

    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = False
    log_level: Literal["CRITICAL", "ERROR", "WARNING", "INFO", "DEBUG"] = "INFO"
    frontend_base_url: str = "http://localhost:3000"

    @field_validator("log_level", mode="before")
    @classmethod
    def normalize_log_level(cls, v: Any) -> str:
        """Normalize application log level from environment values."""
        value = "INFO" if not v else str(v).strip().upper()
        if value not in ALLOWED_LOG_LEVELS:
            raise ValueError(f"Invalid LOG_LEVEL: {value}. Allowed: {ALLOWED_LOG_LEVELS}")
        return value

    # CORS Configuration
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @property
    def effective_cors_origins(self) -> list[str]:
        """CORS origins including frontend_base_url for production deployments."""
        origins = list(self.cors_origins)
        url = self.frontend_base_url.strip().rstrip("/")
        if url and url not in origins:
            origins.append(url)
        return origins

    # Paths
    data_dir: Path = Path(__file__).parent.parent / "data"

    # Database
    database_url: str = ""

    @property
    def db_path(self) -> Path:
        """Path to TinyDB database file."""
        return self.data_dir / "database.json"

    @property
    def config_path(self) -> Path:
        """Path to config storage file."""
        return self.data_dir / "config.json"

    # Supabase Configuration
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_jwt_secret: str = ""
    supabase_audience: str = "authenticated"

    # Stripe Configuration
    stripe_api_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_free_monthly_limit: int = 3


settings = Settings()
