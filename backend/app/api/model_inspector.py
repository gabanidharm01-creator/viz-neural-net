from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, Optional
from app.engines.model_inspector_engine import inspect_pytorch_model

router = APIRouter(tags=["Model Inspector"])

@router.post("/api/model/inspect", summary="Inspect Model Architecture Graph")
@router.post("/model/inspect", summary="Inspect Model Architecture Graph (Alias)")
async def inspect_model_endpoint(params: Optional[Dict[str, Any]] = None):
    """
    Inspects PyTorch model layers, parameter count, input/output tensor shapes, and graph connections.
    """
    model_type = "unet2d"
    if params and "model_type" in params:
        model_type = str(params["model_type"])

    try:
        return inspect_pytorch_model(model_type=model_type)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Model inspection failed: {str(e)}")
