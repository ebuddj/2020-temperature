# 2020-temperature

**Live demo** https://ebuddj.github.io/2020-temperature/

## Temperature differences compared to the average per country from 1901 to 2020 (EBU)

Global warming is the long-term rise in the average temperature of the Earth's climate system. While there have been prehistoric periods of global warming, many observed changes since the mid-20th century have been unprecedented over decades to millennia.

This visualisation shows how the temperatures calculated by the CMIP Phase 5 model changes over time. Visualisation starts from year 1901 and ends to year 2020. In the animation you can see the difference to the average temperature in that country. The average is calculated per country from years 1951–1980. Data comes from World Bank's Climate Knowledge Portal. Data can be used for non-commercial purposes.

The color scale goes from -3°C to +3°C. Larger anomalies are scaled to the nearest minimum or maximum on the scale meaning that if the anomality is for example -10°C it is visualised as it was -3°C. This is done so that the big local anomalies won't blur the big picture. The total average seen on the scale is the non-weighted avarage from all countries per year.  

Missing data for Armenia and Belize.

**Sources**
* [Worldbank](https://climateknowledgeportal.worldbank.org/download-data)
  * Data is not intended for commercial purposes. Please properly cite any data used from the CCKP. World Bank Group, Climate Change Knowledge Portal. 
* [NASA](https://data.giss.nasa.gov/gistemp/)
  * When referencing the GISTEMP v4 data provided here, please cite both this webpage and also our most recent scholarly publication about the data. In citing the webpage, be sure to include the date of access. 
* [Coupled Model Intercomparison Project](https://en.wikipedia.org/wiki/Coupled_Model_Intercomparison_Project)
* [Global warming](https://en.wikipedia.org/wiki/Global_warming)



**EBU links**
* [News Exchange](https://news-exchange.ebu.ch/item_detail/498aee85af812027f34c12eaa56077d5/2020_21002060), 2020-01-15 
* [News Exchange](https://news-exchange.ebu.ch/item_detail/2ee6d07895acda9a9b3ca64b2d57a6e2/2021_10034932), 2021-08-06
* [Social Newswire](https://www.evnsocialnewswire.ch/climate/climate-temperature-differences-compared-to-the-average-per-country-from-1901-to-2016-animation/)

**Used by**
* [Euronews/Italy on Youtube](https://www.youtube.com/watch?v=MVAG3oWL6c8)

## How to use

If you are interested in using the interactive version please contact Teemo Tebest, tebest@ebu.ch

This visualization is part of the EBU News Exchange’s Data Journalism project. Other projects are available: https://news-exchange.ebu.ch/data-journalism

## Rights of usage

The material may be used only by [Eurovision active members and sub-licensees](https://www.ebu.ch/eurovision-news/members-and-sublicensees).

## How to build and develop

This is a Webpack + React project.

* `npm install`
* `npm start`

Project should start at: http://localhost:8080

For developing please refer to `package.json`