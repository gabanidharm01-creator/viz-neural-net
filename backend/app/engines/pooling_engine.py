import numpy as np
import torch
import torch.nn.functional as F
from typing import List, Tuple, Optional, Dict, Any, Union

def compute_relu(matrix: List[List[float]]) -> Dict[str, Any]:
    """
    Computes ReLU activation using PyTorch torch.relu().
    Returns input, output, and list of clamped positions.
    """
    tensor_in = torch.tensor(matrix, dtype=torch.float32)
    tensor_out = torch.relu(tensor_in)
    
    input_list = np.round(tensor_in.numpy(), 4).tolist()
    output_list = np.round(tensor_out.numpy(), 4).tolist()

    clamped_positions: List[Tuple[int, int]] = []
    for r in range(tensor_in.shape[0]):
        for c in range(tensor_in.shape[1]):
            if tensor_in[r, c].item() < 0:
                clamped_positions.append((r, c))

    return {
        "input": input_list,
        "output": output_list,
        "clamped": clamped_positions,
        "changed_positions": clamped_positions,
        "source": "backend"
    }

def compute_max_pooling_2d(
    image: List[List[float]],
    window: Tuple[int, int] = (2, 2),
    stride: int = 2
) -> Dict[str, Any]:
    """
    Computes 2D Max Pooling step-by-step using PyTorch and NumPy.
    Returns output matrix and sliding window steps.
    """
    img_arr = np.array(image, dtype=np.float32)
    if img_arr.ndim != 2:
        raise ValueError("Input image must be a 2D matrix.")

    in_h, in_w = img_arr.shape
    w_h, w_w = window

    out_h = int(np.floor((in_h - w_h) / stride)) + 1
    out_w = int(np.floor((in_w - w_w) / stride)) + 1

    # PyTorch calculation check
    torch_img = torch.tensor(img_arr).unsqueeze(0).unsqueeze(0) # (1, 1, H, W)
    torch_out = F.max_pool2d(torch_img, kernel_size=(w_h, w_w), stride=stride)
    torch_out_np = torch_out.squeeze(0).squeeze(0).detach().numpy()

    output_matrix = np.zeros((out_h, out_w), dtype=np.float32)
    output_so_far: List[List[Optional[float]]] = [[None for _ in range(out_w)] for _ in range(out_h)]
    steps = []

    step_idx = 0
    for r in range(out_h):
        for c in range(out_w):
            r_start = r * stride
            c_start = c * stride
            patch = img_arr[r_start : r_start + w_h, c_start : c_start + w_w]

            # Find local maximum and argmax position
            max_val = float(np.round(np.max(patch), 4))
            local_max_pos = np.unravel_index(np.argmax(patch), patch.shape)
            max_position = (int(local_max_pos[0]), int(local_max_pos[1]))

            output_matrix[r, c] = max_val
            output_so_far[r][c] = max_val

            current_progress = [[v for v in row] for row in output_so_far]

            steps.append({
                "index": step_idx,
                "out_row": r,
                "out_col": c,
                "region": np.round(patch, 4).tolist(),
                "patch": np.round(patch, 4).tolist(),
                "max": max_val,
                "max_position": max_position,
                "output_position": (r, c),
                "output_so_far": current_progress
            })
            step_idx += 1

    return {
        "input_shape": [in_h, in_w],
        "window": list(window),
        "stride": stride,
        "output_shape": [out_h, out_w],
        "output": np.round(output_matrix, 4).tolist(),
        "steps": steps,
        "source": "backend"
    }
