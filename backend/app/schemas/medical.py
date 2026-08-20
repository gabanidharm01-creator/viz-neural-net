from typing import List, Optional, Any
from pydantic import BaseModel

class MedicalImageInfoResponse(BaseModel):
    filename: str
    format: str
    shape: List[int]
    spacing: List[float]
    orientation: str
    affine: Optional[List[List[float]]] = None
    number_of_slices: int
    datatype: str
    min_intensity: float
    max_intensity: float

class VolumePreviewRequest(BaseModel):
    slice_axis: str = "z" # x, y, z
    slice_index: Optional[int] = None

class VolumePreviewResponse(BaseModel):
    slice_axis: str
    slice_index: int
    total_slices: int
    image_base64: str
