from __future__ import annotations

import os
from typing import Any


class AIService:
    """Optional AI enhancer using provider configured by environment variables."""

    def __init__(self) -> None:
        self.provider = os.getenv("AI_PROVIDER", "none").lower()
        self.model = os.getenv("AI_MODEL", "")

    def summarize(self, text: str, prompt: str) -> dict[str, Any] | None:
        if self.provider in {"none", ""}:
            return None
        # Intentionally fallback-safe for local/demo usage without API keys.
        return {
            "provider": self.provider,
            "model": self.model,
            "status": "configured",
            "note": "AI summary is configured but disabled in local fallback mode.",
        }
