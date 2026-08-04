from pathlib import Path

import numpy as np
import pandas as pd
import rasterio

ROOT = Path(__file__).resolve().parents[2]
path_1985 = ROOT / "results" / "rasters" / "classified_map_1985.tif"
path_2024 = ROOT / "results" / "rasters" / "classified_map_2024.tif"
tables_dir = ROOT / "results" / "tables"

with rasterio.open(path_1985) as src_1985:
    class_1985 = src_1985.read(1)

with rasterio.open(path_2024) as src_2024:
    class_2024 = src_2024.read(1)

valid_mask = np.isin(class_1985, [1, 2, 3]) & np.isin(class_2024, [1, 2, 3])
from_values = class_1985[valid_mask]
to_values = class_2024[valid_mask]

classes = [1, 2, 3]
labels = ["Built-up", "Vegetation", "Bare land"]
matrix_labels = [f"{class_id} ({label})" for class_id, label in zip(classes, labels)]

pixel_matrix = pd.crosstab(
    from_values,
    to_values,
    rownames=["From"],
    colnames=["To"],
    dropna=False,
).reindex(index=classes, columns=classes, fill_value=0)

pixel_matrix.index = matrix_labels
pixel_matrix.columns = matrix_labels

pixel_area_km2 = 0.0009
area_matrix = pixel_matrix * pixel_area_km2
percent_matrix = area_matrix / area_matrix.to_numpy().sum() * 100

pixel_matrix.to_csv(tables_dir / "change_matrix_pixels.csv")
area_matrix.round(2).to_csv(tables_dir / "change_matrix_km2.csv")
percent_matrix.round(1).to_csv(tables_dir / "change_matrix_percent.csv")

print("Transition matrices saved in:", tables_dir)
