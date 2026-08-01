"""Pluggable context providers for airline data (flight search, booking, tokens).

This is the single seam through which the rest of the codebase reaches MCP.
Nothing else — orchestrator, flight_service, container — should ever import
`app.mcp.*` directly. Instead everything talks to `ProviderEngine`, which
decides *how* to answer based on config, not on hardcoded logic scattered
through the workflow.

Design (mirrors the "Context Provider" pattern):

    Workflow
       |
       v
    ProviderEngine.search() / .create_token() / .sell_flight()
       |
       +-- mcp_enabled=True  -> MCPFlightProvider (app/mcp/* clients)
       |        |
       |        +-- on failure/timeout: fall back to LocalFlightProvider,
       |            UNLESS mcp_required=True, in which case the error is
       |            re-raised.
       |
       +-- mcp_enabled=False -> LocalFlightProvider only, MCP is never touched.

Consequences:
  * Delete or disable the entire `app/mcp/` package and the application still
    runs — every workflow (search, booking, token issuance) keeps working off
    LocalFlightProvider.
  * Enable MCP and every workflow automatically gets real airline data with
    zero changes to the orchestrator or API layer.
  * A single config flag (`APP_MCP_ENABLED` / `APP_MCP_REQUIRED`) controls the
    behaviour for the whole app — no per-call wiring needed.
"""

from __future__ import annotations

from typing import Any, Protocol, runtime_checkable

from app.core.config import Settings, get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


@runtime_checkable
class FlightDataProvider(Protocol):
    """Contract every provider (MCP-backed or local) must satisfy."""

    name: str

    async def create_token(self, *, session_id: str) -> str: ...

    async def search(
        self,
        *,
        auth_token: str,
        session_id: str,
        origin: str,
        destination: str,
        begin_date: str,
        num_adults: int,
        end_date: str | None = None,
        num_child: int = 0,
    ) -> list[dict[str, Any]]: ...

    async def sell_flight(
        self,
        *,
        auth_token: str,
        session_id: str,
        journey_key_dep: str,
        fare_key_dep: str,
        adult_count: int,
        children_count: int = 0,
    ) -> dict[str, Any]: ...


# ---------------------------------------------------------------------------
# MCP-backed provider — thin composition over the existing app/mcp/* clients.
# Imported lazily inside __init__ so that importing this module never fails
# even if the `mcp` package/server dependency is absent.
# ---------------------------------------------------------------------------
class MCPFlightProvider:
    name = "mcp"

    def __init__(self, settings: Settings):
        from app.mcp.base_client import MCPClient
        from app.mcp.booking_client import BookingClient
        from app.mcp.flight_search_client import FlightSearchClient
        from app.mcp.token_client import TokenClient

        client = MCPClient(settings)
        self._token = TokenClient(client)
        self._search = FlightSearchClient(client)
        self._booking = BookingClient(client)

    async def create_token(self, *, session_id: str) -> str:
        from app.core.exceptions import MCPError

        data = await self._token.create_token(session_id=session_id)
        token = data.get("token") if isinstance(data, dict) else None
        if not token:
            raise MCPError("MCP get_token returned no usable token")
        return token

    async def search(
        self,
        *,
        auth_token: str,
        session_id: str,
        origin: str,
        destination: str,
        begin_date: str,
        num_adults: int,
        end_date: str | None = None,
        num_child: int = 0,
    ) -> list[dict[str, Any]]:
        data = await self._search.search(
            auth_token=auth_token,
            session_id=session_id,
            origin=origin,
            destination=destination,
            begin_date=begin_date,
            num_adults=num_adults,
            end_date=end_date,
            num_child=num_child,
        )
        offers = data.get("offers") if isinstance(data, dict) else data
        return offers or []

    async def sell_flight(
        self,
        *,
        auth_token: str,
        session_id: str,
        journey_key_dep: str,
        fare_key_dep: str,
        adult_count: int,
        children_count: int = 0,
    ) -> dict[str, Any]:
        return await self._booking.sell_flight(
            auth_token=auth_token,
            session_id=session_id,
            journey_key_dep=journey_key_dep,
            fare_key_dep=fare_key_dep,
            adult_count=adult_count,
            children_count=children_count,
        )


# ---------------------------------------------------------------------------
# Local/offline provider — synthetic but shaped like the real thing, so the
# app is fully demoable and testable with MCP off or unreachable.
# ---------------------------------------------------------------------------
class LocalFlightProvider:
    name = "local"

    async def create_token(self, *, session_id: str) -> str:
        return f"local-token-{session_id}"

    async def search(
        self,
        *,
        auth_token: str,
        session_id: str,
        origin: str,
        destination: str,
        begin_date: str,
        num_adults: int,
        end_date: str | None = None,
        num_child: int = 0,
    ) -> list[dict[str, Any]]:
        return [
            {
                "journeyKey": f"J{i}",
                "fareKey": f"F{i}",
                "price": 3200 + i * 450,
                "origin": origin,
                "destination": destination,
                "begin_date": begin_date,
                "carrier": "6E",
                "flightNumber": f"6E-{100 + i}",
            }
            for i in range(5)
        ]

    async def sell_flight(
        self,
        *,
        auth_token: str,
        session_id: str,
        journey_key_dep: str,
        fare_key_dep: str,
        adult_count: int,
        children_count: int = 0,
    ) -> dict[str, Any]:
        suffix = (session_id or "0000")[-4:].upper().rjust(4, "0")
        return {
            "recordLocator": f"LOC{suffix}",
            "journeyKey_dep": journey_key_dep,
            "fareKey_dep": fare_key_dep,
            "adult_count": adult_count,
            "children_count": children_count,
        }


# ---------------------------------------------------------------------------
# Engine — the only thing the rest of the app should depend on.
# ---------------------------------------------------------------------------
class ProviderEngine:
    def __init__(self, settings: Settings | None = None):
        self._settings = settings or get_settings()
        self._local = LocalFlightProvider()
        self._mcp: FlightDataProvider | None = None
        if self._settings.mcp_enabled:
            try:
                self._mcp = MCPFlightProvider(self._settings)
            except Exception as exc:  # noqa: BLE001 - MCP package/config missing
                logger.warning("mcp_provider_unavailable", error=str(exc))
                if self._settings.mcp_required:
                    raise

    @property
    def active_source(self) -> str:
        return "mcp" if self._mcp is not None else "local"

    async def _call(self, method: str, /, **kwargs: Any) -> Any:
        if self._mcp is not None:
            try:
                return await getattr(self._mcp, method)(**kwargs)
            except Exception as exc:  # noqa: BLE001 - normalise any MCP failure
                if self._settings.mcp_required:
                    raise
                logger.warning("mcp_provider_fallback", method=method, error=str(exc))
        return await getattr(self._local, method)(**kwargs)

    async def create_token(self, *, session_id: str) -> str:
        return await self._call("create_token", session_id=session_id)

    async def search(self, **kwargs: Any) -> list[dict[str, Any]]:
        return await self._call("search", **kwargs)

    async def sell_flight(self, **kwargs: Any) -> dict[str, Any]:
        return await self._call("sell_flight", **kwargs)


_ENGINE: ProviderEngine | None = None


def get_provider_engine() -> ProviderEngine:
    """Process-wide singleton, mirroring get_settings()/get_container()."""

    global _ENGINE
    if _ENGINE is None:
        _ENGINE = ProviderEngine()
    return _ENGINE
