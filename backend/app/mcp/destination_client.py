"""Destination information MCP client.

Discovers and invokes MCP destination/travel-recommendation tools when present.
"""

from __future__ import annotations

from typing import Any

from app.core.exceptions import MCPError
from app.mcp.base_client import MCPClient

_DESTINATION_CANDIDATES = (
    "destination_info",
    "get_destination",
    "travel_recommendations",
    "destination_information",
)


class DestinationClient:
    """Adapter over the MCP destination-information capability."""

    def __init__(self, client: MCPClient):
        self._client = client

    async def get_info(
        self,
        *,
        auth_token: str,
        session_id: str,
        arguments: dict[str, Any] | None = None,
    ) -> Any:
        available = set(
            await self._client.list_tools(auth_token=auth_token, session_id=session_id)
        )
        tool = next((t for t in _DESTINATION_CANDIDATES if t in available), None)
        if tool is None:
            raise MCPError("Destination tool is not available on the MCP server")
        result = await self._client.call_tool(
            tool, arguments or {}, auth_token=auth_token, session_id=session_id
        )
        return result.data
