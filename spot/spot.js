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

console.log (spotjs.name, "says hello")

console.log(document.cookie)
