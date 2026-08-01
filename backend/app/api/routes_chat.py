"""Conversational chat routes.

Exposes a Server-Sent Events (SSE) endpoint that streams validated A2UI surfaces
as the agent orchestrates MCP calls, plus a non-streaming fallback endpoint.
"""

from __future__ import annotations

import json
from collections.abc import AsyncIterator

from fastapi import APIRouter, Depends, Request
from sse_starlette.sse import EventSourceResponse

from app.agents.events import AgentEvent
from app.agents.orchestrator import Orchestrator
from app.core.config import get_settings
from app.core.logging import get_logger
from app.core.security import sanitize_text, verify_api_key
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.container import get_container
from app.services.session_store import get_session_store

logger = get_logger(__name__)
router = APIRouter(prefix="/api/v1", tags=["chat"])


async def _event_stream(
    request: Request, chat: ChatRequest
) -> AsyncIterator[dict[str, str]]:
    """Yield SSE-formatted orchestrator events."""

    settings = get_settings()
    store = get_session_store()
    orchestrator = Orchestrator(get_container())

    message = sanitize_text(chat.message, max_length=settings.max_message_length)
    state = await store.get(chat.conversation_id)

    try:
        async for event in orchestrator.handle(
            state,
            message,
            action=chat.action,
            action_payload=chat.action_payload,
        ):
            if await request.is_disconnected():
                logger.info("client_disconnected", conversation_id=chat.conversation_id)
                break
            yield _format(event)
    finally:
        await store.save(state)


def _format(event: AgentEvent) -> dict[str, str]:
    return {"event": event.event, "data": json.dumps(event.data, default=str)}


@router.post("/chat/stream", dependencies=[Depends(verify_api_key)])
async def chat_stream(chat: ChatRequest, request: Request) -> EventSourceResponse:
    """Stream A2UI surfaces progressively via SSE."""

    return EventSourceResponse(_event_stream(request, chat))


@router.post(
    "/chat",
    response_model=ChatResponse,
    dependencies=[Depends(verify_api_key)],
)
async def chat(chat_request: ChatRequest, request: Request) -> ChatResponse:
    """Non-streaming fallback: returns the final A2UI surface for a turn."""

    settings = get_settings()
    store = get_session_store()
    orchestrator = Orchestrator(get_container())

    message = sanitize_text(chat_request.message, max_length=settings.max_message_length)
    state = await store.get(chat_request.conversation_id)

    last_surface: dict = {"surfaceId": "empty", "components": []}
    try:
        async for event in orchestrator.handle(
            state,
            message,
            action=chat_request.action,
            action_payload=chat_request.action_payload,
        ):
            if event.event == "surface":
                last_surface = event.data
    finally:
        await store.save(state)

    return ChatResponse(conversation_id=chat_request.conversation_id, surface=last_surface)
