"""Intent classification.

Lightweight, deterministic intent detection over the user's message. This keeps
the orchestrator provider-agnostic; it can later be swapped for an LLM-backed
classifier without changing callers.
"""

from __future__ import annotations

import re
from enum import Enum


class Intent(str, Enum):
    SEARCH_FLIGHTS = "search_flights"
    BOOK_FLIGHT = "book_flight"
    FLIGHT_STATUS = "flight_status"
    RETRIEVE_BOOKING = "retrieve_booking"
    DESTINATION_INFO = "destination_info"
    PROVIDE_INFO = "provide_info"
    GREETING = "greeting"
    UNKNOWN = "unknown"


_PATTERNS: list[tuple[Intent, re.Pattern[str]]] = [
    (Intent.FLIGHT_STATUS, re.compile(r"\b(status|delayed|on time|arriv|depart)\b", re.I)),
    (Intent.RETRIEVE_BOOKING, re.compile(r"\b(my booking|pnr|record locator|retrieve|manage booking)\b", re.I)),
    (Intent.BOOK_FLIGHT, re.compile(r"\b(book|reserve|confirm)\b", re.I)),
    (Intent.DESTINATION_INFO, re.compile(r"\b(things to do|about|explore|visit|attractions|weather)\b", re.I)),
    (Intent.SEARCH_FLIGHTS, re.compile(r"\b(flight|fly|fare|cheapest|from .* to|travel)\b", re.I)),
    (Intent.GREETING, re.compile(r"^\s*(hi|hello|hey|namaste|good (morning|afternoon|evening))\b", re.I)),
]


def classify(message: str) -> Intent:
    """Return the best-matching intent for a message."""

    for intent, pattern in _PATTERNS:
        if pattern.search(message):
            return intent
    return Intent.PROVIDE_INFO
