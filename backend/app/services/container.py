"""Lightweight service container.

Exposes `get_container()` -> `Container`, used by the orchestrator to reach
the booking adapter. The booking adapter itself now delegates to the shared
`ProviderEngine` (MCP when enabled, local fallback otherwise) instead of
hardcoding fake data, so booking automatically benefits from MCP without any
change to callers.
"""

from __future__ import annotations

from typing import Any

from app.services.context_provider import ProviderEngine, get_provider_engine


class _BookingAdapter:
    def __init__(self, engine: ProviderEngine | None = None) -> None:
        self._engine = engine or get_provider_engine()

    async def sell_flight(
        self,
        *,
        auth_token: str,
        session_id: str,
        journey_key_dep: str,
        fare_key_dep: str,
        adult_count: int,
        children_count: int = 0,
        journey_key_arr: str | None = None,
        fare_key_arr: str | None = None,
        promotion_code: str | None = None,
    ) -> Any:
        return await self._engine.sell_flight(
            auth_token=auth_token,
            session_id=session_id,
            journey_key_dep=journey_key_dep,
            fare_key_dep=fare_key_dep,
            adult_count=adult_count,
            children_count=children_count,
        )


class Container:
    def __init__(self) -> None:
        self.booking = _BookingAdapter()


_CONTAINER: Container | None = None


def get_container() -> Container:
    global _CONTAINER
    if _CONTAINER is None:
        _CONTAINER = Container()
    return _CONTAINER
