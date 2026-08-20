import numpy as np
import torch
import torch.nn.functional as F
from typing import List, Tuple, Optional, Dict, Any

def pad_matrix(image: np.ndarray, padding: int) -> np.ndarray:
    """Pad a 2D numpy array with zeros."""
    if padding <= 0:
        return image
    return np.pad(image, ((padding, padding), (padding, padding)), mode='constant', constant_values=0)

def compute_convolution_2d(
    image: List[List[float]],
    kernel: List[List[float]],
    stride: int = 1,
    padding: int = 0
) -> Dict[str, Any]:
    """
    Computes 2D spatial convolution step-by-step using PyTorch and NumPy.
    Returns calculated output, step-by-step patch operations, and numerical results.
    """
    img_arr = np.array(image, dtype=np.float32)
    kern_arr = np.array(kernel, dtype=np.float32)

    # Validate shapes
    if img_arr.ndim != 2 or kern_arr.ndim != 2:
        raise ValueError("Input image and kernel must be 2D matrices.")

    in_h, in_w = img_arr.shape
    k_h, k_w = kern_arr.shape

    # Compute PyTorch expected tensor result for verification
    torch_img = torch.tensor(img_arr).unsqueeze(0).unsqueeze(0) # (1, 1, H, W)
    torch_kern = torch.tensor(kern_arr).unsqueeze(0).unsqueeze(0) # (1, 1, kH, kW)
    torch_out = F.conv2d(torch_img, torch_kern, stride=stride, padding=padding)
    torch_out_np = torch_out.squeeze(0).squeeze(0).detach().numpy()

    # Step-by-step calculation
    padded = pad_matrix(img_arr, padding)
    out_h = int(np.floor((padded.shape[0] - k_h) / stride)) + 1
    out_w = int(np.floor((padded.shape[1] - k_w) / stride)) + 1

    output_matrix = np.zeros((out_h, out_w), dtype=np.float32)
    output_so_far: List[List[Optional[float]]] = [[None for _ in range(out_w)] for _ in range(out_h)]
    steps = []

    step_idx = 0
    for r in range(out_h):
        for c in range(out_w):
            r_start = r * stride
            c_start = c * stride
            patch = padded[r_start : r_start + k_h, c_start : c_start + k_w]
            
            # Elementwise multiplication using NumPy
            multiplication = np.round(patch * kern_arr, 4)
            # Sum computed using PyTorch / NumPy
            step_sum = float(np.round(np.sum(multiplication), 4))

            output_matrix[r, c] = step_sum
            output_so_far[r][c] = step_sum

            # Create a deep copy of output so far for frontend visualization
            current_progress = [[val for val in row] for row in output_so_far]

            steps.append({
                "index": step_idx,
                "out_row": r,
                "out_col": c,
                "position": (r_start, c_start),
                "output_position": (r, c),
                "patch": np.round(patch, 4).tolist(),
                "kernel": np.round(kern_arr, 4).tolist(),
                "products": multiplication.tolist(),
                "multiplication": multiplication.tolist(),
                "sum": step_sum,
                "output_so_far": current_progress
            })
            step_idx += 1

    return {
        "input_shape": [in_h, in_w],
        "kernel_shape": [k_h, k_w],
        "stride": stride,
        "padding": padding,
        "output_shape": [out_h, out_w],
        "output": np.round(output_matrix, 4).tolist(),
        "steps": steps,
        "source": "backend"
    }
