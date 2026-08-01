"""Conversation state models.

The searchContext is retained across turns so the agent never re-asks for
information the user has already provided.
"""

from __future__ import annotations

import time
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class ConversationStage(str, Enum):
    """High-level state of the booking funnel."""

    GREETING = "greeting"
    COLLECTING_ROUTE = "collecting_route"
    COLLECTING_DATE = "collecting_date"
    COLLECTING_PASSENGERS = "collecting_passengers"
    SEARCHING = "searching"
    RESULTS = "results"
    BOOKING = "booking"
    PAYMENT = "payment"
    COMPLETED = "completed"


class SearchContext(BaseModel):
    """Accumulated flight-search parameters."""

    origin: str | None = None
    destination: str | None = None
    origin_text: str | None = None
    destination_text: str | None = None
    begin_date: str | None = None
    end_date: str | None = None
    adults: int = 1
    children: int = 0
    infants: int = 0
    cabin: str = "Economy"

    def is_searchable(self) -> bool:
        return bool(self.origin and self.destination and self.begin_date and self.adults >= 1)


class Message(BaseModel):
    role: str
    content: str
    at: float = Field(default_factory=time.time)


class ConversationState(BaseModel):
    """Full per-conversation state persisted in the session store."""

    conversation_id: str
    stage: ConversationStage = ConversationStage.GREETING
    search_context: SearchContext = Field(default_factory=SearchContext)
    messages: list[Message] = Field(default_factory=list)
    # Airline session token minted via MCP `get_token`.
    auth_token: str | None = None
    # The flight the user selected to book (transformed, from MCP).
    selected_flight: dict[str, Any] | None = None
    passengers: list[dict[str, str]] = Field(default_factory=list)
    updated_at: float = Field(default_factory=time.time)

    def touch(self) -> None:
        self.updated_at = time.time()

    def add_message(self, role: str, content: str) -> None:
        self.messages.append(Message(role=role, content=content))
        self.touch()
