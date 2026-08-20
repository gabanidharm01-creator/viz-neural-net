import torch
import torch.nn as nn
from typing import Dict, Any, List, Optional
from app.engines.unet_engine import EducationalUNet2D, EducationalUNet3D

def inspect_pytorch_model(model_type: str = "unet2d") -> Dict[str, Any]:
    """Inspects PyTorch model architecture and returns layer list, shape graph, and parameter counts."""
    if model_type == "unet3d":
        model = EducationalUNet3D()
        sample_in = torch.randn(1, 1, 16, 16, 16)
    else:
        model = EducationalUNet2D()
        sample_in = torch.randn(1, 1, 64, 64)

    layers_info = []
    total_params = 0

    for name, module in model.named_modules():
        if name == "":
            continue
        
        # Calculate parameters for module
        module_params = sum(p.numel() for p in module.parameters(recurse=False))
        total_params += module_params

        layer_type = module.__class__.__name__

        # Approximate shapes based on module type
        layers_info.append({
            "layer": name,
            "type": layer_type,
            "parameters": module_params,
            "details": str(module)
        })

    return {
        "model_name": model.__class__.__name__,
        "total_parameters": sum(p.numel() for p in model.parameters()),
        "trainable_parameters": sum(p.numel() for p in model.parameters() if p.requires_grad),
        "layers": layers_info,
        "connections": [
            {"from": "input", "to": "enc1"},
            {"from": "enc1", "to": "pool1"},
            {"from": "pool1", "to": "enc2"},
            {"from": "enc2", "to": "pool2"},
            {"from": "pool2", "to": "bottleneck"},
            {"from": "bottleneck", "to": "up2"},
            {"from": "up2", "to": "dec2"},
            {"from": "enc2", "to": "dec2", "type": "skip"},
            {"from": "dec2", "to": "up1"},
            {"from": "up1", "to": "dec1"},
            {"from": "enc1", "to": "dec1", "type": "skip"},
            {"from": "dec1", "to": "head"}
        ],
        "source": "backend"
    }
