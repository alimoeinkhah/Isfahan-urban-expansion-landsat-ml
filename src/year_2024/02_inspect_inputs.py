from pathlib import Path

import geopandas as gpd
import rasterio

ROOT = Path(__file__).resolve().parents[2]
geojson_path = ROOT / "data" / "training" / "2024" / "training_data_2024.geojson"
raster_path = ROOT / "data" / "imagery" / "Esfahan_L9_2024_with_NDVI_NDBI.tif"

gdf = gpd.read_file(geojson_path)

print("Polygon count:", len(gdf))
print("Classes:", sorted(gdf["class"].unique()))

with rasterio.open(raster_path) as src:
    print("Raster bands:", src.count)
    print("Raster dimensions:", src.width, "x", src.height)
    print("CRS:", src.crs)
