"""Booking MCP client.

Adapter over the booking tools: `sell_flight`, `contact_details`,
`add_passenger`, `get_booking`. All booking state is owned by the MCP server.
"""

from __future__ import annotations

from typing import Any

from app.core.logging import get_logger
from app.mcp.base_client import MCPClient

logger = get_logger(__name__)


class BookingClient:
    """Adapter over the MCP booking tools."""

    def __init__(self, client: MCPClient):
        self._client = client

    async def sell_flight(
        self,
        *,
        auth_token: str,
        session_id: str,
        journey_key_dep: str,
        fare_key_dep: str,
        adult_count: int,
        children_count: int = 0,
        journey_key_arr: str | None = None,
        fare_key_arr: str | None = None,
        promotion_code: str | None = None,
    ) -> Any:
        arguments: dict[str, Any] = {
            "journey_key_dep": journey_key_dep,
            "fare_key_dep": fare_key_dep,
            "adult_count": adult_count,
            "children_count": children_count,
        }
        if journey_key_arr is not None:
            arguments["journey_key_arr"] = journey_key_arr
        if fare_key_arr is not None:
            arguments["fare_key_arr"] = fare_key_arr
        if promotion_code is not None:
            arguments["promotion_code"] = promotion_code

        result = await self._client.call_tool(
            "sell_flight", arguments, auth_token=auth_token, session_id=session_id
        )
        return result.data

    async def add_contact_details(
        self,
        *,
        auth_token: str,
        session_id: str,
        number: str,
        email: str,
        first_name: str,
        last_name: str,
        title: str,
    ) -> Any:
        result = await self._client.call_tool(
            "contact_details",
            {
                "number": number,
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "title": title,
            },
            auth_token=auth_token,
            session_id=session_id,
        )
        return result.data

    async def add_passenger(
        self,
        *,
        auth_token: str,
        session_id: str,
        passenger_keys: str,
        total_adult_count: int,
        total_children_count: int = 0,
        passengers: list[dict[str, str]] | None = None,
    ) -> Any:
        """Add passengers to the booking.

        `passengers` is a list of {title, first_name, last_name}. It is expanded
        into the positional argument shape expected by the MCP tool.
        """

        arguments: dict[str, Any] = {
            "passenger_keys": passenger_keys,
            "total_adult_count": total_adult_count,
            "total_children_count": total_children_count,
        }
        for idx, passenger in enumerate((passengers or [])[:7], start=1):
            arguments[f"passenger_title{idx}"] = passenger.get("title")
            arguments[f"first_name{idx}"] = passenger.get("first_name")
            arguments[f"last_name{idx}"] = passenger.get("last_name")

        result = await self._client.call_tool(
            "add_passenger", arguments, auth_token=auth_token, session_id=session_id
        )
        return result.data

    async def get_booking(
        self,
        *,
        auth_token: str,
        session_id: str,
        record_locator: str,
        last_name: str,
    ) -> Any:
        result = await self._client.call_tool(
            "get_booking",
            {"RecordLocator": record_locator, "LastName": last_name},
            auth_token=auth_token,
            session_id=session_id,
        )
        return result.data
