import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from typing import List, Dict, Any, Tuple, Optional

# ==========================================
# 1. Educational 2D U-Net PyTorch Model
# ==========================================

class ConvBlock2D(nn.Module):
    def __init__(self, in_ch: int, out_ch: int):
        super().__init__()
        self.conv1 = nn.Conv2d(in_ch, out_ch, kernel_size=3, padding=1)
        self.relu1 = nn.ReLU(inplace=True)
        self.conv2 = nn.Conv2d(out_ch, out_ch, kernel_size=3, padding=1)
        self.relu2 = nn.ReLU(inplace=True)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.relu1(self.conv1(x))
        x = self.relu2(self.conv2(x))
        return x

class EducationalUNet2D(nn.Module):
    def __init__(self, in_channels: int = 1, out_channels: int = 1, base_features: int = 16):
        super().__init__()
        f = base_features
        self.enc1 = ConvBlock2D(in_channels, f)
        self.pool1 = nn.MaxPool2d(2, 2)
        
        self.enc2 = ConvBlock2D(f, f * 2)
        self.pool2 = nn.MaxPool2d(2, 2)
        
        self.bottleneck = ConvBlock2D(f * 2, f * 4)
        
        self.up2 = nn.ConvTranspose2d(f * 4, f * 2, kernel_size=2, stride=2)
        self.dec2 = ConvBlock2D(f * 4, f * 2) # f*2 from up, f*2 from enc2 skip
        
        self.up1 = nn.ConvTranspose2d(f * 2, f, kernel_size=2, stride=2)
        self.dec1 = ConvBlock2D(f * 2, f) # f from up, f from enc1 skip
        
        self.head = nn.Conv2d(f, out_channels, kernel_size=1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        e1 = self.enc1(x)
        p1 = self.pool1(e1)
        
        e2 = self.enc2(p1)
        p2 = self.pool2(e2)
        
        b = self.bottleneck(p2)
        
        u2 = self.up2(b)
        cat2 = torch.cat([e2, u2], dim=1)
        d2 = self.dec2(cat2)
        
        u1 = self.up1(d2)
        cat1 = torch.cat([e1, u1], dim=1)
        d1 = self.dec1(cat1)
        
        out = self.head(d1)
        return out


# ==========================================
# 2. Educational 3D U-Net PyTorch Model
# ==========================================

class ConvBlock3D(nn.Module):
    def __init__(self, in_ch: int, out_ch: int):
        super().__init__()
        self.conv1 = nn.Conv3d(in_ch, out_ch, kernel_size=3, padding=1)
        self.relu1 = nn.ReLU(inplace=True)
        self.conv2 = nn.Conv3d(out_ch, out_ch, kernel_size=3, padding=1)
        self.relu2 = nn.ReLU(inplace=True)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.relu1(self.conv1(x))
        x = self.relu2(self.conv2(x))
        return x

class EducationalUNet3D(nn.Module):
    def __init__(self, in_channels: int = 1, out_channels: int = 1, base_features: int = 8):
        super().__init__()
        f = base_features
        self.enc1 = ConvBlock3D(in_channels, f)
        self.pool1 = nn.MaxPool3d(2, 2)
        
        self.bottleneck = ConvBlock3D(f, f * 2)
        
        self.up1 = nn.ConvTranspose3d(f * 2, f, kernel_size=2, stride=2)
        self.dec1 = ConvBlock3D(f * 2, f)
        
        self.head = nn.Conv3d(f, out_channels, kernel_size=1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        e1 = self.enc1(x)
        p1 = self.pool1(e1)
        b = self.bottleneck(p1)
        u1 = self.up1(b)
        cat1 = torch.cat([e1, u1], dim=1)
        d1 = self.dec1(cat1)
        out = self.head(d1)
        return out


# ==========================================
# 3. Architecture Specification Generator
# ==========================================

def get_unet_architecture_spec(
    input_size: int = 64,
    base_features: int = 32,
    depth: int = 4,
    num_classes: int = 2,
    dimensions: int = 2
) -> Dict[str, Any]:
    """Generates complete layer block hierarchy and skip connection definitions for 2D/3D U-Net."""
    spatial = lambda s: [s] * dimensions
    blocks = []
    skips = []

    blocks.append({
        "id": "input",
        "label": "Input",
        "stage": "input",
        "level": 0,
        "shape": spatial(input_size) + [1],
        "description": f"Raw {dimensions}D image tensor entering the network.",
        "parameters": 0
    })

    curr_size = input_size
    curr_feat = base_features
    encoder_info = []

    for lvl in range(depth):
        enc_id = f"enc-{lvl}"
        blocks.append({
            "id": enc_id,
            "label": f"Encoder {lvl + 1}",
            "stage": "encoder",
            "level": lvl,
            "shape": spatial(curr_size) + [curr_feat],
            "description": f"Two {dimensions}D convolutions + ReLU extracting features at level {lvl+1}.",
            "parameters": int(curr_feat * curr_feat * (9 if dimensions == 2 else 27))
        })
        encoder_info.append({"id": enc_id, "shape": spatial(curr_size) + [curr_feat], "level": lvl})

        curr_size = max(1, curr_size // 2)
        curr_feat *= 2
        blocks.append({
            "id": f"down-{lvl}",
            "label": f"Downsample {lvl + 1}",
            "stage": "downsample",
            "level": lvl,
            "shape": spatial(curr_size) + [curr_feat // 2],
            "description": "Strided pooling halves spatial dimensions, enlarging receptive field.",
            "parameters": 0
        })

    # Bottleneck
    blocks.append({
        "id": "bottleneck",
        "label": "Bottleneck",
        "stage": "bottleneck",
        "level": depth,
        "shape": spatial(curr_size) + [curr_feat],
        "description": "Deepest resolution, highest semantic abstraction. Center of U-Net.",
        "parameters": int(curr_feat * curr_feat * 9)
    })

    # Decoder & Skips
    for lvl in range(depth - 1, -1, -1):
        curr_size *= 2
        curr_feat = curr_feat // 2
        
        blocks.append({
            "id": f"up-{lvl}",
            "label": f"Upsample {lvl + 1}",
            "stage": "upsample",
            "level": lvl,
            "shape": spatial(curr_size) + [curr_feat],
            "description": f"Transposed {dimensions}D convolution upsampling spatial dimensions by 2x.",
            "parameters": int(curr_feat * curr_feat * 4)
        })

        enc_matching = next(e for e in encoder_info if e["level"] == lvl)
        dec_id = f"dec-{lvl}"
        
        blocks.append({
            "id": dec_id,
            "label": f"Decoder {lvl + 1}",
            "stage": "decoder",
            "level": lvl,
            "shape": spatial(curr_size) + [curr_feat],
            "description": "Convolutions after concatenating high-resolution encoder skip features.",
            "parameters": int(curr_feat * curr_feat * 9)
        })

        skips.append({
            "id": f"skip-{lvl}",
            "from": enc_matching["id"],
            "from_block": enc_matching["id"],
            "to": dec_id,
            "to_block": dec_id,
            "level": lvl,
            "encoder_shape": enc_matching["shape"],
            "decoder_shape": spatial(curr_size) + [curr_feat],
            "concatenated_shape": spatial(curr_size) + [enc_matching["shape"][-1] + curr_feat],
            "purpose": "Transfers high-frequency spatial detail directly from encoder to decoder, bypassing bottleneck compression."
        })

    blocks.append({
        "id": "output",
        "label": "Segmentation Mask",
        "stage": "output",
        "level": 0,
        "shape": spatial(input_size) + [num_classes],
        "description": "1x1 convolution mapping decoder feature channels to class logits.",
        "parameters": int(curr_feat * num_classes)
    })

    return {
        "name": f"{dimensions}D U-Net",
        "blocks": blocks,
        "skips": skips,
        "source": "backend"
    }


# ==========================================
# 4. Forward Pass Execution & Intermediate Hooks
# ==========================================

def run_unet_forward_visualization(
    input_size: int = 64,
    sample_type: str = "circle",
    debug_mode: bool = False
) -> Dict[str, Any]:
    """Runs a forward pass on PyTorch EducationalUNet2D and captures layer activations & skips."""
    model = EducationalUNet2D(in_channels=1, out_channels=1, base_features=16)
    model.eval()

    # Create dummy input
    input_matrix = generate_synthetic_mask(pattern=sample_type, size=input_size)["input"]
    tensor_in = torch.tensor(input_matrix, dtype=torch.float32).unsqueeze(0).unsqueeze(0)

    layers_captured = []
    skip_captures = []

    # Run manual forward pass to record activations and skips
    with torch.no_grad():
        # Enc1
        e1 = model.enc1(tensor_in)
        p1 = model.pool1(e1)
        layers_captured.append({
            "name": "encoder_1",
            "type": "ConvBlock2D",
            "input_shape": list(tensor_in.shape),
            "output_shape": list(e1.shape),
            "activation_summary": {
                "min": float(e1.min()), "max": float(e1.max()),
                "mean": float(e1.mean()), "std": float(e1.std())
            },
            "sample_map": np.round(e1[0, 0].numpy(), 4).tolist()
        })

        # Enc2
        e2 = model.enc2(p1)
        p2 = model.pool2(e2)
        layers_captured.append({
            "name": "encoder_2",
            "type": "ConvBlock2D",
            "input_shape": list(p1.shape),
            "output_shape": list(e2.shape),
            "activation_summary": {
                "min": float(e2.min()), "max": float(e2.max()),
                "mean": float(e2.mean()), "std": float(e2.std())
            },
            "sample_map": np.round(e2[0, 0].numpy(), 4).tolist()
        })

        # Bottleneck
        b = model.bottleneck(p2)
        layers_captured.append({
            "name": "bottleneck",
            "type": "ConvBlock2D",
            "input_shape": list(p2.shape),
            "output_shape": list(b.shape),
            "activation_summary": {
                "min": float(b.min()), "max": float(b.max()),
                "mean": float(b.mean()), "std": float(b.std())
            },
            "sample_map": np.round(b[0, 0].numpy(), 4).tolist()
        })

        # Up2 + Skip 2
        u2 = model.up2(b)
        cat2 = torch.cat([e2, u2], dim=1)
        d2 = model.dec2(cat2)

        skip_captures.append({
            "name": "skip_connection_level_2",
            "encoder_shape": list(e2.shape),
            "decoder_shape": list(u2.shape),
            "concatenated_shape": list(cat2.shape),
            "operation": "torch.cat(dim=1)",
            "purpose": "Combine deep semantic features (upsampled) with shallow high-res spatial features (encoder)."
        })

        layers_captured.append({
            "name": "decoder_2",
            "type": "ConvBlock2D",
            "input_shape": list(cat2.shape),
            "output_shape": list(d2.shape),
            "activation_summary": {
                "min": float(d2.min()), "max": float(d2.max()),
                "mean": float(d2.mean()), "std": float(d2.std())
            },
            "sample_map": np.round(d2[0, 0].numpy(), 4).tolist()
        })

        # Up1 + Skip 1
        u1 = model.up1(d2)
        cat1 = torch.cat([e1, u1], dim=1)
        d1 = model.dec1(cat1)

        skip_captures.append({
            "name": "skip_connection_level_1",
            "encoder_shape": list(e1.shape),
            "decoder_shape": list(u1.shape),
            "concatenated_shape": list(cat1.shape),
            "operation": "torch.cat(dim=1)",
            "purpose": "Restore fine edge boundaries before final segmentation head."
        })

        layers_captured.append({
            "name": "decoder_1",
            "type": "ConvBlock2D",
            "input_shape": list(cat1.shape),
            "output_shape": list(d1.shape),
            "activation_summary": {
                "min": float(d1.min()), "max": float(d1.max()),
                "mean": float(d1.mean()), "std": float(d1.std())
            },
            "sample_map": np.round(d1[0, 0].numpy(), 4).tolist()
        })

        # Segmentation Head
        out = torch.sigmoid(model.head(d1))
        pred_map = np.round(out[0, 0].numpy(), 4).tolist()

    return {
        "layers": layers_captured,
        "skip_connections": skip_captures,
        "final_output_shape": list(out.shape),
        "prediction_preview": pred_map,
        "source": "backend"
    }


# ==========================================
# 5. Synthetic Dataset Generator
# ==========================================

def generate_synthetic_mask(pattern: str = "circle", size: int = 64) -> Dict[str, Any]:
    """Generates synthetic 2D input image, ground truth mask, and simulated model prediction."""
    img = np.zeros((size, size), dtype=np.float32)
    gt = np.zeros((size, size), dtype=np.float32)

    center = size // 2
    radius = size // 4

    y, x = np.ogrid[:size, :size]

    if pattern == "circle":
        mask = (x - center) ** 2 + (y - center) ** 2 <= radius ** 2
        gt[mask] = 1.0
        img[mask] = 0.8 + 0.1 * np.random.randn(np.sum(mask))
    elif pattern == "square":
        r1, r2 = center - radius, center + radius
        gt[r1:r2, r1:r2] = 1.0
        img[r1:r2, r1:r2] = 0.85
    elif pattern == "brain":
        # Ellipse brain contour + inner lesion
        brain_mask = ((x - center) / (radius * 1.3)) ** 2 + ((y - center) / radius) ** 2 <= 1.0
        lesion_mask = (x - (center + 5)) ** 2 + (y - (center - 5)) ** 2 <= (radius // 2) ** 2
        img[brain_mask] = 0.4
        gt[lesion_mask] = 1.0
        img[lesion_mask] = 0.95
    else: # lesion
        lesion_mask = (x - center) ** 2 + (y - center) ** 2 <= (radius // 1.5) ** 2
        gt[lesion_mask] = 1.0
        img = img + 0.1 * np.random.randn(size, size)
        img[lesion_mask] += 0.7

    img = np.clip(img + 0.05 * np.random.randn(size, size), 0.0, 1.0)
    
    # Generate realistic prediction with slight boundary noise
    pred = gt.copy()
    noise = 0.1 * np.random.randn(size, size)
    pred = np.clip(pred + noise, 0.0, 1.0)

    return {
        "pattern": pattern,
        "input": np.round(img, 4).tolist(),
        "ground_truth": np.round(gt, 4).tolist(),
        "prediction": np.round(pred, 4).tolist()
    }


# ==========================================
# 6. Educational U-Net Mini Trainer
# ==========================================

def train_educational_unet(epochs: int = 5, lr: float = 0.001, batch_size: int = 4) -> List[Dict[str, Any]]:
    """Runs a tiny PyTorch training demo on synthetic data."""
    model = EducationalUNet2D(in_channels=1, out_channels=1, base_features=8)
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    criterion = nn.BCEWithLogitsLoss()

    history = []
    
    # Create small synthetic dataset batch
    syn_data = [generate_synthetic_mask("circle", size=32) for _ in range(batch_size)]
    inputs = torch.tensor([d["input"] for d in syn_data], dtype=torch.float32).unsqueeze(1)
    targets = torch.tensor([d["ground_truth"] for d in syn_data], dtype=torch.float32).unsqueeze(1)

    model.train()
    for ep in range(1, epochs + 1):
        optimizer.zero_grad()
        logits = model(inputs)
        loss = criterion(logits, targets)
        loss.backward()
        optimizer.step()

        preds = (torch.sigmoid(logits) > 0.5).float()
        intersection = (preds * targets).sum().item()
        total_sum = preds.sum().item() + targets.sum().item()
        dice = (2.0 * intersection / total_sum) if total_sum > 0 else 1.0

        history.append({
            "epoch": ep,
            "loss": float(np.round(loss.item(), 4)),
            "dice": float(np.round(dice, 4)),
            "status": "completed" if ep == epochs else "training"
        })

    return history
