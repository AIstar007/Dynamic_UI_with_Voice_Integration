"""Payment MCP client.

Adapter over the MCP `initiate_payment` tool. Payment orchestration is owned by
the MCP server; this client only forwards the request.
"""

from __future__ import annotations

from typing import Any

from app.mcp.base_client import MCPClient


class PaymentClient:
    """Adapter over the MCP `initiate_payment` tool."""

    TOOL = "initiate_payment"

    def __init__(self, client: MCPClient):
        self._client = client

    async def initiate(
        self,
        *,
        auth_token: str,
        session_id: str,
        arguments: dict[str, Any],
    ) -> Any:
        result = await self._client.call_tool(
            self.TOOL, arguments, auth_token=auth_token, session_id=session_id
        )
        return result.data
