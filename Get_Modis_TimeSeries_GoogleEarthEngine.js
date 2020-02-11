/*

Title: Get Modis Time Series
By: Ryan McKeon ryan.e.mckeon@dartmouth.edu
Date: 04 February 2020

Purpose:
Uses Modis 8-day Composite Imagery (MOD09A1) and 
Generates Time Series for NDVI Data with Cloud Masking and returns the julian date of data collection

Environment: 
This JS code runs inside Google Earth Engine. To use this code you first need to sign up with GEE (it's worth it!) 

Needed Imports:  
- Modis MOD09A1 ImageCollection as "modTerra"
- An analysis Point or Polygon drawn here or imported, named "region"

Note On Outputs:
The NDVI time series reports the MEDIAN NVDI for the analysis region (either a point or polygon).
	- The median was chosen to avoid the extremes of individual pixel values and to instead capture 
	  the general "greeness" for the analysis region.

The Analysis Date time series reports the MODE DAY for the analysis region. 
	- Every pixel (500m resolution in this case) has a specific date for each 8 day window where 
	the conditions were most optimal to collect spectral data (or it returns an NA) as a result, 
	when using a polygon as input for the analysis region, many pixels are aggregated together 
	to generate the NDVI value. Take the Mode for the day is the best approximation of the date 
	of data collection for the entire region. 

Change Start/End Dates as needed

*/

// Print out the modis imagery collection to the console
print(modTerra);  // get details of the input MODIS data set printed to the console

// Store analysis point or polygon shapefile as the "region" variable 
var region = easternPA;

// Define analysis Dates
var startDate = ee.Date.fromYMD(2000,03,1);
var endDate = ee.Date.fromYMD(2020,01,10);

// MODIS Bands -- compared with the more readable Landsat band names (later substituted in the code)
var modisBands = ['sur_refl_b03','sur_refl_b04','sur_refl_b01','sur_refl_b02','sur_refl_b06','sur_refl_b07','NDVI','DayOfYear'];
var lsBands = ['blue','green','red','nir','swir1','swir2','NDVI','DayOfYear'];


// DEFINE FUNCTIONS =========================================

// helper function to extract the QA bits -- for cloud masking
function getQABits(image, start, end, newName) {
 // Compute the bits we need to extract.
 var pattern = 0;
 for (var i = start; i <= end; i++) {
 pattern += Math.pow(2, i);
 }
 // Return a single band image of the extracted QA bits, giving the band
 // a new name.
 return image.select([0], [newName])
 .bitwiseAnd(pattern)
 .rightShift(start);
}
 
// A function to mask out cloudy pixels. 
function maskQuality(image) {
 // Select the QA band.
 var QA = image.select('StateQA');
 // Get the internal_cloud_algorithm_flag bit.
 var internalQuality = getQABits(QA,8, 13, 'internal_quality_flag');  // any of the bits that is flagged as 1 means clouds
 // Return an image masking out cloudy areas.
 return image.updateMask(internalQuality.eq(0));  // mask any pixel not equal to 0
}


// Function to calculate NDVI and add it as a band to each image in a collection
function addNDVI(image) {
  var ndvi = image.normalizedDifference(['sur_refl_b02', 'sur_refl_b01']).rename('NDVI');  // bands b02 = nir, b01 = red, eqn does ((1st input - 2nd input)/(1st input + 2nd input)) 
  return image.addBands(ndvi);
}


// BEGIN ANALYSIS ===========================================

// Clip the MODIS Imagery down to a defined analysis region -->  NOT WORKING
var modTerraClip = modTerra.filterBounds(region);

// Mask out low quality pixels (cloud filtering) and Calculate NDVI
var noCloudNDVI = modTerraClip.filterDate(startDate,endDate)
 .map(maskQuality)
 .map(addNDVI)
 .select(modisBands,lsBands);  // this appears to rename the MODIS bands with the familiar Landsat names... plus the added NDVI band that is computed herein
 
print(noCloudNDVI);


// TIME SERIES ============================================

// Make a time-series of the NDVI for the collection in the analysis reigon 
var timeSeriesNDVImedian = Chart.image.seriesByRegion(noCloudNDVI, region, ee.Reducer.median(), "NDVI", 500, 'system:time_start').setOptions({
  title: "NDVI Median Time Series",
  vAxis: {title: "NDVI"},
});
var timeSeriesNDVIstdDev = Chart.image.seriesByRegion(noCloudNDVI, region, ee.Reducer.stdDev(), "NDVI", 500, 'system:time_start').setOptions({
  title: "NDVI StdDev Time Series",
  vAxis: {title: "NDVI"},
});
// Make a time-series of the NDVI for the collection in the analysis reigon 
var timeSeriesDayOfYearMode = Chart.image.seriesByRegion(noCloudNDVI, region, ee.Reducer.mode(), "DayOfYear", 500, 'system:time_start').setOptions({
  title: "Day of Year Mode Time Series",
  vAxis: {title: "DayOfYear"},
});
var timeSeriesDayOfYearStdDev = Chart.image.seriesByRegion(noCloudNDVI, region, ee.Reducer.stdDev(), "DayOfYear", 500, 'system:time_start').setOptions({
  title: "Day of Year StdDev Time Series",
  vAxis: {title: "DayOfYear"},
});


print(timeSeriesNDVImedian);
print(timeSeriesNDVIstdDev);
print(timeSeriesDayOfYearMode);
print(timeSeriesDayOfYearStdDev);