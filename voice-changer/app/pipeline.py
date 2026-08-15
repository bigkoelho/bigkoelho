"""The conversion pipeline: source audio + voice sample -> converted file."""

from __future__ import annotations

import shutil
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path

from . import audio
from .config import Settings
from .engines.base import VoiceConversionEngine

ProgressCallback = Callable[[int, str], None]


@dataclass(frozen=True)
class ConversionOptions:
    output_format: str = "wav"
    normalize: bool = True


@dataclass(frozen=True)
class ConversionResult:
    output_path: Path
    duration: float
    chunks: int
    sample_rate: int


def convert_file(
    engine: VoiceConversionEngine,
    settings: Settings,
    source_path: Path,
    reference_path: Path,
    output_path: Path,
    options: ConversionOptions,
    progress: ProgressCallback | None = None,
) -> ConversionResult:
    """Run one full conversion, reporting progress from 0 to 100."""

    def report(percent: int, message: str) -> None:
        if progress is not None:
            progress(percent, message)

    workdir = output_path.parent / f"{output_path.stem}_work"
    workdir.mkdir(parents=True, exist_ok=True)

    try:
        report(3, "A preparar a amostra de voz…")
        reference_wav = workdir / "reference.wav"
        audio.prepare_reference(
            reference_path,
            reference_wav,
            settings.reference_sample_rate,
            settings.max_reference_seconds,
        )

        report(8, "A descodificar o áudio de origem…")
        source_wav = workdir / "source.wav"
        audio.decode_to_wav(source_path, source_wav, settings.working_sample_rate)

        duration = audio.probe_duration(source_wav)
        if duration <= 0:
            raise audio.AudioError("O ficheiro de origem não contém áudio.")
        if duration > settings.max_source_seconds:
            raise audio.AudioError(
                f"O áudio tem {duration / 60:.1f} min, acima do limite de "
                f"{settings.max_source_seconds / 60:.0f} min."
            )

        samples, sample_rate = audio.read_wav(source_wav)
        segments = audio.find_segments(samples, sample_rate, settings.chunk_seconds)

        report(12, "A carregar o modelo de voz…")
        engine.load()

        chunks_dir = workdir / "chunks"
        chunks_dir.mkdir(exist_ok=True)
        converted: list[Path] = []
        total = len(segments)
        for index, segment in enumerate(segments, start=1):
            chunk_in = chunks_dir / f"in_{index:04d}.wav"
            chunk_out = chunks_dir / f"out_{index:04d}.wav"
            audio.write_wav(chunk_in, samples[segment.start : segment.end], sample_rate)
            engine.convert(chunk_in, reference_wav, chunk_out)
            converted.append(chunk_out)
            report(
                15 + int(75 * index / total),
                f"A converter… bloco {index} de {total}",
            )
            chunk_in.unlink(missing_ok=True)

        report(92, "A juntar os blocos…")
        joined = workdir / "joined.wav"
        audio.concat_wavs(converted, joined)

        report(96, "A exportar…")
        out_rate = audio.wav_sample_rate(joined)
        # mp3 cannot carry every rate the models produce; 48 kHz is its practical ceiling.
        encode_rate = out_rate if options.output_format == "wav" else min(out_rate, 48000)
        audio.encode_output(joined, output_path, options.output_format, options.normalize, encode_rate)

        result = ConversionResult(
            output_path=output_path,
            duration=audio.probe_duration(output_path),
            chunks=total,
            sample_rate=out_rate,
        )
        report(100, "Concluído")
        return result
    finally:
        shutil.rmtree(workdir, ignore_errors=True)
