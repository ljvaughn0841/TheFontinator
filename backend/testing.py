import numpy as np
font_ids = np.load("data/FontData.npy")
font_grid = np.load("data/GridCoords_integers.npy")
index = 629
row = index // 35
col = index % 35
print(row, col)
target = [row, col]
result = np.where((font_grid == target).all(axis=1))[0]

print(font_grid)

print(result)