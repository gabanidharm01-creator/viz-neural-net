from fastapi import APIRouter, HTTPException, status
from app.schemas.convolution import ConvolutionRequest, ConvolutionResult
from app.engines.convolution_engine import compute_convolution_2d

router = APIRouter(tags=["Convolution Engine"])

@router.post("/api/convolution", response_model=ConvolutionResult, summary="Perform 2D Convolution")
@router.post("/cnn/convolution", response_model=ConvolutionResult, summary="Perform 2D Convolution (Alias)")
async def calculate_convolution_endpoint(payload: ConvolutionRequest):
    """
    Computes exact 2D spatial convolution using NumPy and PyTorch.
    Returns step-by-step patch extraction, elementwise multiplication, sums, and output progress.
    """
    try:
        result = compute_convolution_2d(
            image=payload.image,
            kernel=payload.kernel,
            stride=payload.stride,
            padding=payload.padding
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Convolution computation failed: {str(e)}"
        )
