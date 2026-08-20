import pytest
from app.engines.convolution_engine import compute_convolution_2d

def test_convolution_2d_known_values():
    # 3x3 Image, 2x2 Kernel
    image = [
        [1.0, 2.0, 3.0],
        [4.0, 5.0, 6.0],
        [7.0, 8.0, 9.0]
    ]
    kernel = [
        [1.0, 0.0],
        [0.0, 1.0]
    ]
    res = compute_convolution_2d(image=image, kernel=kernel, stride=1, padding=0)

    assert res["input_shape"] == [3, 3]
    assert res["kernel_shape"] == [2, 2]
    assert res["output_shape"] == [2, 2]
    
    # Calculation check:
    # (0,0): 1*1 + 2*0 + 4*0 + 5*1 = 6
    # (0,1): 2*1 + 3*0 + 5*0 + 6*1 = 8
    # (1,0): 4*1 + 5*0 + 7*0 + 8*1 = 12
    # (1,1): 5*1 + 6*0 + 8*0 + 9*1 = 14
    assert res["output"] == [[6.0, 8.0], [12.0, 14.0]]
    assert len(res["steps"]) == 4
    assert res["steps"][0]["sum"] == 6.0
