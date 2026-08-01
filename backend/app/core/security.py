"""Security primitives: input sanitization and API-key verification."""

from __future__ import annotations

import re

from fastapi import Header, HTTPException, status

from app.core.config import get_settings

# Strip control characters (except tab/newline) that have no place in user text.
_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def sanitize_text(value: str, *, max_length: int) -> str:
    """Normalise and bound untrusted user input.

    - Removes control characters.
    - Collapses excessive whitespace.
    - Enforces a maximum length to mitigate abuse.
    """

    if not isinstance(value, str):
        raise ValueError("Expected a string value")

    cleaned = _CONTROL_CHARS.sub("", value)
    cleaned = re.sub(r"[ \t]{2,}", " ", cleaned).strip()

    if len(cleaned) > max_length:
        cleaned = cleaned[:max_length]

    return cleaned


async def verify_api_key(
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
) -> None:
    """Optional API-key gate.

    If `APP_API_KEYS` is configured, requests must present a matching key.
    When no keys are configured (local dev) the gate is disabled.
    """

    settings = get_settings()
    if not settings.api_keys:
        return

    if x_api_key is None or x_api_key not in settings.api_keys:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )
