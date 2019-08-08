/**
 *  nav-vis.js
 *
 *  This is a custom Looker Visualization containing a Bootstrap Navbar
 *
 *  Usage: configure custom visualization in Looker using a host and dependencies below
 *
 *  hosts
 *    https://paulabrams.github.io/nav-vis/nav-vis.js
 *
 *  javascript dependencies:
 *    https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
 *    https://stackpath.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js
 
 *  css: https://stackpath.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css
 */
var navjs = {
  navCount: 7,
  css: [ "https://stackpath.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css",
         "https://fonts.googleapis.com/css?family=Open+Sans|Roboto|Roboto+Condensed|&display=swap",
         "https://paulabrams.github.io/nav-vis/nav-vis.css"],
  init: 0
}

looker.plugins.visualizations.add({
  options: buildOptions (navjs.navCount, {}),
  create: function(element, config){
    console.log("nav-vis.js v0.2.1")
  },
  updateAsync: function(data, element, config, queryResponse, details, doneRendering) {
    this.clearErrors()
    navjs.data = data
    navjs.element = element
    navjs.config = config
    navjs.queryResponse = queryResponse
    navjs.details = details

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
                  filterset_choice: config[`${navId}_filterset_choice`] || '',
                  filterset_custom: config[`${navId}_filterset_custom`] || '',
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
      if (nav.widget === "metric") {
        if (navjs.data[0][nav.metric_dimension] !== undefined) {
          nav.metric_value = navjs.data[0][nav.metric_dimension].rendered
          if (nav.metric_title) { nav.metric_html += `<div class="navjs-metric-title">${nav.metric_title}</div> ` }
          nav.metric_html += `<div class="navjs-metric-value">${nav.metric_value}</div>`
        }
        if (navjs.data[0][nav.comparison_dimension] !== undefined) {
          nav.comparison_value = navjs.data[0][nav.comparison_dimension].rendered
          nav.comparison_change = ""
          if (nav.comparison_style === "show_as_change") {
            if (nav.comparison_value > 0) { nav.comparison_change = `<span class="navjs-comparison-up">^</span>` }
            else if (nav.comparison_value < 0) { nav.comparison_change = `<span class="navjs-comparison-down">v</span>` }
          }
          nav.metric_html += `<div class="navjs-comparison">${nav.comparison_change}${nav.comparison_value}${nav.comparison_label}</div>`
        }
        if (nav.metric_html) {
          nav.metric_html = `<div class="metric">${nav.metric_html}</div>`
        }
      }

      // Build href based on type
      if (nav.widget === "dash") {
        nav.querystring = '?vis=navjs'
        if (navjs.data && navjs.data[0]) {
          nav.filterset = nav.filterset_custom || nav.filterset_choice || ''
          if (nav.filterset) {
            nav.filterset_parameter = "_parameters."+nav.filterset
            if (navjs.data[0][nav.filterset_parameter]) {
              nav.filter_link = navjs.data[0][nav.filterset_parameter]
              if (nav.filter_link && nav.filter_link.html) {
                nav.querystring += $('<div/>').html(nav.filter_link.html).text()
              }
            }
            else {
              //nav.querystring += "&message=filterset not found"
              this.addError({
                title: "Filter Set Not Found",
                message: "Filter Set not found: "+ nav.filterset_parameter });
            }
          }
        }
        else {
            //nav.querystring += "&message=filterset has no data"
            this.addError({
              title: "Filter Set Empty",
              message: "Filter Set query has no data" });
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
      normal: { navbar: "navbar-default" },
      light: { navbar: "navbar-light bg-light" },
      dark: { navbar: "navbar-dark bg-dark" }
    }
    navjs.theme = themes[config.theme] || themes.normal 

    var sizes = {
      large: { list: "", item: ""},
      normal: { list: "", item: "" },
      small: { list: "small", item: "" }
    }
    navjs.size = sizes[config.size] || sizes.normal

    // build the navbar
    var $navbar = $(`<nav class="navbar ${navjs.theme.navbar}" style="margin-bottom: 0px"></nav`)
    if (config.header) {
      $navbar.append(`
        <div class="navbar-header">
          <div class="navjs-header navjs-header-${config.size}">${config.header}</div>
        </div>`)
    }
    var $ul = $(`<ul class="nav navbar-nav ${navjs.navbarClass} ${navjs.size.list} ${config.align}">`)

    navjs.navs.forEach(function(nav) {
      $ul.append(`<li class="navjs-widget-${nav.widget} ${nav.style} ${navjs.size.item}">
                    <a href="${nav.href}">${nav.label_html}${nav.metric_html}</a>
                  </li>`)
    })
    $navbar.append($ul)

    if (config.form === "timeframe") {
      var $form = $(`
        <form class="form-inline">
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text" id="timeframe">Timeframe</span>
            </div>
            <input type="text" class="form-control" placeholder="" aria-label="Username" aria-describedby="timeframe">
          </div>
        </form>`)
      $navbar.append($form)
    }

    // display the navbar
    $el.html($navbar).addClass("navjs container")
    //console.log("doneRending nav-vis.js")

    doneRendering()
  }

});


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
      {"Stacked":  "nav-stacked"},
      //{"Center":    "justify-content-center"},
      //{"Right":     "justify-content-right"},
      //{"Fill":      "nav-fill"},
      {"Justified": "nav-justified"}
    ],
    default: "",
    display: "select",
    display_size: "half"
  }
  /*
  options.form = {
      section: "Main",
      order: 6,
      type: "string",
      label: "Form",
      values: [
        {"None":  ""},
        {"Timeframe": "timeframe"}
      ],
      display: "select"
    }
    */
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
    var navSection = `Nav ${i+1}`,
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
        {"Custom Link": "link"},
        {"Metric": "metric"},
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
      hidden: navWidget !== "dash",
      section: navSection,
      label: "Dashboard ID",
      type: "string",
      placeholder: "55 or mymodel::mylookml"
    }
    options[`${navId}_filterset_choice`] = {
      order: 5,
      hidden: navWidget !== "dash",
      section: navSection,
      label: "Filter Set",
      type: "string",
      values: [
        {"None": ""},
        {"Default": "nav_filterset_default"},
        {"MS Date": "nav_filterset_ms_date"},
        {"MS Campaign": "nav_filterset_ms_campaign"},
        {"MS Campaign, KPI, Date": "nav_filterset_ms_campaign_kpi_date"},
        {"MS KPI, Date": "nav_filterset_ms_kpi_date"},
        {"MS KPI, Date, MyParam1, MyParam2": "nav_filterset_ms_kpi_date_myparam1_myparam2"},
        {"MS Item Number": "nav_filterset_item_number"},
        {"Test": "nav_filterset_test"}
      ],
      display: "select",
      default: ""
    }
    options[`${navId}_filterset_custom`] = {
      order: 6,
      hidden: navWidget !== "dash",
      section: navSection,
      label: "Custom Filter Set",
      type: "string",
      placeholder: "e.g. my_custom_dimension"
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
      hidden: navWidget !== "metric",
      section: navSection,
      label: "Metric Dimension",
      type: "string",
      placeholder: "e.g. my_dimension"
    }
    options[`${navId}_metric_title`] = {
      order: 9,
      hidden: navWidget !== "metric",
      section: navSection,
      label: "Metric Title",
      type: "string",
      placeholder: "optional"
    }
    // Comparison
    options[`${navId}_comparison_dimension`] = {
      order: 10,
      hidden: navWidget !== "metric",
      section: navSection,
      label: "Comparison Dimension",
      type: "string",
      placeholder: "e.g. my_dimension"
    }
    options[`${navId}_comparison_style`] = {
      order: 11,
      hidden: navWidget !== "metric",
      section: navSection,
      label: "Comparison Style",
      type: "string",
      display: "select",
      values: [
        {"Show as Value": "show_as_value"},
        {"Show as Change": "show_as_change"},
        {"Hidden": "hidden"}
      ],
      default: "show_as_value"
    }
    options[`${navId}_comparison_label`] = {
      order: 12,
      hidden: navWidget !== "metric",
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
// - experiemental -
/*
function addNavActions () {
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
}
*/
