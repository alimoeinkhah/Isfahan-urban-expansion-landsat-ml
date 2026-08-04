from pathlib import Path

import geopandas as gpd
import pandas as pd
from rasterstats import zonal_stats

ROOT = Path(__file__).resolve().parents[2]
geojson_path = ROOT / "data" / "training" / "1985" / "training_data_1985.geojson"
raster_path = ROOT / "data" / "imagery" / "Esfahan_L5_1985_with_NDVI_NDBI.tif"
output_path = ROOT / "data" / "training" / "1985" / "training_dataset_1985.csv"

gdf = gpd.read_file(geojson_path)

band_names = ["Blue", "Green", "Red", "NIR", "SWIR1", "SWIR2", "NDVI", "NDBI"]
features = []

for band_index, band_name in enumerate(band_names, start=1):
    statistics = zonal_stats(
        vectors=gdf["geometry"],
        raster=raster_path,
        stats=["mean"],
        band=band_index,
        nodata=-9999,
    )
    band_frame = pd.DataFrame(statistics)
    band_frame.columns = [f"mean_{band_name}"]
    features.append(band_frame)

features_df = pd.concat(features, axis=1)
features_df["class"] = gdf["class"].to_numpy()
features_df.to_csv(output_path, index=False)

print("Zonal statistics completed.")
print("Output:", output_path)
print("Dataset shape:", features_df.shape)
