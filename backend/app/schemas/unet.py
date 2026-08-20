from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

Matrix = List[List[float]]

class UNetArchitectureRequest(BaseModel):
    input_size: int = Field(64, ge=16, le=512)
    base_features: int = Field(32, ge=8, le=256)
    depth: int = Field(4, ge=1, le=6)
    num_classes: int = Field(2, ge=1, le=10)
    dimensions: int = Field(2, ge=2, le=3)

class UNetBlock(BaseModel):
    id: str
    label: str
    stage: str
    level: int
    shape: List[int]
    description: str
    parameters: Optional[int] = 0

class UNetSkip(BaseModel):
    id: str
    from_block: str = Field(..., alias="from")
    to_block: str = Field(..., alias="to")
    level: int
    encoder_shape: List[int]
    decoder_shape: List[int]
    concatenated_shape: List[int]
    purpose: str

    model_config = {
        "populate_by_name": True
    }

class UNetArchitecture(BaseModel):
    name: str
    blocks: List[UNetBlock]
    skips: List[UNetSkip]
    source: str = "backend"

class UNetForwardRequest(BaseModel):
    sample_type: Optional[str] = "circle"
    input_size: Optional[int] = 64
    debug_mode: Optional[bool] = False

class UNetLayerActivation(BaseModel):
    name: str
    type: str
    input_shape: List[int]
    output_shape: List[int]
    activation_summary: Dict[str, float]
    sample_map: Optional[Matrix] = None
    parameters: Optional[int] = 0

class UNetForwardResponse(BaseModel):
    layers: List[UNetLayerActivation]
    skip_connections: List[Dict[str, Any]]
    final_output_shape: List[int]
    prediction_preview: Optional[Matrix] = None
    source: str = "backend"

class SyntheticDatasetRequest(BaseModel):
    pattern: str = Field("circle", description="circle, square, brain, lesion")
    size: int = Field(64, ge=32, le=256)

class SyntheticDatasetResponse(BaseModel):
    pattern: str
    input: Matrix
    ground_truth: Matrix
    prediction: Matrix

class UNetTrainRequest(BaseModel):
    epochs: int = Field(5, ge=1, le=50)
    learning_rate: float = Field(0.001, gt=0)
    batch_size: int = Field(4, ge=1, le=32)

class UNetTrainProgress(BaseModel):
    epoch: int
    loss: float
    dice: float
    status: str = "training"
