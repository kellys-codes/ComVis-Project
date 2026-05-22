# DermaAI - AI-Powered Skin Disease Detection

Vite + React frontend . FastAPI backend . Random Forest ONNX model

## Project Structure
```
.
|-- frontend/          # Vite + React (port 5173)
`-- backend/           # FastAPI (port 8000)
    `-- models/        # place final_model_Random_Forest.onnx here
```

## Quick Start

### 1. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/analyze | Upload image -> 120D features -> ONNX -> probabilities |
| GET | /api/health | Health check |

## Feature Pipeline (120D)
GLCM (24D) + LBP (26D) + Gabor (24D) + Colour Histogram (32D) + Colour Moments (9D) + ABCD (5D)

## Classes
- **0** - Common / Benign Nevi
- **1** - Atypical / Other Benign
- **2** - Melanoma (Suspected)
