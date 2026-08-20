from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class AiExplainRequest(BaseModel):
    question: str
    module: Optional[str] = None
    current_module: Optional[str] = None
    current_step: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    visualization_state: Optional[Dict[str, Any]] = None

class AiExplainResponse(BaseModel):
    answer: str
    source: str = "backend"

class GenerateVisualizationRequest(BaseModel):
    prompt: str
    current_module: Optional[str] = "convolution"

class VisualizationCommand(BaseModel):
    type: str # CONVOLUTION, RELU, POOLING, UPSAMPLE, DOWNSAMPLE, CONCAT, SKIP_CONNECTION, DICE, IOU, etc.
    input_size: Optional[Any] = None
    kernel: Optional[Any] = None
    stride: Optional[int] = 1
    padding: Optional[int] = 0
    params: Optional[Dict[str, Any]] = None
    description: Optional[str] = None

class GenerateVisualizationResponse(BaseModel):
    command: VisualizationCommand
    message: str
    executed_result: Optional[Dict[str, Any]] = None
    source: str = "backend"
