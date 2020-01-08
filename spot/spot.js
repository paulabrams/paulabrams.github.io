/**
 * Spot.js 0.0.3
 *
 *  Spot.js is a web tracker tag
 *
 *  Spot observes window.spotDataLayer array
 *
 */

//
// Config
//
var spotConfigs = {
  "qa": {
    apiHost: "https://qa-master.demostellar.com",
    apiEndpoint: "/edp/api/event",
    apiCrossOrigin: "paulabrams.github.io",
    apiAuthorization: "Bearer 51c22975c02f9aa17cc2a3afc9834c52ae5fb2b320c9815a72f2641763199f3e:0f9201e41766d68f55097ef365b444806396952355f6c35b19df1fe27470570e" },
  "dev": {
    apiHost: "https://growingtree.demostellar.com",
    apiEndpoint: "/edp/api/event",
    apiCrossOrigin: "https://paulabrams.github.io",
    apiAuthorization: "Bearer 7ed9828b0021035c22f1b142db14704bc4eb95b11f93d973bd9c9b698cf736e4:3e1824ff3ec2d7e2e20c13fa00d60d4dbc4a965d5fd48a1f4887338759c1d8e7" }
};
var spotConfig = spotConfigs.dev;

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
      let headers = { "Content-Type": "application/json",
                      "Authorization": spotjs.config.apiAuthorization,
                      "Access-Control-Allow-Origin": spotjs.config.apiCrossOrigin || "*" };
      let blob = new Blob([JSON.stringify(data)], headers);
      navigator.sendBeacon(spotjs.config.apiHost+spotjs.config.apiEndpoint, blob);
    }
    else {
      let xhr = new XMLHttpRequest();
      xhr.open("POST", spotjs.config.apiHost+spotjs.config.apiEndpoint, true);
      xhr.setRequestHeader("Content-Type", spotjs.config.contentType || "application/json");
      xhr.setRequestHeader("Authorization", spotjs.config.apiAuthorization);
      xhr.setRequestHeader("Access-Control-Allow-Origin", spotjs.config.apiCrossOrigin || "*");
      data = {}
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
