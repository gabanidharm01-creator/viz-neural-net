import uuid
import time
from typing import Dict, Any, Optional

class JobTracker:
    def __init__(self):
        self._jobs: Dict[str, Dict[str, Any]] = {}

    def create_job(self, task_type: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        job_id = str(uuid.uuid4())
        self._jobs[job_id] = {
            "job_id": job_id,
            "task_type": task_type,
            "status": "queued",
            "progress": 0,
            "result": None,
            "error": None,
            "created_at": time.time(),
            "updated_at": time.time(),
            "metadata": metadata or {}
        }
        return job_id

    def update_job(
        self,
        job_id: str,
        status: Optional[str] = None,
        progress: Optional[int] = None,
        result: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None
    ) -> None:
        if job_id in self._jobs:
            job = self._jobs[job_id]
            if status:
                job["status"] = status
            if progress is not None:
                job["progress"] = progress
            if result is not None:
                job["result"] = result
            if error is not None:
                job["error"] = error
            job["updated_at"] = time.time()

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        return self._jobs.get(job_id)

jobs_manager = JobTracker()
