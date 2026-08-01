"""Correlation-id + request-tracing middleware."""

from __future__ import annotations

import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.correlation import set_correlation_id
from app.core.logging import get_logger

logger = get_logger(__name__)

_CORRELATION_HEADER = "X-Correlation-Id"


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Bind a correlation id per request and emit access logs with timing."""

    async def dispatch(self, request: Request, call_next) -> Response:  # type: ignore[override]
        incoming = request.headers.get(_CORRELATION_HEADER)
        correlation_id = set_correlation_id(incoming)

        start = time.perf_counter()
        logger.info(
            "request_started",
            method=request.method,
            path=request.url.path,
        )
        try:
            response = await call_next(request)
        except Exception:
            logger.exception("request_failed", method=request.method, path=request.url.path)
            raise

        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        response.headers[_CORRELATION_HEADER] = correlation_id
        logger.info(
            "request_completed",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=duration_ms,
        )
        return response
