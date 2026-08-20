# NeuroVision Lab

Build NeuroVision Lab — Interactive U-Net & nnU-Net Visualization Platform

Build a production-quality educational web application called:

NeuroVision Lab

The application teaches CNNs, U-Net, 2D U-Net, 3D U-Net, and nnU-Net v2 using interactive visualizations, animations, real tensor values, and an AI Tutor.

IMPORTANT:

This is the FRONTEND application.

Do NOT implement heavy PyTorch, nnU-Net, NIfTI processing, or GPU computation inside the browser.

All scientific calculations must come from a separate FastAPI backend.

The frontend must communicate with the backend through REST APIs.

1. Technology

Use:

React

TypeScript

Vite or Next.js

Tailwind CSS

shadcn/ui where useful

SVG

HTML Canvas

Three.js or vtk.js for future 3D visualization

Use clean component architecture.

2. Main UI

Create a modern educational dashboard.

Layout:

┌─────────────────────────────────────────────────────────────┐
│ NeuroVision Lab                         AI Tutor             │
├───────────────┬──────────────────────────────┬──────────────┤
│ Learning      │                              │              │
│ Modules       │       Visualization          │ AI Tutor    │
│               │                              │              │
│ CNN Basics    │       Interactive Canvas     │ Explanation │
│ Convolution   │                              │              │
│ Pooling       │       Network Diagram        │ Ask AI      │
│ U-Net         │                              │              │
│ 2D U-Net      │                              │              │
│ 3D U-Net      │                              │              │
│ nnU-Net       │                              │              │
│               │                              │              │
├───────────────┴──────────────────────────────┴──────────────┤
│ ◀ Previous │ ▶ Play │ ⏸ Pause │ Next ▶ │ Speed │ Reset     │
└─────────────────────────────────────────────────────────────┘


3. Navigation

Create these sections:

Dashboard
CNN Playground
Convolution
ReLU
Max Pooling
CNN Workflow
U-Net
2D U-Net
3D U-Net
nnU-Net v2
Medical Image Viewer
Metrics
AI Tutor
Model Inspector
Learning Progress


4. CNN Playground

Create an interactive 2D image editor.

Use a default 8×8 image.

Display pixels as a grid.

Example:

0 0 0 0 0 0 0 0
0 0 1 1 0 0 0 0
0 1 1 1 1 0 0 0
0 0 1 1 0 0 0 0
0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0


Allow:

Click pixel

Change value

Clear

Reset

Upload image later

5. Convolution Visualization

Create an animated convolution visualizer.

Show three panels:

INPUT IMAGE
KERNEL
OUTPUT FEATURE MAP


Show the moving kernel window.

When the backend returns a convolution step, highlight:

Current patch

Kernel

Multiplication

Sum

Output position

Controls:

Play
Pause
Previous
Next
Reset
Speed


Display:

Input shape: 8×8
Kernel: 3×3
Stride: 1
Padding: 0
Output: 6×6


6. ReLU Visualization

Show:

Input Feature Map
        ↓
      ReLU
        ↓
Output Feature Map


Highlight negative values becoming zero.

7. Max Pooling

Create a 2×2 pooling window.

Animate it moving through the feature map.

Display:

Current region
Maximum value
Output position
Output feature map


8. CNN Workflow

Show:

Input
 ↓
Convolution
 ↓
ReLU
 ↓
Convolution
 ↓
ReLU
 ↓
Max Pooling
 ↓
Feature Map


Clicking any node opens its explanation.

9. U-Net Visualization

Create a large interactive U-Net architecture.

Use:

                 U-NET

Input
 │
 ▼
Encoder ──────────────────────┐
 │                            │
 ▼                            │
Downsample                    │
 │                            │
 ▼                            │
Encoder ──────────────────┐   │
 │                        │   │
 ▼                        │   │
Bottleneck                │   │
 │                        │   │
 ▼                        │   │
Upsample ◄───────────────┘   │
 │                            │
 ▼                            │
Decoder ◄────────────────────┘
 │
 ▼
Segmentation Mask


Use animated data-flow arrows.

10. Skip Connection Interaction

When a user clicks a skip connection:

Display:

Encoder Feature Map
        +
Decoder Feature Map
        ↓
Concatenation
        ↓
Decoder Block


Highlight both tensors.

Show tensor dimensions.

Explain the purpose.

11. Tensor Shape Tracking

Every U-Net block should display:

Input:
128×128×1

Encoder:
128×128×32

Downsample:
64×64×32

Encoder:
64×64×64

Bottleneck:
32×32×128

Decoder:
64×64×64

Output:
128×128×Classes


Do NOT hardcode values when backend data is available.

Render the dimensions returned by the backend.

12. 2D U-Net Demo

Create a synthetic MRI-style example.

Display three panels:

Input
Ground Truth
Prediction


Add:

Mask overlay

Opacity slider

Difference view

Toggle labels

13. Metrics

Create visualization for:

Dice

IoU

Precision

Recall

Example:

Ground Truth
████████

Prediction
██████

Overlap
██████


Show numerical values returned from backend.

14. Training Visualization

Create an educational training animation:

Image
 ↓
U-Net
 ↓
Prediction
 ↓
Ground Truth
 ↓
Loss
 ↓
Backpropagation
 ↓
Weight Update


Show:

Epoch

Batch

Loss

Dice

Validation score

Use backend data when available.

15. 3D U-Net

Create a 3D visualization page.

Display:

MRI Volume


Allow:

Axial slice

Coronal slice

Sagittal slice

Slice slider

Zoom

Pan

Rotate

Segmentation overlay

Opacity

Use Three.js or vtk.js.

Initially support demo/sample volume.

16. nnU-Net v2 Visualization

Create a dedicated page.

Show:

Dataset
   ↓
Dataset Fingerprint
   ↓
Plans
   ↓
Preprocessing
   ↓
Configuration
   ↓
Training
   ↓
Inference
   ↓
Postprocessing
   ↓
Final Segmentation


Each stage must be clickable.

When clicked, show detailed information in a side panel.

17. Dataset Fingerprint Page

Allow the user to enter:

Image size
Voxel spacing
Number of modalities
Number of classes
Number of cases


Send the data to backend.

Display returned configuration information.

Do not claim that the frontend itself determines nnU-Net configuration.

18. nnU-Net Plans

Display:

Target spacing
Patch size
Batch size
Network depth
Number of features
Kernel sizes
Pooling


Render data returned by backend.

19. Preprocessing Visualization

Animate:

Raw Image
 ↓
Resampling
 ↓
Normalization
 ↓
Cropping
 ↓
Patch Extraction
 ↓
Training Tensor


Display shape changes at every stage.

20. Inference Visualization

Display:

MRI Volume
 ↓
Patch Extraction
 ↓
Patch 1
Patch 2
Patch 3
...
 ↓
Model
 ↓
Predictions
 ↓
Reconstruction
 ↓
Final Mask


Animate the workflow.

21. AI Tutor

Create a persistent AI Tutor panel.

The user can ask:

"What is convolution?"

"Why does pooling reduce the image?"

"What is a feature map?"

"Why does U-Net use skip connections?"

"What is the bottleneck?"

"What is the difference between U-Net and nnU-Net?"

"Why use 3D U-Net?"

"Explain this mathematically."

"Explain this like a beginner."

The frontend should send:

{
  "question": "...",
  "current_module": "...",
  "current_step": "...",
  "visualization_state": {}
}


to:

POST /ai/explain


22. Explain This Button

Every major visualization component should have:

Explain this

When clicked, send current context to backend AI endpoint.

23. Natural Language Visualization

Create an input:

"What do you want to visualize?"


Examples:

Show me a 3×3 edge detector.
Explain skip connections.
Show me max pooling.
Show me a 2D U-Net.
Explain nnU-Net.
Compare 2D and 3D U-Net.


Send to:

POST /ai/generate-visualization


Backend returns structured visualization instructions.

Frontend renders them.

24. Visualization Engine

Build reusable components:

ConvolutionVisualizer
PoolingVisualizer
ReluVisualizer
TensorVisualizer
FeatureMapVisualizer
UNetVisualizer
SkipConnectionVisualizer
TrainingVisualizer
NnUNetWorkflowVisualizer
VolumeViewer
MetricVisualizer


Do not create one giant component.

25. Animation Engine

Create reusable animation controls:

play()
pause()
next()
previous()
reset()
setSpeed()


All visualizations should use the same controls.

26. API Layer

Create a centralized API client.

Backend base URL must come from environment variable:

VITE_API_URL


Never hardcode localhost in components.

Implement API functions:

calculateConvolution()
calculatePooling()
getUnetArchitecture()
getNnUNetWorkflow()
getNnUNetPlans()
calculateMetrics()
explainWithAI()
generateVisualization()
inspectModel()


27. Error Handling

Display useful errors:

Backend unavailable
Invalid input
Invalid visualization configuration
Model processing failed
LLM unavailable


Use loading states and skeletons.

Never silently fail.

28. Responsive Design

Support:

Desktop

Laptop

Tablet

Prioritize desktop because this is an educational visualization tool.

29. Visual Design

Use a modern scientific/medical-tech aesthetic.

Prefer:

dark/light mode

clean cards

subtle gradients

clear diagrams

readable labels

smooth animations

professional colors

accessible contrast

Avoid excessive decorative elements.

Visualization must remain the main focus.

30. Learning Progress

Track:

CNN Basics
Convolution
ReLU
Pooling
U-Net
2D U-Net
3D U-Net
nnU-Net
Metrics


Mark modules as completed.

Use localStorage initially.

Keep architecture ready for backend persistence later.

31. Important Rules

Do NOT:

implement fake neural-network calculations

invent nnU-Net architecture

hardcode backend results

put heavy PyTorch processing in frontend

expose API secrets

put LLM API keys in frontend

generate arbitrary executable code from LLM responses

Use backend APIs for all scientific computation.

32. Deliverable

Build the complete frontend with:

Dashboard

CNN Playground

Convolution visualizer

ReLU visualizer

Pooling visualizer

CNN workflow

U-Net visualizer

Skip connection visualizer

2D U-Net demo

Metrics

3D U-Net page

nnU-Net workflow

Dataset fingerprint UI

Plans UI

Preprocessing UI

Inference UI

AI Tutor

Natural-language visualization

Learning progress

API integration layer

Start by implementing the MVP completely:

8×8 Image
 ↓
Convolution
 ↓
ReLU
 ↓
Max Pool
 ↓
U-Net
 ↓
Skip Connection
 ↓
Segmentation
 ↓
AI Explanation


Do not move to advanced 3D/nnU-Net features until the MVP is working correctly.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/11c600a3-1478-495f-9775-ebc3e359b3e2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
