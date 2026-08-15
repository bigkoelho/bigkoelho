"""Optional cloud backend: ElevenLabs speech-to-speech.

Higher quality than the local model, but the audio leaves your machine and the
account needs a plan that allows instant voice cloning. Enabled only when
ELEVENLABS_API_KEY is set.

Flow: clone the reference sample into a temporary voice, run every chunk through
speech-to-speech against it, then delete the voice when the engine is closed.
"""

from __future__ import annotations

import hashlib
import threading
from pathlib import Path

import numpy as np

from ..audio import write_wav
from .base import EngineError, VoiceConversionEngine

API_ROOT = "https://api.elevenlabs.io/v1"
OUTPUT_SAMPLE_RATE = 24000


class ElevenLabsEngine(VoiceConversionEngine):
    key = "elevenlabs"
    label = "ElevenLabs (nuvem)"
    description = "Qualidade superior via API. Requer chave e envia o áudio para o serviço."

    def __init__(self, api_key: str, model_id: str = "eleven_multilingual_sts_v2") -> None:
        self.api_key = api_key
        self.model_id = model_id
        self._client = None
        self._lock = threading.Lock()
        self._voice_cache: dict[str, str] = {}

    def availability(self) -> tuple[bool, str]:
        if not self.api_key:
            return False, "Define ELEVENLABS_API_KEY para ativar."
        return True, f"modelo {self.model_id}"

    def load(self) -> None:
        if self._client is not None:
            return
        if not self.api_key:
            raise EngineError("ELEVENLABS_API_KEY não está definida.")
        try:
            import httpx
        except ImportError as exc:  # pragma: no cover - depends on the install
            raise EngineError("httpx não está instalado. Corre `pip install -r requirements.txt`.") from exc
        self._client = httpx.Client(
            base_url=API_ROOT,
            headers={"xi-api-key": self.api_key},
            timeout=300.0,
        )

    def _voice_id_for(self, reference_wav: Path) -> str:
        digest = hashlib.sha256(reference_wav.read_bytes()).hexdigest()[:16]
        with self._lock:
            cached = self._voice_cache.get(digest)
            if cached:
                return cached
            assert self._client is not None
            response = self._client.post(
                "/voices/add",
                data={"name": f"vc-{digest}"},
                files={"files": (reference_wav.name, reference_wav.read_bytes(), "audio/wav")},
            )
            if response.status_code >= 400:
                raise EngineError(f"Falha ao criar a voz ({response.status_code}): {response.text[:300]}")
            voice_id = response.json().get("voice_id")
            if not voice_id:
                raise EngineError("A API não devolveu voice_id.")
            self._voice_cache[digest] = voice_id
            return voice_id

    def convert(self, source_wav: Path, reference_wav: Path, out_wav: Path) -> Path:
        self.load()
        assert self._client is not None
        voice_id = self._voice_id_for(reference_wav)
        response = self._client.post(
            f"/speech-to-speech/{voice_id}",
            data={"model_id": self.model_id, "output_format": f"pcm_{OUTPUT_SAMPLE_RATE}"},
            files={"audio": (source_wav.name, source_wav.read_bytes(), "audio/wav")},
        )
        if response.status_code >= 400:
            raise EngineError(f"Falha na conversão ({response.status_code}): {response.text[:300]}")

        pcm = np.frombuffer(response.content, dtype="<i2").astype(np.float32) / 32768.0
        if pcm.size == 0:
            raise EngineError("A API devolveu áudio vazio.")
        return write_wav(out_wav, pcm, OUTPUT_SAMPLE_RATE)

    def close(self) -> None:
        if self._client is None:
            return
        for voice_id in self._voice_cache.values():
            try:
                self._client.delete(f"/voices/{voice_id}")
            except Exception:  # noqa: BLE001 - best effort cleanup
                pass
        self._voice_cache.clear()
        self._client.close()
        self._client = None
