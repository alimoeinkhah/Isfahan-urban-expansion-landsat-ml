from pathlib import Path

import numpy as np
import rasterio

ROOT = Path(__file__).resolve().parents[2]
path_1985 = ROOT / "results" / "rasters" / "classified_map_1985.tif"
path_2024 = ROOT / "results" / "rasters" / "classified_map_2024.tif"
output_path = ROOT / "results" / "rasters" / "change_map_1985_2024.tif"

with rasterio.open(path_1985) as src_1985:
    class_1985 = src_1985.read(1)
    profile = src_1985.profile.copy()

with rasterio.open(path_2024) as src_2024:
    class_2024 = src_2024.read(1)

if class_1985.shape != class_2024.shape:
    raise ValueError("The classified rasters do not have the same dimensions.")

valid_mask = np.isin(class_1985, [1, 2, 3]) & np.isin(class_2024, [1, 2, 3])
change_map = np.zeros(class_1985.shape, dtype=np.uint16)
change_map[valid_mask] = (
    class_1985[valid_mask].astype(np.uint16) * 10
    + class_2024[valid_mask].astype(np.uint16)
)

profile.update(dtype="uint16", count=1, nodata=0)

with rasterio.open(output_path, "w", **profile) as dst:
    dst.write(change_map, 1)

print("Change map saved to:", output_path)
print("Unique valid transition codes:", np.unique(change_map[valid_mask]))
