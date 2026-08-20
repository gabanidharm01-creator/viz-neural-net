from typing import List, Optional
from pydantic import BaseModel, Field

Matrix = List[List[float]]

class MetricsRequest(BaseModel):
    ground_truth: Matrix = Field(..., description="2D target ground truth mask")
    prediction: Matrix = Field(..., description="2D predicted mask or probability map")
    threshold: float = Field(0.5, ge=0.0, le=1.0)

class MetricsResult(BaseModel):
    dice: float
    iou: float
    precision: float
    recall: float
    tp: int
    fp: int
    fn: int
    tn: int
    source: str = "backend"
