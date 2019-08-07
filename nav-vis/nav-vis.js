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
  inlineCss: '',
  navCount: 7,
  init: 0
}

looker.plugins.visualizations.add({
  options: buildOptions (navjs.navCount, {}),
  create: function(element, config){
    console.log("nav-vis.js create() v0.1.5")
  },
  updateAsync: function(data, element, config, queryResponse, details, doneRendering) {
    navjs.data = data
    navjs.element = element
    navjs.config = config
    navjs.queryResponse = queryResponse
    navjs.details = details
    console.log("nav-vis.js updateAsync() navjs=", navjs)

    this.trigger('registerOptions', buildOptions(navjs.navCount, config))

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
    if (!navjs.init) {
      if (navjs.loadCss) {
        $el.parent().after(`<link rel="stylesheet" href="${navjs.loadCss}" crossorigin="anonymous">`)
      }
      if (navjs.inlineCss) {
        $el.parent().after(`<style>${navjs.inlineCss}</style>`)
      }
      navjs.init = 1
    }

    // Build nav items from config
    navjs.navs = []
    for (var i=0; i<navjs.navCount; i++) {
      var navStyle = config[`nav_${i+1}_style`] || ''
      if (navStyle === "hidden") { continue }

      var nav = {
        style: navStyle,
        label: config[`nav_${i+1}_label`] || '',
        filterset_choice: config[`nav_${i+1}_filterset`] || '',
        filterset_custom: config[`nav_${i+1}_filterset_custom`] || '',
        dashboard_id: config[`nav_${i+1}_dashboard_id`] || '',
        url: config[`nav_${i+1}_url`] || '',
        metric_dimension: config[`nav_${i+1}_metric_dimension`] || '',
        metric_title: config[`nav_${i+1}_metric_title`] || '',
        comparison_dimension: config[`nav_${i+1}_comparison_dimension`] || '',
        comparison_style: config[`nav_${i+1}_comparison_style`] || '',
        comparison_label: config[`nav_${i+1}_comparison_label`] || '',
        classname: '',
        href: '#'}

      // Label
      nav.label_html = ''
      if (nav.label) {
        nav.label_html += `<span class="label">${nav.label}</span>`
      }
      // Metric
      if (nav.style === "metric") {
        nav.metric_html = ''
        if (navjs.data[0][nav.metric_dimension] !== undefined) {
          nav.metric_value = navjs.data[0][nav.metric_dimension].rendered
          if (nav.metric_title) { nav.metric_html += `<div class="metric_title">${nav.metric_title}</div>` }
          nav.metric_html += `<div class="metric_value">${nav.metric_value}</div>`
        }
        if (navjs.data[0][nav.comparison_dimension] !== undefined) {
          nav.comparison_value = navjs.data[0][nav.comparison_dimension].rendered
          nav.comparison_change = ""
          if (nav.comparison_style === "show_as_change") {
            if (nav.comparison_value > 0) { nav.comparison_change = `<span class="up-arrow-copy">^</span>` }
            else if (nav.comparison_value < 0) { nav.comparison_change = `<span class="down-arrow-copy">v</span>` }
          }
          nav.metric_html += `<div class="comparison">${nav.comparison_change}${nav.comparison_value}${nav.comparison_label}</div>`
        }
        if (nav.metric_html) {
          nav.metric_html = `<div class="metric">${nav.metric_html}</div>`
        }
      }

      // Build href based on type
      if (nav.style === "dash") {
        nav.querystring = '?vis=navjs'
        if (navjs.data && navjs.data[0]) {
          nav.filterset_parameter = "_parameters."+(nav.filterset_custom || nav.filterset_choice)
          if (navjs.data[0][nav.filterset_parameter]) {
            nav.filter_link = navjs.data[0][nav.filterset_parameter]
            if (nav.filter_link && nav.filter_link.html) {
              nav.querystring += $('<div/>').html(nav.filter_link.html).text()
            }
          }
          else {
            nav.querystring += "&message=filterset not found"
            console.log("ERROR - filterset parameter not found:", nav.filterset_parameter)
          }

        }
        else {
            nav.querystring += "&message=filterset has no data"
            console.log("ERROR - filterset query has no data", navjs.data)
        }
        nav.href = '/embed/dashboards/'+nav.dashboard_id + nav.querystring
      }
      else if (nav.style === "link") {
        // use custom URL as-is
        nav.href = nav.url
      }
      // The "Active" nav item
      if (nav.url === "#" || nav.href === "#") {
        nav.classname = "active"
      }

      if (nav.label || nav.metric_html) {
        navjs.navs.push(nav)
      }
    }
    console.log("navjs.navs=", navjs.navs)

    config.widget = config.widget || 'navbar-nav'
    config.align = config.align || ''
    config.listClass = config.listClass || 'navbar-default'
    config.listItemClass = config.listItemClass || ''

    var themes = {
      light: { navbar: "navbar-light bg-light" },
      dark: { navbar: "navbar-dark bg-dark" },
      normal: { navbar: "navbar-default" },
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
          <div class="header navbar-brand">${config.header}</div>
        </div>`)
    }
    var $ul = $(`<ul class="nav navbar-nav ${config.widget} ${navjs.size.list} ${config.align} ${config.listClass}">`)
    navjs.navs.forEach(function(nav) {
      $ul.append(`<li class="${nav.classname} ${navjs.size.item} ${config.listItemClass}"><a href="${nav.href}">${nav.label_html}${nav.metric_html}</a></li>`)
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
    $el.html($navbar).addClass("navjs")
    console.log("doneRending nav-vis.js")

    doneRendering()
  }

});


// Build or rebuild the admin config options
function buildOptions (navCount, config) {
  var options = {}

  // Style Section
  options.header = {
      section: "Style",
      order: 1,
      type: "string",
      label: "Header",
      default: ""
    }
  options.widget = {
      section: "Style",
      order: 2,
      type: "string",
      label: "Navbar",
      values: [
        {"Standard": ""},
        {"Tabs":  "nav-tabs"},
        {"Pills": "nav-pills"},
        {"Links": "nav-links"}
      ],
      display: "select",
      display_size: "half",
      default: ""
  }
  options.theme = {
      section: "Style",
      order: 3,
      type: "string",
      label: "Style",
      values: [
        {"Light": "light"},
        {"Dark": "dark"},
        {"Normal": "normal"}
      ],
      display: "select",
      display_size: "half",
      default: "light"
    }
  options.size = {
      section: "Style",
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
    section: "Style",
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
    display: "select",
    display_size: "half",
    default: ""
  }
  /*
  options.form = {
      section: "Style",
      order: 6,
      type: "string",
      label: "Form",
      values: [
        {"None":  ""},
        {"Timeframe": "timeframe"}
      ],
      display: "select",
      default: ""
    }
    */
  options.listClass = {
      section: "Style",
      order: 7,
      type: "string",
      label: "Custom List Class",
      default: "",
      display_size: "half",
      placeholder: "optional"
    }
  options.listItemClass = { 
      section: "Style",
      order: 8,
      type: "string",
      label: "Custom Item Class",
      default: "",
      display_size: "half",
      placeholder: "optional"
    }


  // Nav Links Sections
  for (var i=0; i<navCount; i++) {

    // Dependent options are marked as hidden=false/true
    var navStyle = config[`nav_${i+1}_style`] || 'hidden'

    console.log("DEBUG - option for nav item "+(i+1)+" style="+navStyle)
    
    // Options for Nav items
    options[`nav_${i+1}_style`] = {
      order: 0,
      hidden: false, // never hidden
      section: section,
      label: "Style",
      type: "string",
      display: "select",
      values: [
        {"Dashboard Link": "dash"},
        {"Custom Link": "link"},
        {"Metric": "metric"},
        {"Hidden": "hidden"}
      ],
      default: "nav"
    } 
    var section = `Nav${i+1}`
    options[`nav_${i+1}_label`] = {
      order: 1,
      hidden: navStyle === "hidden",
      section: section,
      label: "Label",
      type: "string",
      display_size: "normal",
      default: "",
      placeholder: ""
    }
    options[`nav_${i+1}_dashboard_id`] = {
      order: 2,
      hidden: navStyle !== "dash",
      section: section,
      label: "Link - Dashboard ID",
      type: "string",
      default: "",
      placeholder: "55 or mymodel::mylookml"
    }
    options[`nav_${i+1}_filterset`] = {
      order: 3,
      hidden: navStyle !== "dash",
      section: section,
      label: "Link - Filter Set",
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
      default: "nav_filterset_default"
    }
    options[`nav_${i+1}_filterset_custom`] = {
      order: 4,
      hidden: navStyle !== "dash",
      section: section,
      label: "Link - Custom Filter Set",
      type: "string",
      default: "",
      placeholder: "e.g. my_custom_dimension"
    }
    options[`nav_${i+1}_url`] = {
      order: 5,
      hidden: navStyle !== "link",
      section: section,
      label: "Link URL",
      type: "string",
      default: "",
      placeholder: "http://..."
    }
    // Metric w/ comparison
    options[`nav_${i+1}_metric_dimension`] = {
      order: 6,
      hidden: navStyle !== "metric",
      section: section,
      label: "Metric Dimension",
      type: "string",
      default: "",
      placeholder: "e.g. my_dimension"
    }
    options[`nav_${i+1}_metric_title`] = {
      order: 7,
      hidden: navStyle !== "metric",
      section: section,
      label: "Metric Title",
      type: "string",
      default: "",
      placeholder: "optional"
    }
    // Comparison
    options[`nav_${i+1}_comparison_dimension`] = {
      order: 8,
      hidden: navStyle !== "metric",
      section: section,
      label: "Comparison Dimension",
      type: "string",
      default: "",
      placeholder: "e.g. my_dimension"
    }
    options[`nav_${i+1}_comparison_style`] = {
      order: 9,
      hidden: navStyle !== "metric",
      section: section,
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
    options[`nav_${i+1}_comparison_label`] = {
      order: 10,
      hidden: navStyle !== "metric",
      section: section,
      label: "Comparison Label",
      type: "string",
      default: "",
      placeholder: "optional"
    }
  }

  return options
}

navjs.inlineCss = `
.navjs {
  font-family: roboto, open sans, sans-serif;
  margin: 0px;
}
.header {
  height: 22px !important;
  font-family: Roboto;
  font-size: 16px !important;
  font-weight: bold;
  font-style: normal;
  font-stretch: condensed;
  line-height: 1.38 !important;
  letter-spacing: 0.2px;
  color: var(--charcoal-grey) !important;
}
a {
  color: var(--charcoal-grey) !important;
}
a:hover {
  color: var(--charcoal-grey) !important;
}
.label {
  height: 22px;
  font-family: Roboto;
  font-size: 16px;
  font-weight: 300;
  font-style: normal;
  font-stretch: condensed;
  line-height: 1.38;
  letter-spacing: 0.2px;
  color: var(--charcoal-grey) !important;
}
.metric {
}
.metric_title {
  height: 36px;
  font-family: Roboto;
  font-size: 28px;
  font-weight: normal;
  font-style: normal;
  font-stretch: condensed;
  line-height: 1.29;
  letter-spacing: normal;
  color: var(--charcoal-grey) !important;
}
.metric_value {
  height: 36px;
  font-family: Roboto;
  font-size: 28px;
  font-weight: normal;
  font-style: normal;
  font-stretch: condensed;
  line-height: 1.29;
  letter-spacing: normal;
  text-align: center;
  color: var(--charcoal-grey) !important;
}
.comparison {
  height: 16px;
  font-family: Roboto;
  font-size: 12px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.33;
  letter-spacing: normal;
  text-align: right;
  color: #6c7373 !important;
}
.up-arrow-copy {
  width: 7px;
  height: 10px;
  background-image: linear-gradient(to bottom, #2db364, rgba(45, 179, 100, 0));
}
.down-arrow-copy {
  width: 7px;
  height: 10px;
  transform: rotate(-180deg);
  background-image: linear-gradient(to bottom, #ff475d, rgba(255, 71, 93, 0));
}
`
