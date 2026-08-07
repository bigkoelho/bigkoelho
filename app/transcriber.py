import threading

from faster_whisper import WhisperModel

from app.config import COMPUTE_TYPE, DEVICE, MODEL_SIZE

_model = None
_lock = threading.Lock()


class ModelUnavailableError(RuntimeError):
    pass


def get_model() -> WhisperModel:
    global _model
    if _model is None:
        with _lock:
            if _model is None:
                try:
                    _model = WhisperModel(MODEL_SIZE, device=DEVICE, compute_type=COMPUTE_TYPE)
                except Exception as exc:
                    raise ModelUnavailableError(
                        f"Não foi possível carregar o modelo '{MODEL_SIZE}'. "
                        "Na primeira execução ele é baixado do Hugging Face — "
                        "verifique sua conexão de rede."
                    ) from exc
    return _model


def format_timestamp(seconds: float, separator: str = ",") -> str:
    millis = int(round(seconds * 1000))
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    secs, millis = divmod(millis, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}{separator}{millis:03d}"


def to_srt(segments: list[dict]) -> str:
    blocks = []
    for i, seg in enumerate(segments, start=1):
        start = format_timestamp(seg["start"])
        end = format_timestamp(seg["end"])
        blocks.append(f"{i}\n{start} --> {end}\n{seg['text']}\n")
    return "\n".join(blocks)


def to_vtt(segments: list[dict]) -> str:
    blocks = ["WEBVTT\n"]
    for seg in segments:
        start = format_timestamp(seg["start"], separator=".")
        end = format_timestamp(seg["end"], separator=".")
        blocks.append(f"{start} --> {end}\n{seg['text']}\n")
    return "\n".join(blocks)


def transcribe(path: str, language: str | None = None, task: str = "transcribe") -> dict:
    segments_iter, info = get_model().transcribe(
        path,
        language=language,
        task=task,
        vad_filter=True,
        beam_size=5,
    )

    segments = [
        {"id": i, "start": s.start, "end": s.end, "text": s.text.strip()}
        for i, s in enumerate(segments_iter)
    ]
    text = " ".join(s["text"] for s in segments).strip()

    return {
        "text": text,
        "segments": segments,
        "language": info.language,
        "language_probability": round(info.language_probability, 4),
        "duration": round(info.duration, 2),
        "srt": to_srt(segments),
        "vtt": to_vtt(segments),
    }
