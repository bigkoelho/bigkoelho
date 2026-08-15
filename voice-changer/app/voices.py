"""Voice library: saved reference samples, stored on disk so they survive restarts."""

from __future__ import annotations

import json
import shutil
import time
import uuid
from dataclasses import dataclass, asdict
from pathlib import Path

from .audio import prepare_reference, probe_duration
from .config import Settings

META_NAME = "voice.json"
SAMPLE_NAME = "sample.wav"


class VoiceError(RuntimeError):
    """Raised for invalid or missing voices."""


@dataclass
class Voice:
    id: str
    name: str
    created_at: float
    duration: float
    source_filename: str

    def to_dict(self) -> dict:
        return asdict(self)


class VoiceLibrary:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.root = settings.voices_dir
        self.root.mkdir(parents=True, exist_ok=True)

    def _dir(self, voice_id: str) -> Path:
        # Reject anything that could escape the library directory.
        if not voice_id or "/" in voice_id or "\\" in voice_id or voice_id.startswith("."):
            raise VoiceError("Identificador de voz inválido.")
        return self.root / voice_id

    def sample_path(self, voice_id: str) -> Path:
        path = self._dir(voice_id) / SAMPLE_NAME
        if not path.exists():
            raise VoiceError("Voz não encontrada.")
        return path

    def create(self, name: str, raw_sample: Path, source_filename: str = "") -> Voice:
        """Clean up ``raw_sample`` and store it as a reusable voice."""
        voice_id = uuid.uuid4().hex[:12]
        folder = self._dir(voice_id)
        folder.mkdir(parents=True, exist_ok=True)
        sample = folder / SAMPLE_NAME
        prepare_reference(
            raw_sample,
            sample,
            self.settings.reference_sample_rate,
            self.settings.max_reference_seconds,
        )
        duration = probe_duration(sample)
        if duration < self.settings.min_reference_seconds:
            folder_cleanup(folder)
            raise VoiceError(
                f"A amostra tem apenas {duration:.1f}s de fala. "
                f"São precisos pelo menos {self.settings.min_reference_seconds:.0f}s."
            )

        voice = Voice(
            id=voice_id,
            name=(name or "Voz sem nome").strip()[:80],
            created_at=time.time(),
            duration=duration,
            source_filename=source_filename[:120],
        )
        (folder / META_NAME).write_text(json.dumps(voice.to_dict(), ensure_ascii=False, indent=2), "utf-8")
        return voice

    def get(self, voice_id: str) -> Voice:
        meta = self._dir(voice_id) / META_NAME
        if not meta.exists():
            raise VoiceError("Voz não encontrada.")
        return Voice(**json.loads(meta.read_text("utf-8")))

    def list(self) -> list[Voice]:
        voices: list[Voice] = []
        for folder in self.root.iterdir():
            if not folder.is_dir():
                continue
            meta = folder / META_NAME
            if not meta.exists():
                continue
            try:
                voices.append(Voice(**json.loads(meta.read_text("utf-8"))))
            except (json.JSONDecodeError, TypeError):
                continue
        return sorted(voices, key=lambda v: v.created_at, reverse=True)

    def delete(self, voice_id: str) -> None:
        folder = self._dir(voice_id)
        if not folder.exists():
            raise VoiceError("Voz não encontrada.")
        folder_cleanup(folder)


def folder_cleanup(folder: Path) -> None:
    shutil.rmtree(folder, ignore_errors=True)
