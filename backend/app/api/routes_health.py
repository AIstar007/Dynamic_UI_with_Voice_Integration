"""Health + readiness endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    settings = get_settings()
    return {
        "status": "ok",
        "service": settings.service_name,
        "environment": settings.environment,
    }


@router.get("/ready")
async def ready() -> dict[str, str]:
    # Liveness only; MCP connectivity is validated lazily per-request so a
    # transient MCP outage does not take the whole service out of rotation.
    return {"status": "ready"}
