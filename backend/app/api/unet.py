from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional, List, Dict, Any

from app.schemas.unet import (
    UNetArchitectureRequest,
    UNetArchitecture,
    UNetForwardRequest,
    UNetForwardResponse,
    SyntheticDatasetRequest,
    SyntheticDatasetResponse,
    UNetTrainRequest
)
from app.engines.unet_engine import (
    get_unet_architecture_spec,
    run_unet_forward_visualization,
    generate_synthetic_mask,
    train_educational_unet
)

router = APIRouter(tags=["U-Net Engine"])

@router.get("/api/unet/architecture", response_model=UNetArchitecture, summary="Get U-Net Architecture (GET)")
@router.post("/api/unet/architecture", response_model=UNetArchitecture, summary="Get U-Net Architecture (POST)")
@router.post("/unet/architecture", response_model=UNetArchitecture, summary="Get U-Net Architecture (Alias)")
async def get_unet_architecture_endpoint(
    input_size: int = Query(64),
    base_features: int = Query(32),
    depth: int = Query(4),
    num_classes: int = Query(2),
    dimensions: int = Query(2),
    payload: Optional[UNetArchitectureRequest] = None
):
    """
    Returns U-Net layer block structure, shapes, parameter counts, and skip connection definitions.
    """
    if payload is not None:
        s_in, b_feat, d, n_cls, dims = (
            payload.input_size, payload.base_features, payload.depth, payload.num_classes, payload.dimensions
        )
    else:
        s_in, b_feat, d, n_cls, dims = input_size, base_features, depth, num_classes, dimensions

    try:
        return get_unet_architecture_spec(
            input_size=s_in,
            base_features=b_feat,
            depth=d,
            num_classes=n_cls,
            dimensions=dims
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to generate U-Net architecture: {str(e)}")

@router.post("/api/unet/forward", response_model=UNetForwardResponse, summary="Execute U-Net Forward Pass")
async def unet_forward_pass_endpoint(payload: UNetForwardRequest):
    """
    Executes PyTorch EducationalUNet2D forward pass and returns captured intermediate tensor activations & skip connections.
    """
    try:
        return run_unet_forward_visualization(
            input_size=payload.input_size or 64,
            sample_type=payload.sample_type or "circle",
            debug_mode=payload.debug_mode or False
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"U-Net forward pass failed: {str(e)}")

@router.post("/api/unet/synthetic-data", response_model=SyntheticDatasetResponse, summary="Generate Synthetic Mask Dataset")
async def generate_synthetic_data_endpoint(payload: SyntheticDatasetRequest):
    """
    Generates synthetic 2D image, ground truth mask, and simulated model prediction.
    """
    try:
        return generate_synthetic_mask(pattern=payload.pattern, size=payload.size)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to generate synthetic data: {str(e)}")

@router.post("/api/unet/train", summary="Educational U-Net Training Demo")
async def train_unet_endpoint(payload: UNetTrainRequest):
    """
    Runs a mini PyTorch educational training demo on synthetic data.
    """
    try:
        history = train_educational_unet(
            epochs=payload.epochs,
            lr=payload.learning_rate,
            batch_size=payload.batch_size
        )
        return {"training_history": history, "source": "backend"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Training demo failed: {str(e)}")
