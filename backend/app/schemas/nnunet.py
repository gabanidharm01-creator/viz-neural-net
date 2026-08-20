from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class NnUNetStage(BaseModel):
    id: str
    title: str
    name: Optional[str] = None
    summary: str
    description: Optional[str] = None
    details: List[str]

class NnUNetWorkflowResponse(BaseModel):
    stages: List[NnUNetStage]

class FingerprintRequest(BaseModel):
    image_size: List[int] = Field([512, 512, 120])
    spacing: List[float] = Field([0.8, 0.8, 1.5])
    modalities: List[str] = Field(["T1", "T2", "FLAIR"])
    classes: List[str] = Field(["background", "lesion"])

class FingerprintResponse(BaseModel):
    provided_by_user: Dict[str, Any]
    derived_by_backend: Dict[str, Any]
    actual_nnunet_output: Dict[str, Any]
    educational_simplification: Dict[str, Any]

class PreprocessingPreviewRequest(BaseModel):
    dataset_name: Optional[str] = "Task01_BrainTumour"
    target_spacing: Optional[List[float]] = [1.0, 1.0, 1.0]

class PreprocessingStep(BaseModel):
    stage: str
    description: str
    shape_before: List[int]
    shape_after: List[int]
    notes: str

class PreprocessingPreviewResponse(BaseModel):
    steps: List[PreprocessingStep]
