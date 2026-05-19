"""
features.py — 120-dimensional handcrafted CV feature extraction.

Pipeline (matches training notebook exactly):
  preprocess(img) → get_mask(img) → extract_features(img, mask)

Feature vector layout:
  [0:24]   GLCM texture      (6 props × 4 angles)
  [24:50]  LBP texture       (26-bin uniform histogram, P=24 R=3)
  [50:74]  Gabor texture     (4 freqs × 3 orientations, mean+std)
  [74:106] Colour histogram  (16H + 8S + 8V, normalised, within mask)
  [106:115] Colour moments   (mean, std, skewness per HSV channel)
  [115:120] ABCD morphology  (asymmetry, compactness, cvar, diam, elong)
Total: 120 dimensions
"""

import numpy as np
import cv2
from skimage.feature import graycomatrix, graycoprops, local_binary_pattern


# ── Preprocessing ──────────────────────────────────────────────────────────────

def preprocess(img_bgr: np.ndarray, size: tuple = (256, 256)) -> np.ndarray:
    """Hair removal (black-hat) → Gaussian blur → CLAHE → resize."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (17, 17))
    bhat = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, kernel)
    _, hmask = cv2.threshold(bhat, 10, 255, cv2.THRESH_BINARY)
    img_bgr = cv2.inpaint(img_bgr, hmask, 3, cv2.INPAINT_TELEA)
    img_bgr = cv2.GaussianBlur(img_bgr, (5, 5), 0)
    lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    lab[:, :, 0] = clahe.apply(lab[:, :, 0])
    img_bgr = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
    return cv2.resize(img_bgr, size, interpolation=cv2.INTER_AREA)


def get_mask(img_bgr: np.ndarray) -> np.ndarray:
    """Otsu thresholding + morphological refinement to isolate lesion."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (7, 7), 0)
    _, mask = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, k)
    mask = cv2.morphologyEx(
        mask, cv2.MORPH_OPEN,
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    )
    return mask


# ── Feature groups ─────────────────────────────────────────────────────────────

def feat_glcm(gray: np.ndarray) -> np.ndarray:
    """24-dim GLCM at 4 angles × 6 properties."""
    glcm = graycomatrix(
        gray, distances=[1],
        angles=[0, np.pi / 4, np.pi / 2, 3 * np.pi / 4],
        levels=256, symmetric=True, normed=True
    )
    props = ["contrast", "correlation", "energy", "homogeneity", "dissimilarity", "ASM"]
    return np.concatenate([graycoprops(glcm, p).flatten() for p in props])


def feat_lbp(gray: np.ndarray) -> np.ndarray:
    """26-dim LBP histogram — rotation-invariant uniform, P=24 R=3."""
    lbp = local_binary_pattern(gray, P=24, R=3, method="uniform")
    hist, _ = np.histogram(lbp.ravel(), bins=26, range=(0, 26), density=True)
    return hist.astype(np.float32)


def feat_gabor(gray: np.ndarray) -> np.ndarray:
    """24-dim Gabor responses at 4 scales × 3 orientations (mean + std each)."""
    feats = []
    for freq in [0.1, 0.2, 0.3, 0.4]:
        for theta in [0, np.pi / 3, 2 * np.pi / 3]:
            kernel = cv2.getGaborKernel(
                (21, 21), sigma=4.0, theta=theta,
                lambd=1.0 / freq, gamma=0.5, psi=0
            )
            resp = cv2.filter2D(gray.astype(np.float32), cv2.CV_32F, kernel)
            feats.extend([resp.mean(), resp.std()])
    return np.array(feats, dtype=np.float32)


def feat_colour(img_bgr: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """32-dim normalised HSV histogram within lesion mask (16H + 8S + 8V)."""
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    m = (mask > 0).astype(np.uint8) * 255
    h = cv2.calcHist([hsv], [0], m, [16], [0, 180]).flatten()
    s = cv2.calcHist([hsv], [1], m, [8], [0, 256]).flatten()
    v = cv2.calcHist([hsv], [2], m, [8], [0, 256]).flatten()
    norm = lambda x: x / (x.sum() + 1e-8)
    return np.concatenate([norm(h), norm(s), norm(v)]).astype(np.float32)


def feat_colour_moments(img_bgr: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """9-dim colour moments (mean, std, skewness) per HSV channel."""
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    feats = []
    for ch in range(3):
        pixels = hsv[:, :, ch][mask > 0].astype(float)
        if pixels.size == 0:
            feats.extend([0.0, 0.0, 0.0])
            continue
        mu = pixels.mean()
        sigma = pixels.std() + 1e-8
        skew = float(np.mean(((pixels - mu) / sigma) ** 3))
        feats.extend([mu, sigma, skew])
    return np.array(feats, dtype=np.float32)


def feat_abcd(mask: np.ndarray, hsv: np.ndarray) -> np.ndarray:
    """5-dim ABCD dermoscopy features (asymmetry, compactness, cvar, diam, elong)."""
    cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not cnts:
        return np.zeros(5, dtype=np.float32)
    cnt = max(cnts, key=cv2.contourArea)
    area = cv2.contourArea(cnt) + 1e-6
    perim = cv2.arcLength(cnt, True) + 1e-6
    if len(cnt) >= 5:
        axes_sorted = sorted(cv2.fitEllipse(cnt)[1])
        asym = axes_sorted[0] / (axes_sorted[1] + 1e-6)
    else:
        asym = 1.0
    comp = (4 * np.pi * area) / (perim ** 2)
    cvar = float(hsv[:, :, 0][mask > 0].std())
    diam = np.sqrt(4 * area / np.pi)
    elong = perim / (2 * np.sqrt(np.pi * area) + 1e-6)
    return np.array([asym, comp, cvar, diam, elong], dtype=np.float32)


# ── Full 120D extraction ───────────────────────────────────────────────────────

def extract_features(img_bgr: np.ndarray) -> np.ndarray:
    """
    Full pipeline: preprocess → mask → 120D feature vector.

    Input : BGR image (any size)
    Output: float32 ndarray of shape (120,)
    """
    proc = preprocess(img_bgr)                         # 256×256 BGR
    mask = get_mask(proc)                              # binary mask
    gray = cv2.cvtColor(proc, cv2.COLOR_BGR2GRAY)
    hsv  = cv2.cvtColor(proc, cv2.COLOR_BGR2HSV)

    vec = np.concatenate([
        feat_glcm(gray),                               # 24
        feat_lbp(gray),                                # 26
        feat_gabor(gray),                              # 24
        feat_colour(proc, mask),                       # 32
        feat_colour_moments(proc, mask),               # 9
        feat_abcd(mask, hsv),                          # 5
    ]).astype(np.float32)

    assert vec.shape == (120,), f"Expected 120 dims, got {vec.shape}"
    return vec
