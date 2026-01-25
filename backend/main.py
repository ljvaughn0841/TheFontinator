from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings

import numpy as np

font_ids = np.load("data/FontData.npy")

font_grid = np.load("data/GridCoords.npy")

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

@app.get("/hello-world")
def hello_world():
  # Always returns a Pydantic object or a python dictionary -> JSON
  return{"message": "Hello World :)"}


@app.get("/font")
def get_font():
  return font_ids[1]