/*

// Define Tehran AOI
var tehran = ee.Geometry.Polygon([
  [
    [50.651789029809336, 35.38469091102715],
    [51.975641568871836, 35.38469091102715],
    [51.975641568871836, 36.00590281025703],
    [50.651789029809336, 36.00590281025703],
    [50.651789029809336, 35.38469091102715]
  ]
]);

// Cloud masking for Collection 2
function maskC2sr(image) {
  var qa = image.select('QA_PIXEL');
  var cloudShadowBitMask = 1 << 4;
  var cloudsBitMask = 1 << 3;
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
               .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  return image.updateMask(mask);
}

// Composite creation with metadata about band meanings
function getComposite(year, sensor) {
  var start = ee.Date.fromYMD(year, 6, 15);
  var end = ee.Date.fromYMD(year, 9, 15);
  var collection, bandsToSelect, bandInfo;

  if (sensor === 'L5') {
    collection = ee.ImageCollection("LANDSAT/LT05/C02/T1_L2")
      .filterBounds(tehran)
      .filterDate(start, end)
      .map(maskC2sr);
    bandsToSelect = ['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7'];
    bandInfo = {
      'SR_B1': 'Blue (0.45–0.52 µm)',
      'SR_B2': 'Green (0.52–0.60 µm)',
      'SR_B3': 'Red (0.63–0.69 µm)',
      'SR_B4': 'NIR (0.76–0.90 µm)',
      'SR_B5': 'SWIR1 (1.55–1.75 µm)',
      'SR_B7': 'SWIR2 (2.08–2.35 µm)'
    };
  } else if (sensor === 'L8' || sensor === 'L9') {
    var collectionId = sensor === 'L8' ?
      "LANDSAT/LC08/C02/T1_L2" :
      "LANDSAT/LC09/C02/T1_L2";
    collection = ee.ImageCollection(collectionId)
      .filterBounds(tehran)
      .filterDate(start, end)
      .map(maskC2sr);
    bandsToSelect = ['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7'];
    bandInfo = {
      'SR_B2': 'Blue (0.45–0.51 µm)',
      'SR_B3': 'Green (0.53–0.59 µm)',
      'SR_B4': 'Red (0.64–0.67 µm)',
      'SR_B5': 'NIR (0.85–0.88 µm)',
      'SR_B6': 'SWIR1 (1.57–1.65 µm)',
      'SR_B7': 'SWIR2 (2.11–2.29 µm)'
    };
  }

  var composite = collection.median()
    .select(bandsToSelect)
    .multiply(0.0000275)
    .clip(tehran);

  return composite.set({
    'year': year,
    'sensor': sensor,
    'band_info': bandInfo
  });
}

// Generate composites for each year
var img2000 = getComposite(2000, 'L5');
var img2006 = getComposite(2006, 'L5');  // <- Changed from 2005 to 2006
var img2010 = getComposite(2010, 'L5');
var img2015 = getComposite(2015, 'L8');
var img2020 = getComposite(2020, 'L8');
var img2024 = getComposite(2024, 'L9');

// Visual check
Map.centerObject(tehran, 9);
Map.addLayer(img2024.select(['SR_B4', 'SR_B3', 'SR_B2']), {min: 0, max: 0.3}, 'Tehran 2024');

// Export all images to Google Drive
var years = [2000, 2006, 2010, 2015, 2020, 2024];
var sensors = ['L5', 'L5', 'L5', 'L8', 'L8', 'L9'];
var images = [img2000, img2006, img2010, img2015, img2020, img2024];

for (var i = 0; i < years.length; i++) {
  Export.image.toDrive({
    image: images[i],
    description: 'Tehran_' + years[i],
    folder: 'GEE_Tehran',
    fileNamePrefix: 'Tehran_' + years[i],
    region: tehran,
    scale: 30,
    maxPixels: 1e13
  });
}
*/


//////////////////////////////////////////////////////////////////////////////////////////////////////////
/*

// Load your uploaded shapefile (converted to asset)
var region = ee.FeatureCollection("projects/earthengine-legacy/assets/users/alimoeinkhah/tehran_koli");  // replace with your actual asset path

// Cloud masking function for Collection 2
function maskC2sr(image) {
  var qa = image.select('QA_PIXEL');
  var cloudShadowBitMask = 1 << 4;
  var cloudsBitMask = 1 << 3;
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
               .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  return image.updateMask(mask);
}

// Function to create composite with common bands
function getComposite(year, sensor) {
  var start = ee.Date.fromYMD(year, 6, 15);
  var end = ee.Date.fromYMD(year, 9, 15);
  var collection, bandsToSelect;

  bandsToSelect = ['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7'];

  if (sensor === 'L5') {
    collection = ee.ImageCollection("LANDSAT/LT05/C02/T1_L2")
      .filterBounds(region)
      .filterDate(start, end)
      .map(maskC2sr);
  } else if (sensor === 'L9') {
    collection = ee.ImageCollection("LANDSAT/LC09/C02/T1_L2")
      .filterBounds(region)
      .filterDate(start, end)
      .map(maskC2sr);
  }

  return collection.median()
    .select(bandsToSelect)
    .multiply(0.0000275)
    .clip(region);
}

// Generate composites
var img2000 = getComposite(2000, 'L5');
var img2024 = getComposite(2024, 'L9');

// Display
Map.centerObject(region, 9);
Map.addLayer(img2000.select(['SR_B4', 'SR_B3', 'SR_B2']), {min: 0, max: 0.3}, 'Tehran 2000');
Map.addLayer(img2024.select(['SR_B4', 'SR_B3', 'SR_B2']), {min: 0, max: 0.3}, 'Tehran 2024');

// Export to Google Drive
Export.image.toDrive({
  image: img2000,
  description: 'Tehran_2000_clipped',
  folder: 'GEE_Tehran',
  fileNamePrefix: 'Tehran_2000_clipped',
  region: region.geometry(),
  scale: 30,
  maxPixels: 1e13
});

Export.image.toDrive({
  image: img2024,
  description: 'Tehran_2024_clipped',
  folder: 'GEE_Tehran',
  fileNamePrefix: 'Tehran_2024_clipped',
  region: region.geometry(),
  scale: 30,
  maxPixels: 1e13
});

*/



/////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
//📌Shows how many satellite imagery in these years and which one is better to choose//

// Define the updated Esfahan region of interest using new coordinates
var esfehanROI = ee.Geometry.Polygon([
  [
    [51.29111515459174, 32.498537799715464],
    [51.99698673662299, 32.498537799715464],
    [51.99698673662299, 32.91107714194942],
    [51.29111515459174, 32.91107714194942],
    [51.29111515459174, 32.498537799715464]
  ]
]);

// ------------------------
// Landsat 5: August 1985
// ------------------------
var landsat5 = ee.ImageCollection("LANDSAT/LT05/C02/T1_L2")
  .filterBounds(esfehanROI)
  .filterDate('1985-08-01', '1985-08-31');

print('Number of Landsat 5 images in August 1985:', landsat5.size());

var infoL5 = landsat5.map(function(image) {
  var date = ee.Date(image.get('system:time_start')).format('YYYY-MM-dd');
  var cloud = image.get('CLOUD_COVER');
  return ee.Feature(null, {'date': date, 'cloud_cover': cloud});
});
print('Landsat 5 - Dates and Cloud Cover:', infoL5);

// ------------------------
// Landsat 9: August 2024
// ------------------------
var landsat9 = ee.ImageCollection("LANDSAT/LC09/C02/T1_L2")
  .filterBounds(esfehanROI)
  .filterDate('2024-08-01', '2024-08-31');

print('Number of Landsat 9 images in August 2024:', landsat9.size());

var infoL9 = landsat9.map(function(image) {
  var date = ee.Date(image.get('system:time_start')).format('YYYY-MM-dd');
  var cloud = image.get('CLOUD_COVER');
  return ee.Feature(null, {'date': date, 'cloud_cover': cloud});
});
print('Landsat 9 - Dates and Cloud Cover:', infoL9);

// ------------------------
// Display all Landsat 5 images on the map
// ------------------------
landsat5.evaluate(function(list) {
  list.features.forEach(function(imgDict, index) {
    var imageId = imgDict.id;
    var dateStr = imgDict.properties['system:index'];
    var image = ee.Image(imageId).multiply(0.0000275).add(-0.2);
    var visParamsL5 = {
      bands: ['SR_B3', 'SR_B2', 'SR_B1'],
      min: 0,
      max: 0.3,
      gamma: 1.2
    };
    Map.addLayer(image.clip(esfehanROI), visParamsL5, 'L5 - ' + dateStr);
  });
});

// ------------------------
// Display all Landsat 9 images on the map
// ------------------------
landsat9.evaluate(function(list) {
  list.features.forEach(function(imgDict, index) {
    var imageId = imgDict.id;
    var dateStr = imgDict.properties['system:index'];
    var image = ee.Image(imageId).multiply(0.0000275).add(-0.2);
    var visParamsL9 = {
      bands: ['SR_B4', 'SR_B3', 'SR_B2'],
      min: 0,
      max: 0.3,
      gamma: 1.2
    };
    Map.addLayer(image.clip(esfehanROI), visParamsL9, 'L9 - ' + dateStr);
  });
});

// Center the map over Esfahan
Map.centerObject(esfehanROI, 9);

// Show region boundary
Map.addLayer(esfehanROI, {color: 'red'}, 'Esfahan ROI');

*/



//////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
// 📌 Project: Urban Expansion Analysis - Esfahan - Landsat 5 - 1985-08-02
//📌 Esfahan_Landsat5_1985_Preprocessing_With_NDVI_NDBI

// Step: Preprocessing image + NDVI/NDBI calculation + Export-ready composite

// ------------------------
// 1. Define Region of Interest (Esfahan)
// ------------------------
var esfehanROI = ee.Geometry.Polygon([
  [
    [51.29111515459174, 32.498537799715464],
    [51.99698673662299, 32.498537799715464],
    [51.99698673662299, 32.91107714194942],
    [51.29111515459174, 32.91107714194942],
    [51.29111515459174, 32.498537799715464]
  ]
]);

// ------------------------
// 2. Select Landsat 5 image on 1985-08-02
// ------------------------
var imageL5 = ee.ImageCollection("LANDSAT/LT05/C02/T1_L2")
  .filterBounds(esfehanROI)
  .filterDate('1985-08-02', '1985-08-03')
  .first();

// ------------------------
// 3. Apply reflectance scale factor
// ------------------------
var scaledL5 = imageL5.multiply(0.0000275).add(-0.2);

// ------------------------
// 4. Calculate NDVI and NDBI
// ------------------------
var ndvi = scaledL5.normalizedDifference(['SR_B4', 'SR_B3']).rename('NDVI');
var ndbi = scaledL5.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDBI');

// ------------------------
// 5. Rename bands clearly, convert to float32, and clip to ROI
// ------------------------
var finalL5 = scaledL5
  .select(
    ['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7'],
    ['Blue', 'Green', 'Red', 'NIR', 'SWIR1', 'SWIR2']
  )
  .addBands([ndvi, ndbi])
  .toFloat() // ✅ convert all bands to Float32
  .clip(esfehanROI);

// ------------------------
// 6. Visualize result
// ------------------------
Map.centerObject(esfehanROI, 9);

Map.addLayer(finalL5, 
  {bands: ['Red', 'Green', 'Blue'], min: 0, max: 0.3}, 
  'L5 RGB (1985)');

Map.addLayer(finalL5.select('NDVI'), 
  {min: -1, max: 1, palette: ['blue', 'white', 'green']}, 
  'NDVI');

Map.addLayer(finalL5.select('NDBI'), 
  {min: -1, max: 1, palette: ['white', 'gray', 'black']}, 
  'NDBI');

Map.addLayer(esfehanROI, {color: 'red'}, 'Esfahan ROI');

// ------------------------
// 7. Export final image with bands + indices
// ------------------------
Export.image.toDrive({
  image: finalL5,
  description: 'Esfahan_L5_1985_Prepared',
  fileNamePrefix: 'Esfahan_L5_1985_with_NDVI_NDBI',
  region: esfehanROI,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});
*/
//////////////////////////////////////////////////////////////////////////////////////////////////////////



// 📌 Project: Urban Expansion Analysis - Esfahan - Landsat 9 - 2024-08-05
// Step: Preprocessing image + NDVI/NDBI calculation + Export-ready composite

// ------------------------
// 1. Define Region of Interest (Esfahan)
// ------------------------
var esfehanROI = ee.Geometry.Polygon([
  [
    [51.29111515459174, 32.498537799715464],
    [51.99698673662299, 32.498537799715464],
    [51.99698673662299, 32.91107714194942],
    [51.29111515459174, 32.91107714194942],
    [51.29111515459174, 32.498537799715464]
  ]
]);

// ------------------------
// 2. Select Landsat 9 image on 2024-08-05
// ------------------------
var imageL9 = ee.ImageCollection("LANDSAT/LC09/C02/T1_L2")
  .filterBounds(esfehanROI)
  .filterDate('2024-08-05', '2024-08-06')
  .first();

// ------------------------
// 3. Apply reflectance scale factor
// ------------------------
var scaledL9 = imageL9.multiply(0.0000275).add(-0.2);

// ------------------------
// 4. Calculate NDVI and NDBI
// ------------------------
var ndvi = scaledL9.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI');
var ndbi = scaledL9.normalizedDifference(['SR_B6', 'SR_B5']).rename('NDBI');

// ------------------------
// 5. Rename bands clearly, convert to float32, and clip to ROI
// ------------------------
var finalL9 = scaledL9
  .select(
    ['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7'],
    ['Blue', 'Green', 'Red', 'NIR', 'SWIR1', 'SWIR2']
  )
  .addBands([ndvi, ndbi])
  .toFloat()
  .clip(esfehanROI);

// ------------------------
// 6. Visualize result
// ------------------------
Map.centerObject(esfehanROI, 9);

Map.addLayer(finalL9, 
  {bands: ['Red', 'Green', 'Blue'], min: 0, max: 0.3}, 
  'L9 RGB (2024)');

Map.addLayer(finalL9.select('NDVI'), 
  {min: -1, max: 1, palette: ['blue', 'white', 'green']}, 
  'NDVI');

Map.addLayer(finalL9.select('NDBI'), 
  {min: -1, max: 1, palette: ['white', 'gray', 'black']}, 
  'NDBI');

Map.addLayer(esfehanROI, {color: 'red'}, 'Esfahan ROI');

// ------------------------
// 7. Export final image with bands + indices
// ------------------------
Export.image.toDrive({
  image: finalL9,
  description: 'Esfahan_L9_2024_Prepared',
  fileNamePrefix: 'Esfahan_L9_2024_with_NDVI_NDBI',
  region: esfehanROI,
  scale: 30,
  crs: 'EPSG:4326',
  maxPixels: 1e13
});


