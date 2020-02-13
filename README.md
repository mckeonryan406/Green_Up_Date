# Green Up Date Estimator
Ever wonder if spring is starting earlier these days... me too. Using satellite imagery from Google Earth Engine and data interpretation in R this aims to find out.

### What this project does

This project answers a question I was curious about last summer... "Is spring starting earlier than it used to?" Given ample evidence for a warming climate, I figured I already knew the answer, but it was the challenge of actually acquiring, processing, and visualizing data to inform my hunch that I was most interested in.



### The Data - Normalized Difference Vegetation Index 

This project works with data gathered through **Google Earth Engine** (GEE) using JS script available here and a user-specified analysis region which can be created in GEE. Specifically it uses spectral imagery from the MODIS Terra satellite (8-Day Global 500m product) to calculate a time series of the Normalized Difference Vegetation Index (**NDVI**). NDVI values range from -1 to 1 and indicate the density of photosynthesizing vegetation on the surface through variations in the adsorption and reflectance of near infrared and red bands of solar energy throughout the year. This example is for the Upper Valley region of New Hampshire and Vermont.

![alt text] (https://github.com/mckeonryan406/Green_Up_Date/blob/master/UV_ndvi_20yrTS.png)







### The Processing - How to define the start of spring?

Starting with the ~20 year time series of NDVI generated from GEE, this section of the project uses R (in an R Markdown format) to smooth the data, slice it up into individual years, and then interpret the start of spring "green up" for each year in the record.  Green up is when the landscape comes alive in spring and leaves pop out of branches and grass begins to grow... it is easy to know when it happens you are walking around your hard... but harder to pin down when looking at Satellite data.  This 



