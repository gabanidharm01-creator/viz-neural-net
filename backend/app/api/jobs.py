from fastapi import APIRouter, HTTPException, status
from app.engines.jobs_engine import jobs_manager

router = APIRouter(tags=["Background Jobs"])

@router.get("/api/jobs/{job_id}", summary="Get Background Job Status")
async def get_job_status_endpoint(job_id: str):
    """
    Returns background job execution status, progress percentage, and result payload.
    """
    job = jobs_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job ID '{job_id}' not found.")
    return job
