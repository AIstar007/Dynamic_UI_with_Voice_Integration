"""Thin launcher.

Delegates to `app.main`, which owns the real FastAPI app, middleware and
router wiring. Kept separate so `python main.py` works from the backend root
regardless of current working directory or how the package is installed.
"""

from __future__ import annotations

import sys
from pathlib import Path
import importlib

_HERE = Path(__file__).resolve()
_BACKEND_ROOT = _HERE.parent
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))


def _load_app():
    try:
        module = importlib.import_module("app.main")
        return getattr(module, "app"), getattr(module, "settings")
    except Exception as exc:
        print("Failed to import application. Ensure dependencies are installed:", exc, file=sys.stderr)
        raise


if __name__ == "__main__":
    app, settings = _load_app()
    try:
        import uvicorn
    except Exception:
        sys.stderr.write("Uvicorn is not installed. Install with: pip install 'uvicorn[standard]'\n")
        raise SystemExit(1)

    uvicorn.run(app, host=settings.host, port=settings.port, log_level=settings.log_level.lower())
