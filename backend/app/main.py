from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

from app.api import (
    convolution,
    pooling,
    unet,
    metrics,
    medical_images,
    nnunet,
    model_inspector,
    ai,
    jobs
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend for **NeuroVision Lab** — Scientific Computation + AI + nnU-Net Engine.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration - Allow all origins for dev preview and frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Fallback handler for OPTIONS preflight requests."""
    return {"status": "ok"}


# Register Routers
app.include_router(convolution.router)
app.include_router(pooling.router)
app.include_router(unet.router)
app.include_router(metrics.router)
app.include_router(medical_images.router)
app.include_router(nnunet.router)
app.include_router(model_inspector.router)
app.include_router(ai.router)
app.include_router(jobs.router)

@app.get("/health", tags=["Health Check"], summary="Check API Backend Health")
async def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "engine": "PyTorch + NumPy + nnU-Net v2"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
