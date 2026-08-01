from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any

import redis.asyncio as redis

SESSION_TTL_SECONDS = 24 * 60 * 60
_KEY = "session:{session_id}"


class SessionManager:
    """Redis-backed session manager keyed by frontend session id."""

    def __init__(self, host: str, port: int, password: str | None = None) -> None:
        use_ssl = False
        bare_host = host
        if bare_host.startswith("rediss://"):
            use_ssl = True
            bare_host = bare_host[len("rediss://") :]
        elif bare_host.startswith("redis://"):
            bare_host = bare_host[len("redis://") :]
        bare_host = bare_host.rstrip("/")

        self._logger = logging.getLogger(__name__)
        self._redis = redis.Redis(
            host=bare_host,
            port=port,
            password=password,
            ssl=use_ssl,
            decode_responses=True,
        )

    @staticmethod
    def key_for(session_id: str) -> str:
        return _KEY.format(session_id=session_id)

    @staticmethod
    def new_session(session_id: str, authorization_token: str = "") -> dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        return {
            "session_id": session_id,
            "authorization_token": authorization_token,
            "history": [],
            "memory": {"authorization_token": authorization_token},
            "last_access": now,
            "created_at": now,
        }

    async def load_session(self, session_id: str) -> dict[str, Any] | None:
        key = self.key_for(session_id=session_id)
        raw = await self._redis.get(key)
        if raw is None:
            return None

        # Sliding TTL for active sessions.
        await self._redis.expire(key, SESSION_TTL_SECONDS)

        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            self._logger.warning("Invalid JSON in session key %s", key)
            return None

        return parsed if isinstance(parsed, dict) else None

    async def save_session(
        self,
        session_id: str,
        session: dict[str, Any],
    ) -> None:
        key = self.key_for(session_id=session_id)
        payload = json.dumps(session, ensure_ascii=True, default=str)
        await self._redis.set(key, payload, ex=SESSION_TTL_SECONDS)

    async def upsert_fields(
        self,
        session_id: str,
        fields: dict[str, Any],
    ) -> dict[str, Any]:
        session = await self.load_session(session_id=session_id)
        if session is None:
            session = self.new_session(session_id=session_id)
        session.update(fields)
        await self.save_session(session_id=session_id, session=session)
        return session

    async def delete_session(self, session_id: str) -> None:
        await self._redis.delete(self.key_for(session_id=session_id))

    async def clear_session(self, session_id: str) -> None:
        await self.delete_session(session_id=session_id)

    async def close(self) -> None:
        await self._redis.aclose()
