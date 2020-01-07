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
        let evt = spotjs.dataLayer.pop();
        spotjs.processEvent(evt);
      }
    }
  }

  spotjs.processEvent = function (evt) {
    evt = evt || {}
    if (typeof evt !== "object") {
      console.log("spotjs.main spotData skipping non-object", evt)
      return;
    }
    console.log("spotjs.processEvent evt =", evt)
    let data = {};
    data.event = evt.event || {};
    if (!data.event.type) {
      data.event.type = "bounce";
    }
    if (!data.event.isodate) {
      let dateobj = new Date();
      data.event.iso_time = dateobj.toISOString();
    }
    data.client = evt.client;
    data.campaign = evt.campaign;
    data.environment = evt.environment;
    if (!data.client) { data.client = { "identifier": { "id": "rasilang@gmail.com", "id_field": "email" } } }
    if (!data.campaign) { data.campaign = {  "ext_parent_id": "1", "camp_id": "1", "camp_version": "1"} }
    if (!data.environment) { data.environment = { "environment_id": "1"} }
    spotjs.sendBeacon(data)
  }

  spotjs.sendBeacon = function (data) {
    console.log("spotjs.sendBeacon data =", data);
    if (false && navigator.sendBeacon) {
      let headers = { "Content-Type": "application/x-www-form-urlencoded",
                      "Authorization": spotConfig.apiAuthorization,
                      "Access-Control-Allow-Origin": "*" };
      let blob = new Blob([JSON.stringify(data)], headers);
      navigator.sendBeacon(spotConfig.apiHost+spotConfig.apiEndpoint, blob);
    }
    else {
      let xhr = new XMLHttpRequest();
      xhr.open("POST", spotConfig.apiHost+spotConfig.apiEndpoint, true);
      xhr.setRequestHeader("Content-Type", spotConfig.contentType || "application/x-www-form-urlencoded");
      xhr.setRequestHeader("Authorization", spotConfig.apiAuthorization);
      xhr.setRequestHeader("Access-Control-Allow-Origin", spotConfig.crossOrigin || "*");
      xhr.send(JSON.stringify(data));
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
