/**
 *  spot.js
 *
 *  Spot.js is a web tracker tag
 *
 */
var spotjs = {
  version: "0.0.2",
  name: "spot-"+Math.random().toString(36).substring(7),
  fieldJson: '',
  dataJson: '',
  configJson: ''
}



spotjs.main = function () {
  // process data layer queue
  console.log("spotjs.main spotData =", spotData)
  while(spotData.length) {
    var evt = spotData.pop();
    console.log("evt =", evt)
  }
}

console.log (spotjs.name, "loaded", spotjs)
window.setInterval(spotjs.main, 1000)
