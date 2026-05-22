"""
main.py — DermaAI FastAPI backend.

Endpoints:
  GET  /api/health   — health check + model status
  POST /api/analyze  — upload image → 120D features → ONNX → JSON result
"""

import io
import logging
import time
from contextlib import asynccontextmanager

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError

from features import extract_features
from inference import load_model, predict

logger = logging.getLogger(__name__)


# ── Lifespan: pre-load model on startup ───────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        load_model()
        print("✅ Random Forest ONNX model loaded successfully.")
    except FileNotFoundError as e:
        print(f"⚠️  {e}")
    yield


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="DermaAI API",
    description="Skin disease detection using Random Forest ONNX + 120D CV features",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helpers ───────────────────────────────────────────────────────────────────

ALLOWED_IMAGE_FORMATS = {"JPEG", "PNG", "BMP", "WEBP"}
MAX_SIZE_MB = 10
MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
UPLOAD_CHUNK_SIZE = 1024 * 1024


class InvalidImageError(ValueError):
    """Raised when uploaded bytes are not a supported image."""


def decode_image(data: bytes) -> np.ndarray:
    """Decode uploaded bytes → BGR ndarray."""
    try:
        with Image.open(io.BytesIO(data)) as pil:
            if pil.format not in ALLOWED_IMAGE_FORMATS:
                raise InvalidImageError("Unsupported image format. Use JPEG, PNG, BMP, or WEBP.")
            rgb = pil.convert("RGB")
    except InvalidImageError:
        raise
    except (Image.DecompressionBombError, OSError, UnidentifiedImageError) as exc:
        raise InvalidImageError("Invalid image data. Upload a valid image file.") from exc

    bgr = cv2.cvtColor(np.array(rgb), cv2.COLOR_RGB2BGR)
    return bgr


async def read_limited_upload(file: UploadFile) -> bytes:
    """Read an upload while enforcing the configured byte limit."""
    data = bytearray()
    while chunk := await file.read(UPLOAD_CHUNK_SIZE):
        if len(data) + len(chunk) > MAX_SIZE_BYTES:
            raise HTTPException(status_code=400, detail=f"File too large (max {MAX_SIZE_MB} MB).")
        data.extend(chunk)
    return bytes(data)


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    """Health check — confirms API and model status."""
    try:
        load_model()
        model_ok = True
    except Exception:
        model_ok = False
    return {
        "status": "ok",
        "model_loaded": model_ok,
        "model": "final_model_Random_Forest.onnx",
        "features": "120D (GLCM 24 + LBP 26 + Gabor 24 + ColourHist 32 + ColourMoments 9 + ABCD 5)",
    }


@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)):
    """
    Upload a skin image and receive classification results.

    Pipeline:
      1. Decode image
      2. Preprocess: hair removal → Gaussian blur → CLAHE → resize 256×256
      3. Otsu segmentation mask
      4. 120D feature extraction
      5. ONNX Random Forest inference
      6. Return label, probabilities, plain-language explanation
    """
    raw = await read_limited_upload(file)

    try:
        t0 = time.perf_counter()

        # Decode
        img_bgr = decode_image(raw)

        # Feature extraction (preprocess + mask + 120D)
        features = extract_features(img_bgr)

        # ONNX inference
        result = predict(features)

        elapsed_ms = round((time.perf_counter() - t0) * 1000)

        return {
            **result,
            "filename":    file.filename,
            "elapsed_ms":  elapsed_ms,
            "feature_dims": 120,
        }

    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except InvalidImageError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Feature extraction or inference failed")
        raise HTTPException(
            status_code=500,
            detail="Feature extraction or inference failed."
        ) from e
