"""Deprecated module — the active case analysis pipeline is implemented in app.api.routes.cases."""
from app.api.routes.cases import analyze_case, router

__all__ = ["analyze_case", "router"]
