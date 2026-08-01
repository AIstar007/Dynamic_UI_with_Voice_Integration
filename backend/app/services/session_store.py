"""In-memory session store for local development.

Provides a minimal async-compatible store implementing `get` and `save` used
by the conversational routes. In production this would be backed by Redis
via `session_manager.SessionManager`.
"""

from __future__ import annotations

from typing import Dict

from app.schemas.conversation import ConversationState


class _InMemoryStore:
    def __init__(self) -> None:
        self._store: Dict[str, ConversationState] = {}

    async def get(self, conversation_id: str) -> ConversationState:
        state = self._store.get(conversation_id)
        if state is None:
            state = ConversationState(conversation_id=conversation_id)
            self._store[conversation_id] = state
        return state

    async def save(self, state: ConversationState) -> None:
        self._store[state.conversation_id] = state


_STORE: _InMemoryStore | None = None


def get_session_store() -> _InMemoryStore:
    global _STORE
    if _STORE is None:
        _STORE = _InMemoryStore()
    return _STORE
