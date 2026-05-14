"""LLM service with cost tracking for SaaS."""

import json
import logging
from dataclasses import dataclass
from typing import Any

from app.llm import (
    complete,
    complete_json,
    get_llm_config,
    LLMConfig,
    get_model_name,
)
from app.services.usage import UsageTracker
from app.db_postgres import db
from uuid import UUID

logger = logging.getLogger(__name__)

# Pricing per 1M tokens (USD) - DeepSeek rates
DEEPSEEK_PRICING = {
    "deepseek-chat": {"input": 0.27, "output": 1.10},
    "deepseek-reasoner": {"input": 0.55, "output": 2.19},
}

# Fallback pricing for other providers
DEFAULT_PRICING = {
    "input": 0.50,
    "output": 1.50,
}


@dataclass
class LLMResponse:
    """Response from LLM with usage stats."""

    content: str
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0
    cost: float = 0.0
    provider: str = ""
    model: str = ""


def _get_pricing(model_name: str) -> dict[str, float]:
    """Get pricing for a model."""
    for prefix, pricing in DEEPSEEK_PRICING.items():
        if model_name.startswith(prefix):
            return pricing
    return DEFAULT_PRICING


def _calculate_cost(
    input_tokens: int,
    output_tokens: int,
    model_name: str,
) -> float:
    """Calculate cost based on token usage."""
    pricing = _get_pricing(model_name)
    input_cost = (input_tokens / 1_000_000) * pricing["input"]
    output_cost = (output_tokens / 1_000_000) * pricing["output"]
    return round(input_cost + output_cost, 6)


async def complete_with_tracking(
    prompt: str,
    system_prompt: str | None = None,
    config: LLMConfig | None = None,
    max_tokens: int = 4096,
    temperature: float = 0.7,
    user_id: UUID | None = None,
    action_type: str = "llm_complete",
) -> LLMResponse:
    """Complete a text prompt with usage tracking.

    Args:
        prompt: The user prompt
        system_prompt: Optional system prompt
        config: LLM configuration (defaults to app config)
        max_tokens: Max tokens in response
        temperature: Sampling temperature
        user_id: User ID for usage logging (optional)
        action_type: Action type for usage tracking

    Returns:
        LLMResponse with content and usage stats
    """
    if config is None:
        config = get_llm_config()

    model_name = get_model_name(config)

    try:
        content = await complete(
            prompt=prompt,
            system_prompt=system_prompt,
            config=config,
            max_tokens=max_tokens,
            temperature=temperature,
        )

        # Estimate token usage (approximate: 1 token ≈ 4 chars)
        input_tokens = len(prompt) // 4
        output_tokens = len(content) // 4
        total_tokens = input_tokens + output_tokens

        cost = _calculate_cost(input_tokens, output_tokens, model_name)

        # Log usage if user_id provided
        if user_id:
            try:
                db.log_usage(
                    user_id=user_id,
                    action_type=action_type,
                    llm_provider=config.provider,
                    tokens_used=total_tokens,
                    cost=cost,
                )
            except Exception as e:
                logger.warning(f"Failed to log usage: {e}")

        return LLMResponse(
            content=content,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
            cost=cost,
            provider=config.provider,
            model=config.model,
        )

    except Exception as e:
        logger.error(f"LLM completion failed: {e}")
        raise


async def complete_json_with_tracking(
    prompt: str,
    system_prompt: str | None = None,
    config: LLMConfig | None = None,
    max_tokens: int = 4096,
    retries: int = 2,
    schema_type: str = "resume",
    user_id: UUID | None = None,
    action_type: str = "llm_json",
) -> tuple[dict[str, Any], LLMResponse]:
    """Complete a JSON prompt with usage tracking.

    Args:
        prompt: The user prompt
        system_prompt: Optional system prompt
        config: LLM configuration (defaults to app config)
        max_tokens: Max tokens in response
        retries: Number of retries for JSON parsing
        schema_type: Expected schema type for truncation detection
        user_id: User ID for usage logging (optional)
        action_type: Action type for usage tracking

    Returns:
        Tuple of (parsed JSON dict, LLMResponse with usage stats)
    """
    if config is None:
        config = get_llm_config()

    model_name = get_model_name(config)

    try:
        result = await complete_json(
            prompt=prompt,
            system_prompt=system_prompt,
            config=config,
            max_tokens=max_tokens,
            retries=retries,
            schema_type=schema_type,
        )

        # Estimate token usage
        prompt_str = json.dumps({"system": system_prompt, "user": prompt})
        input_tokens = len(prompt_str) // 4
        output_tokens = len(json.dumps(result)) // 4
        total_tokens = input_tokens + output_tokens

        cost = _calculate_cost(input_tokens, output_tokens, model_name)

        # Log usage if user_id provided
        if user_id:
            try:
                db.log_usage(
                    user_id=user_id,
                    action_type=action_type,
                    llm_provider=config.provider,
                    tokens_used=total_tokens,
                    cost=cost,
                )
            except Exception as e:
                logger.warning(f"Failed to log usage: {e}")

        response = LLMResponse(
            content=json.dumps(result),
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
            cost=cost,
            provider=config.provider,
            model=config.model,
        )

        return result, response

    except Exception as e:
        logger.error(f"LLM JSON completion failed: {e}")
        raise


def get_default_config() -> LLMConfig:
    """Get the default LLM configuration for SaaS.

    Uses DeepSeek as the default provider.
    """
    return get_llm_config()