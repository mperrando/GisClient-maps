Chart = function(getUrl, ids, opts) {
  var me = this,
    view = document.createElement("div"),
    _to = new Date().getTime(),
    _from = new Date(),
    ids = ids;
  if(opts==undefined)
    opts = {}
  _from.setDate(_from.getDate() -1);
  _from = _from.getTime();
  //$(view).css("padding", '10');
  $(view).addClass("plotly-chart chart");

  var layout = {
    autosize: true,
    height: opts.height || 200,
    margin: {l: 80, r: 30, b: 40, t: 20},
    xaxis: {
      type: "date"
    },
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#fafafa'
  };

  var data = ids.map(function(id){ return {x: [], y: [], type: 'scatter'}; });

  me.url = function() {
    return getUrl(ids, _from, _to);
  };

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

  me.reload = function() {
    Plotly.d3.json(me.url(), function(series) {
      if ( !series )
        reutrn;
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

  me.reload();
}
