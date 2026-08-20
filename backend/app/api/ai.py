from fastapi import APIRouter, HTTPException, status
from app.schemas.ai import (
    AiExplainRequest,
    AiExplainResponse,
    GenerateVisualizationRequest,
    GenerateVisualizationResponse
)
from app.llm.service import llm_service

router = APIRouter(tags=["AI Service & Visualization DSL"])

@router.post("/api/ai/explain", response_model=AiExplainResponse, summary="AI Tutor Explanation")
@router.post("/ai/explain", response_model=AiExplainResponse, summary="AI Tutor Explanation (Alias)")
async def ai_explain_endpoint(payload: AiExplainRequest):
    """
    Provides scientific explanations based on actual supplied calculation context.
    """
    try:
        mod = payload.module or payload.current_module
        step = payload.current_step
        ctx = payload.context or payload.visualization_state

        answer = await llm_service.explain(
            question=payload.question,
            module=mod,
            current_step=step,
            context=ctx
        )
        return {"answer": answer, "source": "backend"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"AI Tutor response error: {str(e)}")

@router.post("/api/ai/generate-visualization", response_model=GenerateVisualizationResponse, summary="Generate Visualization DSL Plan")
@router.post("/ai/generate-visualization", response_model=GenerateVisualizationResponse, summary="Generate Visualization DSL Plan (Alias)")
async def generate_visualization_endpoint(payload: GenerateVisualizationRequest):
    """
    Generates validated Visualization DSL command and executes actual calculation using NumPy/PyTorch backend.
    """
    try:
        result = await llm_service.generate_visualization_plan(
            prompt=payload.prompt,
            current_module=payload.current_module or "convolution"
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Visualization generation error: {str(e)}")
