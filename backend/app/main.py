"""FastAPI application entry point.

Wires middleware, routers, rate limiting, structured logging and global error
handling for the Controlled UI backend.
"""

from __future__ import annotations

# Ensure the backend root is on sys.path so absolute imports like `from app...`
# work when the module is executed directly (e.g. `python main.py`). This makes
# running the service convenient from the `backend/app` folder during local
# development without requiring `python -m app.main` or installing the package.
import sys
from pathlib import Path

_HERE = Path(__file__).resolve()
_BACKEND_ROOT = _HERE.parent.parent
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

# Verify required third-party packages are available and provide a clear
# installation hint if any are missing. This avoids noisy tracebacks for
# common developer mistakes (forgotten `pip install -r requirements.txt`).
import importlib

_REQUIRED = [
    ("fastapi", "fastapi"),
    ("pydantic", "pydantic"),
    ("pydantic_settings", "pydantic-settings"),
    ("slowapi", "slowapi"),
    ("sse_starlette.sse", "sse-starlette"),
    ("redis.asyncio", "redis"),
    ("structlog", "structlog"),
    ("uvicorn", "uvicorn[standard]"),
]

_missing = []
for mod, pkg in _REQUIRED:
    try:
        importlib.import_module(mod)
    except Exception:
        if pkg not in _missing:
            _missing.append(pkg)

if _missing:
    msg = (
        "Missing Python dependencies: " + ", ".join(_missing) + "\n"
        "Install them with: `pip install -r requirements.txt` from backend/`\n"
    )
    sys.stderr.write(msg)
    raise SystemExit(1)

# `mcp` is only required when APP_MCP_ENABLED=true. Checked separately (after
# settings load below) so the app can still start with MCP fully disabled and
# the `mcp` package absent from the environment.

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from app.api.middleware import CorrelationIdMiddleware
from app.api.routes_chat import router as chat_router
from app.api.routes_health import router as health_router
from app.core.config import get_settings
from app.core.exceptions import PlatformError
from app.core.logging import configure_logging, get_logger

settings = get_settings()
configure_logging(level=settings.log_level, json_output=settings.log_json)
logger = get_logger(__name__)

if settings.mcp_enabled:
    try:
        importlib.import_module("mcp")
    except Exception:
        sys.stderr.write(
            "APP_MCP_ENABLED=true but the `mcp` package is not installed.\n"
            "Either `pip install mcp` or set APP_MCP_ENABLED=false to run on "
            "local/synthetic data only.\n"
        )
        raise SystemExit(1)

limiter = Limiter(key_func=get_remote_address, default_limits=[settings.rate_limit])


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        "service_starting",
        service=settings.service_name,
        environment=settings.environment,
        mcp_enabled=settings.mcp_enabled,
        mcp_required=settings.mcp_required,
        mcp_server_url=settings.mcp_server_url if settings.mcp_enabled else None,
    )
    yield
    logger.info("service_stopping")


app = FastAPI(
    title="Unified Search Controlled UI",
    version="1.0.0",
    description="A2UI-powered controlled UI backend with optional, pluggable MCP integration.",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Correlation-Id"],
)


@app.exception_handler(PlatformError)
async def platform_error_handler(_: Request, exc: PlatformError) -> JSONResponse:
    logger.warning("platform_error", code=exc.code, message=exc.message)
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


app.include_router(health_router)
app.include_router(chat_router)


if __name__ == "__main__":
    try:
        import uvicorn
    except Exception:
        sys.stderr.write(
            "Uvicorn is not installed. Install with: pip install 'uvicorn[standard]'\n"
        )
        raise SystemExit(1)

    uvicorn.run(app, host=settings.host, port=settings.port, log_level=settings.log_level.lower())
