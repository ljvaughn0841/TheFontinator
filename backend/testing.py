import numpy as np
import pandas as pd

font_slider_scores = pd.read_parquet("data/semantic_axes.parquet")
print(font_slider_scores)

fontFilters = {"fontFilters": {
    "formality": [0, 100],
    "age":  [0, 100],
    "energy": [0, 100],
    "warmth":[0, 100],
    "expressiveness": [0, 100]
}}

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

distances = np.linalg.norm(font_slider_scores[cols].values - target, axis=1)
font_slider_scores['distance'] = distances

closest = font_slider_scores.nsmallest(10, 'distance')

# for now we'll just keep this

print(closest)