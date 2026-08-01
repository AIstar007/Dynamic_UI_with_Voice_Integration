"""Application configuration.

All values are sourced from environment variables (12-factor). Secrets must NEVER
be hardcoded. A local `.env` file is supported for development only and must be
git-ignored.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Annotated, Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    """Strongly-typed application settings loaded from the environment."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="APP_",
        extra="ignore",
    )

    # ---- Runtime ----
    environment: Literal["development", "qa", "uat", "preprod", "prod"] = "development"
    debug: bool = False
    service_name: str = "unified-search-controlled-ui"

    # ---- HTTP server ----
    host: str = "127.0.0.1"
    port: int = 8080

    # ---- CORS ----
    cors_allow_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["*"]
    )

    # ---- MCP backend ----
    # Master switch: when False, MCP is never contacted and every workflow
    # runs entirely on local/synthetic data via app.services.context_provider.
    # The application must remain fully functional with this off.
    mcp_enabled: bool = True
    # When True, an MCP failure propagates as an error instead of silently
    # falling back to local data. Only flip this on where a live airline
    # session is a hard business requirement (e.g. real payment/booking).
    mcp_required: bool = False
    # URL of the existing FastMCP server exposing the airline tools.
    mcp_server_url: str = "http://127.0.0.1:8001/mcp"
    # Session header name understood by the MCP auth middleware.
    mcp_session_header: str = "X-Conversation-Id"
    # Per-call MCP timeout (seconds) — timeout protection is mandatory.
    mcp_timeout_seconds: float = 30.0
    mcp_max_retries: int = 2
    mcp_retry_backoff_seconds: float = 0.5

    # ---- Security ----
    # Comma-separated list of API keys accepted by the backend (optional gate).
    api_keys: Annotated[list[str], NoDecode] = Field(default_factory=list)
    rate_limit: str = "60/minute"
    max_message_length: int = 2000

    # ---- Sessions ----
    session_ttl_seconds: int = 60 * 60  # 1 hour of idle conversation state

    # ---- Logging ----
    log_level: str = "INFO"
    log_json: bool = True

    @field_validator("cors_allow_origins", "api_keys", mode="before")
    @classmethod
    def _split_csv(cls, value: object) -> object:
        """Accept comma-separated strings for list settings from the env.

        pydantic-settings defaults to JSON parsing for complex types; this makes
        `APP_API_KEYS=a,b,c` and empty values ergonomic in `.env`.
        """

        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return []
            return [item.strip() for item in stripped.split(",") if item.strip()]
        return value

    @property
    def is_production(self) -> bool:
        return self.environment in {"preprod", "prod"}


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""

    return Settings()
