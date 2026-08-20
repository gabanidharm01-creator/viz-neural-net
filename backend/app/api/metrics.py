from fastapi import APIRouter, HTTPException, status
from app.schemas.metrics import MetricsRequest, MetricsResult
from app.engines.metrics_engine import compute_segmentation_metrics

router = APIRouter(tags=["Segmentation Metrics Engine"])

@router.post("/api/metrics/dice", response_model=MetricsResult, summary="Calculate Dice Metric")
@router.post("/api/metrics/iou", response_model=MetricsResult, summary="Calculate IoU Metric")
@router.post("/api/metrics/precision", response_model=MetricsResult, summary="Calculate Precision Metric")
@router.post("/api/metrics/recall", response_model=MetricsResult, summary="Calculate Recall Metric")
@router.post("/api/metrics/segmentation", response_model=MetricsResult, summary="Calculate All Segmentation Metrics")
@router.post("/metrics/segmentation", response_model=MetricsResult, summary="Calculate All Metrics (Alias)")
async def calculate_metrics_endpoint(payload: MetricsRequest):
    """
    Calculates exact segmentation metrics (Dice, IoU, Precision, Recall, Confusion Matrix) using NumPy.
    """
    try:
        return compute_segmentation_metrics(
            ground_truth=payload.ground_truth,
            prediction=payload.prediction,
            threshold=payload.threshold
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Segmentation metric computation failed: {str(e)}"
        )
