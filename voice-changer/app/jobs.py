"""In-memory job queue with a single worker thread.

Conversions take from seconds to minutes, far too long for a request/response
cycle, so the API hands back a job id and the browser polls for progress. One
worker keeps memory bounded and avoids concurrent inference on the same model.
"""

from __future__ import annotations

import threading
import time
import traceback
import uuid
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path


class JobStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    DONE = "done"
    ERROR = "error"


@dataclass
class Job:
    id: str
    status: JobStatus = JobStatus.QUEUED
    progress: int = 0
    message: str = "Na fila…"
    created_at: float = field(default_factory=time.time)
    finished_at: float | None = None
    source_name: str = ""
    voice_name: str = ""
    engine: str = ""
    model: str = ""
    output_path: Path | None = None
    output_name: str = ""
    duration: float = 0.0
    chunks: int = 0
    error: str = ""
    # Files removed once the job finishes, whatever the outcome.
    temp_paths: list[Path] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "status": self.status.value,
            "progress": self.progress,
            "message": self.message,
            "created_at": self.created_at,
            "finished_at": self.finished_at,
            "source_name": self.source_name,
            "voice_name": self.voice_name,
            "engine": self.engine,
            "model": self.model,
            "output_name": self.output_name,
            "duration": round(self.duration, 2),
            "chunks": self.chunks,
            "error": self.error,
            "elapsed": round((self.finished_at or time.time()) - self.created_at, 1),
        }


class JobStore:
    def __init__(self, retention_hours: int = 12, max_workers: int = 1) -> None:
        self._jobs: dict[str, Job] = {}
        self._lock = threading.Lock()
        self._pool: ThreadPoolExecutor | None = None
        self._max_workers = max_workers
        self._retention = retention_hours * 3600

    def _executor(self) -> ThreadPoolExecutor:
        """The worker pool, created on demand.

        Building it lazily means a store that was shut down (an app restart, or a
        second lifespan in the same process) simply starts a fresh pool instead of
        rejecting every job from then on.
        """
        with self._lock:
            if self._pool is None:
                self._pool = ThreadPoolExecutor(
                    max_workers=self._max_workers, thread_name_prefix="vc-worker"
                )
            return self._pool

    def create(self, source_name: str, voice_name: str) -> Job:
        job = Job(id=uuid.uuid4().hex[:12], source_name=source_name, voice_name=voice_name)
        with self._lock:
            self._jobs[job.id] = job
        return job

    def get(self, job_id: str) -> Job | None:
        with self._lock:
            return self._jobs.get(job_id)

    def list(self) -> list[Job]:
        with self._lock:
            jobs = list(self._jobs.values())
        return sorted(jobs, key=lambda job: job.created_at, reverse=True)

    def submit(self, job: Job, work: Callable[[Job], None]) -> None:
        self._executor().submit(self._run, job, work)

    def remove(self, job_id: str) -> Job | None:
        """Forget a job and delete its output file."""
        with self._lock:
            job = self._jobs.pop(job_id, None)
        if job is not None and job.output_path is not None:
            try:
                job.output_path.unlink(missing_ok=True)
            except OSError:
                pass
        return job

    def _run(self, job: Job, work: Callable[[Job], None]) -> None:
        job.status = JobStatus.RUNNING
        job.message = "A começar…"
        try:
            work(job)
            job.status = JobStatus.DONE
            job.progress = 100
            job.message = "Concluído"
        except Exception as exc:  # noqa: BLE001 - the message is shown to the user
            job.status = JobStatus.ERROR
            job.error = str(exc) or exc.__class__.__name__
            job.message = "Erro"
            traceback.print_exc()
        finally:
            job.finished_at = time.time()
            for path in job.temp_paths:
                try:
                    path.unlink(missing_ok=True)
                except OSError:
                    pass
            job.temp_paths.clear()
            self.cleanup()

    def update(self, job: Job, progress: int, message: str) -> None:
        job.progress = max(0, min(100, progress))
        job.message = message

    def cleanup(self) -> None:
        """Drop jobs (and their outputs) older than the retention window."""
        cutoff = time.time() - self._retention
        with self._lock:
            stale = [job for job in self._jobs.values() if job.created_at < cutoff]
            for job in stale:
                self._jobs.pop(job.id, None)
        for job in stale:
            if job.output_path is not None:
                try:
                    job.output_path.unlink(missing_ok=True)
                except OSError:
                    pass

    def shutdown(self) -> None:
        with self._lock:
            pool, self._pool = self._pool, None
        if pool is not None:
            pool.shutdown(wait=False, cancel_futures=True)
