import pytest
from app.engines.pooling_engine import compute_relu, compute_max_pooling_2d

def test_relu_clamping():
    matrix = [
        [-5.0, 3.0],
        [0.0, -1.2]
    ]
    res = compute_relu(matrix)
    assert res["output"] == [[0.0, 3.0], [0.0, 0.0]]
    assert (0, 0) in res["clamped"]
    assert (1, 1) in res["clamped"]

def test_max_pooling_2d():
    image = [
        [1.0, 3.0, 2.0, 4.0],
        [5.0, 6.0, 7.0, 8.0],
        [9.0, 10.0, 11.0, 12.0],
        [13.0, 14.0, 15.0, 16.0]
    ]
    res = compute_max_pooling_2d(image, window=(2, 2), stride=2)
    assert res["output_shape"] == [2, 2]
    assert res["output"] == [[6.0, 8.0], [14.0, 16.0]]
    assert res["steps"][0]["max"] == 6.0
