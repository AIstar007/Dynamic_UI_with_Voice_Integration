"""API request/response schemas for the conversational endpoint."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Inbound conversational turn from the frontend."""

    conversation_id: str = Field(..., min_length=1, max_length=128)
    message: str = Field(..., min_length=1, max_length=4000)
    # Optional structured action (e.g. a BookingButton press) carrying a payload.
    action: str | None = Field(default=None, max_length=64)
    action_payload: dict[str, Any] | None = None


class ChatResponse(BaseModel):
    """Non-streaming response containing a single A2UI surface."""

    conversation_id: str
    surface: dict[str, Any]
