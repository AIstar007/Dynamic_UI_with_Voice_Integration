"""Streaming event contract between the orchestrator and the SSE transport."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class AgentEvent:
    """A single server-sent event emitted by the orchestrator."""

    event: str  # "surface" | "component" | "status" | "done" | "error"
    data: dict[str, Any] = field(default_factory=dict)
