"""Ancillary services MCP client (meals, baggage, insurance, ...).

Discovers and invokes the MCP ancillary/meal tools when available.
"""

from __future__ import annotations

from typing import Any

from app.core.exceptions import MCPError
from app.mcp.base_client import MCPClient

_ANCILLARY_LIST_CANDIDATES = ("get_ancillaries", "list_ancillaries", "ancillary_services")
_MEAL_LIST_CANDIDATES = ("get_meals", "list_meals", "meal_options")
_ADD_ANCILLARY_CANDIDATES = ("add_ancillary", "select_ancillary", "add_service")


class AncillariesClient:
    """Adapter over the MCP ancillary + meal capability."""

    def __init__(self, client: MCPClient):
        self._client = client

    async def _first_available(
        self, candidates: tuple[str, ...], *, auth_token: str, session_id: str
    ) -> str | None:
        available = set(
            await self._client.list_tools(auth_token=auth_token, session_id=session_id)
        )
        return next((t for t in candidates if t in available), None)

    async def list_meals(
        self, *, auth_token: str, session_id: str, arguments: dict[str, Any] | None = None
    ) -> Any:
        tool = await self._first_available(
            _MEAL_LIST_CANDIDATES, auth_token=auth_token, session_id=session_id
        )
        if tool is None:
            raise MCPError("Meal tool is not available on the MCP server")
        result = await self._client.call_tool(
            tool, arguments or {}, auth_token=auth_token, session_id=session_id
        )
        return result.data

    async def list_ancillaries(
        self, *, auth_token: str, session_id: str, arguments: dict[str, Any] | None = None
    ) -> Any:
        tool = await self._first_available(
            _ANCILLARY_LIST_CANDIDATES, auth_token=auth_token, session_id=session_id
        )
        if tool is None:
            raise MCPError("Ancillary tool is not available on the MCP server")
        result = await self._client.call_tool(
            tool, arguments or {}, auth_token=auth_token, session_id=session_id
        )
        return result.data

    async def add_ancillary(
        self, *, auth_token: str, session_id: str, arguments: dict[str, Any]
    ) -> Any:
        tool = await self._first_available(
            _ADD_ANCILLARY_CANDIDATES, auth_token=auth_token, session_id=session_id
        )
        if tool is None:
            raise MCPError("Add-ancillary tool is not available on the MCP server")
        result = await self._client.call_tool(
            tool, arguments, auth_token=auth_token, session_id=session_id
        )
        return result.data
