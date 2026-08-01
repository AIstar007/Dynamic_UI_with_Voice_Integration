"""Seat-selection MCP client.

Discovers and invokes the MCP seat tools when available. Seat maps and pricing
are always sourced from the MCP server.
"""

from __future__ import annotations

from typing import Any

from app.core.exceptions import MCPError
from app.mcp.base_client import MCPClient

_SEATMAP_TOOL_CANDIDATES = ("get_seat_map", "seat_map", "seat_availability")
_SELECT_SEAT_TOOL_CANDIDATES = ("select_seat", "assign_seat", "seat_selection")


class SeatClient:
    """Adapter over the MCP seat-selection capability."""

    def __init__(self, client: MCPClient):
        self._client = client

    async def _first_available(
        self, candidates: tuple[str, ...], *, auth_token: str, session_id: str
    ) -> str | None:
        available = set(
            await self._client.list_tools(auth_token=auth_token, session_id=session_id)
        )
        return next((t for t in candidates if t in available), None)

    async def get_seat_map(
        self, *, auth_token: str, session_id: str, arguments: dict[str, Any] | None = None
    ) -> Any:
        tool = await self._first_available(
            _SEATMAP_TOOL_CANDIDATES, auth_token=auth_token, session_id=session_id
        )
        if tool is None:
            raise MCPError("Seat-map tool is not available on the MCP server")
        result = await self._client.call_tool(
            tool, arguments or {}, auth_token=auth_token, session_id=session_id
        )
        return result.data

    async def select_seat(
        self, *, auth_token: str, session_id: str, arguments: dict[str, Any]
    ) -> Any:
        tool = await self._first_available(
            _SELECT_SEAT_TOOL_CANDIDATES, auth_token=auth_token, session_id=session_id
        )
        if tool is None:
            raise MCPError("Seat-selection tool is not available on the MCP server")
        result = await self._client.call_tool(
            tool, arguments, auth_token=auth_token, session_id=session_id
        )
        return result.data
