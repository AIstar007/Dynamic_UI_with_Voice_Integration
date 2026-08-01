"""Simple surface builders used by the orchestrator.

These are intentionally minimal; they return `Surface` objects and small
component models with `model_dump()` so the orchestrator and SSE route can
operate without the full A2UI library while running locally.
"""

from __future__ import annotations

from typing import Any, Dict, List

from pydantic import BaseModel

from .schemas import Surface


class Component(BaseModel):
    type: str
    payload: Dict[str, Any]


def greeting_surface() -> Surface:
    return Surface(surfaceId="greeting", components=[{"type": "text", "text": "Hello! How can I help you today?"}])


def ask_route_surface() -> Surface:
    return Surface(surfaceId="ask-route", components=[{"type": "text", "text": "Where would you like to go?"}])


def ask_date_surface(origin: str | None = None, destination: str | None = None) -> Surface:
    title = "When do you want to travel?"
    if origin and destination:
        title = f"When do you want to travel from {origin} to {destination}?"
    return Surface(surfaceId="ask-date", components=[{"type": "text", "text": title}])


def ask_passengers_surface() -> Surface:
    return Surface(surfaceId="ask-passengers", components=[{"type": "text", "text": "How many passengers?"}])


def loading_surface() -> Surface:
    return Surface(surfaceId="loading", components=[{"type": "status", "status": "searching"}])


def error_surface(message: str, code: str | None = None) -> Surface:
    payload = {"type": "error", "message": message}
    if code:
        payload["code"] = code
    return Surface(surfaceId="error", components=[payload])


def results_surface(offers: List[Any], summary: str) -> Surface:
    comps = []
    for idx, offer in enumerate(offers):
        comps.append({"type": "flight_card", "index": idx, "offer": offer})
    comps.append({"type": "summary", "text": summary})
    return Surface(surfaceId="flight-results", components=comps)


def flight_card_component(offer: Any, *, index: int = 0) -> Component:
    # The orchestrator expects an object with `model_dump()` that returns a
    # JSON-serialisable representation of the component.
    return Component(type="flight_card", payload={"index": index, "offer": offer})


def passenger_form_surface(adults: int, children: int) -> Surface:
    return Surface(surfaceId="passenger-form", components=[{"type": "form", "adults": adults, "children": children}])


def booking_summary_surface(data: Dict[str, Any]) -> Surface:
    return Surface(surfaceId="booking-summary", components=[{"type": "booking", "data": data}])
