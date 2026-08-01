"""Domain exceptions for the platform."""

from __future__ import annotations


class PlatformError(Exception):
    """Base class for all application errors."""

    status_code: int = 500
    code: str = "INTERNAL_ERROR"

    def __init__(self, message: str, *, code: str | None = None, status_code: int | None = None):
        super().__init__(message)
        self.message = message
        if code:
            self.code = code
        if status_code:
            self.status_code = status_code


class ValidationError(PlatformError):
    status_code = 422
    code = "VALIDATION_ERROR"


class AuthenticationError(PlatformError):
    status_code = 401
    code = "UNAUTHENTICATED"


class MCPError(PlatformError):
    """Raised when an MCP tool call fails, times out, or returns an error."""

    status_code = 502
    code = "MCP_ERROR"


class MCPTimeoutError(MCPError):
    status_code = 504
    code = "MCP_TIMEOUT"


class A2UIValidationError(PlatformError):
    """Raised when a generated A2UI payload fails schema validation."""

    status_code = 500
    code = "A2UI_INVALID"
