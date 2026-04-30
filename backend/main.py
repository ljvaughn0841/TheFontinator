from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings

import numpy as np
from scipy.stats import gaussian_kde
import pandas as pd
from pydantic import BaseModel


font_ids = np.load("data/FontData.npy")

font_grid = np.load("data/IntGridCoords.npy")

font_slider_scores = pd.read_parquet("data/semantic_axes.parquet")

featured_font = font_ids[0]  # Initialize with the first font

app = FastAPI(
  title="THE FONTINATOR API",
  description="Api to access encoded fonts.",
  docs_url="/docs",
  redoc_url="/redoc",
)


# Allows api to be used from a different origin (url).
app.add_middleware(
  # CORS Cross Origin Resource Sharing.
  CORSMiddleware,
  allow_origins=settings.ALLOWED_ORIGINS,
  # Allows sending of credentials
  allow_credentials=True,
  # Allows sending all methods
  allow_methods=["*"],
  # Allows sending additional info in the headers
  allow_headers=["*"]
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

@app.get("/api/hello-world")
def hello_world():
  # Always returns a Pydantic object or a python dictionary -> JSON
  return{"message": "Hello World :)"}


@app.get("/api/font")
def get_font():
  return font_ids[1]

@app.post("/api/gridhover")
def gridhover(data: dict):
  index = data['index']
  row = index // 35
  col = index % 35
  target = [row, col]
  indices = np.where((font_grid == target).all(axis=1))[0]

  font_name = font_ids[indices][0]
  print({"font": font_name})
  return {"font": font_name}

@app.get("/api/featured-font")
def get_featured_font():
  return {"font": featured_font}



# --- Request models ---
class DistributionRequest(BaseModel):
    key: str  # "formality", "energy", etc.

class FilteredDistributionRequest(BaseModel):
    key: str                        # which axis to plot
    filters: dict[str, list[float]] # all current slider ranges


def to_curve(values: np.ndarray, y_max: float = None, points: int = 60) -> list[dict]:
    if len(values) < 2:
        return []

    kde = gaussian_kde(values, bw_method=0.3)
    x_range = np.linspace(0, 100, points)
    y_values = kde(x_range)

    # If a y_max is passed in, normalize against it
    # Otherwise normalize against its own max (used for full distribution)
    normalizer = y_max if y_max is not None else y_values.max()
    y_normalized = y_values / y_values.max()

    return [{"x": round(float(x), 2), "y": round(float(y), 6)} 
            for x, y in zip(x_range, y_normalized)]

def compute_kde(values: np.ndarray, points: int = 60) -> np.ndarray:
    """Returns raw y values for a given array, evaluated on 0-100 x range."""
    kde = gaussian_kde(values, bw_method=0.3)
    x_range = np.linspace(0, 100, points)
    return x_range, kde(x_range)


@app.post("/api/distribution")
def get_distribution(req: DistributionRequest):
    if req.key not in font_slider_scores.columns:
        return []

    values = font_slider_scores[req.key].dropna().values
    x_range, y_values = compute_kde(values)
    y_normalized = y_values / y_values.max()  # peaks at 1.0

    return [{"x": round(float(x), 2), "y": round(float(y), 6)}
            for x, y in zip(x_range, y_normalized)]


@app.post("/api/distribution/filtered")
def get_filtered_distribution(req: FilteredDistributionRequest):
    if req.key not in font_slider_scores.columns:
        return []

    df = font_slider_scores.copy()
    for col, (lo, hi) in req.filters.items():
        if col in df.columns:
            df = df[(df[col] >= lo) & (df[col] <= hi)]

    if len(df) < 2:
        return []

    full_values = font_slider_scores[req.key].dropna().values
    filtered_values = df[req.key].dropna().values

    # How many fonts survived — this becomes the height scalar
    survival_ratio = len(filtered_values) / len(full_values)

    x_range, full_y = compute_kde(full_values)
    _, filtered_y = compute_kde(filtered_values)

    full_y_max = full_y.max()
    full_y_norm = full_y / full_y_max

    # Scale filtered by survival ratio before clamping
    # 100% of fonts survive → full height, 10% survive → 10% height
    filtered_y_norm = (filtered_y / full_y_max) * survival_ratio

    clamped_y = np.minimum(filtered_y_norm, full_y_norm)

    return [{"x": round(float(x), 2), "y": round(float(y), 6)}
            for x, y in zip(x_range, clamped_y)]