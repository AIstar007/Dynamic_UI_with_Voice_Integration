"""Flight service used by the orchestrator.

Public method signatures are unchanged from the original local-dev stub, but
the search/token work is now delegated to `ProviderEngine`
(`app/services/context_provider.py`), which transparently uses MCP when
enabled and falls back to local data otherwise. Callers of this service never
need to know or care which source answered.
"""

from __future__ import annotations

from typing import List

from app.services.context_provider import ProviderEngine, get_provider_engine


class FlightService:
    def __init__(self, container: object | None = None, engine: ProviderEngine | None = None) -> None:
        self._container = container
        self._engine = engine or get_provider_engine()

    async def ensure_token(self, *, session_id: str, existing: str | None = None) -> str:
        if existing:
            return existing
        return await self._engine.create_token(session_id=session_id)

    async def resolve_route(self, ctx: object, *, auth_token: str, session_id: str) -> None:
        """Naive free-text -> code resolution. Purely local NLU heuristics;
        not an airline-data lookup, so it deliberately stays independent of
        the provider engine."""

        if getattr(ctx, "origin_text", None) and not getattr(ctx, "origin", None):
            txt = ctx.origin_text.strip()
            ctx.origin = txt[:3].upper()
        if getattr(ctx, "destination_text", None) and not getattr(ctx, "destination", None):
            txt = ctx.destination_text.strip()
            ctx.destination = txt[:3].upper()

    async def search(
        self,
        ctx: object,
        *,
        auth_token: str,
        session_id: str,
        top: int = 5,
    ) -> List[dict]:
        origin = getattr(ctx, "origin", None) or "XXX"
        destination = getattr(ctx, "destination", None) or "YYY"
        begin_date = getattr(ctx, "begin_date", None)
        offers = await self._engine.search(
            auth_token=auth_token,
            session_id=session_id,
            origin=origin,
            destination=destination,
            begin_date=begin_date,
            num_adults=getattr(ctx, "adults", 1) or 1,
            end_date=getattr(ctx, "end_date", None),
            num_child=getattr(ctx, "children", 0) or 0,
        )
        return offers[:top]
