"""Configuration endpoints (features, prompts)."""

import json
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.config import settings
from app.schemas import (
    FeatureConfigRequest,
    FeatureConfigResponse,
    FeaturePromptsRequest,
    FeaturePromptsResponse,
    PromptConfigRequest,
    PromptConfigResponse,
    PromptOption,
    ResetDatabaseRequest,
)
from app.prompts import (
    DEFAULT_IMPROVE_PROMPT_ID,
    IMPROVE_PROMPT_OPTIONS,
    validate_prompt_placeholders,
)
from app.prompts.templates import COVER_LETTER_PROMPT, OUTREACH_MESSAGE_PROMPT
from app.config_cache import invalidate_config_cache
from app.database import db

router = APIRouter(prefix="/config", tags=["Configuration"])


def _get_config_path() -> Path:
    """Get path to config storage file."""
    return settings.config_path


def _load_config() -> dict:
    """Load config from file."""
    path = _get_config_path()
    if path.exists():
        return json.loads(path.read_text())
    return {}


def _save_config(config: dict) -> None:
    """Save config to file and invalidate the resume router's cache."""
    path = _get_config_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(config, indent=2))
    invalidate_config_cache()


def _get_prompt_options() -> list[PromptOption]:
    """Return available prompt options for resume tailoring."""
    return [PromptOption(**option) for option in IMPROVE_PROMPT_OPTIONS]


@router.get("/features", response_model=FeatureConfigResponse)
async def get_feature_config() -> FeatureConfigResponse:
    """Get current feature configuration."""
    stored = _load_config()

    return FeatureConfigResponse(
        enable_cover_letter=stored.get("enable_cover_letter", False),
        enable_outreach_message=stored.get("enable_outreach_message", False),
    )


@router.put("/features", response_model=FeatureConfigResponse)
async def update_feature_config(request: FeatureConfigRequest) -> FeatureConfigResponse:
    """Update feature configuration."""
    stored = _load_config()

    if request.enable_cover_letter is not None:
        stored["enable_cover_letter"] = request.enable_cover_letter
    if request.enable_outreach_message is not None:
        stored["enable_outreach_message"] = request.enable_outreach_message

    _save_config(stored)

    return FeatureConfigResponse(
        enable_cover_letter=stored.get("enable_cover_letter", False),
        enable_outreach_message=stored.get("enable_outreach_message", False),
    )


@router.get("/prompts", response_model=PromptConfigResponse)
async def get_prompt_config() -> PromptConfigResponse:
    """Get current prompt configuration for resume tailoring."""
    stored = _load_config()
    options = _get_prompt_options()
    option_ids = {option.id for option in options}
    default_prompt_id = stored.get("default_prompt_id", DEFAULT_IMPROVE_PROMPT_ID)
    if default_prompt_id not in option_ids:
        default_prompt_id = DEFAULT_IMPROVE_PROMPT_ID

    return PromptConfigResponse(
        default_prompt_id=default_prompt_id,
        prompt_options=options,
    )


@router.put("/prompts", response_model=PromptConfigResponse)
async def update_prompt_config(
    request: PromptConfigRequest,
) -> PromptConfigResponse:
    """Update prompt configuration for resume tailoring."""
    stored = _load_config()
    options = _get_prompt_options()
    option_ids = {option.id for option in options}

    if request.default_prompt_id is not None:
        if request.default_prompt_id not in option_ids:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Unsupported prompt id: "
                    f"{request.default_prompt_id}. Supported: {sorted(option_ids)}"
                ),
            )
        stored["default_prompt_id"] = request.default_prompt_id

    _save_config(stored)

    default_prompt_id = stored.get("default_prompt_id", DEFAULT_IMPROVE_PROMPT_ID)
    if default_prompt_id not in option_ids:
        default_prompt_id = DEFAULT_IMPROVE_PROMPT_ID

    return PromptConfigResponse(
        default_prompt_id=default_prompt_id,
        prompt_options=options,
    )


@router.get("/feature-prompts", response_model=FeaturePromptsResponse)
async def get_feature_prompts() -> FeaturePromptsResponse:
    """Get custom feature prompts (cover letter, outreach message)."""
    stored = _load_config()
    return FeaturePromptsResponse(
        cover_letter_prompt=stored.get("cover_letter_prompt", "") or "",
        outreach_message_prompt=stored.get("outreach_message_prompt", "") or "",
        cover_letter_default=COVER_LETTER_PROMPT,
        outreach_message_default=OUTREACH_MESSAGE_PROMPT,
    )


@router.put("/feature-prompts", response_model=FeaturePromptsResponse)
async def update_feature_prompts(
    request: FeaturePromptsRequest,
) -> FeaturePromptsResponse:
    """Update custom feature prompts."""
    stored = _load_config()

    if request.cover_letter_prompt is not None:
        prompt = request.cover_letter_prompt.strip()
        if prompt:
            missing = validate_prompt_placeholders(prompt)
            if missing:
                raise HTTPException(
                    status_code=422,
                    detail={
                        "code": "missing_placeholders",
                        "field": "cover_letter_prompt",
                        "missing": missing,
                    },
                )
        stored["cover_letter_prompt"] = prompt

    if request.outreach_message_prompt is not None:
        prompt = request.outreach_message_prompt.strip()
        if prompt:
            missing = validate_prompt_placeholders(prompt)
            if missing:
                raise HTTPException(
                    status_code=422,
                    detail={
                        "code": "missing_placeholders",
                        "field": "outreach_message_prompt",
                        "missing": missing,
                    },
                )
        stored["outreach_message_prompt"] = prompt

    _save_config(stored)

    return FeaturePromptsResponse(
        cover_letter_prompt=stored.get("cover_letter_prompt", "") or "",
        outreach_message_prompt=stored.get("outreach_message_prompt", "") or "",
        cover_letter_default=COVER_LETTER_PROMPT,
        outreach_message_default=OUTREACH_MESSAGE_PROMPT,
    )


@router.post("/reset")
async def reset_database_endpoint(request: ResetDatabaseRequest) -> dict:
    """Reset the database and clear all data."""
    if request.confirm != "RESET_ALL_DATA":
        raise HTTPException(
            status_code=400,
            detail="Confirmation required. Pass confirm=RESET_ALL_DATA in request body.",
        )
    db.reset_database()
    return {"message": "Database and all data have been reset successfully"}
