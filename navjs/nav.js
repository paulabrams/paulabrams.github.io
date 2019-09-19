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
  version: "1.2",
  name: "navjs-"+Math.random().toString(36).substring(7),
  navCount: 9,
  stylesheets: [
    "https://stackpath.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css",
    "https://fonts.googleapis.com/css?family=Roboto|Roboto:300|Roboto+Condensed|Roboto+Condensed:300|&display=swap",
    "https://paulabrams.github.io/navjs/nav.css" ],
  fields: {},
  rendered: false,
  emptyValueDashes: '--',
  updateCount: 0,
  optimize: true,
  fieldJson: '',
  dataJson: '',
  configJson: ''
}

looker.plugins.visualizations.add({
  options: buildOptions(navjs.navCount, {}),
  create: function(element, config){
    console.log(navjs.name, navjs.version)
    $("body").addClass('navjs')
    var $el = $(element)
    navjs.stylesheets.forEach(function(href) {
      $el.parent().after(`<link rel="stylesheet" href="${href}" crossorigin="anonymous">`)
      if (href.indexOf("bootstrap") !== -1) {
        clearStylesheetRules(href, "@media print")
      }
    })
  },
  updateAsync: function(data, element, config, queryResponse, details, doneRendering) {
    var updateCount = ++navjs.updateCount
    console.log(navjs.name, "updateAsync", updateCount)

    // Looker seems to send a lot of spurious calls to render the visualization.
    // In some cases up to four updateAsync calls were made with the same data during initial page rendering.
    // So this code checks to see if we need to actually do anything.
    if (updateCount > 1) {
      var fieldJson = JSON.stringify(queryResponse.fields),
          dataJson = JSON.stringify(data[0]),
          configJson = JSON.stringify(config)
      if (fieldJson !== navjs.fieldJson) {
        console.log(navjs.name, "fields changed")
      }
      else if (dataJson === navjs.dataJson) {
        console.log(navjs.name, "data changed")
      }
      else if (configJson === navjs.configJson) {
        console.log(navjs.name, "config changed")
      }
      else { 
        console.log(navjs.name, "nothing changed")
        doneRendering()
        return    
      }
    }
    navjs.fieldJson = fieldJson
    navjs.dataJson = dataJson
    navjs.configJson = configJson

    navjs.vis = this
    var $el = $(element).hide()
    navjs.data = data
    navjs.config = config
    navjs.queryResponse = queryResponse
    navjs.details = details
    this.clearErrors()
    navjs.rendered = $el.hasClass("navjs")
    $el.addClass("navjs container")

    this.trigger('registerOptions', updateOptions(navjs.navCount, config))

    // Build nav items from config
    navjs.active_tab = null
    navjs.navs = []
    for (var i=0; i<navjs.navCount; i++) {
      var navId = `nav_${i+1}`,
          nav = { widget: config[`${navId}_widget`] || '',
                  label: config[`${navId}_label`] || '',
                  style: config[`${navId}_style`] || '',
                  filterset: config[`${navId}_filterset`] || '',
                  active_param: config[`${navId}_active_param`] || '',
                  active_param_value: config[`${navId}_active_param_value`] || '',
                  dashboard_id: config[`${navId}_dashboard_id`] || '',
                  url: config[`${navId}_url`] || '',
                  metric_dimension: config[`${navId}_metric_dimension`] || '',
                  metric_title: config[`${navId}_metric_title`] || '',
                  comparison_dimension: config[`${navId}_comparison_dimension`] || '',
                  comparison_style: config[`${navId}_comparison_style`] || '',
                  comparison_label: config[`${navId}_comparison_label`] || '',
                  href: '#' }

      if (nav.widget === "hidden") { continue }

      // Active Tab
      if (nav.style === "active_param" && nav.active_param_value !== '') {
        if (navjs.data && navjs.data[0] && navjs.data[0][nav.active_param] && navjs.data[0][nav.active_param].value !== undefined) {
          if ((''+navjs.data[0][nav.active_param].value) === (''+nav.active_param_value)) {
            nav.style = "active"
          }
        }
      }
      if (nav.style === "active") {
        navjs.active_tab = navjs.active_tab || nav
      }

      // Tab Label
      nav.label_html = '' 
      if (nav.widget !== "spacer" && nav.label) {
        nav.label_html = `<span class="navjs-label">${nav.label}</span>`
      }

      // Metric
      nav.metric_html = ''
      if (nav.widget === "metric" || nav.widget === "metric_dash") {
        if (navjs.data && navjs.data[0]) {
          var metricData = navjs.data[0][nav.metric_dimension]
          if (metricData !== undefined) {
            nav.metric_value = metricData.rendered || metricData.value
            if (nav.metric_value === undefined || nav.metric_value < 0.001) {
              nav.metric_value = navjs.emptyValueDashes
            }
            if (nav.metric_title) { nav.metric_html += `<div class="navjs-metric-title">${nav.metric_title}</div> ` }
            nav.metric_html += ` <div class="navjs-metric-value">${nav.metric_value}</div> `
          }
          var comparisonData = navjs.data[0][nav.comparison_dimension]
          if (comparisonData !== undefined) {
            nav.comparison_value = comparisonData.rendered || comparisonData.value
            if (nav.comparison_value === undefined || nav.comparison_value < 0.001) {
              nav.comparison_value = navjs.emptyValueDashes
            }
            var comparison_class = `navjs-comparison-${nav.comparison_style}`
            if (nav.comparison_style === "show_as_value") {
              nav.metric_html += ` <div class="navjs-comparison"><span class="${comparison_class}">${nav.comparison_value}&nbsp;${nav.comparison_label}</span></div> `
            }
            else if (nav.comparison_value !== navjs.emptyValueDashes && nav.comparison_style === "show_as_change" ||  nav.comparison_style === "show_as_change_reversed") {
              comparison_class += comparisonData.value > 0 ? "-positive" : "-negative"
              nav.metric_html += ` <div class="navjs-comparison"><span class="${comparison_class}">▲</span> ${nav.comparison_value}&nbsp;${nav.comparison_label}</div> `
            }
            else if (nav.comparison_style === "hidden") {
              
            }
          }
          if (nav.metric_html) {
            nav.metric_html = ` <div class="metric">${nav.metric_html}</div> `
          }
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
    //console.log(navjs.name,"navjs.navs=", navjs.navs)

    // Navbar Widget and class
    navjs.navbarClass = config.widget || 'navjs-top'
    if (config.widget === "navjs-middle" || config.widget === "navjs-bottom") {
      navjs.navbarClass += " nav-pills "
    }

    config.align = config.align || ''

    var themes = {
      normal: { navbar: "" },
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

    // navbar
    var $navbar = $el.find(".navbar")
    if (!$navbar.length) {
      $navbar = $('<nav style="margin-bottom: 0px"></nav>').appendTo($el)
    }
    $navbar.removeClass().addClass(`navbar navbar-expand d-print ${navjs.theme.navbar} navjs-size-${config.size}`)

    // header
    if (config.header_dimension !== '') {
      if (navjs.data && navjs.data[0]) {
        var headerData = navjs.data[0][config.header_dimension]
        if (headerData !== undefined) {
          config.header = headerData.rendered || headerData.value || config.header
        }
      }
    }
    if (config.header_style === "active_tab" && navjs.active_tab !== null) {
      config.header = navjs.active_tab.label || config.header
    }
    if (config.header_style !== "hidden" && config.header && !config.showTools) {
      var $header = $navbar.find(".navjs-header")
      if (!$header.length) {
        $navbar.empty()
        $navbar.append('<div class="navbar-header"><div class="navjs-header"></div></div>')
        $header = $navbar.find(".navjs-header")
      }
      $header.html(config.header)
    }

    if (config.showTools) {
      $navbar.empty()
      var $form = $(`<form onsubmit="return false;">`).submit(function() { return false }).appendTo($navbar)
      $(`<h3 style="">Advanced Tools</h1>`).appendTo($form)
      var $formGroup = $(`<div class="form-group">`).appendTo($form)
      $(`<label for="inputConfigJson">Config JSON</label>`).appendTo($formGroup)
      navjs.$configInput = $(`<textarea id="inputConfigJson" class="form-control" rows="10">`)
        .val(JSON.stringify(navjs.config, null, '\t'))
        .appendTo($formGroup)
      $(`<button class="btn btn-primary" type="submit">Apply</button>`)
        .click(navjs.actions.applyJsonConfig)
          .appendTo($form)
      $(`<button class="btn btn-default pull-right" type="submit">Close</button>`)
        .click(navjs.actions.closeTools)
          .appendTo($form)
    }

    if (!config.showTools) {
      var $nav = $navbar.find(".nav")
      if (!$nav.length) {
        $nav = $('<ul>').appendTo($navbar)
      }
      $nav.addClass(`nav navbar-nav ${navjs.navbarClass} ${navjs.size.list} ${config.align}`).empty()

      navjs.navs.forEach(function(nav) {
        var $link = $(`<a class="nav-link" href="${nav.href}">${nav.label_html} ${nav.metric_html}</a>`).click(navjs.actions.clickLink)
        $navItem = $('<li>').addClass(`nav-item navjs-widget-${nav.widget} ${nav.style} ${navjs.size.item}`).append($link).appendTo($nav)
      })

      if (config.align === "navbar-right") {
        $('<li class="navjs-end-spacer">&nbsp;</li>').appendTo($nav)
      }
    }
    $el.fadeIn(300)
    doneRendering()
  }
});


// Fields
function buildFields (fieldGroup, fieldOptionArray) {
  if (navjs.queryResponse && navjs.queryResponse.fields && navjs.queryResponse.fields[fieldGroup] !== undefined) {
    navjs.queryResponse.fields[fieldGroup].forEach( function(field) {
      var option = {}
      option[field.label] = field.name
      fieldOptionArray.push(option)
    })
  }
}

// Build or rebuild the admin config options
function buildOptions (navCount, config) {
  var options = navjs.options = {}
  navCount = navCount || 0
  config = config || {}

  // Style Section
  options.header_style = {
    section: "Main",
    order: 0,
    type: "string",
    label: "Header Style",
    values: [
      {"Hidden": ""},
      {"Text": "text"},
      {"Show Active Tab": "active_tab"}
    ],
    display: "select",
    default: "text"
  }
  options.header = {
    section: "Main",
    order: 1,
    type: "string",
    label: "Header Text"
  }
  options.header_dimension = {
    section: "Main",
    order: 2,
    type: "string",
    label: "Header Dimension",
    display: "select",
    values: [],
    default: ""
  }
  options.widget = {
    section: "Main",
    order: 3,
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
    order: 4,
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
    order: 5,
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
    order: 6,
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
    order: 7,
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
    order: 8,
    type: "string",
    label: "Custom List Class",
    display_size: "half",
    hidden: true,
    placeholder: "optional"
  }
  options.listItemClass = { 
    section: "Main",
    order: 9,
    type: "string",
    label: "Custom Item Class",
    hidden: true,
    display_size: "half",
    placeholder: "optional"
  }
  options.showTools = { 
    section: "Main",
    order: 10,
    type: "boolean",
    label: "Show Advanced Tools",
    value: false
  }

  // Nav Links Sections
  // Dependent options are marked as hidden=false/true
  //console.log("build nav links", config)
  for (var i=0; i<navCount; i++) {
    var navSection = `n${i+1}`,
        navId = `nav_${i+1}`,
        navWidget = config[`${navId}_widget`] || 'hidden',
        navStyle = config[`${navId}_style`] || ''

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
      //hidden: navWidget === "spacer" || navWidget === "hidden",
      section: navSection,
      label: "Label",
      type: "string",
      placeholder: ""
    }
    options[`${navId}_dashboard_id`] = {
      order: 3,
      //hidden: navWidget !== "dash" && navWidget !== "metric_dash",
      section: navSection,
      label: "Dashboard ID",
      type: "string",
      placeholder: "55 or mymodel::mylookml"
    }
    options[`${navId}_filterset`] = {
      order: 4,
      //hidden: navWidget !== "dash" && navWidget !== "metric_dash",
      section: navSection,
      label: "Filter Dimension",
      type: "string",
      //values: navjs.fields.dimensions,
      display: "select",
      default: ""
    }
    options[`${navId}_style`] = {
      order: 5,
      //hidden: navWidget === "hidden",
      section: navSection,
      label: "Style",
      display: "select",
      values: [
        {"Normal": ""},
        {"Active": "active"},
        {"Active Param ": "active_param"},
      ],
      type: "string",
      default: ""
    }
    options[`${navId}_active_param`] = {
      order: 6,
      //hidden: (navWidget !== "dash" && navWidget !== "metric_dash") || navStyle !== "active_param",
      section: navSection,
      label: "Active Param",
      type: "string",
      //values: navjs.fields.dimensions,
      display: "select",
      default: ""
    }
    options[`${navId}_active_param_value`] = {
      order: 7,
      //hidden: (navWidget !== "dash" && navWidget !== "metric_dash") || navStyle !== "active_param",
      section: navSection,
      label: "Active Param Value",
      type: "string",
      //values: navjs.fields.dimensions,
      //display: "select",
      default: ""
    }
    options[`${navId}_url`] = {
      order: 8,
      //hidden: navWidget !== "link",
      section: navSection,
      label: "Link URL",
      type: "string",
      placeholder: "http://..."
    }
    // Metric w/ comparison
    options[`${navId}_metric_dimension`] = {
      order: 9,
      //hidden: navWidget !== "metric" && navWidget !== "metric_dash",
      section: navSection,
      label: "Metric Dimension",
      type: "string",
      //values: navjs.fields.measures,
      display: "select"
    }
    options[`${navId}_metric_title`] = {
      order: 10,
      //hidden: navWidget !== "metric" && navWidget !== "metric_dash",
      section: navSection,
      label: "Metric Title",
      type: "string",
      placeholder: "optional"
    }
    // Comparison
    options[`${navId}_comparison_dimension`] = {
      order: 11,
      //hidden: navWidget !== "metric" && navWidget !== "metric_dash",
      section: navSection,
      label: "Comparison Dimension",
      type: "string",
      //values: navjs.fields.measures,
      display: "select"
    }
    options[`${navId}_comparison_style`] = {
      order: 12,
      //hidden: navWidget !== "metric" && navWidget !== "metric_dash",
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
      order: 13,
      //hidden: navWidget !== "metric" && navWidget !== "metric_dash",
      section: navSection,
      label: "Comparison Label",
      type: "string",
      placeholder: "optional"
    }

  }
  return options
}
function updateOptions (navCount, config) {
  options = navjs.options
  navCount = navCount || 0
  config = config || {}

  // Build the lists of measures and dimensions
  navjs.fields.measures = [ {"None": ""} ]
  buildFields("measures", navjs.fields.measures)
  navjs.fields.dimensions = [ {"None": ""} ]
  buildFields("dimensions", navjs.fields.dimensions)
  //buildFields("table_calculations", navjs.fields.measures)

  // Style Section
  options.header.hidden = config.header_style === ""
  options.header.placeholder = config.header_style === "active_tab" ? "displayed if no active tab" : ""
  options.header_dimension.hidden = config.header_style === ""
  options.header_dimension.values = navjs.fields.measures

  // Nav Links Sections
  // Dependent options are marked as hidden=false/true
  for (var i=0; i<navCount; i++) {
    var navSection = `n${i+1}`,
        navId = `nav_${i+1}`,
        navWidget = config[`${navId}_widget`] || 'hidden',
        navStyle = config[`${navId}_style`] || ''

    options[`${navId}_label`].hidden = navWidget === "spacer" || navWidget === "hidden"
    options[`${navId}_dashboard_id`].hidden = navWidget !== "dash" && navWidget !== "metric_dash"
    options[`${navId}_filterset`].hidden = navWidget !== "dash" && navWidget !== "metric_dash"
    options[`${navId}_filterset`].values = navjs.fields.dimensions
    options[`${navId}_style`].hidden = navWidget === "hidden"
    options[`${navId}_active_param`].hidden = (navWidget !== "dash" && navWidget !== "metric_dash") || navStyle !== "active_param"
    options[`${navId}_active_param`].values = navjs.fields.dimensions
    options[`${navId}_active_param_value`].hidden = (navWidget !== "dash" && navWidget !== "metric_dash") || navStyle !== "active_param"
    options[`${navId}_url`].hidden = navWidget !== "link"
    options[`${navId}_metric_dimension`].hidden = navWidget !== "metric" && navWidget !== "metric_dash"
    options[`${navId}_metric_dimension`].values = navjs.fields.measures
    options[`${navId}_metric_title`].hidden = navWidget !== "metric" && navWidget !== "metric_dash"
    options[`${navId}_comparison_dimension`].hidden = navWidget !== "metric" && navWidget !== "metric_dash"
    options[`${navId}_comparison_dimension`].values = navjs.fields.measures
    options[`${navId}_comparison_style`].hidden = navWidget !== "metric" && navWidget !== "metric_dash"
    options[`${navId}_comparison_label`].hidden = navWidget !== "metric" && navWidget !== "metric_dash"

  }

  return options
}

//
// Clear any @media print rules
//
function clearStylesheetRules (href, rule) {
  rule = rule || "@media print"
  //console.log("clearStylesheetRules()", href, rule)
  var stylesheets = document.styleSheets,
      loaded = 0
  for (var i=0; i<stylesheets.length; i++) {
    if (stylesheets[i].href === href) {
      loaded = 1
      //console.log("loaded stylesheet rules", href, rule)
      for (var j=0; j<stylesheets[i].rules.length; j++) {
        if (stylesheets[i].rules[j].cssText.indexOf(rule) !=-1) {
          //console.log("clearing rule", stylesheets[i].rules[j].cssText)
          stylesheets[i].deleteRule(j)
        }
      }
    }
  }

  if (!loaded) {
    //console.log("waiting for stylesheet to load", href, rule)
    window.setTimeout(function () { clearStylesheetRules(href, rule) }, 100)
  }
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

  navjs.actions.exportConfig = function () {
    navjs.$configInput.show()
    navjs.$configInput.val(JSON.stringify(navjs.config))
    navjs.$configInput.select(); 
    navjs.$configInput.setSelectionRange(0, 99999); /*For mobile devices*/
    document.execCommand("copy");
    console.log("config copied to clipboard")
  }

  navjs.actions.applyJsonConfig = function () {
    var inputVal = navjs.$configInput.val()
    var config = JSON.parse(inputVal)
    if (config) {
      console.log("Applying Config JSON", config)
      config.showTools = false
      navjs.vis.trigger("updateConfig", [config])
    }
    else {
      console.log("Invalid Config JSON", inputVal)
    }
  }

  navjs.actions.closeTools = function () {
    navjs.vis.trigger("updateConfig", [ {showTools: false} ])
  }

}
addNavActions ()



