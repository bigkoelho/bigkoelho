"""FastAPI application: upload a voice sample, convert any audio into that voice."""

from __future__ import annotations

import threading
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles

from . import audio
from .config import get_settings
from .engines import describe_engines, get_engine, reset_engines
from .engines.base import EngineError
from .jobs import Job, JobStatus, JobStore
from .pipeline import ConversionOptions, convert_file
from .voices import VoiceError, VoiceLibrary

STATIC_DIR = Path(__file__).resolve().parent / "static"

ALLOWED_SUFFIXES = {
    ".wav", ".mp3", ".m4a", ".aac", ".ogg", ".oga", ".opus", ".flac", ".webm",
    ".mp4", ".mov", ".mkv", ".aiff", ".aif", ".wma", ".amr", ".3gp",
}

settings = get_settings()
library = VoiceLibrary(settings)
jobs = JobStore(retention_hours=settings.job_retention_hours)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings.ensure_dirs()
    if settings.preload_engine:
        threading.Thread(target=_preload_engine, daemon=True).start()
    yield
    jobs.shutdown()
    reset_engines()


def _preload_engine() -> None:
    try:
        get_engine(settings.engine, settings).load()
    except Exception as exc:  # noqa: BLE001 - never block startup on a model failure
        print(f"[voice-changer] pré-carregamento falhou: {exc}")


app = FastAPI(title="Voice Changer", version="1.0.0", lifespan=lifespan)


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #

def _suffix_of(filename: str, fallback: str = ".wav") -> str:
    suffix = Path(filename or "").suffix.lower()
    return suffix if suffix in ALLOWED_SUFFIXES else fallback


def _save_upload(upload: UploadFile, folder: Path, label: str) -> Path:
    """Stream an upload to disk, enforcing the size cap as we go."""
    if upload is None or not upload.filename:
        raise HTTPException(400, f"Falta o ficheiro: {label}.")
    suffix = Path(upload.filename).suffix.lower()
    if suffix and suffix not in ALLOWED_SUFFIXES:
        raise HTTPException(400, f"Formato não suportado em {label}: {suffix}")

    folder.mkdir(parents=True, exist_ok=True)
    destination = folder / f"{uuid.uuid4().hex[:12]}{_suffix_of(upload.filename)}"
    written = 0
    upload.file.seek(0)
    with destination.open("wb") as handle:
        while True:
            block = upload.file.read(1024 * 1024)
            if not block:
                break
            written += len(block)
            if written > settings.max_upload_bytes:
                handle.close()
                destination.unlink(missing_ok=True)
                raise HTTPException(413, f"{label} excede o limite de {settings.max_upload_mb} MB.")
            handle.write(block)
    if written == 0:
        destination.unlink(missing_ok=True)
        raise HTTPException(400, f"{label} está vazio.")
    return destination


def _require_ffmpeg() -> None:
    if not audio.ffmpeg_available():
        raise HTTPException(
            503,
            "O ffmpeg não está instalado no servidor. Instala-o (apt install ffmpeg) e reinicia.",
        )


# --------------------------------------------------------------------------- #
# Meta
# --------------------------------------------------------------------------- #

@app.get("/api/health")
def health() -> dict:
    return {
        "status": "ok",
        "ffmpeg": audio.ffmpeg_available(),
        "engine": settings.engine,
        "model": settings.coqui_model,
        "device": settings.device,
        "limits": {
            "max_upload_mb": settings.max_upload_mb,
            "max_source_seconds": settings.max_source_seconds,
            "max_reference_seconds": settings.max_reference_seconds,
            "min_reference_seconds": settings.min_reference_seconds,
        },
    }


@app.get("/api/engines")
def engines() -> dict:
    return {
        "selected": settings.engine,
        "engines": [info.__dict__ for info in describe_engines(settings)],
    }


# --------------------------------------------------------------------------- #
# Voice library
# --------------------------------------------------------------------------- #

@app.get("/api/voices")
def list_voices() -> dict:
    return {"voices": [voice.to_dict() for voice in library.list()]}


@app.post("/api/voices", status_code=201)
def create_voice(name: str = Form(""), sample: UploadFile = File(...)) -> dict:
    _require_ffmpeg()
    raw = _save_upload(sample, settings.uploads_dir, "a amostra de voz")
    try:
        voice = library.create(name or Path(sample.filename).stem, raw, sample.filename or "")
    except VoiceError as exc:
        raise HTTPException(400, str(exc)) from exc
    except audio.AudioError as exc:
        raise HTTPException(400, f"Não foi possível ler a amostra: {exc}") from exc
    finally:
        raw.unlink(missing_ok=True)
    return voice.to_dict()


@app.get("/api/voices/{voice_id}/sample")
def voice_sample(voice_id: str) -> FileResponse:
    try:
        path = library.sample_path(voice_id)
    except VoiceError as exc:
        raise HTTPException(404, str(exc)) from exc
    return FileResponse(path, media_type="audio/wav", filename=f"{voice_id}.wav")


@app.delete("/api/voices/{voice_id}", status_code=204)
def delete_voice(voice_id: str):
    try:
        library.delete(voice_id)
    except VoiceError as exc:
        raise HTTPException(404, str(exc)) from exc
    return Response(status_code=204)


# --------------------------------------------------------------------------- #
# Conversion
# --------------------------------------------------------------------------- #

@app.post("/api/convert", status_code=202)
def convert(
    source: UploadFile = File(...),
    voice_id: str = Form(""),
    sample: UploadFile | None = File(None),
    save_voice: bool = Form(False),
    voice_name: str = Form(""),
    output_format: str = Form("wav"),
    normalize: bool = Form(True),
    engine: str = Form(""),
) -> dict:
    """Queue a conversion. Give either a saved ``voice_id`` or a new ``sample``."""
    _require_ffmpeg()

    output_format = output_format.lower()
    if output_format not in {"wav", "mp3"}:
        raise HTTPException(400, "Formato de saída inválido (usa wav ou mp3).")

    engine_key = (engine or settings.engine).lower()
    try:
        selected_engine = get_engine(engine_key, settings)
    except EngineError as exc:
        raise HTTPException(400, str(exc)) from exc
    available, detail = selected_engine.availability()
    if not available:
        raise HTTPException(503, f"O motor '{engine_key}' não está disponível. {detail}")

    source_path = _save_upload(source, settings.uploads_dir, "o áudio de origem")
    temp_paths = [source_path]

    # Resolve the reference: an existing library voice, or a freshly uploaded sample.
    if voice_id:
        try:
            voice = library.get(voice_id)
            reference_path = library.sample_path(voice_id)
        except VoiceError as exc:
            source_path.unlink(missing_ok=True)
            raise HTTPException(404, str(exc)) from exc
        reference_label = voice.name
    elif sample is not None and sample.filename:
        raw_sample = _save_upload(sample, settings.uploads_dir, "a amostra de voz")
        if save_voice:
            try:
                voice = library.create(voice_name or Path(sample.filename).stem, raw_sample, sample.filename)
            except (VoiceError, audio.AudioError) as exc:
                raw_sample.unlink(missing_ok=True)
                source_path.unlink(missing_ok=True)
                raise HTTPException(400, str(exc)) from exc
            raw_sample.unlink(missing_ok=True)
            reference_path = library.sample_path(voice.id)
            reference_label = voice.name
        else:
            reference_path = raw_sample
            reference_label = voice_name or Path(sample.filename).stem
            temp_paths.append(raw_sample)
    else:
        source_path.unlink(missing_ok=True)
        raise HTTPException(400, "Escolhe uma voz guardada ou envia uma amostra de voz.")

    job = jobs.create(source_name=source.filename or "audio", voice_name=reference_label)
    job.temp_paths = temp_paths
    job.output_name = f"{Path(source.filename or 'audio').stem}_{_slug(reference_label)}.{output_format}"
    job.output_path = settings.outputs_dir / f"{job.id}.{output_format}"
    options = ConversionOptions(output_format=output_format, normalize=normalize)

    def work(current: Job) -> None:
        assert current.output_path is not None
        result = convert_file(
            engine=selected_engine,
            settings=settings,
            source_path=source_path,
            reference_path=reference_path,
            output_path=current.output_path,
            options=options,
            progress=lambda percent, message: jobs.update(current, percent, message),
        )
        current.duration = result.duration
        current.chunks = result.chunks

    jobs.submit(job, work)
    return job.to_dict()


def _slug(text: str) -> str:
    keep = [c if c.isalnum() else "-" for c in text.strip().lower()]
    slug = "".join(keep).strip("-")
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug[:40] or "voz"


@app.get("/api/jobs")
def list_jobs() -> dict:
    return {"jobs": [job.to_dict() for job in jobs.list()[:25]]}


@app.get("/api/jobs/{job_id}")
def job_status(job_id: str) -> dict:
    job = jobs.get(job_id)
    if job is None:
        raise HTTPException(404, "Trabalho não encontrado.")
    return job.to_dict()


@app.get("/api/jobs/{job_id}/download")
def download(job_id: str, inline: bool = False) -> FileResponse:
    job = jobs.get(job_id)
    if job is None:
        raise HTTPException(404, "Trabalho não encontrado.")
    if job.status is not JobStatus.DONE or job.output_path is None or not job.output_path.exists():
        raise HTTPException(409, "O resultado ainda não está pronto.")
    media_type = "audio/wav" if job.output_path.suffix == ".wav" else "audio/mpeg"
    headers = {"Content-Disposition": f'inline; filename="{job.output_name}"'} if inline else None
    return FileResponse(
        job.output_path,
        media_type=media_type,
        filename=None if inline else job.output_name,
        headers=headers,
    )


@app.delete("/api/jobs/{job_id}", status_code=204)
def delete_job(job_id: str):
    if jobs.remove(job_id) is None:
        raise HTTPException(404, "Trabalho não encontrado.")
    return Response(status_code=204)


# --------------------------------------------------------------------------- #
# Front end
# --------------------------------------------------------------------------- #

@app.get("/")
def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
