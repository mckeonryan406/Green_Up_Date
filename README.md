# Green Up Date Estimator
Ever wonder if spring is starting earlier these days... me too. Using satellite imagery from Google Earth Engine and data interpretation in R this aims to find out.

### What this project does

This project answers a question I was curious about last summer... "Is spring starting earlier than it used to?" Given ample evidence for a warming climate, I figured I already knew the answer, but it was the challenge of actually acquiring, processing, and visualizing data to inform my hunch that I was most interested in. This project gathers near-weekly satellite data from the last 20 years that measures the density of photosynthesizing plants on the landscape. Then using that time series data this project uses different definitions of when spring starts to address whether climate change is changing our seasons.

### The Data - Normalized Difference Vegetation Index 

This project works with data gathered through **Google Earth Engine** (GEE) using JS script available here and a user-specified analysis region which can be created in GEE. Specifically it uses spectral imagery from the MODIS Terra satellite (8-Day Global 500m product) to calculate a time series of the Normalized Difference Vegetation Index (**NDVI**). NDVI values range from -1 to 1 and indicate the density of photosynthesizing vegetation on the surface through variations in the adsorption and reflectance of near infrared and red bands of solar energy throughout the year. The JS script in GEE produces a time series, the example below is for the Upper Valley region of New Hampshire and Vermont.

![](https://github.com/mckeonryan406/Green_Up_Date/blob/master/UV_ndvi_20yrTS.png)

Several comments about the data above:

The time series analyzed here was collected using a polygon which aggregates NDVI data from a number of different grid cells of MODIS imagery. As a result, the time series records the ***median*** NDVI for the study area every 8 days (after filtering for clouds and other obscuring atmospheric phenomena). Also recorded is the Julian date that the NDVI value for each 8-day period was observed for each pixel which may not be the same across the analysis polygon. As a result, the Julian date for this time series is the ***mode*** meaning it is the most frequent date of observation within the polygon for each 8-day period. 

### The Processing - How to define the start of spring?

Starting with the ~20 year time series of NDVI generated from GEE, this section of the project uses R (in an R Markdown format) to smooth the data, slice it up into individual years, and then interpret the start of spring "green up" for each year in the record.  Green up is when the landscape comes alive in spring and leaves pop out of branches and grass begins to grow... it is easy to know when it happens you are walking around your hard... but harder to pin down when looking at Satellite data.  

![](/Users/ryanmckeon/Google Drive/R/ChangePoint_Detection_NDVI/To_GIT/Green_Up_Date/NDVI_histogram.png)

The histogram above shows the frequency of different NDVI values from the entire 20 years of satellite data. Here it is easy to interpret the winter and summer peaks at the edges of the range of values, but what this project is interested in is the transition from one stable setting to the other... from no green on the landscape (winter) to full-blown greeness (summer). 

**Annual NDVI Variability -** The first step is to look at the time series year by year... here using the facet_wrap() function in ggplot2.

![](/Users/ryanmckeon/Google Drive/R/ChangePoint_Detection_NDVI/To_GIT/Green_Up_Date/annual_NDVI_plots.png)



Looking at the annual variation in NDVI yields some interesting insights. Summers appear to hardly vary at all, both in terms of value (all the points are nearly equal for NDVI) and in duration (the length of the peak). Winters in stark contrast vary quite a bit, both between years and within a single year. To illustrate this point, look at the first 100 days of 2015 and 2018.  2015 was a historically chilly winter with a consistent snow cover, whereas 2018 was characterized by frequent snows followed by warm temps that melted the snow cover on numerous occasions. *Because winter NDVI values are strongly influenced by the presence or absence of snow, there is no standard threshold for the starting NDVI value that spring greening builds from.*     

**Smoothing Using a Loess Filter -** Because identifying the transition from winter to spring is impacted by the presence or absence of snow (and its impact on NDVI values), smoothing the noise of the data set is helpful for interpreting the trend of the seasons and the transition from one to another. Here is an example of tuning the loess filter based on how much of the year contributes to the smoothed value at a particular point in the record.

![](/Users/ryanmckeon/Google Drive/R/ChangePoint_Detection_NDVI/To_GIT/Green_Up_Date/loess_span_example.png)  

The black dots are the observed NDVI values throughout 2018.  The different color lines are Loess filters applied to the Julian Date - NDVI data with varying size moving windows controlling the behavior of the smoothing. Because of the seasonal variation in vegetation, a moving window that spans the entire year (the gray line) is far too coarse to pick up on the changes this project is trying to interrogate. Similarly, a 6 month moving window (light blue) over simplifies the abrupt changes that are visible in the time series. The 3 month moving window (red line) does a nice job capturing the major features of the annual variation of NDVI without over-smoothing or being too influenced by the noise (as seen in the pink line for a 1.5 month window). *From here on the NDVI data will be smoothed with a 3 month moving window (a span of 0.25).*

**Defining Green Up Date Two Ways -** The last step in this process is to actually define "green up" in a way that is detectable using the smoothed annual NDVI data. Here I try two methods, the first finds the steepest springtime slope of the smoothed NDVI time series and then second finds the highest acceleration in positive change in NDVI preceding the steepest slope. The rationale for the steepest slope is pretty straight forward, it should detect the timing of fastest growth of green stuff on the landscape, but the drawback is that it is not sensitive to the initial growth of leaves and grass. This shortcoming seeds the rationale for finding the date with the fastest rate of acceleration the rise of NDVI from the doldrums of winter to the greeness of summer. The reason for limiting the search for the highest acceleration to the period prior to reaching the steepest slope in NDVI is that this project is interested in the onset of spring greening, therefore once the steepest slope has been reached the landscape has already started greening. Below are plots that illustrate these methods.  

![](/Users/ryanmckeon/Google Drive/R/ChangePoint_Detection_NDVI/To_GIT/Green_Up_Date/green_up_date_methods.png)

The vertical lines correspond to the green up date measured by each method, with Blue showing the timing of the steepest slope and Red showing the timing of the greatest acceleration in NDVI value.

**The Punchline... Is the Green Up Date Changing? -** The answer is that it is hard to tell.  

![](/Users/ryanmckeon/Google Drive/R/ChangePoint_Detection_NDVI/To_GIT/Green_Up_Date/green_up_thru_the_years_v1.png)

Here the blue points and regression fit represent the steepest slope definition of green up and the red points and regression fit represent the greatest acceleration definition.  Both methods bounce around a lot, signaling that this is very much a weather-dependent process and therefore chaotic. However, there are some data points for each method of defining green up that are concerning.  The 75th Julian day of the year is about March 15th, for anyone who knows northern New England, there is unlikely to be anything leafy or grass like growing for another few weeks.  This means that the methods I chose here are not sensitive enough to differentiate snow melt on a dormant landscape as a driver of increased NDVI vs. actual plant growth.  More ideas of how to address this to come...