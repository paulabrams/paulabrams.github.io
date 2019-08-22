/**
 *  nav.js
 *
 *  This is a custom Looker Visualization containing a Bootstrap Navbar
 *
 *  Usage: configure custom visualization in Looker using a host and dependencies below
 *
 *  hosts
 *    https://paulabrams.github.io/navjs/nav.js
 *
 *  javascript dependencies:
 *    https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
 *    https://stackpath.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js
 
 *  css: https://stackpath.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css
 */
var navjs = {
  navCount: 9,
  css: [ "https://stackpath.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css",
         "https://fonts.googleapis.com/css?family=Open+Sans|Roboto|Roboto+Condensed|&display=swap",
         "https://paulabrams.github.io/navjs/nav.css"],
  fields: {},
  init: 0
}

looker.plugins.visualizations.add({
  options: buildOptions (navjs.navCount, {}),
  create: function(element, config){
    console.log("navjs v0.3.0")
  },
  updateAsync: function(data, element, config, queryResponse, details, doneRendering) {
    this.clearErrors()
    navjs.data = data
    navjs.element = element
    navjs.config = config
    navjs.queryResponse = queryResponse
    navjs.details = details

    buildFields("measures")
    buildFields("dimensions")
    this.trigger('registerOptions', buildOptions(navjs.navCount, config))

    var $el = $(element)
    if (!navjs.init) {
      navjs.css.forEach(function(css) {
      $el.parent().after(`<link rel="stylesheet" href="${css}" crossorigin="anonymous">`)
      })
      navjs.init = 1
    }

    // Build nav items from config
    navjs.navs = []
    for (var i=0; i<navjs.navCount; i++) {
      var navId = `nav_${i+1}`,
          nav = { widget: config[`${navId}_widget`] || '',
                  label: config[`${navId}_label`] || '',
                  style: config[`${navId}_style`] || '',
                  filterset: config[`${navId}_filterset`] || '',
                  dashboard_id: config[`${navId}_dashboard_id`] || '',
                  url: config[`${navId}_url`] || '',
                  metric_dimension: config[`${navId}_metric_dimension`] || '',
                  metric_title: config[`${navId}_metric_title`] || '',
                  comparison_dimension: config[`${navId}_comparison_dimension`] || '',
                  comparison_style: config[`${navId}_comparison_style`] || '',
                  comparison_label: config[`${navId}_comparison_label`] || '',
                  href: '#' }

      if (nav.widget === "hidden") { continue }

      // Label
      nav.label_html = '' 
      if (nav.widget !== "spacer" && nav.label) {
        nav.label_html = `<span class="navjs-label">${nav.label}</span>`
      }

      // Metric
      nav.metric_html = ''
      if (nav.widget === "metric" || nav.widget === "metric_dash") {
        if (navjs.data && navjs.data[0]) {
          var metricData = navjs.data[0][nav.metric_dimension]
          if (metricData !== undefined && metricData.rendered !== undefined) {
            nav.metric_value = metricData.rendered
            if (nav.metric_title) { nav.metric_html += `<div class="navjs-metric-title">${nav.metric_title}</div> ` }
            nav.metric_html += ` <div class="navjs-metric-value">${nav.metric_value}</div> `
          }
          var comparisonData = navjs.data[0][nav.comparison_dimension]
          if (comparisonData !== undefined && comparisonData.rendered !== undefined) {
            nav.comparison_value = comparisonData.rendered
            var comparison_class = `navjs-comparison-${nav.comparison_style}`
            if (nav.comparison_style === "show_as_value") {
              nav.metric_html += ` <div class="navjs-comparison"><span class="${comparison_class}">${nav.comparison_value}${nav.comparison_label}</span></div> `
            }
            else if (nav.comparison_style === "show_as_change" ||  nav.comparison_style === "show_as_change_reversed") {
              comparison_class += comparisonData.value > 0 ? "-positive" : "-negative"
              nav.metric_html += ` <div class="navjs-comparison"><span class="${comparison_class}">▲</span> ${nav.comparison_value} ${nav.comparison_label}</div> `
            }
            else if (nav.comparison_style === "hidden") {
              
            }
          }
          if (nav.metric_html) {
            nav.metric_html = ` <div class="metric">${nav.metric_html}</div> `
          }
        }
        else {
          console.log("no data")
        }
      }

      // Build href based on type
      if (nav.widget === "dash" || nav.widget === "metric_dash") {
        nav.querystring = '?vis=nav'
        if (navjs.data && navjs.data[0]) {
          if (nav.filterset) {
            if (navjs.data[0][nav.filterset] !== undefined) {
              nav.filter_link = navjs.data[0][nav.filterset]
              if (nav.filter_link && nav.filter_link.html) {
                nav.querystring += $('<div/>').html(nav.filter_link.html).text()
              }
            }
          }
        }
        nav.href = '/embed/dashboards/'+nav.dashboard_id + nav.querystring
      }
      else if (nav.widget === "link") {
        // use custom URL as-is
        nav.href = nav.url
      }

      if (nav.label || nav.metric_html) {
        navjs.navs.push(nav)
      }
    }
    //console.log("navjs.navs=", navjs.navs)

    // Navbar Widget and class
    navjs.navbarClass = config.widget || 'navjs-top'
    if (config.widget === "navjs-middle" || config.widget === "navjs-bottom") {
      navjs.navbarClass += " nav-pills "
    }

    config.align = config.align || ''

    // apply theme to iframe
    $("body").removeClass().addClass("navjs-theme-"+config.theme)

    var themes = {
      normal: { navbar: "navbar-default navbar-expand-sm" },
      light: { navbar: "navbar-light bg-light navbar-expand-sm" },
      dark: { navbar: "navbar-dark bg-dark navbar-expand-sm" }
    }
    navjs.theme = themes[config.theme] || themes.normal 

    var sizes = {
      large: { list: "", item: ""},
      normal: { list: "", item: "" },
      small: { list: "small", item: "" }
    }
    navjs.size = sizes[config.size] || sizes.normal

    // build the navbar
    var $navbar = $(`<nav class="navbar ${navjs.theme.navbar}" style="margin-bottom: 0px"></nav>`)
    var $container = $(`<div class="container-fluid"></div>`).appendTo($navbar)
    if (config.header) {
      $container.append(`
        <div class="navbar-header">
          <div class="navjs-header navjs-header-${config.size}">${config.header}</div>
        </div>`)
    }

    /* if (config.form === "navjs-date") {
      var $form = $(`<form class="form-inline navbar-right  my-2 my-lg-0">
          <div class="input-group">
            <div class="input-group-prepend my-2 my-sm-0">
              <span class="input-group-text" id="basic-addon1">Date</span>
            </div>
            <select class="form-control mr-sm-2" type="search" placeholder="Date" aria-label="Date">
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
            </select>
          </div>
        </form>`).appendTo($container)
    } */

    var $ul = $(`<ul class="nav navbar-nav ${navjs.navbarClass} ${navjs.size.list} ${config.align}">`).appendTo($container)

    navjs.navs.forEach(function(nav) {
      nav.$link = $(`<a href="${nav.href}">${nav.label_html} ${nav.metric_html}</a>`).click(navjs.actions.clickLink)
      $(`<li class="navjs-widget-${nav.widget} ${nav.style} ${navjs.size.item}"></li>`).append(nav.$link).appendTo($ul)
    })

    if (config.align === "navbar-right") {
      $(`<li class="navjs-end-spacer">&nbsp;</li>`).appendTo($ul)
    }

    $el.html($navbar).addClass("navjs container")
    doneRendering()
  }
});


// Fields
function buildFields (fieldGroup) {
  var options = navjs.fields[fieldGroup] = [ {"None": ""} ]
  if (navjs.queryResponse && navjs.queryResponse.fields && navjs.queryResponse.fields[fieldGroup]) {
    navjs.queryResponse.fields[fieldGroup].forEach( function(field) {
      var option = {}
      option[field.label] = field.name
      options.push(option)
    })
  }
}

// Build or rebuild the admin config options
function buildOptions (navCount, config) {
  var options = {}
  var orderValues = [ { "Hidden": "hidden" } ]
  for (var i=0; i<navjs.navCount; i++) {
    var choice = {}
    choice[`${i+1}`] = ''+(i+1)
    orderValues.push(choice)
  }

  // Style Section
  options.header = {
      section: "Main",
      order: 1,
      type: "string",
      label: "Header"
    }
  options.widget = {
      section: "Main",
      order: 2,
      type: "string",
      label: "Navbar",
      values: [
        // custom
        {"Top Nav": "navjs-top"},
        {"Middle Nav": "navjs-middle"},
        {"Bottom Nav": "navjs-bottom"},
        {"Side Nav": "navjs-side"},
        {"Metrics Bar": "navjs-metrics"},
        // default bootstrap
        {"Pills": "nav-pills"},
        {"Tabs":  "nav-tabs"},
        {"Links": "nav-links"}
      ],
      display: "select",
      display_size: "half",
      default: "navjs-top"
  }
  options.theme = {
      section: "Main",
      order: 3,
      type: "string",
      label: "Theme",
      values: [
        {"Normal": "normal"},
        {"Light": "light"},
        {"Dark": "dark"}
      ],
      display: "select",
      display_size: "half",
      default: "normal"
    }
  options.size = {
      section: "Main",
      order: 4,
      type: "string",
      label: "Size",
      values: [
        {"Large": "large"},
        {"Normal": "normal"},
        {"Small":  "small"}
    ],
    display: "select",
    display_size: "half",
    default: "normal"
  }
  options.align = {
    section: "Main",
    order: 5,
    type: "string",
    label: "Align",
    values: [
      {"Normal":    ""},
      {"Right":     "navbar-right"},
      //{"Fill":      "nav-fill"},
      {"Stacked":  "nav-stacked"},
      {"Justified": "nav-justified"}
    ],
    default: "",
    display: "select",
    display_size: "half"
  }
  /*options.form = {
      section: "Main",
      order: 6,
      type: "string",
      label: "Form",
      values: [
        {"None":  "none"},
        {"Date": "navjs-date"}
      ],
      default: "none",
      display: "select"
    }*/
  options.listClass = {
      section: "Main",
      order: 7,
      type: "string",
      label: "Custom List Class",
      display_size: "half",
      hidden: true,
      placeholder: "optional"
    }
  options.listItemClass = { 
      section: "Main",
      order: 8,
      type: "string",
      label: "Custom Item Class",
      hidden: true,
      display_size: "half",
      placeholder: "optional"
    }


  // Nav Links Sections
  // Dependent options are marked as hidden=false/true
  //console.log("build nav links", config)
  for (var i=0; i<navCount; i++) {
    var navSection = `n${i+1}`,
        navId = `nav_${i+1}`,
        navWidget = config[`${navId}_widget`] || 'hidden'

    // Options for Nav items
    options[`${navId}_widget`] = {
      order: 1,
      hidden: false, // never hidden
      section: navSection,
      label: "Widget",
      type: "string",
      display: "select",
      values: [
        {"Hidden": "hidden"},
        {"Dashboard Link": "dash"},
        {"Dashboard Link / Metric": "metric_dash"},
        {"Metric": "metric"},
        {"Custom Link": "link"},
        {"Spacer": "spacer"}
      ],
      default: "hidden"
    } 
    options[`${navId}_label`] = {
      order: 2,
      hidden: navWidget === "spacer" || navWidget === "hidden",
      section: navSection,
      label: "Label",
      type: "string",
      placeholder: ""
    }
    options[`${navId}_style`] = {
      order: 3,
      hidden: navWidget === "hidden",
      section: navSection,
      label: "Style",
      display: "select",
      values: [
        {"Normal": ""},
        {"Active": "active"},
      ],
      type: "string",
      default: ""
    }
    options[`${navId}_dashboard_id`] = {
      order: 4,
      hidden: navWidget !== "dash" && navWidget !== "metric_dash",
      section: navSection,
      label: "Dashboard ID",
      type: "string",
      placeholder: "55 or mymodel::mylookml"
    }
    options[`${navId}_filterset`] = {
      order: 5,
      hidden: navWidget !== "dash" && navWidget !== "metric_dash",
      section: navSection,
      label: "Filter Dimension",
      type: "string",
      values: navjs.fields.dimensions,
      display: "select",
      default: ""
    }
    options[`${navId}_url`] = {
      order: 7,
      hidden: navWidget !== "link",
      section: navSection,
      label: "Link URL",
      type: "string",
      placeholder: "http://..."
    }
    // Metric w/ comparison
    options[`${navId}_metric_dimension`] = {
      order: 8,
      hidden: navWidget !== "metric" && navWidget !== "metric_dash",
      section: navSection,
      label: "Metric Dimension",
      type: "string",
      values: navjs.fields.measures,
      display: "select"
    }
    options[`${navId}_metric_title`] = {
      order: 9,
      hidden: navWidget !== "metric" && navWidget !== "metric_dash",
      section: navSection,
      label: "Metric Title",
      type: "string",
      placeholder: "optional"
    }
    // Comparison
    options[`${navId}_comparison_dimension`] = {
      order: 10,
      hidden: navWidget !== "metric" && navWidget !== "metric_dash",
      section: navSection,
      label: "Comparison Dimension",
      type: "string",
      values: navjs.fields.measures,
      display: "select"
    }
    options[`${navId}_comparison_style`] = {
      order: 11,
      hidden: navWidget !== "metric" && navWidget !== "metric_dash",
      section: navSection,
      label: "Comparison Style",
      type: "string",
      display: "select",
      values: [
        {"Show as Value": "show_as_value"},
        {"Show as Change": "show_as_change"},
        {"Show as Change (reversed)": "show_as_change_reversed"},
        {"Hidden": "hidden"}
      ],
      default: "show_as_value"
    }
    options[`${navId}_comparison_label`] = {
      order: 12,
      hidden: navWidget !== "metric" && navWidget !== "metric_dash",
      section: navSection,
      label: "Comparison Label",
      type: "string",
      placeholder: "optional"
    }

  }

  return options
}

//
// Nav Actions
// Wrappers for Looker functions
// 
function addNavActions () {
  navjs.actions = {}
  // Links need to be opened via Looker since we are down in an iframe
  navjs.actions.clickLink = function () {
    var url = $(this).attr("href")
    if (url !== undefined && url !== "#") {
      return LookerCharts.Utils.openUrl(url)
    }
    return false
  }

}
addNavActions ()
