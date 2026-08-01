"""Base MCP client.

Wraps the MCP streamable-HTTP transport with:
  * tool discovery + caching
  * asynchronous tool invocation
  * timeout management
  * retry with exponential backoff
  * structured error handling and response normalisation

Every airline capability (flight search, booking, seats, ...) is exposed by the
existing MCP server. Domain clients subclass / compose this base client and must
never fabricate airline data.
"""

from __future__ import annotations

import asyncio
import json
from typing import Any

from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

from app.core.config import Settings, get_settings
from app.core.correlation import get_correlation_id
from app.core.exceptions import MCPError, MCPTimeoutError
from app.core.logging import get_logger

logger = get_logger(__name__)


class MCPToolResult:
    """Normalised MCP tool result."""

    def __init__(self, *, tool: str, data: Any, is_error: bool, raw: Any = None):
        self.tool = tool
        self.data = data
        self.is_error = is_error
        self.raw = raw

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"MCPToolResult(tool={self.tool!r}, is_error={self.is_error})"


class MCPClient:
    """Asynchronous client for the airline MCP server.

    A fresh MCP session is opened per invocation. This keeps the client stateless
    and safe for concurrent requests, while the auth token + conversation id are
    injected as headers so the server's auth middleware can bind the session.
    """

    def __init__(self, settings: Settings | None = None):
        self._settings = settings or get_settings()

    # ---- Headers -----------------------------------------------------------
    def _build_headers(self, *, auth_token: str, session_id: str) -> dict[str, str]:
        headers = {
            "Authorization": auth_token,
            self._settings.mcp_session_header: session_id,
        }
        cid = get_correlation_id()
        if cid:
            headers["X-Correlation-Id"] = cid
        return headers

    # ---- Discovery ---------------------------------------------------------
    async def list_tools(self, *, auth_token: str, session_id: str) -> list[str]:
        """Discover the tools exposed by the MCP server."""

        headers = self._build_headers(auth_token=auth_token, session_id=session_id)
        try:
            async with asyncio.timeout(self._settings.mcp_timeout_seconds):
                async with streamablehttp_client(
                    self._settings.mcp_server_url, headers=headers
                ) as (read, write, _):
                    async with ClientSession(read, write) as session:
                        await session.initialize()
                        result = await session.list_tools()
                        return [tool.name for tool in result.tools]
        except (TimeoutError, asyncio.TimeoutError) as exc:
            raise MCPTimeoutError("MCP tool discovery timed out") from exc
        except Exception as exc:  # noqa: BLE001 - normalise transport errors
            raise MCPError(f"MCP tool discovery failed: {exc}") from exc

    # ---- Invocation --------------------------------------------------------
    async def call_tool(
        self,
        tool_name: str,
        arguments: dict[str, Any],
        *,
        auth_token: str,
        session_id: str,
    ) -> MCPToolResult:
        """Invoke a single MCP tool with retry + timeout protection."""

        headers = self._build_headers(auth_token=auth_token, session_id=session_id)
        attempts = self._settings.mcp_max_retries + 1
        last_exc: Exception | None = None

        for attempt in range(1, attempts + 1):
            try:
                return await self._invoke_once(tool_name, arguments, headers)
            except MCPTimeoutError as exc:
                last_exc = exc
                logger.warning(
                    "mcp_tool_timeout", tool=tool_name, attempt=attempt, max=attempts
                )
            except MCPError as exc:
                last_exc = exc
                logger.warning(
                    "mcp_tool_error",
                    tool=tool_name,
                    attempt=attempt,
                    max=attempts,
                    error=str(exc),
                )

            if attempt < attempts:
                backoff = self._settings.mcp_retry_backoff_seconds * (2 ** (attempt - 1))
                await asyncio.sleep(backoff)

        assert last_exc is not None
        raise last_exc

    async def _invoke_once(
        self,
        tool_name: str,
        arguments: dict[str, Any],
        headers: dict[str, str],
    ) -> MCPToolResult:
        try:
            async with asyncio.timeout(self._settings.mcp_timeout_seconds):
                async with streamablehttp_client(
                    self._settings.mcp_server_url, headers=headers
                ) as (read, write, _):
                    async with ClientSession(read, write) as session:
                        await session.initialize()
                        logger.info("mcp_tool_call", tool=tool_name)
                        result = await session.call_tool(tool_name, arguments)
                        data = self._extract_payload(result)
                        return MCPToolResult(
                            tool=tool_name,
                            data=data,
                            is_error=bool(getattr(result, "isError", False)),
                            raw=result,
                        )
        except (TimeoutError, asyncio.TimeoutError) as exc:
            raise MCPTimeoutError(f"MCP tool '{tool_name}' timed out") from exc
        except (MCPError, MCPTimeoutError):
            raise
        except Exception as exc:  # noqa: BLE001
            raise MCPError(f"MCP tool '{tool_name}' failed: {exc}") from exc

    # ---- Response transformation ------------------------------------------
    @staticmethod
    def _extract_payload(result: Any) -> Any:
        """Transform a raw MCP CallToolResult into plain Python data.

        The FastMCP server returns structured content; we prefer
        `structuredContent`, then parse text blocks as JSON, and finally fall
        back to concatenated text.
        """

        structured = getattr(result, "structuredContent", None)
        if structured is not None:
            return structured

        content = getattr(result, "content", None) or []
        texts: list[str] = []
        for block in content:
            text = getattr(block, "text", None)
            if text is None:
                continue
            try:
                return json.loads(text)
            except (json.JSONDecodeError, TypeError):
                texts.append(text)

        if len(texts) == 1:
            return texts[0]
        return texts or None
