from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings

import numpy as np
from scipy.stats import gaussian_kde
import pandas as pd
from pydantic import BaseModel

# TODO: Rewrite Font Data to have Caps n Spaces
# TODO: Use median of data distribution within threshold instead of midpoint for distance calculation.
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

# Seems to work best visually with 10 bins. otherwise the values are too sparse.
def to_histogram(values: np.ndarray, total: int, bins: int = 10) -> list[dict]:
    """Count fonts per bin, normalize against total font count."""
    counts, edges = np.histogram(values, bins=bins, range=(0, 100))
    x_centers = (edges[:-1] + edges[1:]) / 2
    y_normalized = counts / total  # proportion of ALL fonts in each bin

    return [{"x": round(float(x), 2), "y": round(float(y), 6)}
            for x, y in zip(x_centers, y_normalized)]


@app.post("/api/distribution")
def get_distribution(req: DistributionRequest):
    if req.key not in font_slider_scores.columns:
        return []

    values = font_slider_scores[req.key].dropna().values
    total = len(font_slider_scores)

    # Full dist — normalize against itself so it peaks at its natural proportion
    return to_histogram(values, total, bins=10)


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

    total = len(font_slider_scores)  # always the full count
    filtered_values = df[req.key].dropna().values

    # Both use the same total — filtered bars are physically shorter
    # when fewer fonts survive, impossible to exceed full distribution
    return to_histogram(filtered_values, total, bins=10)


# TODO: AN API CALL FOR REQUESTING A LIST OF THE BEST MATCHING FONTS
@app.post("/api/getclosestfonts")
def get_closest_fonts(fontFilters: dict):
  # Get the score between the sliders
  print(fontFilters)

  midpoints = {key: (vals[0] + vals[1]) / 2 for key, vals in fontFilters["fontFilters"].items()}

  print(midpoints)

  active_filters = {
      key: vals for key, vals in fontFilters["fontFilters"].items()
      if vals != [0, 100]
  }

  # in the event of no font filters we use all filters
  # this in theory gets us the most average looking fonts across the board
  if not active_filters:
      active_filters = fontFilters["fontFilters"]

  cols = list(active_filters.keys())
  target = np.array([(vals[0] + vals[1]) / 2 for vals in active_filters.values()])

  # TODO: Weight based on how much the fontFilters have been restricted

  distances = np.linalg.norm(font_slider_scores[cols].values - target, axis=1)
  font_slider_scores['distance'] = distances

  closest = font_slider_scores.nsmallest(10, 'distance')

  # for now we'll just keep this

  print(closest.font.to_dict())

  # Currently font_slider_scores is just a df
  return{ "fonts": closest.font.tolist()}