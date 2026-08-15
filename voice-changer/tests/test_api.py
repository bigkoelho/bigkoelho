"""End-to-end API tests running against the passthrough engine."""

from __future__ import annotations

import time
from pathlib import Path

import pytest
import soundfile as sf
from fastapi.testclient import TestClient

from app.main import app

from .conftest import requires_ffmpeg

pytestmark = requires_ffmpeg


@pytest.fixture
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client


def _upload(path: Path, field: str) -> dict:
    return {field: (path.name, path.read_bytes(), "audio/wav")}


def _wait_for_job(client: TestClient, job_id: str, timeout: float = 60.0) -> dict:
    deadline = time.time() + timeout
    while time.time() < deadline:
        job = client.get(f"/api/jobs/{job_id}").json()
        if job["status"] in {"done", "error"}:
            return job
        time.sleep(0.2)
    raise AssertionError("O trabalho não terminou a tempo.")


def test_health_reports_configuration(client: TestClient) -> None:
    body = client.get("/api/health").json()
    assert body["status"] == "ok"
    assert body["ffmpeg"] is True
    assert body["engine"] == "passthrough"
    assert body["limits"]["max_upload_mb"] > 0


def test_engines_are_listed(client: TestClient) -> None:
    body = client.get("/api/engines").json()
    keys = {engine["key"] for engine in body["engines"]}
    assert {"coqui", "elevenlabs", "passthrough"} <= keys
    assert body["selected"] == "passthrough"


def test_local_engine_exposes_its_models(client: TestClient) -> None:
    engines = client.get("/api/engines").json()["engines"]
    coqui = next(engine for engine in engines if engine["key"] == "coqui")
    model_keys = {model["key"] for model in coqui["models"]}
    assert {"freevc", "openvoice_v2", "knnvc"} <= model_keys
    assert all(model["label"] for model in coqui["models"])
    # Engines with a single model must not offer a picker.
    passthrough = next(engine for engine in engines if engine["key"] == "passthrough")
    assert passthrough["models"] == []


def test_unknown_model_is_rejected(client: TestClient, make_wav) -> None:
    sample = make_wav("amostra6.wav", seconds=8.0)
    source = make_wav("origem6.wav", seconds=3.0)
    response = client.post(
        "/api/convert",
        data={"model": "modelo-inventado"},
        files={
            "source": (source.name, source.read_bytes(), "audio/wav"),
            "sample": (sample.name, sample.read_bytes(), "audio/wav"),
        },
    )
    assert response.status_code == 400
    assert "Modelo desconhecido" in response.json()["detail"]


def test_voice_library_roundtrip(client: TestClient, make_wav) -> None:
    sample = make_wav("voz.wav", seconds=8.0)

    created = client.post("/api/voices", data={"name": "Voz teste"}, files=_upload(sample, "sample"))
    assert created.status_code == 201
    voice = created.json()
    assert voice["name"] == "Voz teste"
    assert voice["duration"] > 3

    listed = client.get("/api/voices").json()["voices"]
    assert any(item["id"] == voice["id"] for item in listed)

    preview = client.get(f"/api/voices/{voice['id']}/sample")
    assert preview.status_code == 200
    assert preview.headers["content-type"] == "audio/wav"

    assert client.delete(f"/api/voices/{voice['id']}").status_code == 204
    assert client.get(f"/api/voices/{voice['id']}/sample").status_code == 404


def test_short_sample_is_rejected(client: TestClient, make_wav) -> None:
    tiny = make_wav("curta.wav", seconds=1.0)
    response = client.post("/api/voices", data={"name": "curta"}, files=_upload(tiny, "sample"))
    assert response.status_code == 400
    assert "pelo menos" in response.json()["detail"]


def test_convert_with_an_uploaded_sample(client: TestClient, make_wav, tmp_path) -> None:
    sample = make_wav("amostra.wav", seconds=8.0, freq=180)
    source = make_wav("origem.wav", seconds=9.0, freq=110)

    response = client.post(
        "/api/convert",
        data={"output_format": "wav", "normalize": "true", "save_voice": "false"},
        files={
            "source": (source.name, source.read_bytes(), "audio/wav"),
            "sample": (sample.name, sample.read_bytes(), "audio/wav"),
        },
    )
    assert response.status_code == 202
    job = _wait_for_job(client, response.json()["id"])

    assert job["status"] == "done", job["error"]
    assert job["progress"] == 100
    assert job["chunks"] >= 3  # 9 s split into 3 s chunks
    assert abs(job["duration"] - 9.0) < 0.6
    assert job["output_name"].endswith(".wav")

    download = client.get(f"/api/jobs/{job['id']}/download")
    assert download.status_code == 200
    assert len(download.content) > 10000

    # The normalised output must keep the working rate, not loudnorm's 192 kHz.
    result = tmp_path / "resultado.wav"
    result.write_bytes(download.content)
    assert sf.info(str(result)).samplerate == 24000


def test_convert_with_a_saved_voice_and_mp3_output(client: TestClient, make_wav) -> None:
    sample = make_wav("guardada.wav", seconds=8.0)
    voice = client.post("/api/voices", data={"name": "Guardada"}, files=_upload(sample, "sample")).json()
    source = make_wav("origem2.wav", seconds=4.0, freq=140)

    response = client.post(
        "/api/convert",
        data={"voice_id": voice["id"], "output_format": "mp3"},
        files={"source": (source.name, source.read_bytes(), "audio/wav")},
    )
    assert response.status_code == 202
    job = _wait_for_job(client, response.json()["id"])

    assert job["status"] == "done", job["error"]
    assert job["voice_name"] == "Guardada"
    assert job["output_name"].endswith(".mp3")
    assert client.get(f"/api/jobs/{job['id']}/download").headers["content-type"] == "audio/mpeg"


def test_convert_can_save_the_voice_for_later(client: TestClient, make_wav) -> None:
    sample = make_wav("nova.wav", seconds=8.0)
    source = make_wav("origem3.wav", seconds=4.0)

    response = client.post(
        "/api/convert",
        data={"save_voice": "true", "voice_name": "Nova voz"},
        files={
            "source": (source.name, source.read_bytes(), "audio/wav"),
            "sample": (sample.name, sample.read_bytes(), "audio/wav"),
        },
    )
    assert response.status_code == 202
    _wait_for_job(client, response.json()["id"])

    names = [voice["name"] for voice in client.get("/api/voices").json()["voices"]]
    assert "Nova voz" in names


def test_convert_requires_a_voice(client: TestClient, make_wav) -> None:
    source = make_wav("origem4.wav", seconds=3.0)
    response = client.post(
        "/api/convert",
        files={"source": (source.name, source.read_bytes(), "audio/wav")},
    )
    assert response.status_code == 400
    assert "amostra" in response.json()["detail"]


def test_unknown_job_returns_404(client: TestClient) -> None:
    assert client.get("/api/jobs/naoexiste").status_code == 404


def test_download_before_completion_conflicts(client: TestClient, make_wav) -> None:
    sample = make_wav("amostra5.wav", seconds=8.0)
    source = make_wav("origem5.wav", seconds=6.0)
    job_id = client.post(
        "/api/convert",
        files={
            "source": (source.name, source.read_bytes(), "audio/wav"),
            "sample": (sample.name, sample.read_bytes(), "audio/wav"),
        },
    ).json()["id"]

    early = client.get(f"/api/jobs/{job_id}/download")
    if early.status_code != 200:  # the job may already be finished on a fast machine
        assert early.status_code == 409
    _wait_for_job(client, job_id)


def test_index_page_is_served(client: TestClient) -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert "Voice Changer" in response.text
