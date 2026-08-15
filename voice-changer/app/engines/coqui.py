"""Local, offline voice conversion through the coqui-tts models.

FreeVC (the default) is zero-shot any-to-any: it takes any source recording plus
any reference sample and needs no per-voice training. Weights download once into
the coqui cache (~1 GB for FreeVC) and everything after that runs offline.
"""

from __future__ import annotations

import importlib.util
import threading
from pathlib import Path

from .base import EngineError, VoiceConversionEngine

MODELS: dict[str, str] = {
    "freevc": "voice_conversion_models/multilingual/vctk/freevc24",
    "openvoice_v2": "voice_conversion_models/multilingual/multi-dataset/openvoice_v2",
    "openvoice_v1": "voice_conversion_models/multilingual/multi-dataset/openvoice_v1",
    "knnvc": "voice_conversion_models/multilingual/multi-dataset/knnvc",
}

DEFAULT_MODEL = "freevc"


def _resolve_device(preference: str) -> str:
    import torch

    if preference in {"cpu", "cuda", "mps"}:
        return preference
    if torch.cuda.is_available():
        return "cuda"
    if getattr(torch.backends, "mps", None) is not None and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


class CoquiEngine(VoiceConversionEngine):
    key = "coqui"
    label = "Local (coqui-tts)"
    description = "Modelo de conversão de voz executado na tua máquina. Sem custos e sem enviar áudio para fora."

    def __init__(self, model: str = DEFAULT_MODEL, device: str = "auto") -> None:
        if model not in MODELS:
            raise EngineError(f"Modelo desconhecido: {model}. Opções: {', '.join(MODELS)}")
        self.model = model
        self.model_name = MODELS[model]
        self.device_preference = device
        self.device: str | None = None
        self._api = None
        self._lock = threading.Lock()

    def availability(self) -> tuple[bool, str]:
        for module in ("torch", "TTS"):
            if importlib.util.find_spec(module) is None:
                return False, "Falta instalar as dependências: pip install -r requirements.txt"
        return True, f"modelo {self.model_name}"

    def load(self) -> None:
        if self._api is not None:
            return
        with self._lock:
            if self._api is not None:
                return
            try:
                from TTS.api import TTS
            except ImportError as exc:  # pragma: no cover - depends on the install
                raise EngineError(
                    "coqui-tts não está instalado. Corre `pip install -r requirements.txt`."
                ) from exc

            self.device = _resolve_device(self.device_preference)
            try:
                api = TTS(model_name=self.model_name, progress_bar=False)
                api.to(self.device)
            except Exception as exc:  # noqa: BLE001 - surface the real cause to the UI
                raise EngineError(f"Não foi possível carregar o modelo {self.model_name}: {exc}") from exc
            self._api = api

    def convert(self, source_wav: Path, reference_wav: Path, out_wav: Path) -> Path:
        self.load()
        assert self._api is not None
        out_wav.parent.mkdir(parents=True, exist_ok=True)
        # Inference is not thread safe, and a second concurrent call would double
        # the memory footprint for no throughput gain on CPU.
        with self._lock:
            try:
                self._api.voice_conversion_to_file(
                    source_wav=str(source_wav),
                    target_wav=str(reference_wav),
                    file_path=str(out_wav),
                )
            except Exception as exc:  # noqa: BLE001
                raise EngineError(f"A conversão falhou: {exc}") from exc
        if not out_wav.exists():
            raise EngineError("O modelo não produziu ficheiro de saída.")
        return out_wav
