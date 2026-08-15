"""Audio helpers: chunking, joining and ffmpeg round trips."""

from __future__ import annotations

import numpy as np

from app import audio

from .conftest import requires_ffmpeg, silence, tone


def test_short_audio_is_a_single_segment(sample_rate: int) -> None:
    samples = tone(4.0, sample_rate)
    segments = audio.find_segments(samples, sample_rate, max_seconds=20)
    assert len(segments) == 1
    assert segments[0].start == 0
    assert segments[0].end == samples.size


def test_segments_cover_the_whole_signal_without_gaps(sample_rate: int) -> None:
    samples = tone(25.0, sample_rate)
    segments = audio.find_segments(samples, sample_rate, max_seconds=5)

    assert segments[0].start == 0
    assert segments[-1].end == samples.size
    for previous, current in zip(segments, segments[1:]):
        assert current.start == previous.end
    assert all(segment.length <= 5 * sample_rate + 1 for segment in segments)


def test_cuts_land_inside_the_silences(sample_rate: int) -> None:
    # 4 s speech, 1 s silence, repeated: cuts should land in the quiet stretches.
    block = np.concatenate([tone(4.0, sample_rate), silence(1.0, sample_rate)])
    samples = np.concatenate([block] * 4)
    segments = audio.find_segments(samples, sample_rate, max_seconds=6, min_seconds=2)

    assert len(segments) > 1
    for segment in segments[:-1]:
        # Each internal cut should sit in a low-energy window.
        window = samples[max(segment.end - 200, 0) : segment.end + 200]
        assert float(np.abs(window).max()) < 0.05


def test_concat_restores_the_original_length(tmp_path, sample_rate: int) -> None:
    pieces = []
    for index in range(3):
        path = tmp_path / f"piece_{index}.wav"
        audio.write_wav(path, tone(2.0, sample_rate, freq=120 + index * 40), sample_rate)
        pieces.append(path)

    joined = audio.concat_wavs(pieces, tmp_path / "joined.wav", crossfade_ms=10)
    samples, rate = audio.read_wav(joined)

    assert rate == sample_rate
    # 6 s minus two 10 ms crossfades.
    expected = 6.0 * sample_rate - 2 * int(0.010 * sample_rate)
    assert abs(samples.size - expected) < sample_rate * 0.02


@requires_ffmpeg
def test_decode_converts_to_mono_at_the_requested_rate(make_wav, tmp_path) -> None:
    source = make_wav("source.wav", seconds=3.0)
    decoded = audio.decode_to_wav(source, tmp_path / "decoded.wav", sample_rate=16000)

    samples, rate = audio.read_wav(decoded)
    assert rate == 16000
    assert samples.ndim == 1
    assert abs(audio.probe_duration(decoded) - 3.0) < 0.1


@requires_ffmpeg
def test_prepare_reference_trims_silence_and_caps_length(tmp_path, sample_rate: int) -> None:
    padded = np.concatenate([silence(2.0, sample_rate), tone(6.0, sample_rate), silence(2.0, sample_rate)])
    raw = audio.write_wav(tmp_path / "raw.wav", padded, sample_rate)

    prepared = audio.prepare_reference(raw, tmp_path / "ref.wav", sample_rate=24000, max_seconds=30)
    duration = audio.probe_duration(prepared)

    assert 5.0 < duration < 7.5  # the 4 s of padding is gone


@requires_ffmpeg
def test_prepare_reference_handles_audio_without_any_silence(make_wav, tmp_path) -> None:
    # Regression: silenceremove feeding loudnorm deadlocks ffmpeg 6.x when there is
    # no silence to strip and the whole stream has to be flushed.
    source = make_wav("no_silence.wav", seconds=8.0)
    prepared = audio.prepare_reference(source, tmp_path / "ref.wav", sample_rate=24000, max_seconds=30)
    assert abs(audio.probe_duration(prepared) - 8.0) < 0.3


@requires_ffmpeg
def test_prepare_reference_respects_the_cap(make_wav, tmp_path) -> None:
    long_sample = make_wav("long.wav", seconds=40.0)
    prepared = audio.prepare_reference(long_sample, tmp_path / "ref.wav", sample_rate=24000, max_seconds=10)
    assert audio.probe_duration(prepared) <= 10.5


@requires_ffmpeg
def test_encode_output_writes_mp3(make_wav, tmp_path) -> None:
    source = make_wav("source.wav", seconds=2.0)
    out = audio.encode_output(source, tmp_path / "out.mp3", fmt="mp3", normalize=True)
    assert out.exists() and out.stat().st_size > 1000
