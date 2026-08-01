"""Lightweight A2UI schema models.

Provide a `Surface` model with a `to_payload()` helper used by the
orchestrator and API layers.
"""

from __future__ import annotations

from typing import Any, Dict, List

from pydantic import BaseModel


class Surface(BaseModel):
    surfaceId: str
    components: List[Dict[str, Any]] = []

    def to_payload(self) -> Dict[str, Any]:
        """Return a plain dict payload suitable for API responses."""
        return self.model_dump()
