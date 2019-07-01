/**
 *  nav-vis.js
 *
 *  This is a custom Looker Visualization containing a Bootstrap Navbar
 *
 *  Usage: configure custom visualization in Looker using a host and dependencies below
 *
 *  hosts
 *    https://paulabrams.github.io/nav-vis/nav-vis.js
 *    https://dl.dropboxusercontent.com/s/50iydrtuwzaml33/nav.js?raw=1
 *
 *  javascript dependencies:
 *    https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
 *    https://stackpath.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js
 
 *  css: https://stackpath.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css
 */
var navjs = {
  loadCss: "https://stackpath.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css",
  visElementStyles: { "margin": "0px" },
  navCount: 8
}

var options = {}
// Nav Links Sections
for (var i=0; i<navjs.navCount; i++) {
  var section = `Nav${i+1}`
  options[`nav_${i+1}_label`] = {
    order: 1,
    section: section,
    label: "Label",
    type: "string",
    display_size: "normal",
    placeholder: ""
  }
  options[`nav_${i+1}_dashboard_id`] = {
    order: 2,
    section: section,
    label: "Dashboard ID",
    type: "string",
    display_size: "half",
    placeholder: "55 or mymodel::mylookml"
  }
  options[`nav_${i+1}_filterset`] = {
    order: 3,
    section: section,
    label: "Dashboard Filter Set",
    type: "string",
    values: [
      {"None": ""},
      {"MS Campaign, KPI, Date":    "nav_filterset_ms_campaign_kpi_date"},
      {"MS KPI, Date ID":           "nav_filterset_ms_kpi_date"}
    ],
    display: "select",
    display_size: "half",
    default: ""
  }
  options[`nav_${i+1}_url`] = {
    order: 4,
    section: section,
    label: "Custom URL",
    type: "string",
    placeholder: "URL to non-dashboard page"
  }
}

// Style Section
options.heading = {
    section: "Style",
    order: 1,
    type: "string",
    label: "Heading",
    default: "",
    placeholder: "Heading"
  }
options.widget = {
    section: "Style",
    order: 2,
    type: "string",
    label: "Widget",
    values: [
      {"Navbar": "navbar-nav"},
      {"Pills": "nav-pills"},
      {"Tabs":  "nav-tabs"},
      {"Links": "nav-links"}
    ],
    display: "select",
    display_size: "third",
    default: "navbar-nav"
  }
options.size = {
    section: "Style",
    order: 3,
    type: "string",
    label: "Size",
    values: [
      {"Large": "large"},
      {"Normal": "normal"},
      {"Small":  "small"}
    ],
    display: "select",
    display_size: "third",
    default: "normal"
  }
options.align = {
  section: "Style",
  order: 4,
  type: "string",
  label: "Align",
  values: [
    {"Normal":    ""},
    {"Stacked":  "nav-stacked"},
    //{"Center":    "justify-content-center"},
    //{"Right":     "justify-content-right"},
    //{"Fill":      "nav-fill"},
    {"Justified": "nav-justified"}
  ],
  display: "select",
  display_size: "third",
  default: ""
}
options.filters = {
    section: "Style",
    order: 5,
    type: "string",
    label: "Filters",
    values: [
      {"None":  ""},
      {"Timeframe": "timeframe"}
    ],
    display: "select",
    default: ""
  }
options.listClass = {
    section: "Style",
    order: 6,
    type: "string",
    label: "Navbar Class",
    default: "navbar-default",
    display_size: "half"
  }
options.listItemClass = { 
    section: "Style",
    order: 7,
    type: "string",
    label: "Custom List Item Class",
    default: "",
    display_size: "half",
    placeholder: "CSS classname"
  }

looker.plugins.visualizations.add({
  options: options,
  create: function(element, config){
    console.log("nav-vis.js create() v0.1.2")
  },
  updateAsync: function(data, element, config, queryResponse, details, doneRendering){
    navjs.data = data
    navjs.element = element
    navjs.config = config
    navjs.queryResponse = queryResponse
    navjs.details = details
    console.log("nav-vis.js updateAsync() navjs=", navjs)

    // Nav Actions -- WIP
    navjs.actions = {}
    navjs.actions.getLink = function () {
      return navjs.data[0].link
    }
    navjs.actions.openDrillMenu = function () { 
      var link = navjs.actions.getLink()
      var cell = LookerCharts.Utils.htmlForCell(link)
      LookerCharts.Utils.openDrillMenu({
        links: [{ label: "click drill", type: 'drill', type_label: "type", url: link }],
        element: $(navjs.element),
        event: $(navjs.element)}) 
    }
    navjs.actions.getHtml = function () {
      return LookerCharts.Utils.htmlForCell(navjs.actions.getLink())
    }
    navjs.actions.openUrl = function (url) {
      return LookerCharts.Utils.openUrl(url)
    }
   

    var $el = $(element)
    if (navjs.loadCss) {
      $el.parent().after(`<link rel="stylesheet" href="${navjs.loadCss}" crossorigin="anonymous">`)
      navjs.loadCss = ""
    }

    // Build nav items from config
    navjs.navs = []
    for (var i=0; i<navjs.navCount; i++) {
      if (config[`nav_${i+1}_label`]) {
        var nav = { label: config[`nav_${i+1}_label`] || '',
                    filterset: config[`nav_${i+1}_filterset`],
                    dashboard_id: config[`nav_${i+1}_dashboard_id`],
                    url: config[`nav_${i+1}_url`] || '#',
                    classname: '',
                    href: '#'}
        // Build href based on type
        if (nav.dashboard_id) {
          nav.href = '/embed/dashboards/'+nav.dashboard_id+'?navjs=1'
          nav.filterURLParams = ''
          if (navjs.data && navjs.data[0]) {
            nav.filterLink = navjs.data[0]["_parameters."+nav.filterset]
            if (nav.filterLink && nav.filterLink.html) {
              nav.filterURLParams = $('<div/>').html(nav.filterLink.html).text()
            }
          }
          nav.url += nav.filterURLParams
        }
        else if (nav.url) {
          nav.href = nav.url
        }
        // The "Active" nav item
        if (nav.href === "#") {
          nav.className = "active"
        }
        navjs.navs.push(nav)
      }
    }
    console.log("navjs.navs=", navjs.navs)

    config.widget = config.widget || 'navbar-nav'
    config.align = config.align || ''
    config.listClass = config.listClass || ''
    config.listItemClass = config.listItemClass || ''

    var sizes = {
      large: { list: "", item: ""},
      normal: { list: "small", item: "" },
      small: { list: "small", item: "small" }
    }
    navjs.size = sizes[config.size] || sizes.normal

    // build the navbar
    var $navbar = $(`<nav class="navbar navbar-default"></nav`)
    var $container = $(`<div class="container-fluid" style="padding: 0px;"></div>`).appendTo($navbar)
    if (config.heading) {
      $container.append(`
        <div class="navbar-header">
          <a class="navbar-brand" href="#">${config.heading}</a>
        </div>`)
    }
    var $ul = $(`<ul class="nav ${config.widget} ${navjs.size.list} ${config.align} ${config.listClass}">`)
    navjs.navs.forEach(function(nav) {
      $ul.append(`<li class="${nav.className} ${navjs.size.item} ${config.listItemClass}"><a href="${nav.href}">${nav.label}</a></li>`)
    })
    $container.append($ul)

    // display the navbar
    $el.html($navbar)
       .css(navjs.visElementStyles)
    console.log("doneRending nav-vis.js")
    doneRendering()
  }

});

