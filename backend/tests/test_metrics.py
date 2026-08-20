import pytest
from app.engines.metrics_engine import compute_segmentation_metrics

def test_dice_and_iou_known_masks():
    gt = [
        [1.0, 1.0, 0.0],
        [1.0, 1.0, 0.0],
        [0.0, 0.0, 0.0]
    ]
    pred = [
        [1.0, 1.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0]
    ]
    # TP = 3, FP = 0, FN = 1, TN = 5
    # Dice = 2*3 / (2*3 + 0 + 1) = 6/7 = 0.8571
    # IoU = 3 / (3 + 0 + 1) = 3/4 = 0.75
    metrics = compute_segmentation_metrics(gt, pred, threshold=0.5)
    
    assert metrics["tp"] == 3
    assert metrics["fp"] == 0
    assert metrics["fn"] == 1
    assert metrics["tn"] == 5
    assert abs(metrics["dice"] - 0.8571) < 0.001
    assert abs(metrics["iou"] - 0.75) < 0.001
