"""Correlation-id propagation using context variables.

A correlation id is generated (or read from the inbound request) for every
request and bound to the logging context so every log line and MCP call can be
traced end-to-end.
"""

from __future__ import annotations

import uuid
from contextvars import ContextVar

_correlation_id: ContextVar[str | None] = ContextVar("correlation_id", default=None)


def new_correlation_id() -> str:
    return uuid.uuid4().hex


def set_correlation_id(value: str | None) -> str:
    cid = value or new_correlation_id()
    _correlation_id.set(cid)
    return cid


def get_correlation_id() -> str | None:
    return _correlation_id.get()
