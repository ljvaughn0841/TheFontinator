from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings

import numpy as np

import pandas as pd

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

