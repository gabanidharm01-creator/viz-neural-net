import numpy as np
from typing import List, Dict, Any, Union

def compute_segmentation_metrics(
    ground_truth: List[List[float]],
    prediction: List[List[float]],
    threshold: float = 0.5
) -> Dict[str, Any]:
    """
    Computes exact segmentation metrics (Dice, IoU, Precision, Recall, Confusion Matrix) using NumPy.
    """
    gt_arr = np.array(ground_truth, dtype=np.float32)
    pred_arr = np.array(prediction, dtype=np.float32)

    if gt_arr.shape != pred_arr.shape:
        raise ValueError(f"Ground truth shape {gt_arr.shape} does not match prediction shape {pred_arr.shape}.")

    # Binarize masks based on threshold
    gt_bin = (gt_arr >= threshold).astype(np.int32)
    pred_bin = (pred_arr >= threshold).astype(np.int32)

    tp = int(np.sum((gt_bin == 1) & (pred_bin == 1)))
    fp = int(np.sum((gt_bin == 0) & (pred_bin == 1)))
    fn = int(np.sum((gt_bin == 1) & (pred_bin == 0)))
    tn = int(np.sum((gt_bin == 0) & (pred_bin == 0)))

    # Compute Dice
    dice_denom = 2 * tp + fp + fn
    dice = float(np.round((2.0 * tp / dice_denom) if dice_denom > 0 else 1.0, 4))

    # Compute IoU (Jaccard)
    iou_denom = tp + fp + fn
    iou = float(np.round((float(tp) / iou_denom) if iou_denom > 0 else 1.0, 4))

    # Precision & Recall
    prec_denom = tp + fp
    precision = float(np.round((float(tp) / prec_denom) if prec_denom > 0 else 0.0, 4))

    rec_denom = tp + fn
    recall = float(np.round((float(tp) / rec_denom) if rec_denom > 0 else 0.0, 4))

    return {
        "dice": dice,
        "iou": iou,
        "precision": precision,
        "recall": recall,
        "tp": tp,
        "fp": fp,
        "fn": fn,
        "tn": tn,
        "source": "backend"
    }
