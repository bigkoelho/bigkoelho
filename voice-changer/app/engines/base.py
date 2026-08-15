"""Engine interface shared by every voice conversion backend."""

from __future__ import annotations

import abc
from dataclasses import dataclass
from pathlib import Path


class EngineError(RuntimeError):
    """Raised when a backend is unavailable or a conversion fails."""


@dataclass(frozen=True)
class EngineInfo:
    key: str
    label: str
    description: str
    available: bool
    detail: str = ""


class VoiceConversionEngine(abc.ABC):
    """Converts speech so it keeps its content but adopts a reference speaker's voice."""

    key: str = "base"
    label: str = "Base"
    description: str = ""

    @abc.abstractmethod
    def load(self) -> None:
        """Load whatever is needed (model weights, credentials). Must be idempotent."""

    @abc.abstractmethod
    def convert(self, source_wav: Path, reference_wav: Path, out_wav: Path) -> Path:
        """Render ``source_wav`` spoken with the voice heard in ``reference_wav``."""

    def availability(self) -> tuple[bool, str]:
        """(available, reason) — checked without loading heavy weights."""
        return True, ""

    def info(self) -> EngineInfo:
        available, detail = self.availability()
        return EngineInfo(
            key=self.key,
            label=self.label,
            description=self.description,
            available=available,
            detail=detail,
        )
