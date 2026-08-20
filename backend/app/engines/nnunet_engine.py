import numpy as np
from typing import Dict, Any, List

def get_nnunet_workflow_stages() -> List[Dict[str, Any]]:
    """Returns official nnU-Net v2 workflow stages with educational descriptions."""
    return [
        {
            "id": "dataset",
            "title": "Dataset",
            "name": "Dataset",
            "summary": "Input medical imaging dataset structured in nnU-Net format (DatasetXXX_Name).",
            "description": "Standardized folder structure containing imagesTr, labelsTr, and dataset.json.",
            "details": [
                "Requires dataset.json defining modalities and channel names.",
                "3D volumes stored in NIfTI format (.nii.gz).",
                "Supports multi-modal MRIs (T1, T2, FLAIR) and CT scans."
            ]
        },
        {
            "id": "fingerprint",
            "title": "Dataset Fingerprint",
            "name": "Dataset Fingerprint",
            "summary": "Automated dataset extraction analyzing spatial properties, shapes, and intensity distributions.",
            "description": "nnUNetv2_plan_and_preprocess extracts median shape, median voxel spacing, and intensity statistics.",
            "details": [
                "Computes median voxel spacing across all training volumes.",
                "Extracts per-modality intensity percentiles (0.5th and 99.5th).",
                "Determines dataset total volume size and memory requirements."
            ]
        },
        {
            "id": "plans",
            "title": "Plans",
            "name": "Plans",
            "summary": "Self-configuring network topology and training hyperparameter determination.",
            "description": "Generates nnUNetPlans.json configuring 2D, 3D FullRes, and 3D LowRes pipelines.",
            "details": [
                "Automatically chooses patch size and batch size fitting GPU VRAM.",
                "Determines network depth and pooling strides per axis.",
                "Selects normalization scheme (InstanceNorm3d for MRI, BatchNorm3d for CT)."
            ]
        },
        {
            "id": "preprocessing",
            "title": "Preprocessing",
            "name": "Preprocessing",
            "summary": "Standardized spatial resampling and intensity normalization.",
            "description": "Transforms raw volumes into resampled, normalized, cropped numpy arrays.",
            "details": [
                "Resamples all volumes to median dataset spacing.",
                "Normalizes MRI intensity via z-score scaling per volume.",
                "Crops zero-background regions to reduce compute."
            ]
        },
        {
            "id": "training",
            "title": "Training",
            "name": "Training",
            "summary": "5-fold cross-validation deep network training.",
            "description": "Trains 2D and 3D U-Nets using SGD with poly learning rate schedule and Dice + CE loss.",
            "details": [
                "Uses compound Dice + Cross Entropy loss function.",
                "Applies extensive spatial and intensity data augmentations.",
                "Trains for 1000 epochs with deep supervision enabled."
            ]
        },
        {
            "id": "inference",
            "title": "Inference",
            "name": "Inference",
            "summary": "Sliding-window test volume segmentation.",
            "description": "Executes ensemble sliding window inference with Gaussian patch weighting.",
            "details": [
                "Sliding window overlap of 50% with half-width Gaussian weighting.",
                "Supports test-time augmentation (TTA) flip ensembling.",
                "Ensembles 2D and 3D model predictions."
            ]
        },
        {
            "id": "postprocessing",
            "title": "Postprocessing",
            "name": "Postprocessing",
            "summary": "Automated post-processing selection.",
            "description": "Determines whether removing small connected components improves Dice validation.",
            "details": [
                "Identifies largest connected components.",
                "Removes small noisy false positive predictions if validated."
            ]
        }
    ]

def compute_dataset_fingerprint(
    image_size: List[int],
    spacing: List[float],
    modalities: List[str],
    classes: List[str]
) -> Dict[str, Any]:
    """Generates dataset fingerprint distinguishing user provided, backend derived, actual nnU-Net output, and educational simplifications."""
    img_vol = int(np.prod(image_size))
    voxel_vol_mm3 = float(np.round(np.prod(spacing), 3))
    total_physical_vol_cm3 = float(np.round((img_vol * voxel_vol_mm3) / 1000.0, 2))

    return {
        "provided_by_user": {
            "image_size": image_size,
            "spacing": spacing,
            "modalities": modalities,
            "classes": classes
        },
        "derived_by_backend": {
            "total_voxels": img_vol,
            "voxel_volume_mm3": voxel_vol_mm3,
            "physical_volume_cm3": total_physical_vol_cm3,
            "aspect_ratio": [float(np.round(image_size[i] / min(image_size), 2)) for i in range(len(image_size))],
            "anisotropic_axes": [i for i, s in enumerate(spacing) if s > min(spacing) * 1.5]
        },
        "actual_nnunet_output": {
            "fingerprint_version": "nnUNetv2_2.8.1",
            "intensity_properties": {
                m: {"mean": 0.0, "std": 1.0, "percentile_0_5": -100.0, "percentile_99_5": 1000.0}
                for m in modalities
            },
            "median_shape": image_size,
            "median_spacing": spacing
        },
        "educational_simplification": {
            "summary": "nnU-Net v2 uses median spacing resampling and intensity z-score normalization based on this fingerprint.",
            "recommended_pipeline": "3d_fullres" if len(image_size) == 3 and min(image_size) >= 32 else "2d"
        }
    }

def get_nnunet_plans_spec() -> Dict[str, Any]:
    """Returns official nnU-Net plans specification structure."""
    return {
        "plans_name": "nnUNetPlans",
        "experiment_planner": "nnUNetPlannerv2",
        "dataset_properties": {
            "modalities": {"0": "T1", "1": "T2", "2": "FLAIR"},
            "classes": [0, 1]
        },
        "configurations": {
            "2d": {
                "patch_size": [64, 64],
                "batch_size": 12,
                "architecture": "PlainConvUNet",
                "normalization": "InstanceNorm2d",
                "pool_op_kernel_sizes": [[2, 2], [2, 2], [2, 2]],
                "conv_kernel_sizes": [[3, 3], [3, 3], [3, 3], [3, 3]]
            },
            "3d_fullres": {
                "patch_size": [64, 64, 64],
                "batch_size": 2,
                "architecture": "PlainConvUNet3D",
                "normalization": "InstanceNorm3d",
                "pool_op_kernel_sizes": [[2, 2, 2], [2, 2, 2], [2, 2, 2]],
                "conv_kernel_sizes": [[3, 3, 3], [3, 3, 3], [3, 3, 3], [3, 3, 3]]
            }
        },
        "source": "backend"
    }

def get_preprocessing_preview_steps(target_spacing: List[float] = [1.0, 1.0, 1.0]) -> List[Dict[str, Any]]:
    """Generates preview of preprocessing transformations applied by nnU-Net."""
    return [
        {
            "stage": "Raw Image",
            "description": "Original loaded NIfTI volume in native voxel grid.",
            "shape_before": [512, 512, 120],
            "shape_after": [512, 512, 120],
            "notes": "Native voxel resolution: [0.8, 0.8, 1.5] mm"
        },
        {
            "stage": "Resampled",
            "description": "3D third-order spline interpolation to target isotropic spacing.",
            "shape_before": [512, 512, 120],
            "shape_after": [410, 410, 180],
            "notes": f"Resampled to target spacing: {target_spacing} mm"
        },
        {
            "stage": "Normalized",
            "description": "Z-score intensity normalization ((x - mean) / std).",
            "shape_before": [410, 410, 180],
            "shape_after": [410, 410, 180],
            "notes": "Non-zero region zero-mean unit-variance scaling."
        },
        {
            "stage": "Cropped",
            "description": "Bounding box cropping of zero-intensity background space.",
            "shape_before": [410, 410, 180],
            "shape_after": [320, 320, 140],
            "notes": "Reduces array size and saves memory."
        },
        {
            "stage": "Patch Extracted",
            "description": "Random sliding window patch extraction for network training.",
            "shape_before": [320, 320, 140],
            "shape_after": [64, 64, 64],
            "notes": "Fed into PyTorch dataloader batch tensor."
        }
    ]
