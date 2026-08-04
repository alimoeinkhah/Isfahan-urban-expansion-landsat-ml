/*
Isfahan Urban Expansion Mapping (1985–2024)
Google Earth Engine preprocessing

Outputs:
1. Esfahan_L5_1985_with_NDVI_NDBI.tif
2. Esfahan_L9_2024_with_NDVI_NDBI.tif

Each exported raster contains eight bands in this order:
Blue, Green, Red, NIR, SWIR1, SWIR2, NDVI, NDBI
*/

// -----------------------------------------------------------------------------
// 1. Study area
// -----------------------------------------------------------------------------
var isfahanROI = ee.Geometry.Polygon([
  [
    [51.29111515459174, 32.498537799715464],
    [51.99698673662299, 32.498537799715464],
    [51.99698673662299, 32.91107714194942],
    [51.29111515459174, 32.91107714194942],
    [51.29111515459174, 32.498537799715464]
  ]
]);

var SCALE_FACTOR = 0.0000275;
var OFFSET = -0.2;
var EXPORT_SCALE = 30;
var EXPORT_CRS = 'EPSG:4326';

// -----------------------------------------------------------------------------
// 2. Landsat 5 TM — 2 August 1985
// -----------------------------------------------------------------------------
var rawL5 = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
  .filterBounds(isfahanROI)
  .filterDate('1985-08-02', '1985-08-03')
  .first();

var opticalL5 = rawL5
  .select(
    ['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7'],
    ['Blue', 'Green', 'Red', 'NIR', 'SWIR1', 'SWIR2']
  )
  .multiply(SCALE_FACTOR)
  .add(OFFSET);

var ndvi1985 = opticalL5
  .normalizedDifference(['NIR', 'Red'])
  .rename('NDVI');

var ndbi1985 = opticalL5
  .normalizedDifference(['SWIR1', 'NIR'])
  .rename('NDBI');

var finalL5 = opticalL5
  .addBands([ndvi1985, ndbi1985])
  .toFloat()
  .clip(isfahanROI);

print('Landsat 5 product ID:', rawL5.get('LANDSAT_PRODUCT_ID'));
print(
  'Landsat 5 acquisition date:',
  ee.Date(rawL5.get('system:time_start')).format('YYYY-MM-dd')
);
print('Landsat 5 cloud cover:', rawL5.get('CLOUD_COVER'));
print('Landsat 5 output bands:', finalL5.bandNames());

// -----------------------------------------------------------------------------
// 3. Landsat 9 OLI-2 — 5 August 2024
// -----------------------------------------------------------------------------
var rawL9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
  .filterBounds(isfahanROI)
  .filterDate('2024-08-05', '2024-08-06')
  .first();

var opticalL9 = rawL9
  .select(
    ['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7'],
    ['Blue', 'Green', 'Red', 'NIR', 'SWIR1', 'SWIR2']
  )
  .multiply(SCALE_FACTOR)
  .add(OFFSET);

var ndvi2024 = opticalL9
  .normalizedDifference(['NIR', 'Red'])
  .rename('NDVI');

var ndbi2024 = opticalL9
  .normalizedDifference(['SWIR1', 'NIR'])
  .rename('NDBI');

var finalL9 = opticalL9
  .addBands([ndvi2024, ndbi2024])
  .toFloat()
  .clip(isfahanROI);

print('Landsat 9 product ID:', rawL9.get('LANDSAT_PRODUCT_ID'));
print(
  'Landsat 9 acquisition date:',
  ee.Date(rawL9.get('system:time_start')).format('YYYY-MM-dd')
);
print('Landsat 9 cloud cover:', rawL9.get('CLOUD_COVER'));
print('Landsat 9 output bands:', finalL9.bandNames());

// -----------------------------------------------------------------------------
// 4. Map display
// -----------------------------------------------------------------------------
Map.centerObject(isfahanROI, 9);

Map.addLayer(
  finalL5,
  {bands: ['Red', 'Green', 'Blue'], min: 0, max: 0.3, gamma: 1.2},
  'Landsat 5 RGB — 1985',
  false
);

Map.addLayer(
  finalL9,
  {bands: ['Red', 'Green', 'Blue'], min: 0, max: 0.3, gamma: 1.2},
  'Landsat 9 RGB — 2024',
  true
);

Map.addLayer(
  finalL5.select('NDVI'),
  {min: -1, max: 1, palette: ['blue', 'white', 'green']},
  'NDVI — 1985',
  false
);

Map.addLayer(
  finalL9.select('NDVI'),
  {min: -1, max: 1, palette: ['blue', 'white', 'green']},
  'NDVI — 2024',
  false
);

Map.addLayer(
  finalL5.select('NDBI'),
  {min: -1, max: 1, palette: ['white', 'gray', 'black']},
  'NDBI — 1985',
  false
);

Map.addLayer(
  finalL9.select('NDBI'),
  {min: -1, max: 1, palette: ['white', 'gray', 'black']},
  'NDBI — 2024',
  false
);

Map.addLayer(isfahanROI, {color: 'red'}, 'Study area', true);

// -----------------------------------------------------------------------------
// 5. Export prepared rasters
// The output filenames retain "Esfahan" to match the Python workflow.
// -----------------------------------------------------------------------------
Export.image.toDrive({
  image: finalL5,
  description: 'Esfahan_L5_1985_Prepared',
  fileNamePrefix: 'Esfahan_L5_1985_with_NDVI_NDBI',
  region: isfahanROI,
  scale: EXPORT_SCALE,
  crs: EXPORT_CRS,
  maxPixels: 1e13
});

Export.image.toDrive({
  image: finalL9,
  description: 'Esfahan_L9_2024_Prepared',
  fileNamePrefix: 'Esfahan_L9_2024_with_NDVI_NDBI',
  region: isfahanROI,
  scale: EXPORT_SCALE,
  crs: EXPORT_CRS,
  maxPixels: 1e13
});
