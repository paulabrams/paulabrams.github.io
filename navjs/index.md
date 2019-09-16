## Nav.js


### Custom Navigation Visualization


## Overview

Nav.js is a custom Looker Visualization containing a Bootstrap Navbar. Some of the key features are below.

**Usage** - Use Nav.js like other visualizations, simply add it to your dashboard and configure it via the settings panel. You will need to create dimensions and measures in order to get the most out of the features.

**Nav Tabs (Links)** - The admin can configure navigation “tabs” to link to other Looker dashboards. 

**Dynamic Filters** - Nav links can be given dynamic filter parameters using dimensions, so that the current dashboard filters such as timeframe or campaign id will carry forward.

**Navbar Styles** - There are five custom navbar styles: Top Navbar, Metrics Bar, Side Navbar, Middle Navbar, and Bottom Navbar. Standard Bootstrap navbar styles are also supported, such as Nav Pills.

**Metrics** - The “Metrics bar” navbar style allows the same options as a Looker “Single Value” visualization, which are a metric, comparison metric, and related settings.


## Setup



1. Login to the Looker instance
2. Go to Admin > Visualizations
3. Confirm there is not already a visualization with ID=”navjs”. (This ID is referenced inside LookML dashboards, so it must match.)
4. Click Add Visualization, configure the settings as below and click Save


#### Settings


```
ID: navjs
Label: Nav JS
Main: https://paulabrams.github.io/navjs/nav.js 
Advanced Options > Dependencies:
https://ajax.googleapis.com/ajax/libs/jquery/3.4.0/jquery.min.js
https://stackpath.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js 
