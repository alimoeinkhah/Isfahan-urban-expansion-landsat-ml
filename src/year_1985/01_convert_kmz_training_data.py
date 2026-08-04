from pathlib import Path
import zipfile

import geopandas as gpd
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
folder = ROOT / "data" / "training" / "1985"

label_map = {
    "Class1_Builtup.kmz": 1,
    "Class2_Vegetation.kmz": 2,
    "Class3_Bare_land.kmz": 3,
}

gdf_list = []

for filename, class_id in label_map.items():
    kmz_path = folder / filename
    if not kmz_path.exists():
        raise FileNotFoundError(f"Missing training file: {kmz_path}")

    with zipfile.ZipFile(kmz_path, "r") as archive:
        kml_files = [name for name in archive.namelist() if name.lower().endswith(".kml")]
        if not kml_files:
            raise ValueError(f"No KML file found inside {kmz_path.name}")

        kml_name = kml_files[0]
        archive.extract(kml_name, folder)
        kml_path = folder / kml_name

        gdf = gpd.read_file(kml_path, driver="KML")
        gdf["class"] = class_id
        gdf_list.append(gdf)

        kml_path.unlink()

full_gdf = gpd.GeoDataFrame(
    pd.concat(gdf_list, ignore_index=True),
    crs=gdf_list[0].crs,
)

geojson_path = folder / "training_data_1985.geojson"
csv_path = folder / "training_data_1985.csv"

full_gdf.to_file(geojson_path, driver="GeoJSON")
full_gdf.drop(columns="geometry").to_csv(csv_path, index=False)

print("Conversion completed successfully.")
print("GeoJSON:", geojson_path)
print("CSV:", csv_path)
