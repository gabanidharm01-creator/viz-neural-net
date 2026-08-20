from typing import List, Tuple, Optional, Any, Union
from pydantic import BaseModel, Field

Matrix = List[List[float]]

class ConvolutionRequest(BaseModel):
    image: Matrix = Field(..., description="2D input image matrix")
    kernel: Matrix = Field(..., description="2D convolution kernel filter")
    stride: int = Field(1, ge=1, description="Convolution stride step")
    padding: int = Field(0, ge=0, description="Padding added to input image border")

class ConvolutionStep(BaseModel):
    index: int
    out_row: int
    out_col: int
    patch: Matrix
    kernel: Matrix
    products: Matrix
    sum: float
    output_so_far: List[List[Optional[float]]]
    position: Tuple[int, int]
    output_position: Tuple[int, int]

class ConvolutionResult(BaseModel):
    input_shape: Tuple[int, int]
    kernel_shape: Tuple[int, int]
    stride: int
    padding: int
    output_shape: Tuple[int, int]
    output: Matrix
    steps: List[ConvolutionStep]
    source: str = "backend"

class ReluRequest(BaseModel):
    image: Optional[Matrix] = None
    tensor: Optional[Matrix] = None

class ReluResult(BaseModel):
    input: Matrix
    output: Matrix
    clamped: List[Tuple[int, int]]
    changed_positions: List[Tuple[int, int]]
    source: str = "backend"

class PoolingRequest(BaseModel):
    image: Optional[Matrix] = None
    tensor: Optional[Matrix] = None
    window: Optional[Tuple[int, int]] = None
    kernel_size: Optional[Union[int, Tuple[int, int]]] = None
    stride: int = 2

class PoolingStep(BaseModel):
    index: int
    out_row: int
    out_col: int
    region: Matrix
    max: float
    max_position: Tuple[int, int]
    output_position: Tuple[int, int]
    output_so_far: List[List[Optional[float]]]

class PoolingResult(BaseModel):
    input_shape: Tuple[int, int]
    window: Tuple[int, int]
    stride: int
    output_shape: Tuple[int, int]
    output: Matrix
    steps: List[PoolingStep]
    source: str = "backend"
