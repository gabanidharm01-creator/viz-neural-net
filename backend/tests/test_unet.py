import pytest
from app.engines.unet_engine import get_unet_architecture_spec, run_unet_forward_visualization

def test_unet_architecture_spec():
    spec = get_unet_architecture_spec(input_size=64, base_features=16, depth=3, num_classes=2, dimensions=2)
    assert spec["name"] == "2D U-Net"
    assert len(spec["blocks"]) > 0
    assert len(spec["skips"]) == 3
    assert spec["skips"][0]["purpose"] is not None

def test_unet_forward_pass_visualization():
    res = run_unet_forward_visualization(input_size=64, sample_type="circle", debug_mode=False)
    assert len(res["layers"]) > 0
    assert len(res["skip_connections"]) == 2
    assert "prediction_preview" in res
