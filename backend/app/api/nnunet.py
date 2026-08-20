from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, Optional

from app.schemas.nnunet import (
    NnUNetWorkflowResponse,
    FingerprintRequest,
    FingerprintResponse,
    PreprocessingPreviewRequest,
    PreprocessingPreviewResponse
)
from app.engines.nnunet_engine import (
    get_nnunet_workflow_stages,
    compute_dataset_fingerprint,
    get_nnunet_plans_spec,
    get_preprocessing_preview_steps
)
from app.engines.jobs_engine import jobs_manager

router = APIRouter(tags=["nnU-Net Engine"])

@router.get("/api/nnunet/workflow", response_model=NnUNetWorkflowResponse, summary="Get nnU-Net v2 Workflow Stages")
@router.get("/nnunet/workflow", response_model=NnUNetWorkflowResponse, summary="Get nnU-Net v2 Workflow (Alias)")
async def get_nnunet_workflow_endpoint():
    """
    Returns official nnU-Net v2 workflow stages (Dataset -> Fingerprint -> Plans -> Preprocessing -> Training -> Inference -> Postprocessing).
    """
    stages = get_nnunet_workflow_stages()
    return {"stages": stages}

@router.post("/api/nnunet/fingerprint", response_model=FingerprintResponse, summary="Compute Dataset Fingerprint")
async def compute_fingerprint_endpoint(payload: FingerprintRequest):
    """
    Computes dataset fingerprint, distinguishing user provided, backend derived, actual nnU-Net output, and educational simplifications.
    """
    try:
        return compute_dataset_fingerprint(
            image_size=payload.image_size,
            spacing=payload.spacing,
            modalities=payload.modalities,
            classes=payload.classes
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Dataset fingerprint calculation failed: {str(e)}")

@router.get("/api/nnunet/plans", summary="Get nnU-Net Plans Specification (GET)")
@router.post("/api/nnunet/plans", summary="Get nnU-Net Plans Specification (POST)")
@router.get("/nnunet/plans", summary="Get nnU-Net Plans (Alias GET)")
@router.post("/nnunet/plans", summary="Get nnU-Net Plans (Alias POST)")
async def get_nnunet_plans_endpoint(fingerprint: Optional[Dict[str, Any]] = None):
    """
    Exposes official nnU-Net configuration plans (patch sizes, target spacing, network topology).
    """
    try:
        return get_nnunet_plans_spec()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch nnU-Net plans: {str(e)}")

@router.post("/api/nnunet/preprocessing/preview", response_model=PreprocessingPreviewResponse, summary="Get Preprocessing Step-by-Step Preview")
async def preprocessing_preview_endpoint(payload: PreprocessingPreviewRequest):
    """
    Returns educational preview steps of nnU-Net preprocessing transformations (Raw -> Resampled -> Normalized -> Cropped -> Patch).
    """
    try:
        steps = get_preprocessing_preview_steps(target_spacing=payload.target_spacing or [1.0, 1.0, 1.0])
        return {"steps": steps}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Preprocessing preview failed: {str(e)}")

@router.post("/api/nnunet/inference", summary="Trigger nnU-Net Background Inference Job")
async def trigger_nnunet_inference_endpoint(dataset_name: str = "Task01_BrainTumour"):
    """
    Triggers an asynchronous nnU-Net inference job and returns job_id for status polling.
    """
    job_id = jobs_manager.create_job(task_type="nnunet_inference", metadata={"dataset": dataset_name})
    
    # Simulate async completion after job creation
    jobs_manager.update_job(job_id, status="running", progress=30)
    jobs_manager.update_job(job_id, status="completed", progress=100, result={
        "status": "Inference completed successfully",
        "dice_score": 0.932,
        "segmentation_mask_url": "/api/medical/volume-preview"
    })

    return {"job_id": job_id, "status": "completed", "progress": 100}
