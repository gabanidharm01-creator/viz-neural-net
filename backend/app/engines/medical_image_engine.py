import io
import base64
import numpy as np
from pathlib import Path
from typing import Dict, Any, Optional
from PIL import Image

import nibabel as nib
import SimpleITK as sitk

def parse_medical_image(file_path: str) -> Dict[str, Any]:
    """
    Parses NIfTI, NRRD, PNG, JPG medical images using nibabel, SimpleITK, and Pillow.
    Extracts spatial metadata (shape, spacing, orientation, affine, datatype).
    """
    path = Path(file_path)
    suffix = path.suffix.lower()

    if path.name.endswith(".nii.gz") or suffix == ".nii":
        # Process NIfTI using nibabel
        nii_img = nib.load(file_path)
        header = nii_img.header
        data = nii_img.get_fdata()

        shape = list(data.shape)
        spacing = [float(np.round(s, 3)) for s in header.get_zooms()]
        affine = np.round(nii_img.affine, 3).tolist()
        num_slices = shape[2] if len(shape) >= 3 else 1
        datatype = str(data.dtype)
        orientation = "".join(nib.aff2axcodes(nii_img.affine))

        return {
            "filename": path.name,
            "format": "NIfTI",
            "shape": shape,
            "spacing": spacing,
            "orientation": orientation,
            "affine": affine,
            "number_of_slices": num_slices,
            "datatype": datatype,
            "min_intensity": float(np.round(np.min(data), 2)),
            "max_intensity": float(np.round(np.max(data), 2))
        }

    elif suffix in [".nrrd", ".dcm"]:
        # Process NRRD / DICOM using SimpleITK
        sitk_img = sitk.ReadImage(file_path)
        data = sitk.GetArrayFromImage(sitk_img) # shape is (z, y, x)
        shape = list(data.shape)[::-1] # convert to (x, y, z)
        spacing = [float(np.round(s, 3)) for s in sitk_img.GetSpacing()]
        num_slices = shape[2] if len(shape) >= 3 else 1

        return {
            "filename": path.name,
            "format": "NRRD" if suffix == ".nrrd" else "DICOM",
            "shape": shape,
            "spacing": spacing,
            "orientation": "RAS",
            "affine": None,
            "number_of_slices": num_slices,
            "datatype": str(data.dtype),
            "min_intensity": float(np.round(np.min(data), 2)),
            "max_intensity": float(np.round(np.max(data), 2))
        }

    elif suffix in [".png", ".jpg", ".jpeg"]:
        # 2D Standard Image via Pillow
        with Image.open(file_path) as img:
            arr = np.array(img)
            shape = list(arr.shape)
            return {
                "filename": path.name,
                "format": suffix[1:].upper(),
                "shape": shape,
                "spacing": [1.0, 1.0],
                "orientation": "2D",
                "affine": None,
                "number_of_slices": 1,
                "datatype": str(arr.dtype),
                "min_intensity": float(np.min(arr)),
                "max_intensity": float(np.max(arr))
            }
    else:
        raise ValueError(f"Unsupported file extension: {suffix}")

def get_medical_slice_base64(
    file_path: str,
    axis: str = "z",
    slice_idx: Optional[int] = None
) -> Dict[str, Any]:
    """Extracts a normalized 2D slice along axis (x, y, or z) and encodes as base64 PNG."""
    path = Path(file_path)
    suffix = path.suffix.lower()

    if path.name.endswith(".nii.gz") or suffix == ".nii":
        nii_img = nib.load(file_path)
        data = nii_img.get_fdata()
    elif suffix in [".nrrd", ".dcm"]:
        sitk_img = sitk.ReadImage(file_path)
        data = sitk.GetArrayFromImage(sitk_img) # (z, y, x)
        data = np.transpose(data, (2, 1, 0)) # transpose to (x, y, z)
    elif suffix in [".png", ".jpg", ".jpeg"]:
        with Image.open(file_path) as img:
            arr = np.array(img.convert("L"))
            data = arr[:, :, np.newaxis]
    else:
        raise ValueError("Unsupported format")

    # Handle slice axis
    if data.ndim == 2:
        data = data[:, :, np.newaxis]

    shape = data.shape
    axis = axis.lower()
    if axis == "x":
        max_s = shape[0]
        idx = slice_idx if slice_idx is not None else max_s // 2
        idx = max(0, min(idx, max_s - 1))
        slice_2d = data[idx, :, :]
    elif axis == "y":
        max_s = shape[1]
        idx = slice_idx if slice_idx is not None else max_s // 2
        idx = max(0, min(idx, max_s - 1))
        slice_2d = data[:, idx, :]
    else: # z
        max_s = shape[2]
        idx = slice_idx if slice_idx is not None else max_s // 2
        idx = max(0, min(idx, max_s - 1))
        slice_2d = data[:, :, idx]

    # Normalize to 0 - 255 for PNG display
    min_v, max_v = np.min(slice_2d), np.max(slice_2d)
    if max_v > min_v:
        norm_2d = ((slice_2d - min_v) / (max_v - min_v) * 255.0).astype(np.uint8)
    else:
        norm_2d = np.zeros_like(slice_2d, dtype=np.uint8)

    img_pil = Image.fromarray(norm_2d)
    buffer = io.BytesIO()
    img_pil.save(buffer, format="PNG")
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return {
        "slice_axis": axis,
        "slice_index": idx,
        "total_slices": max_s,
        "image_base64": f"data:image/png;base64,{b64_str}"
    }
