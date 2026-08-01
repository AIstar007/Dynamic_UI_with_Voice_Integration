"""Conversation orchestrator.

Ties together intent classification, entity extraction, session state, the
flight/booking services and A2UI surface builders into the SSE event stream
consumed by `app/api/routes_chat.py`.

MCP is never called from here directly — all airline data flows through
`FlightService` / `Container.booking`, which themselves sit on top of
`ProviderEngine` (`app/services/context_provider.py`). That means this
orchestrator, and the whole conversational workflow, works identically
whether MCP is enabled, disabled, or unreachable; only the data source behind
the scenes changes.
"""

from __future__ import annotations

from collections.abc import AsyncIterator

from app.a2ui import surfaces
from app.agents import entities as entity_extractor
from app.agents.events import AgentEvent
from app.agents.intent import Intent, classify
from app.core.exceptions import PlatformError
from app.core.logging import get_logger
from app.schemas.conversation import ConversationStage, ConversationState
from app.services.container import Container
from app.services.flight_service import FlightService

logger = get_logger(__name__)


class Orchestrator:
    def __init__(self, container: Container):
        self._container = container
        self._flights = FlightService(container)

    async def handle(
        self,
        state: ConversationState,
        message: str,
        *,
        action: str | None = None,
        action_payload: dict | None = None,
    ) -> AsyncIterator[AgentEvent]:
        state.add_message("user", message)

        try:
            # Explicit UI actions (button presses) short-circuit free-text NLU.
            if action == "book_flight" and action_payload:
                async for event in self._handle_booking(state, action_payload):
                    yield event
                return

            intent = classify(message)

            if intent is Intent.GREETING and not state.search_context.origin_text:
                state.stage = ConversationStage.GREETING
                yield self._surface_event(surfaces.greeting_surface())
                yield AgentEvent(event="done", data={})
                return

            extracted = entity_extractor.extract(message)
            self._merge_entities(state, extracted)

            auth_token = await self._flights.ensure_token(
                session_id=state.conversation_id, existing=state.auth_token
            )
            state.auth_token = auth_token

            await self._flights.resolve_route(
                state.search_context, auth_token=auth_token, session_id=state.conversation_id
            )

            missing = self._next_missing_field(state)
            if missing is not None:
                state.stage = missing
                yield self._surface_event(self._ask_surface(missing, state))
                yield AgentEvent(event="done", data={})
                return

            # All mandatory fields present -> search immediately.
            state.stage = ConversationStage.SEARCHING
            yield self._surface_event(surfaces.loading_surface())

            offers = await self._flights.search(
                state.search_context,
                auth_token=auth_token,
                session_id=state.conversation_id,
            )
            state.stage = ConversationStage.RESULTS
            summary = (
                f"{len(offers)} flights from {state.search_context.origin} to "
                f"{state.search_context.destination} on {state.search_context.begin_date}."
            )
            yield self._surface_event(surfaces.results_surface(offers, summary))
            yield AgentEvent(event="done", data={})

        except PlatformError as exc:
            logger.warning("orchestrator_platform_error", code=exc.code, error=exc.message)
            yield self._surface_event(surfaces.error_surface(exc.message, code=exc.code))
            yield AgentEvent(event="done", data={})
        except Exception as exc:  # noqa: BLE001 - never leak internals to the client
            logger.error("orchestrator_unhandled_error", error=str(exc))
            yield self._surface_event(
                surfaces.error_surface("Something went wrong. Please try again.")
            )
            yield AgentEvent(event="done", data={})

    # ---- Booking ------------------------------------------------------
    async def _handle_booking(
        self, state: ConversationState, payload: dict
    ) -> AsyncIterator[AgentEvent]:
        state.stage = ConversationStage.BOOKING
        yield self._surface_event(surfaces.loading_surface())

        booking = await self._container.booking.sell_flight(
            auth_token=state.auth_token or "",
            session_id=state.conversation_id,
            journey_key_dep=payload.get("journeyKey", ""),
            fare_key_dep=payload.get("fareKey", ""),
            adult_count=state.search_context.adults,
            children_count=state.search_context.children,
        )
        state.selected_flight = booking
        state.stage = ConversationStage.COMPLETED
        yield self._surface_event(surfaces.booking_summary_surface(booking))
        yield AgentEvent(event="done", data={})

    # ---- Helpers --------------------------------------------------------
    @staticmethod
    def _merge_entities(state: ConversationState, extracted) -> None:
        ctx = state.search_context
        for field in extracted.fields:
            value = getattr(extracted, field)
            if value is not None:
                setattr(ctx, field, value)

    @staticmethod
    def _next_missing_field(state: ConversationState) -> ConversationStage | None:
        ctx = state.search_context
        if not ctx.origin_text and not ctx.origin:
            return ConversationStage.COLLECTING_ROUTE
        if not ctx.destination_text and not ctx.destination:
            return ConversationStage.COLLECTING_ROUTE
        if not ctx.begin_date:
            return ConversationStage.COLLECTING_DATE
        if ctx.adults < 1:
            return ConversationStage.COLLECTING_PASSENGERS
        return None

    @staticmethod
    def _ask_surface(stage: ConversationStage, state: ConversationState):
        ctx = state.search_context
        if stage is ConversationStage.COLLECTING_ROUTE:
            return surfaces.ask_route_surface()
        if stage is ConversationStage.COLLECTING_DATE:
            return surfaces.ask_date_surface(ctx.origin_text, ctx.destination_text)
        return surfaces.ask_passengers_surface()

    @staticmethod
    def _surface_event(surface) -> AgentEvent:
        return AgentEvent(event="surface", data=surface.to_payload())
