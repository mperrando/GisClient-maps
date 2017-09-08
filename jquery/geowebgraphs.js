function simpleLink(text, callback) {
  var result = document.createElement("a");
  result.href = "#";
  result.innerHTML = text;
  result.onclick = callback;
  return result;
}

function centralWindow(title) {
  var me = this,
      view = document.createElement("div");
  $(view).css("margin", "auto");
  $(view).css("margin-top", 50);
  $(view).css("padding", 20);
  $(view).css("width", "50%");
  $(view).css("min-width", "400");
  $(view).css("background", "white");
  view.innerHTML = "<h3>" + title  +"</h3>";
  return view;
}

function indexForOptionWithValue(select, value) {
  for(var i = 0; i < select.length; i++) {
    var o = select.options[i];
    if ( o.value == value )
      return i;
  }
}

function ajaxForEachElement(url, callback) {
  $.getJSON(url, function(data) {
    for(var i = 0; i < data.length; i++) {
      callback(data[i]);
    }
  });
}

function installCallbackOnOptions(select) {
  var f = function() {
    select.options[select.selectedIndex].execute();
  };
  select.onchange = f;
  f();
}

function FormLabel(text) {
  var me = this,
      view = document.createElement("div"),
      label = document.createElement("label");
  me.view = view;
  view.appendChild(label);
  label.innerText = text;
}

function DateField() {
  var me = this,
      view = document.createElement('div'),
      current = undefined;
  $(view).addClass("easyui-calendar");
  $(view).calendar({onSelect: function(date){
    current = date;
  }});
  //view.style="width:250px;height:250px;";
  me.view = view;

  me.set = function(val) {
    $(view).calendar({current: val});
    current = val;
  }

  me.get = function() {
    return current;
  }
}

function StartEndDatesPanel(okCallback) {
  var me = this,
      view = document.createElement("div"),
      start = new DateField(),
      end = new DateField();
  me.view = view;
  view.appendChild(new FormLabel("Inizio").view);
  view.appendChild(start.view);
  view.appendChild(new FormLabel("Fine").view);
  view.appendChild(end.view);

  me.getStart = function() {
    return start.get();
  }

  me.setStart = function(val) {
    start.set(val);
  }

  me.getEnd = function() {
    return end.get();
  }

  me.setEnd = function(val) {
    end.set(val);
  }
}

function RightToolbarPanel(size) {
  var me = this,
      view = document.createElement("div"),
      content = document.createElement("div"),
      toolbar = document.createElement("div");
  view.appendChild(toolbar);
  view.appendChild(content);
  $(toolbar).css("float", "right");
  $(toolbar).css("background", "white");
  $(toolbar).css("padding-left", 10);

  me.view = view;
  me.content = content;
  me.toolbar = toolbar;

  me.setSize = function(size) {
    $(toolbar).css("width", size);
    $(content).css("padding-right", size);
  }

  if(size != undefined)
    me.setSize(size);
}

function TimeControlBar(onChange, getCurrent) {
  var me = this,
      view = document.createElement("div");

  function lastDays(n) {
    return function() {
      var to = new Date().getTime(),
          from = to - n * 86400000;
      onChange(from, to);
    };
  }
  view.appendChild(simpleLink("Ultimi 7 giorni", lastDays(7)));
  view.appendChild(simpleLink("Ultimi 30 giorni", lastDays(30)));
  view.appendChild(simpleLink("Ultimi 60 giorni", lastDays(60)));
  view.appendChild(simpleLink("<", function() {
    var current = getCurrent(),
        from = current[0],
        to = current[1]
        span = (to - from) / 2;
    onChange(from - span, to - span);
  }));
  view.appendChild(simpleLink("ADESSO", function() {
    var current = getCurrent(),
        from = current[0],
        to = current[1]
        span = to - from,
        now = new Date().getTime();
    onChange(now - span, now);
  }));
  view.appendChild(simpleLink(">", function() {
    var current = getCurrent(),
        from = current[0],
        to = current[1]
        span = (to - from) / 2;
    onChange(from + span, to + span);
  }));
  view.appendChild(simpleLink("Imposta", function() {
    var current = getCurrent(),
        from = current[0],
        to = current[1];
    var popup = window.PopupService.createModalPopup(),
        content = centralWindow("Imposta orizzonte temporale"),
        startEnd = new StartEndDatesPanel(),
        closeBtn = simpleLink("Cancel", function() {
          popup.hide();
        }),
        okBtn  = simpleLink("OK", function(){
          onChange(startEnd.getStart().getTime(), startEnd.getEnd().getTime());
          popup.hide();
        });
    popup.element().appendChild(content)
    content.appendChild(startEnd.view);
    content.appendChild(okBtn)
    content.appendChild(closeBtn)
    startEnd.setStart(new Date(from));
    startEnd.setEnd(new Date(to));
    popup.show();
  }));

  me.view = function() {
    return view;
  }
}

function SerieChooser(callback) {
  var me = this,
      view = centralWindow("Scegli la misura da visualizzare"),
      list = document.createElement("div");
  view.appendChild(list);

  me.setSeries = function(series) {
    emptyContent(list);
    series.forEach(function(serie){
      var v = document.createElement("div"),
          btn = simpleLink(serie.name, function() {
            callback(serie);
          });
      v.appendChild(btn);
      list.appendChild(v);
    });
  }

  me.getView = function() {
    return view;
  }
}

function ChartPanel(getUrl, opts) {
  var me = this;
  var chart = new Chart(new ChartDataProvider(getUrl).getChartData, opts),
      view = document.createElement("div"),
      rightToolbarPanel = new RightToolbarPanel();

  rightToolbarPanel.content.appendChild(chart.view());
  view.appendChild(rightToolbarPanel.view);

  me.toolbar = {
    add: function(text, callback) {
      rightToolbarPanel.setSize(40);
      rightToolbarPanel.toolbar.appendChild(simpleLink(text, callback));
    }
  };

  me.setIds = function(ids) {
    chart.setIds(ids);
  }

  me.view = view;
  me.refresh = chart.refresh;
  me.getTimeRange = chart.getTimeRange;
  me.setTimeRange = chart.setTimeRange;
  me.setTitle = chart.setTitle;
}

function QuickWorkspace(urlProvider) {
  var me = this;
  var chart = new ChartPanel(urlProvider.urlForSerie);
  var view = document.createElement("div"),
    timeControlBar = new TimeControlBar(chart.setTimeRange, chart.getTimeRange);
  $(view).addClass("quickWorkspace");
  //$(view).css("padding", 20);
  view.appendChild(timeControlBar.view());
  view.appendChild(chart.view);

  me.setSerie = function(serieId) {
    chart.setIds([serieId]);
  }

  me.getView = function() {
    return view;
  }

  me.setTitle = function(title) {
    chart.setTitle(title);
  }

  me.refresh = function() {
    chart.refresh();
  }

  me.getToolbar = chart.getToolbar;

  me.chart = chart;
}

function ChartsPanel(getUrl) {
  var me = this,
    charts = [];
  var view = document.createElement("div");
  $(view).addClass("chartsWorkspace");
  me.view = function() {
    return view;
  }

  rangeChangedOnChart = function(from, to) {
    if(me.rangeChanged != undefined)
      me.rangeChanged(from, to);
  }

  me.addChart = function(ids) {
    var chart = new ChartPanel(getUrl);
    chart.setIds(ids);
    charts.push(chart);
    chart.rangeChanged = rangeChangedOnChart;
    view.appendChild(chart.view);
    chart.refresh();
  }

  me.clear = function() {
    charts = [];
    emptyContent(view);
  }

  me.setTimeRange = function(from, to) {
    for(var i = 0; i < charts.length; i++) {
      charts[i].setTimeRange(from, to);
    }
  }

  me.getTimeRange = function() {
    return charts[0].getTimeRange();
  }
};

function ChartsWorkspace(urlProvider) {
  var me = this;
  var chartsPanel = new ChartsPanel(urlProvider.urlForSerie);
  var view = document.createElement("div"),
    workspaceData = null,
    timeControlBar = new TimeControlBar(chartsPanel.setTimeRange, chartsPanel.getTimeRange);

  $(view).addClass("normalWorkspace");
  //$(view).css("padding", 20);
  view.appendChild(timeControlBar.view());
  view.appendChild(chartsPanel.view());

  chartsPanel.rangeChanged = chartsPanel.setTimeRange;

  me.view = function() {
    return view;
  }

  me.refresh = function() {
    chart.refresh();
  }

  me.addChart = function(ids) {
    chartsPanel.addChart(ids);
  }

  refreshGraphs = function() {
    chartsPanel.clear();
    var graphs = workspaceData.graphs;
    for(var i = 0; i < graphs.length; i++) {
      chartsPanel.addChart(graphs[i].series);
    }
  }

  me.load = function(id) {
    $.getJSON(urlProvider.workspace(id), function(data) {
      workspaceData = data;
      refreshGraphs();
      if(workspaceData.timeRange != undefined) {
        chartsPanel.setTimeRange(timeRange.from, timeRange.to);
      }
    });
  }
}

function WorkspacesPanel(urlProvider, searchPanel) {
  var me = this,
      view = document.createElement("div"),
      workspaceSelect = document.createElement("select"),
      workspacePanel = document.createElement("div");

  $(workspacePanel).addClass("workspaces");
  $(view).css("padding", 20);

  view.appendChild(workspaceSelect);
  view.appendChild(workspacePanel);

  var chartsWorkspace = new ChartsWorkspace(urlProvider);

  var populateWorkspaceSelect = function() {
    emptyContent(workspaceSelect);
    var o = document.createElement("option");
    o.innerHTML = "Ricerca...";
    o.value = -1;
    o.execute = mustOpenSearch;
    workspaceSelect.appendChild(o);
    ajaxForEachElement(urlProvider.workspacesList(), function(item) {
      var o = document.createElement("option");
      o.innerHTML = item.name;
      var id = item.id;
      o.value = id;
      workspaceSelect.appendChild(o);
      o.execute = function() { mustChangeWorkspace(id); }
    });
  };

  var mustOpenSearch = function() {
    emptyContent(workspacePanel);
    workspacePanel.appendChild(searchPanel.view());
    searchPanel.execute();
  }

  var mustChangeWorkspace = function(id) {
    chartsWorkspace.load(id);
    emptyContent(workspacePanel);
    workspacePanel.appendChild(chartsWorkspace.view());
  }

  var indexForWorkspace = function(id) {
    return indexForOptionWithValue(workspaceSelect, id);
  }

  populateWorkspaceSelect();
  installCallbackOnOptions(workspaceSelect);

  me.view = function() { return view; }
  me.openWorkspace = function(id) {
    var idx = indexForWorkspace(id);
    if ( idx != undefined ) {
      workspaceSelect.selectedIndex = idx;
      mustChangeWorkspace(id);
    }
    else {
      alert("Workspace not found: " + id);
    }
  }
}

function emptyContent(element) {
  while(element.firstChild)
    element.removeChild(element.firstChild);
}

var GraphService = {
  getGraphsForFeature: function(featureType, featureId) {
    return[
      {
        name: "Pressione",
        id: 10
      },
      {
        name: "Volume",
        id: 4
      }
    ]
  }
}

function createFullWindownBlackPanelWithCloseAndContent() {
  var result = window.PopupService.createModalPopup();
  $(result.element()).addClass('pino');
  var closebtn = document.createElement("a");
  closebtn.href = "#";
  closebtn.innerHTML = "serite";
  $(closebtn).on("click", function() {
    result.hide();
  });
  result.element().appendChild(closebtn);
  return result;
}

function createVerticalScrollPanel() {
  var result = document.createElement("div");
  $(result).css("height", "100%");
  $(result).css("overflow-y", "scroll");
  return result;
}

window.Extensions["FeatureChart.Ready"] = [];

function installFeatureButton(urlProvider) {
  var me = this;
  var measuresPopup = createFullWindownBlackPanelWithCloseAndContent();
  var content = createVerticalScrollPanel()
  measuresPopup.element().appendChild(content);

  var makeWs = function() {
    me.ws = new QuickWorkspace(urlProvider);
    var exts = window.Extensions["FeatureChart.Ready"];
    for(var i = 0; i < exts.length; i++)
      exts[i](measuresPopup, ws.chart, function() { return me.serie; });
  }

  var openSerieInQuickWorkspace = function(serie) {
    if(me.ws == undefined)
      makeWs();

    content.appendChild(me.ws.getView());

    me.serie = serie;
    me.ws.setSerie(serie.id);
    me.ws.setTitle(serie.name);
    //me.ws.refresh();
  }

  var serieChooser = new SerieChooser(function(serie) {
    openSerieInQuickWorkspace(serie);
  });

  createButton = function(featureType, feature) {
    var series = GraphService.getGraphsForFeature(featureType, feature);
    if(series.length > 0)
      return '<a href="#" featureType="' + featureType
        + '" featureId="' + feature.id
        + '" action="graphs">buttunettu</a>';
    else {
      return null;
    }
  };

  buttonCallback = function(featureType, featureId) {
    emptyContent(content);
    var series = GraphService.getGraphsForFeature(featureType, featureId);
    if(series.length == 1)
     openSerieInQuickWorkspace(series[0]);
    else {
      serieChooser.setSeries(series);
      content.appendChild(serieChooser.getView());
    }
    measuresPopup.show();
  }

  var qte = window.Extensions["QueryToolbar.Actions"].
    addAction("graphs", createButton, buttonCallback);
}

function SearchForm() {
  var me = this,
      view = document.createElement("div"),
      field = document.createElement("input"),
      submitBtn = document.createElement("input");
  field.type = "text";
  field.placeholder = "Nome misura (min 3 caratteri)";
  submitBtn.type = "submit";
  submitBtn.onclick = function() {
    if(me.onSubmit != undefined)
      me.onSubmit();
  }

  view.appendChild(field);
  view.appendChild(submitBtn);

  me.view = function() { return view; }
  me.text = function() { return field.value; }
}

function ScrollPanelTop() {
  var wrap = document.createElement("div"),
      div = document.createElement("div"),
      top = document.createElement("div"),
      content = document.createElement("div");
  wrap.style = "position:relative";
  wrap.appendChild(div);
  div.style = "position:absolute; top: 0; bottom: 0; left: 0; right: 0;";
  div.appendChild(top);
  $(div).css("height", "100%");
  $(div).css("overflow-y", "scroll");
  $(top).css("position", "fixed");
  $(top).resize(function() {
    $(content).css("padding-top", top.height);
  });
  div.appendChild(content);
  wrap.top = top;
  wrap.content = content;
  return wrap;
}

window.Extensions["SearchChart.Ready"] = [];

function SearchPanel(urlProvider) {
  var me = this,
      view = document.createElement("div"),
      searchResults = document.createElement("div"),
      searchForm = new SearchForm(),
      graphContainer = document.createElement("div");

  view.appendChild(graphContainer);
  view.appendChild(searchForm.view());
  view.appendChild(searchResults);

  var makeWs = function() {
    me.ws = new QuickWorkspace(urlProvider);
    var exts = window.Extensions["SearchChart.Ready"];
    for(var i = 0; i < exts.length; i++)
      exts[i](me.ws.chart, function() { return me.serieId; });
  }

  me.view = function() { return view; }

  me.execute = function() {
    emptyContent(graphContainer);
    emptyContent(searchResults);
    var text = searchForm.text();

    ajaxForEachElement(urlProvider.getSearchUrl(text), function(item) {
      var l = document.createElement("a");
      l.href = '#';
      l.style = "display:block";
      l.innerHTML = item.name;
      searchResults.appendChild(l);
      l.onclick = function() { openSerie(item); }
    });
  }

  openSerie = function(serie) {
    if(me.ws==undefined)
      makeWs();

    graphContainer.appendChild(me.ws.getView());
    me.serieId = serie.id;
    me.ws.setSerie(serie.id);
    me.ws.setTitle(serie.name);
    //me.ws.refresh();
  }

  searchForm.onSubmit = me.execute;
}

function installSideBarButton(workspacesPanel, workspacesPopup) {
  var measuresPopup = workspacesPopup,
      content = createVerticalScrollPanel();
  measuresPopup.element().appendChild(content);
  content.appendChild(workspacesPanel.view());

  var button = window.Extensions["SideToolbar.Buttons"].addButton(
    "graphs", measuresPopup.show);
  button.iconName = "signal";
}

function AddSerieToWorkspace(urlProvider, serie, doneCallback, cancelCallback) {
  var me = this,
      view = centralWindow("Aggiungi a workspce");

  var workspaceSelect = document.createElement("select"),
      chartSelect = document.createElement("select");
  view.appendChild(workspaceSelect);
  view.appendChild(chartSelect);
  view.appendChild(simpleLink("Annulla", cancelCallback));
  add = function() {
    doneCallback(me.workspaceId, me.chartId);
  }

  view.appendChild(simpleLink("Aggiungi", add));

  reloadCharts = function() {
    emptyContent(chartSelect);
    var o = document.createElement("option");
    o.innerHTML = "[Nuovo grafico]";
    chartSelect.appendChild(o);
    o.execute = function() { me.chartId = null; };

    if(me.workspaceId) {
      $.getJSON(urlProvider.workspace(me.workspaceId), function(data) {
        for(var i = 0; i < data.graphs.length; i++) {
          var o = document.createElement("option"),
              item = data.graphs[i];
          o.innerHTML = item.name;
          chartSelect.appendChild(o);
          o.execute = function() { me.chartId = item.id; }
        }
      });
    }
    installCallbackOnOptions(chartSelect);
  }

  var o = document.createElement("option");
  o.innerHTML = "[Nuovo workspace]";
  workspaceSelect.appendChild(o);
  o.execute = function() { me.workspaceId = null; reloadCharts(); };

  ajaxForEachElement(urlProvider.workspacesList(), function(item) {
    var o = document.createElement("option");
    o.innerHTML = item.name;
    workspaceSelect.appendChild(o);
    o.execute = function() { me.workspaceId = item.id; reloadCharts(); };
  });
  installCallbackOnOptions(workspaceSelect);

  me.view = view;
}

function popupAddSerieToWorkspace(urlProvider, serie, doneCallback) {
  var popup = window.PopupService.createModalPopup(),
      content = new AddSerieToWorkspace(urlProvider, serie, function(workspaceId, chartId){
        if(doneCallback(workspaceId, chartId))
          popup.hide();
      }, function(){
        popup.hide();
      }),
      element = popup.element();
  element.appendChild(content.view);
  popup.show();
}

function installAddSerieToWorkspace(workspacesPopup, workspacesPanel, urlProvider) {
  addSerie = function(serie, workspaceId, chartId) {
    alert("Adding serie " + serie + " to ws " + workspaceId + " chart " + chartId);
    if ( workspaceId != undefined )
      return workspaceId;
    else
      return 9999;
  }

  window.Extensions["FeatureChart.Ready"].push(function(popup, chart, getSerie) {
    chart.toolbar.add("...", function() {
      var serie = getSerie();
      popupAddSerieToWorkspace(urlProvider, serie, function(workspaceId, chartId) {
        var targetWs = addSerie(serie, workspaceId, chartId);
        popup.hide();
        workspacesPopup.show();
        workspacesPanel.openWorkspace(targetWs);
        return true;
      });
    });
  });

  window.Extensions["SearchChart.Ready"].push(function(chart, getSerie) {
    chart.toolbar.add("...", function() {
      var serie = getSerie();
      popupAddSerieToWorkspace(urlProvider, serie, function(workspaceId, chartId) {
        var targetWs = addSerie(serie, workspaceId, chartId);
        workspacesPanel.openWorkspace(targetWs);
        return true;
      });
    });
  });
}

$(function(){
  var serivcesUrl = '/gisclient3/services';

  var urlProvider = {
    urlForSerie: function(ids, from, to) {
      var pars = 'ids=' + ids.join(",") + '&from=' + from + '&to=' + to;
      return serivcesUrl + '/charts/?action=get_series&' + pars;
    },

    workspacesList: function() {
      return serivcesUrl + '/charts/?action=workspaces_list';
    },

    workspace: function(id) {
      return serivcesUrl + '/charts/?action=workspace&id=' + id;
    },

    getSearchUrl: function(text) {
      return serivcesUrl + '/charts/?action=searchMeasure&text=' + text;
    }
  }

  var workspacesPopup = createFullWindownBlackPanelWithCloseAndContent();
  var workspacesPanel = new WorkspacesPanel(urlProvider,
    new SearchPanel(urlProvider));

  installFeatureButton(urlProvider);
  installSideBarButton(workspacesPanel, workspacesPopup);
  installAddSerieToWorkspace(workspacesPopup, workspacesPanel, urlProvider);
});
