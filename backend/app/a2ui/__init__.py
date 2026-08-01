"""Minimal A2UI helpers used by the backend during development and tests.

This package provides simple surface builders and schema models that mirror
the expected runtime shape used by the orchestrator and API routes. It is a
lightweight implementation intended to allow the backend to run locally when
the full A2UI library is not available.
"""

from . import surfaces
from .schemas import Surface

__all__ = ["surfaces", "Surface"]
