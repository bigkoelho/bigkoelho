"""Engine registry: one process keeps at most one loaded engine per key."""

from __future__ import annotations

import threading

from ..config import Settings
from .base import EngineError, EngineInfo, VoiceConversionEngine
from .coqui import MODELS as COQUI_MODELS
from .coqui import CoquiEngine
from .elevenlabs import ElevenLabsEngine
from .passthrough import PassthroughEngine

__all__ = [
    "COQUI_MODELS",
    "CoquiEngine",
    "ElevenLabsEngine",
    "EngineError",
    "EngineInfo",
    "PassthroughEngine",
    "VoiceConversionEngine",
    "build_engine",
    "describe_engines",
    "get_engine",
    "reset_engines",
]

_engines: dict[str, VoiceConversionEngine] = {}
_lock = threading.Lock()


def build_engine(key: str, settings: Settings) -> VoiceConversionEngine:
    key = (key or "").lower()
    if key == "coqui":
        return CoquiEngine(model=settings.coqui_model, device=settings.device)
    if key == "elevenlabs":
        return ElevenLabsEngine(api_key=settings.elevenlabs_api_key, model_id=settings.elevenlabs_model)
    if key == "passthrough":
        return PassthroughEngine()
    raise EngineError(f"Motor desconhecido: {key}")


def get_engine(key: str, settings: Settings) -> VoiceConversionEngine:
    """Return the shared instance for ``key``, creating it on first use.

    Engines are cached because loading model weights costs tens of seconds and
    hundreds of megabytes; every job reuses the same warm instance.
    """
    key = (key or settings.engine).lower()
    with _lock:
        engine = _engines.get(key)
        if engine is None:
            engine = build_engine(key, settings)
            _engines[key] = engine
        return engine


def describe_engines(settings: Settings) -> list[EngineInfo]:
    infos: list[EngineInfo] = []
    for key in ("coqui", "elevenlabs", "passthrough"):
        try:
            infos.append(build_engine(key, settings).info())
        except EngineError as exc:
            infos.append(EngineInfo(key=key, label=key, description="", available=False, detail=str(exc)))
    return infos


def reset_engines() -> None:
    """Drop cached engines (used by the tests and on shutdown)."""
    with _lock:
        for engine in _engines.values():
            close = getattr(engine, "close", None)
            if callable(close):
                try:
                    close()
                except Exception:  # noqa: BLE001 - shutdown is best effort
                    pass
        _engines.clear()
