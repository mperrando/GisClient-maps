"use strict";

Array.prototype.move = function(from,to) {
  this.splice(to,0,this.splice(from,1)[0]);
  return this;
};

function moveInElement(e, from, to) {
  if ( from == to )
    return;
  if ( from < to )
    return moveInElement(e, to, from);
  var nodes = e.childNodes;
  var append = to == nodes.length;
  var target = nodes[to];
  var moving = e.removeChild(nodes[from]);
  if ( append ) {
    e.appendChild(moving);
  } else {
    e.insertBefore(moving, target);
  }
}

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
  var lastIndex = null;
  var f = function() {
    if(select.options[select.selectedIndex].execute())
      lastIndex = select.selectedIndex;
    else
      select.selectedIndex = lastIndex;
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

function DateFieldJqueruUI() {
  var me = this,
      view = document.createElement('div');
  //view.style="width:250px;height:250px;";
  me.view = view;

  me.set = function(val) {
    $(view).datepicker("setDate", val);
  }

  me.get = function() {
    return $(view).datepicker("getDate");
  }

  me.setOnChange = function(cb) {
    $(view).datepicker().on("change", cb);
  }

  me.setMinDate = function(d) {
    $(view).datepicker("option", "minDate", d);
  }

  me.setMaxDate = function(d) {
    $(view).datepicker("option", "maxDate", d);
  }
}

function DateFieldEasyUI() {
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

  me.setValidator = function(validator) {
    $(view).calendar({validator: validator});
  }
}

function StartEndDatesPanel() {
  var me = this,
      view = document.createElement("div"),
      start = new DateFieldJqueruUI(),
      end = new DateFieldJqueruUI();
  me.maxDate = null;
  me.view = view;
  view.appendChild(new FormLabel("Inizio").view);
  view.appendChild(start.view);
  view.appendChild(new FormLabel("Fine").view);
  view.appendChild(end.view);

  var setRanges = function(){
    var low = start.get();
    if(low)
      end.setMinDate(low);
    if(me.maxDate)
      end.setMinDate(me.maxDate);
    var high = end.get();
    if ( high || me.maxDate)
      start.setMaxDate(new Date(Math.min(high, me.maxDate)));
  };

  start.setOnChange(setRanges);
  end.setOnChange(setRanges);

  me.getStart = function() {
    return start.get();
  }

  me.setStart = function(val) {
    start.set(val);
    setRanges();
  }

  me.getEnd = function() {
    return end.get();
  }

  me.setEnd = function(val) {
    end.set(val);
    setRanges();
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
        to = current[1],
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

    startEnd.maxDate = new Date(); // now
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

  view.style = "margin-bottom: 2px";
  rightToolbarPanel.content.appendChild(chart.view());
  view.appendChild(rightToolbarPanel.view);

  me.toolbar = {
    add: function(text, callback) {
      rightToolbarPanel.setSize(40);
      var link = simpleLink(text, callback);
      var wrap = document.createElement("div");
      wrap.appendChild(link);
      rightToolbarPanel.toolbar.appendChild(wrap);
      return {
        setVisible: function(val) {
          if(val)
            $(link).show();
          else
            $(link).hide();
        }
      };
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
  me.chart = chart;
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
    charts = [],
    syncingRanges;
  var view = document.createElement("div");
  $(view).addClass("chartsPanel");
  me.view = function() {
    return view;
  }

  var rangeChangedOnChart = function(from, to) {
    if(me.rangeChanged != undefined)
      me.rangeChanged(from, to);
  }

  var createToolbar = function(c) {
    var chart = c;
    var calcVisibles = function() {
      var idx = charts.indexOf(chart);
      up.setVisible(idx > 0);
      down.setVisible(idx < charts.length - 1);
    }
    var up = chart.toolbar.add("Su", function() {
      moveUp(chart);
    });
    var down = chart.toolbar.add("Giù", function(){
      moveDown(chart);
    });
    return {
      calcVisibles: calcVisibles,
    }
  }

  var moveDown = function(chart) {
    var idx = charts.indexOf(chart);
    if ( idx == charts.length - 1 )
      return;
    charts.move(idx, idx + 1);
    moveInElement(view, idx, idx + 1);
    eachChartDo(function(c){
      c.moveToolbar.calcVisibles();
    });
    notifyPanelMoved();
  }


  var moveUp = function(chart) {
    var idx = charts.indexOf(chart);
    if ( idx == 0 )
      return;
    charts.move(idx, idx - 1);
    moveInElement(view, idx, idx - 1);
    eachChartDo(function(c){
      c.moveToolbar.calcVisibles();
    });
    notifyPanelMoved();
  }

  var notifyPanelMoved = function() {
    if ( me.onPanelMoved )
      me.onPanelMoved();
  }
  var syncRanges = function(from, to, chart) {
    if(syncingRanges)
      return;
    syncingRanges = true;
    eachChartDo(function(c) {
      if ( c == chart )
        return;
      c.setTimeRange(from, to);
    });
    syncingRanges = false;
  }

  me.addChart = function(ids, name) {
    var chart = new ChartPanel(getUrl);
    chart.setIds(ids);
    charts.push(chart);
    chart.setTitle(name);
    chart.chart.rangeChanged = function(from, to) {
      syncRanges(from, to, chart);
    };
    chart.moveToolbar = createToolbar(chart);
    eachChartDo(function(c){
      c.moveToolbar.calcVisibles();
    });
    chart.rangeChanged = rangeChangedOnChart;
    view.appendChild(chart.view);
    chart.refresh();
  }

  me.clear = function() {
    charts = [];
    emptyContent(view);
  }

  var eachChartDo = function(f) {
    for(var i = 0; i < charts.length; i++) {
      f(charts[i]);
    }
  }

  me.setTimeRange = function(from, to) {
    for(var i = 0; i < charts.length; i++) {
      charts[i].setTimeRange(from, to);
    }
  }

  me.getTimeRange = function() {
    return charts[0].getTimeRange();
  }

  me.onPanelMoved = undefined;
};

function ChartsWorkspace(urlProvider) {
  var me = this;
  var chartsPanel = new ChartsPanel(urlProvider.urlForSerie);
  var view = document.createElement("div"),
    workspaceData = null,
    timeControlBar = new TimeControlBar(chartsPanel.setTimeRange, chartsPanel.getTimeRange),
    dirty = false;

  $(window).bind('beforeunload', function() {
    if ( dirty )
  	  return 'confirm please';
  });

  $(view).addClass("chartsWorkspace");
  //$(view).css("padding", 20);
  view.appendChild(timeControlBar.view());
  view.appendChild(chartsPanel.view());

  chartsPanel.rangeChanged = chartsPanel.setTimeRange;

  chartsPanel.onPanelMoved = function() {
    markDirty();
  };

  me.view = function() {
    return view;
  }

  me.refresh = function() {
    chart.refresh();
  }

  me.addChart = function(ids) {
    chartsPanel.addChart(ids);
  }

  var refreshGraphs = function() {
    chartsPanel.clear();
    var graphs = workspaceData.graphs;
    for(var i = 0; i < graphs.length; i++) {
      chartsPanel.addChart(graphs[i].series, graphs[i].name);
    }
  },
  markDirty = function() {
    dirty = true;
    calcCss();
  },
  calcCss = function() {
    if ( dirty )
      $(view).addClass("dirty")
    else
      $(view).removeClass("dirty")
  },
  confirmLoseData = function() {
    return confirm("Procedendo si perdono i dati non salvati. Procedere?");
  };

  me.load = function(id) {
    if ( dirty && !confirmLoseData() )
      return false;
    $.getJSON(urlProvider.workspace(id), function(data) {
      workspaceData = data;
      dirty = false;
      refreshGraphs();
      if(workspaceData.timeRange != undefined) {
        chartsPanel.setTimeRange(timeRange.from, timeRange.to);
      }
    });
    return true;
  }

  me.clear = function() {
    if ( !dirty )
      return true;
    if ( !confirmLoseData() )
      return false;
    dirty = false;
      return true;
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
      o.execute = function() { return mustChangeWorkspace(id); }
    });
  };

  var mustOpenSearch = function() {
    if(!chartsWorkspace.clear())
      return false;
    emptyContent(workspacePanel);
    workspacePanel.appendChild(searchPanel.view());
    searchPanel.execute();
    return true;
  }

  var mustChangeWorkspace = function(id) {
    if(!chartsWorkspace.load(id))
      return false;
    emptyContent(workspacePanel);
    workspacePanel.appendChild(chartsWorkspace.view());
    return true;
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
      return mustChangeWorkspace(id);
    }
    else {
      alert("Workspace not found: " + id);
      return false;
    }
  }
}

function emptyContent(element) {
  while(element.firstChild)
    element.removeChild(element.firstChild);
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

function FeatureButton(urlProvider) {
  var me = this;
  var measuresPopup = createFullWindownBlackPanelWithCloseAndContent();
  var content = createVerticalScrollPanel()
  measuresPopup.element().appendChild(content);

  var makeWs = function() {
    me.ws = new QuickWorkspace(urlProvider);
    var exts = window.Extensions["FeatureChart.Ready"];
    for(var i = 0; i < exts.length; i++)
      exts[i](measuresPopup, me.ws.chart, function() { return me.serie; });
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

  var getGraphsForFeature = function(id, done) {
    $.getJSON(urlProvider.getSeriesForFeature(id), done);
  }

  var createButton = function(featureType, feature) {
    var id = "asdasd" + feature.id;
    var series = getGraphsForFeature(feature.id, function(series){
      if(series.length == 0) {
        $("#" + id).hide();
      }
    });
    return '<a href="#" id="' + id + '" featureType="' + featureType
      + '" featureId="' + feature.id
      + '" action="graphs">buttunettu</a>';
  };

  var buttonCallback = function(featureType, featureId) {
    emptyContent(content);
    getGraphsForFeature(featureId, function(series) {
      if(series.length == 1)
       openSerieInQuickWorkspace(series[0]);
      else {
        serieChooser.setSeries(series);
        content.appendChild(serieChooser.getView());
      }
    });
    measuresPopup.show();
  }

  window.Extensions["QueryToolbar.Actions"].addAction("graphs",
    createButton, buttonCallback);
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

  var openSerie = function(serie) {
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
  var add = function() {
    doneCallback(me.workspaceId, me.chartId);
  }

  view.appendChild(simpleLink("Aggiungi", add));

  var reloadCharts = function() {
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
      content = new AddSerieToWorkspace(urlProvider, serie, function(workspaceId, chartId) {
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
  var addSerie = function(serie, workspaceId, chartId) {
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
  var servicesUrl = '/gisclient3/services';

  var urlProvider = {
    urlForSerie: function(ids, from, to) {
      var pars = 'ids=' + ids.join(",") + '&from=' + from + '&to=' + to;
      return servicesUrl + '/charts/?action=get_series&' + pars;
    },

    workspacesList: function() {
      return servicesUrl + '/charts/?action=workspaces_list';
    },

    workspace: function(id) {
      return servicesUrl + '/charts/?action=workspace&id=' + id;
    },

    getSearchUrl: function(text) {
      return servicesUrl + '/charts/?action=searchMeasure&text=' + text;
    },

    getSeriesForFeature: function(id) {
      return servicesUrl + '/charts/?action=getSeriesForFeature&featureId=' + id;
    }
  }

  var workspacesPopup = createFullWindownBlackPanelWithCloseAndContent();
  var workspacesPanel = new WorkspacesPanel(urlProvider,
    new SearchPanel(urlProvider));

  new FeatureButton(urlProvider);
  installSideBarButton(workspacesPanel, workspacesPopup);
  installAddSerieToWorkspace(workspacesPopup, workspacesPanel, urlProvider);
});
