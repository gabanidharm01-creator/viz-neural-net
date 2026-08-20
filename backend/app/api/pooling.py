from fastapi import APIRouter, HTTPException, status
from app.schemas.convolution import PoolingRequest, PoolingResult, ReluRequest, ReluResult
from app.engines.pooling_engine import compute_max_pooling_2d, compute_relu

router = APIRouter(tags=["Pooling & Activation Engine"])

@router.post("/api/relu", response_model=ReluResult, summary="Perform ReLU Activation")
@router.post("/cnn/relu", response_model=ReluResult, summary="Perform ReLU Activation (Alias)")
async def calculate_relu_endpoint(payload: ReluRequest):
    """
    Computes ReLU activation using PyTorch torch.relu().
    """
    matrix = payload.image if payload.image is not None else payload.tensor
    if matrix is None:
        raise HTTPException(status_code=400, detail="Must provide 'image' or 'tensor' matrix.")
    
    try:
        return compute_relu(matrix)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"ReLU computation failed: {str(e)}")

@router.post("/api/pooling", response_model=PoolingResult, summary="Perform 2D Max Pooling")
@router.post("/cnn/max-pooling", response_model=PoolingResult, summary="Perform 2D Max Pooling (Alias)")
async def calculate_pooling_endpoint(payload: PoolingRequest):
    """
    Computes 2D Max Pooling step-by-step using PyTorch and NumPy.
    """
    matrix = payload.image if payload.image is not None else payload.tensor
    if matrix is None:
        raise HTTPException(status_code=400, detail="Must provide 'image' or 'tensor' matrix.")

    window = payload.window
    if window is None:
        if isinstance(payload.kernel_size, int):
            window = (payload.kernel_size, payload.kernel_size)
        elif isinstance(payload.kernel_size, (list, tuple)):
            window = tuple(payload.kernel_size)
        else:
            window = (2, 2)

    try:
        return compute_max_pooling_2d(matrix, window=window, stride=payload.stride)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Max Pooling computation failed: {str(e)}")
