from pathlib import Path

import joblib
import numpy as np
import rasterio

ROOT = Path(__file__).resolve().parents[2]
image_path = ROOT / "data" / "imagery" / "Esfahan_L9_2024_with_NDVI_NDBI.tif"
model_path = ROOT / "models" / "2024" / "svm_model.pkl"
scaler_path = ROOT / "models" / "2024" / "svm_scaler.pkl"
output_path = ROOT / "results" / "rasters" / "classified_map_2024.tif"

with rasterio.open(image_path) as src:
    image = src.read()
    metadata = src.meta.copy()
    bands, rows, columns = image.shape

pixels = image.reshape(bands, -1).T
valid_mask = ~np.isnan(pixels).any(axis=1)
valid_pixels = pixels[valid_mask]

scaler = joblib.load(scaler_path)
svm_model = joblib.load(model_path)

scaled_pixels = scaler.transform(valid_pixels)
predicted = np.full(pixels.shape[0], 255, dtype=np.uint8)
predicted[valid_mask] = svm_model.predict(scaled_pixels).astype(np.uint8)
classified = predicted.reshape(rows, columns)

metadata.update(count=1, dtype="uint8", nodata=255)

with rasterio.open(output_path, "w", **metadata) as dst:
    dst.write(classified, 1)

print("Classified raster saved to:", output_path)
