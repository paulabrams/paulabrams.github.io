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
var spotjs = {
  name: "spot-0.0.3-"+Math.random().toString(36).substring(7),
  config: spotConfig,
  dataLayer: null
}

spotjs.onDataLayerPush = function (arr) {
  console.log("spotjs.onDataLayerPush", arr);
  spotjs.processDataLayer(arr);
}

spotjs.processDataLayer = function () {
  if (spotjs.onDataLayerPush) {
    do while (spotjs.dataLayer.length) {
      let item = spotjs.dataLayer.pop();
      spotjs.processEvent(item);
    }
  }
}

spotjs.processEvent = function (data) {
  // process data layer queue
  if (typeof data !== "object") {
    console.log("spotjs.main spotData skipping non-object", data)
    return;
  }
  console.log("spotjs.processEvent data =", data)
  data.meta = {};
  if (!data.client) { data.client = { "identifier": { "id": "rasilang@gmail.com", "id_field": "email" } } }
  if (!data.event) { data.event = "event": { "type": "bounce", "iso_time": "2019-12-05T00:00:00.000Z" } }
  spotjs.submitEvent(data)
}

spotjs.submitEvent (data) {
  console.log("spotjs.submitEvent data =", data)
  var xhr = new XMLHttpRequest();
  xhr.open("POST", spotConfig.apiHost+spotConfig.apiEndpoint, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader("Authorization", spotConfig.apiAuthorization);
  xhr.onreadystatechange = function() {
    console.log("spotjs.submitEvent XHR finished", this);
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      console.log("spotjs.submitEvent XHR finished", this);
    }
  }
  xhr.send(data);
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
  spotjs.processDataLayer(arr);
}

console.log (spotjs.name, "loaded")
