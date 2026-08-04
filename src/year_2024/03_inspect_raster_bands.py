from pathlib import Path

import rasterio

ROOT = Path(__file__).resolve().parents[2]
tif_path = ROOT / "data" / "imagery" / "Esfahan_L9_2024_with_NDVI_NDBI.tif"

with rasterio.open(tif_path) as src:
    print("Band count:", src.count)
    print("CRS:", src.crs)
    print("Dimensions:", src.width, "x", src.height)
    print("\nBand descriptions:")

    if src.descriptions and src.descriptions[0] is not None:
        for index, description in enumerate(src.descriptions, start=1):
            print(f"Band {index}: {description}")
    else:
        print("The raster does not contain descriptive band names.")
