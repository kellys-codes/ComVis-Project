"""
inference.py — ONNX Runtime wrapper for the Random Forest model.

Expected model: final_model_Random_Forest.onnx
  Input  : float_input  [None, 120]  float32  (raw features — no scaling needed)
  Outputs: label        [None]       int64
           probabilities [None, 3]   float32
"""

from pathlib import Path
from threading import Lock

import numpy as np
import onnxruntime as rt

MODEL_PATH = Path(__file__).parent / "model" / "final_model_Random_Forest.onnx"

CLASS_NAMES = {
    0: "Common / Benign Nevi",
    1: "Atypical / Other Benign",
    2: "Melanoma (Suspected)",
}

CLASS_RISK = {
    0: "healthy",
    1: "watch",
    2: "danger",
}

CLASS_WHAT = {
    0: "A common benign mole. Melanocytic nevi are very common — most adults have 10–40. Almost always completely harmless.",
    1: "This category includes atypical or other benign lesions such as seborrhoeic keratosis, actinic keratosis, dermatofibroma, or vascular lesions. While many are harmless, some may need treatment.",
    2: "Melanoma is the most serious type of skin cancer. It develops from pigment-producing cells. Early detection is critical — when caught early, treatment is highly effective.",
}

CLASS_ACTION = {
    0: "No action needed. Monitor for changes in shape, colour, size, or bleeding.",
    1: "Recommended: book a consultation with a dermatologist for professional evaluation.",
    2: "Please see a dermatologist or doctor as soon as possible. Do not delay.",
}

_session = None
_session_lock = Lock()

def load_model() -> rt.InferenceSession:
    """Load ONNX model (cached after first call)."""
    global _session
    if _session is None:
        with _session_lock:
            if _session is None:
                if not MODEL_PATH.exists():
                    raise FileNotFoundError(
                        f"ONNX model not found at {MODEL_PATH}. "
                        "Please copy final_model_Random_Forest.onnx into backend/models/"
                    )
                opts = rt.SessionOptions()
                opts.intra_op_num_threads = 4
                _session = rt.InferenceSession(str(MODEL_PATH), sess_options=opts)
    return _session


def predict(features: np.ndarray) -> dict:
    """
    Run ONNX inference on a (120,) or (1, 120) feature vector.

    Returns:
        {
            "label":         int,          # 0, 1, or 2
            "class_name":    str,
            "risk":          str,          # healthy / watch / danger
            "probabilities": [p0, p1, p2], # float list, sums to 1
            "confidence":    float,        # max probability
            "what":          str,          # plain-language explanation
            "action":        str,          # recommended next step
        }
    """
    sess = load_model()
    if features.ndim == 1:
        features = features.reshape(1, -1)
    features = features.astype(np.float32)

    label_arr, prob_arr = sess.run(
        ["label", "probabilities"],
        {"float_input": features}
    )
    label = int(label_arr[0])
    probs = prob_arr[0].tolist()
    if label not in CLASS_NAMES:
        raise ValueError(f"Model returned unexpected label {label}; probabilities={probs}")

    return {
        "label":         label,
        "class_name":    CLASS_NAMES[label],
        "risk":          CLASS_RISK[label],
        "probabilities": probs,
        "confidence":    float(max(probs)),
        "what":          CLASS_WHAT[label],
        "action":        CLASS_ACTION[label],
    }
