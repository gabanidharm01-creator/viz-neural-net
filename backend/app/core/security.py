import re
from pathlib import Path
from fastapi import HTTPException, status
from app.core.config import settings

ALLOWED_MEDICAL_EXTENSIONS = {".png", ".jpg", ".jpeg", ".nii", ".gz", ".nrrd", ".dcm"}

def sanitize_filename(filename: str) -> str:
    """Sanitize uploaded filenames to prevent path traversal attack."""
    clean_name = Path(filename).name
    clean_name = re.sub(r"[^\w\.-]", "_", clean_name)
    return clean_name

def validate_uploaded_file(filename: str, content_bytes: bytes) -> None:
    """Validate file extension and file size."""
    ext = Path(filename).suffix.lower()
    if filename.endswith(".nii.gz"):
        ext = ".gz"
        
    if ext not in ALLOWED_MEDICAL_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(sorted(ALLOWED_MEDICAL_EXTENSIONS))}"
        )
        
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content_bytes) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )
