from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import rasterio

ROOT = Path(__file__).resolve().parents[2]
path_1985 = ROOT / "results" / "rasters" / "classified_map_1985.tif"
path_2024 = ROOT / "results" / "rasters" / "classified_map_2024.tif"
table_path = ROOT / "results" / "tables" / "Land_Cover_Net_Change_1985_2024.csv"
figure_path = ROOT / "images" / "land_cover_area_comparison_1985_2024.png"

class_labels = {1: "Built-up", 2: "Vegetation", 3: "Bare land"}
pixel_area_km2 = (30 * 30) / 1_000_000


def count_pixels_per_class(image_path: Path) -> dict[int, int]:
    with rasterio.open(image_path) as src:
        data = src.read(1)
    unique, counts = np.unique(data, return_counts=True)
    return dict(zip(unique.tolist(), counts.tolist()))


counts_1985 = count_pixels_per_class(path_1985)
counts_2024 = count_pixels_per_class(path_2024)

rows = []
for class_id in [1, 2, 3]:
    label = class_labels[class_id]
    area_1985 = counts_1985.get(class_id, 0) * pixel_area_km2
    area_2024 = counts_2024.get(class_id, 0) * pixel_area_km2
    change = area_2024 - area_1985
    percent_change = (change / area_1985) * 100 if area_1985 > 0 else np.nan
    rows.append(
        [
            label,
            round(area_1985, 2),
            round(area_2024, 2),
            round(change, 2),
            round(percent_change, 1),
        ]
    )

df = pd.DataFrame(
    rows,
    columns=["Class", "Area_1985_km2", "Area_2024_km2", "Change_km2", "Change_%"],
)
df.to_csv(table_path, index=False)
print(df.to_string(index=False))

x = np.arange(len(df))
width = 0.35

plt.figure(figsize=(10, 5))
plt.bar(x - width / 2, df["Area_1985_km2"], width, label="1985")
plt.bar(x + width / 2, df["Area_2024_km2"], width, label="2024")
plt.xticks(x, df["Class"])
plt.ylabel("Area (km²)")
plt.title("Comparison of Land Cover Area (1985 vs 2024)")
plt.legend()
plt.grid(axis="y", linestyle="--", alpha=0.6)
plt.tight_layout()
plt.savefig(figure_path, dpi=300, bbox_inches="tight")
plt.show()

print("Table saved to:", table_path)
print("Figure saved to:", figure_path)
