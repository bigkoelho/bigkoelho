"""Test setup: point the app at a throwaway data dir and the passthrough engine.

These env vars must be set before ``app.config`` is imported, because settings
are read once and cached.
"""

from __future__ import annotations

import os
import tempfile
from pathlib import Path

import numpy as np
import pytest

_TEST_DATA_DIR = Path(tempfile.mkdtemp(prefix="voice-changer-tests-"))
os.environ.setdefault("VC_DATA_DIR", str(_TEST_DATA_DIR))
os.environ.setdefault("VC_ENGINE", "passthrough")
os.environ.setdefault("VC_CHUNK_SECONDS", "3")

import soundfile as sf  # noqa: E402  (after the env vars above)

from app.audio import ffmpeg_available  # noqa: E402

requires_ffmpeg = pytest.mark.skipif(not ffmpeg_available(), reason="ffmpeg não está instalado")


def tone(seconds: float, sample_rate: int = 24000, freq: float = 150.0, gain: float = 0.35) -> np.ndarray:
    """A harmonic-rich tone: loud and continuous, so silence trimming keeps it."""
    t = np.arange(int(seconds * sample_rate), dtype=np.float32) / sample_rate
    wave = sum(np.sin(2 * np.pi * freq * harmonic * t) / harmonic for harmonic in (1, 2, 3, 4))
    return (gain * wave).astype(np.float32)


def silence(seconds: float, sample_rate: int = 24000) -> np.ndarray:
    return np.zeros(int(seconds * sample_rate), dtype=np.float32)


@pytest.fixture
def sample_rate() -> int:
    return 24000


@pytest.fixture
def make_wav(tmp_path: Path, sample_rate: int):
    def _make(name: str, seconds: float = 5.0, freq: float = 150.0) -> Path:
        path = tmp_path / name
        sf.write(str(path), tone(seconds, sample_rate, freq), sample_rate, subtype="PCM_16")
        return path

    return _make


@pytest.fixture
def data_dir() -> Path:
    return _TEST_DATA_DIR
