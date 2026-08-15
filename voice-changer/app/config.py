"""Application settings, all overridable through environment variables."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def _env_str(name: str, default: str) -> str:
    value = os.getenv(name)
    return value.strip() if value and value.strip() else default


def _env_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        return default


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on", "sim"}


@dataclass(frozen=True)
class Settings:
    """Runtime configuration for the voice conversion service."""

    data_dir: Path = field(default_factory=lambda: Path(_env_str("VC_DATA_DIR", str(BASE_DIR / "data"))))

    # Engine selection: "coqui" (local model) | "elevenlabs" (cloud) | "passthrough" (tests).
    engine: str = field(default_factory=lambda: _env_str("VC_ENGINE", "coqui").lower())
    # Which local model the coqui engine loads: freevc | openvoice_v2 | knnvc.
    coqui_model: str = field(default_factory=lambda: _env_str("VC_COQUI_MODEL", "freevc").lower())
    # auto | cpu | cuda | mps
    device: str = field(default_factory=lambda: _env_str("VC_DEVICE", "auto").lower())

    # Audio handling.
    reference_sample_rate: int = field(default_factory=lambda: _env_int("VC_REFERENCE_SR", 24000))
    working_sample_rate: int = field(default_factory=lambda: _env_int("VC_WORKING_SR", 24000))
    max_reference_seconds: int = field(default_factory=lambda: _env_int("VC_MAX_REFERENCE_SECONDS", 30))
    min_reference_seconds: float = field(default_factory=lambda: float(_env_int("VC_MIN_REFERENCE_MS", 3000)) / 1000)
    max_source_seconds: int = field(default_factory=lambda: _env_int("VC_MAX_SOURCE_SECONDS", 900))
    chunk_seconds: int = field(default_factory=lambda: _env_int("VC_CHUNK_SECONDS", 20))
    max_upload_mb: int = field(default_factory=lambda: _env_int("VC_MAX_UPLOAD_MB", 200))

    # Housekeeping.
    job_retention_hours: int = field(default_factory=lambda: _env_int("VC_JOB_RETENTION_HOURS", 12))

    # Cloud engine (optional).
    elevenlabs_api_key: str = field(default_factory=lambda: _env_str("ELEVENLABS_API_KEY", ""))
    elevenlabs_model: str = field(default_factory=lambda: _env_str("ELEVENLABS_MODEL", "eleven_multilingual_sts_v2"))

    # Warm the model up at startup instead of on the first job.
    preload_engine: bool = field(default_factory=lambda: _env_bool("VC_PRELOAD_ENGINE", False))

    @property
    def uploads_dir(self) -> Path:
        return self.data_dir / "uploads"

    @property
    def outputs_dir(self) -> Path:
        return self.data_dir / "outputs"

    @property
    def voices_dir(self) -> Path:
        return self.data_dir / "voices"

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024

    def ensure_dirs(self) -> None:
        for path in (self.data_dir, self.uploads_dir, self.outputs_dir, self.voices_dir):
            path.mkdir(parents=True, exist_ok=True)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    settings = Settings()
    settings.ensure_dirs()
    return settings
