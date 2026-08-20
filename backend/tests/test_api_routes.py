import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_convolution_api():
    payload = {
        "image": [[1, 2], [3, 4]],
        "kernel": [[1, 0], [0, 1]],
        "stride": 1,
        "padding": 0
    }
    response = client.post("/api/convolution", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["output"] == [[5.0]]

def test_relu_api():
    payload = {"image": [[-1, 2], [3, -4]]}
    response = client.post("/api/relu", json=payload)
    assert response.status_code == 200
    assert response.json()["output"] == [[0.0, 2.0], [3.0, 0.0]]

def test_metrics_api():
    payload = {
        "ground_truth": [[1, 0], [0, 1]],
        "prediction": [[1, 0], [0, 1]],
        "threshold": 0.5
    }
    response = client.post("/api/metrics/dice", json=payload)
    assert response.status_code == 200
    assert response.json()["dice"] == 1.0

def test_ai_explain_api():
    payload = {
        "question": "Why use skip connections?",
        "module": "unet",
        "current_step": "skip_connection"
    }
    response = client.post("/api/ai/explain", json=payload)
    assert response.status_code == 200
    assert "answer" in response.json()
