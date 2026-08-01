from __future__ import annotations

from typing import Any

from app.core.logging import get_logger
from app.mcp.base_client import MCPClient

logger = get_logger(__name__)


class TokenClient:
    """Adapter over the MCP `get_token` tool."""

    TOOL = "get_token"

    def __init__(self, client: MCPClient):
        self._client = client

    async def create_token(self, *, session_id: str, bootstrap_token: str = "bootstrap") -> Any:
        """Create an airline session token.

        The MCP auth middleware requires an Authorization header even for token
        bootstrap; `bootstrap_token` satisfies that requirement while the real
        token is minted server-side.
        """

        result = await self._client.call_tool(
            self.TOOL,
            {},
            auth_token=bootstrap_token,
            session_id=session_id,
        )
        return result.data
