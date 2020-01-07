/**
 * Spot.js 0.0.3
 *
 *  Spot.js is a web tracker tag
 *
 *  Spot observes window.spotDataLayer array
 *
 */

//
// Default Config
//
var spotConfig = {
  apiHost: "https://growingtree.demostellar.com",
  apiEndpoint: "/edp/api/event",
  apiAuthorization: "Bearer 7ed9828b0021035c22f1b142db14704bc4eb95b11f93d973bd9c9b698cf736e4:3e1824ff3ec2d7e2e20c13fa00d60d4dbc4a965d5fd48a1f4887338759c1d8e7"
};

//
// Implementation
//
var initSpotjs = function () {
  if (window.spotjs) {
    return;
  }

  var spotjs = {
    name: "spot-0.0.3-"+Math.random().toString(36).substring(7),
    config: spotConfig,
    dataLayer: null
  }

  spotjs.onDataLayerPush = function (arr) {
    console.log("spotjs.onDataLayerPush", arr);
    spotjs.processDataLayer();
  }

  spotjs.processDataLayer = function () {
    console.log("spotjs.processDataLayer dataLayer =", spotjs.dataLayer)
    if (spotjs.onDataLayerPush) {
      while (spotjs.dataLayer.length) {
        let data = spotjs.dataLayer.pop();
        spotjs.processEvent(data);
      }
    }
  }

  spotjs.processEvent = function (data) {
    data = data || {}
    if (typeof data !== "object") {
      console.log("spotjs.main spotData skipping non-object", data)
      return;
    }
    console.log("spotjs.processEvent data =", data)
    if (!data.event) {
      data.event = {};
      data.event.type = "none";
    }
    if (!data.event.isodate) {
      let dateobj = new Date();
      data.event.iso_time = dateobj.toISOString();
    }
    if (!data.event.client) { data.event.client = { "identifier": { "id": "rasilang@gmail.com", "id_field": "email" } } }
    spotjs.sendBeacon(data.event)
  }

  spotjs.sendBeacon = function (data) {
    console.log("spotjs.sendBeacon data =", data)
    let dataPayload = JSON.stringify(data);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(spotConfig.apiHost+spotConfig.apiEndpoint, dataPayload);
    }
    else {
      let xhr = new XMLHttpRequest();
      xhr.open("POST", spotConfig.apiHost+spotConfig.apiEndpoint, true);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.setRequestHeader("Authorization", spotConfig.apiAuthorization);
      xhr.send(dataPayload);
    }
  }

  // Init Data Layer
  if (!spotjs.dataLayer) {
    if (typeof window.spotDataLayer === 'undefined') {
      window.spotDataLayer = [];
    }
    spotjs.dataLayer = window.spotDataLayer;
    spotjs.dataLayer.push = function(e) {
      Array.prototype.push.call(arr, e);
      spotjs.onDataLayerPush(arr);
    };
    spotjs.processDataLayer();
  }

  console.log (spotjs.name, "loaded")
}();
