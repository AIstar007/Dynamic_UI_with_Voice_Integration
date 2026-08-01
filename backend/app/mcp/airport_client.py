"""Airport / destination resolution client.

Resolves free-text city names to IATA codes and surfaces destination info.

Airport lookups are served by MCP tool discovery when an airport search tool is
present. If the MCP server does not (yet) expose a dedicated airport tool, the
client performs a best-effort local normalisation of already-IATA input ONLY —
it never invents fares, flights or airline availability data.
"""

from __future__ import annotations

from app.core.logging import get_logger
from app.mcp.base_client import MCPClient

logger = get_logger(__name__)

# Candidate MCP tool names for airport search, in priority order.
_AIRPORT_TOOL_CANDIDATES = ("airport_search", "search_airport", "get_airports")


class AirportClient:
    """Adapter over the MCP airport-search capability."""

    def __init__(self, client: MCPClient):
        self._client = client

    async def resolve(
        self,
        query: str,
        *,
        auth_token: str,
        session_id: str,
    ) -> str | None:
        """Resolve a free-text location to an IATA code via MCP.

        Returns the IATA code string if resolvable, else None. If the input is
        already a 3-letter IATA code it is returned as-is (uppercased) without a
        network call.
        """

        candidate = query.strip().upper()
        if len(candidate) == 3 and candidate.isalpha():
            return candidate

        tools = await self._discover_airport_tools(
            auth_token=auth_token, session_id=session_id
        )
        for tool in tools:
            result = await self._client.call_tool(
                tool,
                {"query": query},
                auth_token=auth_token,
                session_id=session_id,
            )
            code = self._extract_iata(result.data)
            if code:
                return code
        return None

    async def _discover_airport_tools(
        self, *, auth_token: str, session_id: str
    ) -> list[str]:
        try:
            available = set(
                await self._client.list_tools(
                    auth_token=auth_token, session_id=session_id
                )
            )
        except Exception as exc:  # noqa: BLE001 - discovery is best-effort
            logger.warning("airport_tool_discovery_failed", error=str(exc))
            return []
        return [t for t in _AIRPORT_TOOL_CANDIDATES if t in available]

    @staticmethod
    def _extract_iata(data: object) -> str | None:
        if isinstance(data, dict):
            for key in ("iata", "code", "iataCode", "airportCode"):
                value = data.get(key)
                if isinstance(value, str) and len(value) == 3:
                    return value.upper()
            results = data.get("data") or data.get("results")
            if isinstance(results, list) and results:
                return AirportClient._extract_iata(results[0])
        if isinstance(data, list) and data:
            return AirportClient._extract_iata(data[0])
        return None
