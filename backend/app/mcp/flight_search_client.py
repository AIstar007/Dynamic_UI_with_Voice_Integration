"""Flight search MCP client.

Adapter over the MCP `search_flight` tool. Responsible only for invocation and
response transformation — sorting/selection lives in the flight service, and
airline data always originates from the MCP server.
"""

from __future__ import annotations

from typing import Any

from app.core.logging import get_logger
from app.mcp.base_client import MCPClient

logger = get_logger(__name__)


class FlightSearchClient:
    """Adapter over the MCP `search_flight` tool."""

    TOOL = "search_flight"

    def __init__(self, client: MCPClient):
        self._client = client

    async def search(
        self,
        *,
        auth_token: str,
        session_id: str,
        origin: str,
        destination: str,
        begin_date: str,
        num_adults: int,
        end_date: str | None = None,
        num_child: int = 0,
        senior_citizen: int = 0,
        infant: int = 0,
        promotion_code: str | None = None,
    ) -> Any:
        arguments: dict[str, Any] = {
            "origin": origin,
            "destination": destination,
            "begin_date": begin_date,
            "num_adults": num_adults,
            "num_child": num_child,
            "senior_citizen": senior_citizen,
            "infant": infant,
        }
        if end_date is not None:
            arguments["end_date"] = end_date
        if promotion_code is not None:
            arguments["promotionCode"] = promotion_code

        result = await self._client.call_tool(
            self.TOOL,
            arguments,
            auth_token=auth_token,
            session_id=session_id,
        )
        return result.data
