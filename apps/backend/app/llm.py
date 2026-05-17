"""LiteLLM wrapper for DeepSeek/MiniMax AI support."""

import json
import logging
import re
import threading
from typing import Any, Literal

import litellm
from litellm import Router
from litellm.router import RetryPolicy
from pydantic import BaseModel

from app.config import settings

LITELLM_LOGGER_NAMES = ("LiteLLM", "LiteLLM Router", "LiteLLM Proxy")


def _configure_litellm_logging() -> None:
    """Align LiteLLM logger levels with application settings."""
    numeric_level = getattr(logging, settings.log_llm, logging.WARNING)
    for logger_name in LITELLM_LOGGER_NAMES:
        logging.getLogger(logger_name).setLevel(numeric_level)


_configure_litellm_logging()

litellm.drop_params = True
litellm.modify_params = True

LLM_TIMEOUT_HEALTH_CHECK = 30
LLM_TIMEOUT_COMPLETION = 120
LLM_TIMEOUT_JSON = 180

MAX_JSON_EXTRACTION_RECURSION = 10
MAX_JSON_CONTENT_SIZE = 1024 * 1024
DEFAULT_JSON_MAX_TOKENS = 8192


class LLMConfig(BaseModel):
    """LLM configuration model."""

    provider: Literal["deepseek", "minimax"]
    model: str
    api_key: str
    api_base: str | None = None
    reasoning_effort: Literal["minimal", "low", "medium", "high"] | None = None


def get_llm_config() -> LLMConfig:
    """Get current LLM configuration from environment variables."""
    return LLMConfig(
        provider=settings.llm_provider,
        model=settings.llm_model,
        api_key=settings.llm_api_key,
        api_base=settings.llm_api_base,
        reasoning_effort=settings.reasoning_effort if hasattr(settings, 'reasoning_effort') else None,
    )


def get_model_name(config: LLMConfig) -> str:
    """Convert to LiteLLM format."""
    return f"{config.provider}/{config.model}"


_router: Router | None = None
_router_config_key: str = ""
_router_lock = threading.Lock()


def _config_fingerprint(config: LLMConfig) -> str:
    """Generate a fingerprint to detect config changes."""
    key_hash = hash(config.api_key) if config.api_key else 0
    return f"{config.provider}|{config.model}|{key_hash}|{config.api_base}"


def _build_router(config: LLMConfig) -> Router:
    """Build a LiteLLM Router with error-type retry policies."""
    model_name = get_model_name(config)

    litellm_params: dict[str, Any] = {"model": model_name}
    if config.api_key:
        litellm_params["api_key"] = config.api_key
    if config.api_base:
        litellm_params["api_base"] = config.api_base

    return Router(
        model_list=[
            {
                "model_name": "primary",
                "litellm_params": litellm_params,
            }
        ],
        num_retries=3,
        retry_policy=RetryPolicy(
            AuthenticationErrorRetries=0,
            BadRequestErrorRetries=0,
            TimeoutErrorRetries=2,
            RateLimitErrorRetries=3,
            ContentPolicyViolationErrorRetries=0,
            InternalServerErrorRetries=2,
        ),
        disable_cooldowns=True,
    )


def get_router(config: LLMConfig | None = None) -> tuple[Router, LLMConfig]:
    """Get or rebuild the LiteLLM Router."""
    global _router, _router_config_key

    if config is None:
        config = get_llm_config()

    key = _config_fingerprint(config)
    with _router_lock:
        if _router is None or _router_config_key != key:
            _router = _build_router(config)
            _router_config_key = key
            logging.info("LiteLLM Router rebuilt for %s/%s", config.provider, config.model)
        router = _router

    return router, config


def _extract_text_parts(value: Any, depth: int = 0, max_depth: int = 10) -> list[str]:
    """Recursively extract text segments from nested response structures."""
    if depth >= max_depth:
        return []

    if isinstance(value, str):
        return [value] if value else []
    if isinstance(value, list):
        result = []
        for item in value:
            result.extend(_extract_text_parts(item, depth + 1, max_depth))
        return result
    if isinstance(value, dict):
        for key in ("text", "content", "value"):
            if key in value:
                return _extract_text_parts(value[key], depth + 1, max_depth)
        for v in value.values():
            parts = _extract_text_parts(v, depth + 1, max_depth)
            if parts:
                return parts
    if hasattr(value, "content"):
        return _extract_text_parts(value.content, depth + 1, max_depth)
    if hasattr(value, "text"):
        return _extract_text_parts(value.text, depth + 1, max_depth)

    return []


def _join_text_parts(parts: list[str]) -> str | None:
    """Join text parts into a single string."""
    if not parts:
        return None
    return "\n".join(parts).strip() or None


def _safe_get(obj: Any, key: str, default: Any = None) -> Any:
    """Safely get attribute or dict key."""
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def _extract_choice_text(choice: Any) -> str | None:
    """Extract text content from a completion choice."""
    msg = _safe_get(choice, "message")
    if msg is None:
        return None

    primary = _join_text_parts(_extract_text_parts(_safe_get(msg, "content")))
    if primary:
        return primary

    reasoning = (
        _join_text_parts(_extract_text_parts(_safe_get(msg, "reasoning_content")))
        or _join_text_parts(_extract_text_parts(_safe_get(msg, "thinking")))
    )
    return reasoning


_SECRET_PATTERNS = [
    re.compile(r"sk-[a-zA-Z0-9]{20,}"),
    re.compile(r"[a-zA-Z0-9]{32,}"),
]


def _scrub_secrets(text: str) -> str:
    """Redact API-key-like strings from error messages."""
    for pattern in _SECRET_PATTERNS:
        text = pattern.sub("[REDACTED]", text)
    return text


def _to_code_block(value: str | None) -> str | None:
    """Wrap value in markdown code block for display."""
    if value is None:
        return None
    return f"```\n{value}\n```"


async def check_llm_health(
    config: LLMConfig | None = None,
    *,
    include_details: bool = False,
    test_prompt: str | None = None,
) -> dict[str, Any]:
    """Check if the LLM provider is accessible and working."""
    if config is None:
        config = get_llm_config()

    if not config.api_key:
        return {
            "healthy": False,
            "provider": config.provider,
            "model": config.model,
            "error_code": "api_key_missing",
        }

    model_name = get_model_name(config)
    prompt = test_prompt or "Hi"

    try:
        kwargs: dict[str, Any] = {
            "model": model_name,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 64,
            "api_key": config.api_key,
            "timeout": LLM_TIMEOUT_HEALTH_CHECK,
        }
        if config.api_base:
            kwargs["api_base"] = config.api_base
        if config.reasoning_effort:
            kwargs["reasoning_effort"] = config.reasoning_effort

        response = await litellm.acompletion(**kwargs)
        content = _extract_choice_text(response.choices[0])
        if not content:
            logging.warning(
                "LLM health check returned empty content",
                extra={"provider": config.provider, "model": config.model},
            )
            result: dict[str, Any] = {
                "healthy": False,
                "provider": config.provider,
                "model": config.model,
                "error_code": "empty_content",
                "message": "LLM returned empty response",
            }
            if include_details:
                result["test_prompt"] = _to_code_block(prompt)
                result["model_output"] = _to_code_block(None)
            return result

        result = {
            "healthy": True,
            "provider": config.provider,
            "model": config.model,
            "response_model": response.model if response else None,
        }
        if include_details:
            result["test_prompt"] = _to_code_block(prompt)
            result["model_output"] = _to_code_block(content)
        return result
    except Exception as e:
        logging.exception(
            "LLM health check failed",
            extra={"provider": config.provider, "model": config.model},
        )

        error_code = "health_check_failed"
        message = str(e)
        if "404" in message:
            error_code = "not_found_404"
        elif "<!doctype html" in message.lower() or "<html" in message.lower():
            error_code = "html_response"

        result = {
            "healthy": False,
            "provider": config.provider,
            "model": config.model,
            "error_code": error_code,
        }
        if include_details:
            result["test_prompt"] = _to_code_block(prompt)
            result["model_output"] = _to_code_block(None)
            result["error_detail"] = _to_code_block(_scrub_secrets(message))
        return result


def _supports_temperature(model_name: str, temperature: float) -> bool:
    """Check if model supports temperature parameter."""
    if "claude-3-opus-4" in model_name or "kimi-k2.6" in model_name:
        return temperature > 0
    return True


def _get_retry_temperature(model_name: str, attempt: int) -> float | None:
    """Get temperature for retry attempts."""
    if attempt == 0:
        return None
    return 0.7 + (attempt * 0.1)


def _calculate_timeout(operation: str, max_tokens: int, provider: str) -> int:
    """Calculate adaptive timeout based on operation and parameters."""
    base_timeouts = {
        "health_check": LLM_TIMEOUT_HEALTH_CHECK,
        "completion": LLM_TIMEOUT_COMPLETION,
        "json": LLM_TIMEOUT_JSON,
    }
    base = base_timeouts.get(operation, LLM_TIMEOUT_COMPLETION)
    token_factor = max(1.0, max_tokens / 4096)
    return int(base * token_factor)


def _strip_thinking_tags(content: str) -> str:
    """Strip thinking/reasoning tags from model output."""
    stripped = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL)
    stripped = re.sub(r"<think>.*", "", stripped, flags=re.DOTALL)
    return stripped.strip()


def _appears_truncated(result: dict, schema_type: str) -> bool:
    """Detect if parsed JSON appears to be truncated."""
    if schema_type == "resume":
        for key in ("workExperience", "education", "skills", "summary"):
            if key in result:
                value = result[key]
                if isinstance(value, list) and len(value) > 0:
                    last_item = value[-1]
                    if isinstance(last_item, dict):
                        for v in last_item.values():
                            if isinstance(v, str) and not v.endswith((".", "!", "?", '"')):
                                return True
    return False


def _extract_json(content: str, _depth: int = 0) -> str:
    """Extract JSON from LLM response."""
    if _depth > MAX_JSON_EXTRACTION_RECURSION:
        raise ValueError(f"JSON extraction exceeded max recursion depth: {_depth}")
    if len(content) > MAX_JSON_CONTENT_SIZE:
        raise ValueError(f"Content too large for JSON extraction: {len(content)} bytes")

    original = content

    if "<think>" in content:
        content = _strip_thinking_tags(content)

    if "```json" in content:
        content = content.split("```json")[1].split("```")[0]
    elif "```" in content:
        parts = content.split("```")
        if len(parts) >= 2:
            content = parts[1]
            if content.startswith(("json", "JSON")):
                content = content[4:]

    content = content.strip()

    if content.startswith("{"):
        depth = 0
        end_idx = -1
        in_string = False
        escape_next = False

        for i, char in enumerate(content):
            if escape_next:
                escape_next = False
                continue
            if char == "\\":
                escape_next = True
                continue
            if char == '"' and not escape_next:
                in_string = not in_string
                continue
            if in_string:
                continue
            if char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    end_idx = i
                    break

        if end_idx == -1 and depth != 0:
            logging.warning(
                "JSON extraction found unbalanced braces (depth=%d), possible truncation",
                depth,
            )

        if end_idx != -1:
            return content[: end_idx + 1]

    start_idx = content.find("{")
    if start_idx > 0:
        return _extract_json(content[start_idx:], _depth + 1)

    logging.error(
        "Could not extract JSON from response format. Content preview: %s",
        content[:200] if content else "<empty>",
    )
    raise ValueError(f"No JSON found in response: {original[:200]}")


async def complete(
    prompt: str,
    system_prompt: str | None = None,
    config: LLMConfig | None = None,
    max_tokens: int = 4096,
    temperature: float = 0.7,
) -> str:
    """Make a completion request to the LLM."""
    router, config = get_router(config)

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    try:
        kwargs: dict[str, Any] = {
            "model": "primary",
            "messages": messages,
            "max_tokens": max_tokens,
            "timeout": _calculate_timeout("completion", max_tokens, config.provider),
        }
        if _supports_temperature(get_model_name(config), temperature):
            kwargs["temperature"] = temperature
        if config.reasoning_effort:
            kwargs["reasoning_effort"] = config.reasoning_effort

        response = await router.acompletion(**kwargs)
        content = _extract_choice_text(response.choices[0])
        if not content:
            raise ValueError("Empty response from LLM")
        if "<think>" in content:
            content = _strip_thinking_tags(content)
            if not content:
                raise ValueError("Response contained only thinking content, no output")
        return content
    except Exception as e:
        logging.error(f"LLM completion failed: {e}")
        raise ValueError(
            "LLM completion failed. Please check your API configuration and try again."
        ) from e


def _supports_json_mode(model_name: str) -> bool:
    """Check if model supports JSON mode."""
    return True


async def complete_json(
    prompt: str,
    system_prompt: str | None = None,
    config: LLMConfig | None = None,
    max_tokens: int = 4096,
    retries: int = 2,
    schema_type: str = "resume",
) -> dict[str, Any]:
    """Make a completion request expecting JSON response."""
    router, config = get_router(config)
    model_name = get_model_name(config)

    json_system = (
        system_prompt or ""
    ) + "\n\nYou must respond with valid JSON only. No explanations, no markdown."
    messages = [
        {"role": "system", "content": json_system},
        {"role": "user", "content": prompt},
    ]

    use_json_mode = _supports_json_mode(model_name)
    json_mode_failed = False

    for attempt in range(retries + 1):
        try:
            kwargs: dict[str, Any] = {
                "model": "primary",
                "messages": messages,
                "max_tokens": max_tokens,
                "timeout": _calculate_timeout("json", max_tokens, config.provider),
            }
            retry_temp = _get_retry_temperature(model_name, attempt)
            if retry_temp is not None:
                kwargs["temperature"] = retry_temp
            if config.reasoning_effort:
                kwargs["reasoning_effort"] = config.reasoning_effort

            if use_json_mode and not json_mode_failed:
                kwargs["response_format"] = {"type": "json_object"}

            response = await router.acompletion(**kwargs)
            content = _extract_choice_text(response.choices[0])

            if not content:
                raise ValueError("Empty response from LLM")

            logging.debug(f"LLM response (attempt {attempt + 1}): {content[:300]}")

            json_str = _extract_json(content)
            result = json.loads(json_str)

            if isinstance(result, dict) and _appears_truncated(result, schema_type):
                if attempt < retries:
                    logging.warning(
                        "Parsed JSON appears truncated (attempt %d/%d), retrying",
                        attempt + 1,
                        retries + 1,
                    )
                    messages.append(
                        {
                            "role": "user",
                            "content": f"The previous response was truncated. Please provide the COMPLETE JSON object with ALL keys. Do not truncate.\n\nIMPORTANT: Output the COMPLETE JSON object with ALL keys. Do not truncate.",
                        }
                    )
                    continue
                else:
                    logging.warning("JSON appears truncated after all retries")

            return result

        except json.JSONDecodeError as e:
            logging.warning(
                "Failed to parse JSON (attempt %d/%d): %s",
                attempt + 1,
                retries + 1,
                str(e)[:200],
            )
            if attempt < retries:
                messages.append(
                    {
                        "role": "user",
                        "content": f"The previous response was not valid JSON: {str(e)[:100]}. Please respond with valid JSON only.",
                    }
                )
                continue
            raise ValueError(f"Failed to parse JSON after {retries + 1} attempts: {e}") from e

        except ValueError as e:
            if "Empty response" in str(e) or "No JSON found" in str(e):
                logging.warning(
                    "JSON extraction failed (attempt %d/%d): %s",
                    attempt + 1,
                    retries + 1,
                    str(e)[:200],
                )
                if attempt < retries:
                    messages.append(
                        {
                            "role": "user",
                            "content": f"Previous response format error: {str(e)[:100]}. Please respond with valid JSON only.",
                        }
                    )
                    continue
            raise
        except Exception as e:
            if attempt < retries and "response_format" in str(e).lower():
                json_mode_failed = True
                logging.warning("JSON mode failed, falling back to prompt-only: %s", e)
                continue
            raise

    raise ValueError(f"Failed to get valid JSON after {retries + 1} attempts")


def get_safe_max_tokens(requested: int, model_name: str | None = None) -> int:
    """Clamp requested max_tokens to model's actual capacity."""
    model_limits = {
        "deepseek-chat": 8192,
        "deepseek-coder": 8192,
        "minimax": 8192,
    }
    limit = 8192
    if model_name:
        for key, value in model_limits.items():
            if key in model_name:
                limit = value
                break
    return min(requested, limit)
