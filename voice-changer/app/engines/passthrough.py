"""No-op engine used by the tests and to exercise the UI without model weights.

It copies the source audio through untouched, so the pipeline, job queue and
front end can be validated in a second instead of minutes.
"""

from __future__ import annotations

import shutil
from pathlib import Path

from .base import VoiceConversionEngine


class PassthroughEngine(VoiceConversionEngine):
    key = "passthrough"
    label = "Passthrough (teste)"
    description = "Não converte nada — devolve o áudio original. Serve para testar a aplicação."

    def load(self) -> None:
        return None

    def convert(self, source_wav: Path, reference_wav: Path, out_wav: Path) -> Path:
        out_wav.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source_wav, out_wav)
        return out_wav
