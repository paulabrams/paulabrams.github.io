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
    apiAuthorization: "Bearer 51c22975c02f9aa17cc2a3afc9834c52ae5fb2b320c9815a72f2641763199f3e:0f9201e41766d68f55097ef365b444806396952355f6c35b19df1fe27470570e",
    useNavigatorBeacon: false },
  "dev": {
    apiHost: "https://growingtree.demostellar.com",
    apiEndpoint: "/edp/api/event",
    apiCrossOrigin: "https://paulabrams.github.io",
    apiAuthorization: "Bearer 7ed9828b0021035c22f1b142db14704bc4eb95b11f93d973bd9c9b698cf736e4:3e1824ff3ec2d7e2e20c13fa00d60d4dbc4a965d5fd48a1f4887338759c1d8e7",
    useNavigatorBeacon: false }
};
var spotConfig = spotConfigs.dev;


//
// Implementation
//
function SpotJs () {
  if (window.spotjs) {
    return;
  }

  spotjs = {
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
        if (typeof data !== "object") {
          console.log("spotjs.processDataLayer skipping non-object item", data)
          return;
        }
        if (data && data.type) {
          if (data.type === "config") {
            spotjs.processConfig(data);
          }
          else {
            spotjs.processEvent(data);
          }
        }
      }
    }
  }

  // Allow the tag to provide config, such as API details.
  spotjs.processConfig = function (data) {
    console.log("spotjs.processConfig data=", data);
    console.log("spotjs.processConfig", "NOT YET IMPLEMENTED");
  }

  // Process a business event, such as a page visit, add to cart, etc.
  spotjs.processEvent = function (data) {
    console.log("spotjs.processEvent data =", data);
    if (!data.iso_time) {
      let dateobj = new Date();
      data.iso_time = dateobj.toISOString();
    }
    var evt = {
      event: {
        "type": data.type || spotConfig.eventType || "web",
        "iso_time": data.iso_time
      },
      client: {
        "identifier": {
          "id": data.dt, 
          "id_field": spot.config.idField || "integration_id"
        }
      }
    };
    console.log("spotjs.processEvent evt =", evt);
    spotjs.sendEvent(evt);
  }

  spotjs.sendEvent = function (evt) {
    console.log("spotjs.sendEvent evt =", evt);
    if (spotjs.config.useNavigatorBeacon && navigator.sendBeacon) {
      let blob = new Blob([JSON.stringify(evt)], { "type": "application/json" });
      navigator.sendBeacon(spotjs.config.apiHost+spotjs.config.apiEndpoint, blob);
    }
    else {
      let xhr = new XMLHttpRequest();
      xhr.open("POST", spotjs.config.apiHost+spotjs.config.apiEndpoint, true);
      xhr.setRequestHeader("Content-Type", spotjs.config.contentType || "application/json");
      xhr.setRequestHeader("Authorization", spotjs.config.apiAuthorization);
      xhr.setRequestHeader("Access-Control-Allow-Origin", spotjs.config.apiCrossOrigin || "*");
      xhr.send(JSON.stringify(evt));
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

  console.log (spotjs.name, "loaded");
  return spotjs;
}

window.spotjs = SpotJs();
