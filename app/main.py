import asyncio
import uuid
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import (
    ALLOWED_EXTENSIONS,
    MAX_UPLOAD_BYTES,
    MODEL_SIZE,
    STATIC_DIR,
    UPLOAD_DIR,
)
from app.transcriber import ModelUnavailableError, transcribe

app = FastAPI(title="Transcrever", version="1.0.0")

UPLOAD_DIR.mkdir(exist_ok=True)


def _save_upload(upload: UploadFile) -> Path:
    suffix = Path(upload.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Formato não suportado: {suffix or 'desconhecido'}",
        )

    dest = UPLOAD_DIR / f"{uuid.uuid4().hex}{suffix}"
    written = 0
    try:
        with dest.open("wb") as out:
            while chunk := upload.file.read(1024 * 1024):
                written += len(chunk)
                if written > MAX_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=f"Arquivo excede o limite de {MAX_UPLOAD_BYTES // (1024 * 1024)} MB",
                    )
                out.write(chunk)
    except Exception:
        dest.unlink(missing_ok=True)
        raise

    if written == 0:
        dest.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="Arquivo vazio")

    return dest


@app.post("/api/transcribe")
async def transcribe_endpoint(
    file: UploadFile = File(...),
    language: str | None = Form(None),
    task: str = Form("transcribe"),
):
    if task not in {"transcribe", "translate"}:
        raise HTTPException(status_code=400, detail="Tarefa inválida")

    path = await asyncio.to_thread(_save_upload, file)
    try:
        result = await asyncio.to_thread(
            transcribe, str(path), language or None, task
        )
    except ModelUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    finally:
        path.unlink(missing_ok=True)

    result["filename"] = file.filename
    return result


@app.get("/api/health")
async def health():
    return {"status": "ok", "model": MODEL_SIZE}


@app.get("/")
async def index():
    return FileResponse(STATIC_DIR / "index.html")


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
