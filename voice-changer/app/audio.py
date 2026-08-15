"""Audio helpers built on ffmpeg + soundfile.

Everything that touches the user's files funnels through here so the rest of the
app only ever deals with mono PCM wav at a known sample rate.
"""

from __future__ import annotations

import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import soundfile as sf

FFMPEG = shutil.which("ffmpeg") or "ffmpeg"
FFPROBE = shutil.which("ffprobe") or "ffprobe"

# -nostdin keeps ffmpeg from reading the parent's stdin, which otherwise makes it
# block when the app runs as a service.
FFMPEG_BASE = [FFMPEG, "-nostdin", "-hide_banner", "-loglevel", "error", "-y"]


class AudioError(RuntimeError):
    """Raised when ffmpeg fails or the file cannot be decoded."""


def ffmpeg_available() -> bool:
    return shutil.which("ffmpeg") is not None and shutil.which("ffprobe") is not None


def _run(cmd: list[str]) -> str:
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    except FileNotFoundError as exc:  # pragma: no cover - depends on the host
        raise AudioError(
            "ffmpeg não foi encontrado. Instala com `apt install ffmpeg` ou `brew install ffmpeg`."
        ) from exc
    if proc.returncode != 0:
        tail = (proc.stderr or "").strip().splitlines()[-4:]
        raise AudioError("ffmpeg falhou: " + " | ".join(tail))
    return proc.stdout


def probe_duration(path: Path) -> float:
    """Duration in seconds, or 0.0 when ffprobe cannot tell."""
    out = _run(
        [
            FFPROBE,
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ]
    )
    try:
        return float(out.strip())
    except ValueError:
        return 0.0


def decode_to_wav(src: Path, dst: Path, sample_rate: int, filters: str | None = None) -> Path:
    """Decode any container/codec into mono 16-bit PCM wav at ``sample_rate``."""
    dst.parent.mkdir(parents=True, exist_ok=True)
    cmd = [*FFMPEG_BASE, "-i", str(src), "-vn", "-sn", "-dn"]
    if filters:
        cmd += ["-af", filters]
    cmd += ["-ac", "1", "-ar", str(sample_rate), "-c:a", "pcm_s16le", str(dst)]
    _run(cmd)
    return dst


def prepare_reference(src: Path, dst: Path, sample_rate: int, max_seconds: int) -> Path:
    """Clean up a voice sample: trim leading/trailing silence, level it, cap its length.

    A tidy 10-30 s sample gives the model a much better speaker embedding than a
    long recording padded with room tone.
    """
    strip_silence = "silenceremove=start_periods=1:start_silence=0.1:start_threshold=-45dB:detection=rms"
    # areverse turns the "trim the start" filter into "trim the end" as well, and the
    # aresample re-clocks the stream: without it, silenceremove feeding loudnorm
    # deadlocks the filter graph on ffmpeg 6.x.
    trim = f"{strip_silence},areverse,{strip_silence},areverse,aresample=async=1,loudnorm=I=-20:TP=-2:LRA=11"
    dst.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        *FFMPEG_BASE,
        "-i",
        str(src),
        "-vn",
        "-sn",
        "-dn",
        "-af",
        trim,
        "-t",
        str(max_seconds),
        "-ac",
        "1",
        "-ar",
        str(sample_rate),
        "-c:a",
        "pcm_s16le",
        str(dst),
    ]
    _run(cmd)
    return dst


def encode_output(
    src: Path, dst: Path, fmt: str, normalize: bool = True, sample_rate: int | None = None
) -> Path:
    """Render the final file as wav or mp3, optionally loudness-normalised."""
    fmt = fmt.lower()
    if fmt not in {"wav", "mp3"}:
        raise AudioError(f"Formato de saída não suportado: {fmt}")

    cmd = [*FFMPEG_BASE, "-i", str(src)]
    if normalize:
        cmd += ["-af", "aresample=async=1,loudnorm=I=-16:TP=-1.5:LRA=11"]
    # loudnorm always outputs 192 kHz; without pinning the rate the wav ends up eight
    # times bigger than the model's own output, for no extra quality.
    if sample_rate:
        cmd += ["-ar", str(sample_rate)]
    if fmt == "wav":
        cmd += ["-c:a", "pcm_s16le"]
    else:
        cmd += ["-c:a", "libmp3lame", "-b:a", "192k"]
    cmd += [str(dst)]
    dst.parent.mkdir(parents=True, exist_ok=True)
    _run(cmd)
    return dst


def wav_sample_rate(path: Path) -> int:
    """Sample rate of a wav without decoding it."""
    return int(sf.info(str(path)).samplerate)


def read_wav(path: Path) -> tuple[np.ndarray, int]:
    """Read a wav as float32 mono."""
    samples, sample_rate = sf.read(str(path), dtype="float32", always_2d=False)
    if samples.ndim > 1:
        samples = samples.mean(axis=1)
    return samples.astype(np.float32, copy=False), int(sample_rate)


def write_wav(path: Path, samples: np.ndarray, sample_rate: int) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(path), np.clip(samples, -1.0, 1.0), sample_rate, subtype="PCM_16")
    return path


@dataclass(frozen=True)
class Segment:
    """A slice of the source audio, in samples."""

    start: int
    end: int

    @property
    def length(self) -> int:
        return self.end - self.start


def _frame_rms_db(samples: np.ndarray, frame: int, hop: int) -> np.ndarray:
    if samples.size < frame:
        return np.array([-120.0], dtype=np.float32)
    count = 1 + (samples.size - frame) // hop
    strides = (samples.strides[0] * hop, samples.strides[0])
    frames = np.lib.stride_tricks.as_strided(samples, shape=(count, frame), strides=strides)
    rms = np.sqrt(np.maximum((frames.astype(np.float64) ** 2).mean(axis=1), 1e-12))
    return (20.0 * np.log10(rms)).astype(np.float32)


def find_segments(
    samples: np.ndarray,
    sample_rate: int,
    max_seconds: float,
    min_seconds: float = 2.0,
    min_silence_ms: int = 180,
    relative_threshold_db: float = 32.0,
) -> list[Segment]:
    """Split audio into chunks of at most ``max_seconds``, cutting inside silence.

    Voice conversion models work on whole utterances; feeding them a 20 minute
    file at once is slow and memory hungry. Cutting on silence keeps the joins
    inaudible because nothing is sliced mid-word.
    """
    total = int(samples.size)
    max_len = max(int(max_seconds * sample_rate), sample_rate)
    min_len = max(int(min_seconds * sample_rate), sample_rate // 2)
    if total <= max_len:
        return [Segment(0, total)]

    frame = max(int(0.02 * sample_rate), 64)
    hop = max(frame // 2, 32)
    db = _frame_rms_db(samples, frame, hop)
    peak_db = float(db.max())
    threshold = min(peak_db - relative_threshold_db, -35.0)
    silent = db < threshold

    # Collect the midpoint of every silent run long enough to cut in.
    min_silent_frames = max(int((min_silence_ms / 1000) * sample_rate / hop), 1)
    candidates: list[int] = []
    run_start: int | None = None
    for index, is_silent in enumerate(silent):
        if is_silent and run_start is None:
            run_start = index
        elif not is_silent and run_start is not None:
            if index - run_start >= min_silent_frames:
                candidates.append(((run_start + index) // 2) * hop + frame // 2)
            run_start = None
    if run_start is not None and len(silent) - run_start >= min_silent_frames:
        candidates.append(((run_start + len(silent)) // 2) * hop + frame // 2)

    segments: list[Segment] = []
    position = 0
    while total - position > max_len:
        window_start = position + min_len
        window_end = position + max_len
        cut = next(
            (point for point in reversed(candidates) if window_start <= point <= window_end),
            window_end,
        )
        segments.append(Segment(position, cut))
        position = cut
    if position < total:
        segments.append(Segment(position, total))
    return segments


def concat_wavs(paths: list[Path], dst: Path, crossfade_ms: int = 12) -> Path:
    """Join converted chunks back into one file with a short crossfade at the seams."""
    if not paths:
        raise AudioError("Não há nada para juntar.")

    pieces: list[np.ndarray] = []
    sample_rate: int | None = None
    for path in paths:
        chunk, rate = read_wav(path)
        if sample_rate is None:
            sample_rate = rate
        elif rate != sample_rate:
            raise AudioError(f"Sample rates inconsistentes: {rate} != {sample_rate}")
        pieces.append(chunk)

    assert sample_rate is not None
    fade = int(sample_rate * crossfade_ms / 1000)
    output = pieces[0]
    for chunk in pieces[1:]:
        overlap = min(fade, output.size, chunk.size)
        if overlap <= 0:
            output = np.concatenate([output, chunk])
            continue
        ramp = np.linspace(0.0, 1.0, overlap, dtype=np.float32)
        blended = output[-overlap:] * (1.0 - ramp) + chunk[:overlap] * ramp
        output = np.concatenate([output[:-overlap], blended, chunk[overlap:]])

    return write_wav(dst, output, sample_rate)
