import os
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.core.config import settings
from app.core.security import sanitize_filename, validate_uploaded_file
from app.schemas.medical import MedicalImageInfoResponse, VolumePreviewRequest, VolumePreviewResponse
from app.engines.medical_image_engine import parse_medical_image, get_medical_slice_base64

router = APIRouter(tags=["Medical Image Engine"])

@router.post("/api/medical/upload", summary="Upload Medical Image File")
async def upload_medical_file_endpoint(file: UploadFile = File(...)):
    """Uploads NIfTI, NRRD, PNG, JPG file and saves it in temporary server storage."""
    filename = sanitize_filename(file.filename or "medical_image.nii.gz")
    content = await file.read()
    
    validate_uploaded_file(filename, content)

    save_path = settings.TEMP_DIR / filename
    with open(save_path, "wb") as f:
        f.write(content)

    return {"filename": filename, "saved_path": str(save_path), "size_bytes": len(content)}

@router.post("/api/medical/image-info", response_model=MedicalImageInfoResponse, summary="Extract Medical Image Metadata")
async def get_image_info_endpoint(filename: str):
    """
    Extracts shape, voxel spacing, orientation, affine, slice count, and intensity range.
    """
    file_path = settings.TEMP_DIR / sanitize_filename(filename)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"File '{filename}' not found in server temporary directory.")

    try:
        return parse_medical_image(str(file_path))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse medical image: {str(e)}")

@router.post("/api/medical/volume-preview", response_model=VolumePreviewResponse, summary="Render Medical Volume Slice Preview")
async def preview_volume_slice_endpoint(filename: str, payload: VolumePreviewRequest):
    """
    Renders 2D slice preview along specified axis ('x', 'y', 'z') as base64 PNG.
    """
    file_path = settings.TEMP_DIR / sanitize_filename(filename)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"File '{filename}' not found.")

    try:
        return get_medical_slice_base64(
            file_path=str(file_path),
            axis=payload.slice_axis,
            slice_idx=payload.slice_index
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Slice preview generation failed: {str(e)}")
