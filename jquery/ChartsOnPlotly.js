var ChartDataProvider = function(getUrl) {
  var me = this;

  me.getChartData = function(ids, from, to, callback) {
    Plotly.d3.json(getUrl(ids, from, to), callback);
  }
}

Chart = function(getChartData, opts) {
  var me = this,
    view = document.createElement("div"),
    _to = new Date().getTime(),
    _from = new Date(),
    ids = [];
  if ( opts == undefined )
    opts = {};
  _from.setDate(_from.getDate() -1);
  _from = _from.getTime();
  //$(view).css("padding", '10');
  $(view).addClass("plotly-chart chart");

  var height = function() {
    return opts.height || 200;
  }

  var layout = {
    autosize: true,
    height: height(),
    margin: {l: 80, r: 30, b: 40, t: 20},
    xaxis: {
      type: "date"
    },
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#fafafa'
  };


  me.setIds = function(ids) {
    this.ids = ids;
    var data = ids.map(function(id){ return {x: [], y: [], type: 'scatter'}; });
    Plotly.newPlot(view, data, layout, {showLink: false, displayModeBar: false});
    view.on('plotly_relayout', function(eventdata){
      //console.log("relayout");
      if(me.rangeChanged != undefined)
        var from  = eventdata['xaxis.range[0]'],
          to = eventdata['xaxis.range[1]'];
        if(from || to) {
          from  = new Date(from).getTime();
          to  = new Date(to).getTime();
          me.rangeChanged(from || _from, to || _to);
        }
    });

    me.reload();
  }

  me.reload = function() {
    getChartData(this.ids, _from, _to, function(series) {
      if ( !series )
        return;
      for ( var i = 0, len = series.length; i < len; i++ ) {
        var serie = series[i];
        Plotly.restyle(view, {
          x: [serie.x],
          y: [serie.y],
          name: serie.name,
        }, i);
      }
    });
  };

  $(window).resize(function(){
    me.refresh();
  });

  me.setTitle = function(title) {
    var props = {
      title: title
    };
    if(title != undefined) {
      props['margin'] = { t: 80 };
      props['height'] = height() + 60;
    }
    else {
      props['height'] = height();
    }
    Plotly.relayout(view, props)
  }

  me.setTimeRange = function(from, to) {
    _from = from;
    _to = to;
    Plotly.relayout(view, {
      "xaxis.range": [from, to]
    });
    me.reload();
  };

  me.getTimeRange = function() {
    return [_from, _to];
  }

  me.rangeChanged = me.setTimeRange;

  me.view = function() {
    return view;
  };

  me.refresh = function() {
    Plotly.Plots.resize(view);
  };
}
