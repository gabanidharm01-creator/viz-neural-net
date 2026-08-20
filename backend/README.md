# NeuroVision Lab Backend

Scientific Computation, PyTorch + NumPy Deep Learning Engine, 2D/3D U-Net, nnU-Net v2 Workflow, Medical Image Processing & AI Tutor Service.

---

## 1. Features & Architecture

* **Scientific Accuracy**: All linear algebra, 2D spatial convolution, ReLU activations, 2D max pooling, Dice metrics, and U-Net tensor forward passes are computed natively using **NumPy** and **PyTorch**. The LLM is restricted to explanations and structured visualization generation.
* **2D & 3D U-Net Engine**: Full intermediate layer hooks, activation map previews, skip connection captures, synthetic dataset generation, and educational mini-trainer demo.
* **nnU-Net v2 Engine**: Dataset fingerprinting, self-configuring plans inspection, preprocessing transformation preview (Raw -> Resampled -> Normalized -> Cropped -> Patch), and background job pipeline.
* **Medical Image Processing**: Multi-format metadata extractor & 2D slice visualizer supporting NIfTI (`.nii`, `.nii.gz`), NRRD, DICOM, PNG, and JPG via `nibabel`, `SimpleITK`, and `Pillow`.
* **AI Tutor & Visualization DSL**: Structured JSON DSL generation validated with Pydantic and executed live on calculation engines.
* **Background Jobs Queue**: Asynchronous status tracker for long-running medical processing and inference tasks.

---

## 2. Installation & Setup

### Requirements

* Python 3.11+
* PyTorch 2.0+ (CPU or CUDA GPU)
* FastAPI, Uvicorn, NumPy, Nibabel, SimpleITK, scikit-image, Pillow, nnUNetv2

### Quickstart

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Run FastAPI backend server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive Swagger API Documentation available at `http://localhost:8000/docs`.

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env`:

```env
LLM_API_KEY=your_gemini_api_key_here
LLM_MODEL=gemini-1.5-flash
LLM_PROVIDER=gemini
FRONTEND_URL=http://localhost:5173
PORT=8000
HOST=0.0.0.0
DEBUG=True
MAX_UPLOAD_SIZE_MB=50
```

---

## 4. Running Unit Tests

Execute the full pytest test suite covering Convolution, ReLU, Max Pooling, Dice Metrics, U-Net Forward Hooks, Skip Connections, and API Routers:

```bash
cd backend
python -m pytest
```

---

## 5. Major API Endpoints

### Core Calculations & CNN
* `GET  /health` — Backend health status
* `POST /api/convolution` (alias `/cnn/convolution`) — 2D step-by-step spatial convolution
* `POST /api/relu` (alias `/cnn/relu`) — PyTorch ReLU activation
* `POST /api/pooling` (alias `/cnn/max-pooling`) — 2D step-by-step max pooling

### U-Net Engine
* `GET  /api/unet/architecture` (alias `/unet/architecture`) — 2D & 3D U-Net layer graph and skip spec
* `POST /api/unet/forward` — Forward pass visualization with captured tensor hooks & skips
* `POST /api/unet/synthetic-data` — Synthetic segmentation dataset generator
* `POST /api/unet/train` — Educational mini PyTorch training demo

### Metrics & Medical Imaging
* `POST /api/metrics/dice` (alias `/metrics/segmentation`) — Dice, IoU, Precision, Recall, Confusion Matrix
* `POST /api/medical/upload` — Upload medical image file
* `POST /api/medical/image-info` — Extract spatial metadata (NIfTI / NRRD / PNG)
* `POST /api/medical/volume-preview` — Render normalized slice preview (base64 PNG)

### nnU-Net v2 Workflow
* `GET  /api/nnunet/workflow` (alias `/nnunet/workflow`) — 7-stage workflow inspector
* `POST /api/nnunet/fingerprint` — Compute dataset fingerprint
* `GET  /api/nnunet/plans` (alias `/nnunet/plans`) — Expose network topology & patch sizes
* `POST /api/nnunet/preprocessing/preview` — Preview spatial resampling & normalization steps
* `POST /api/nnunet/inference` — Trigger background inference job

### AI Tutor & Model Inspector
* `POST /api/model/inspect` (alias `/model/inspect`) — Inspect model parameter graph
* `POST /api/ai/explain` (alias `/ai/explain`) — Contextual AI Tutor explanation
* `POST /api/ai/generate-visualization` (alias `/ai/generate-visualization`) — Visualization DSL generator
* `GET  /api/jobs/{job_id}` — Query background job execution status

---

## 6. GPU & PyTorch Setup

PyTorch automatically detects GPU availability:

```python
import torch
print("CUDA Available:", torch.cuda.is_available())
if torch.cuda.is_available():
    print("Device:", torch.cuda.get_device_name(0))
```

If no GPU is available, the backend automatically runs all tensor calculations on high-performance CPU.

---

## 7. Connecting Frontend (viz-neural-net)

1. Open `viz-neural-net/.env` in the React frontend:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
2. Start the React development server:
   ```bash
   cd viz-neural-net
   npm run dev
   ```
3. The frontend now fetches scientific computations live from the FastAPI backend!
