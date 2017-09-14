window.PopupService = {
  stack: [],
  createModalPopup: function() {
    var me = this;
    var e = document.createElement('div');
    e.innerHTML = "";
    var jqe = $(e);
    jqe.attr('style', "overflow-y: scroll; position: fixed; left:0; right: 0; top:0; bottom: 0; background: rgba(0,0,0,.8);");
    return {
      element: function() {
        return e;
      },
      show: function() {
        var current = me.stack[0], zindex;
        if(current != undefined) {
          zindex = $(current).attr("z-index") + 1;
        } else {
          zindex = 10000;
        }
        jqe.attr("z-index", zindex);
        document.body.appendChild(e);
        me.stack.push(this);
      },
      hide: function() {
        me.stack.shift();
        document.body.removeChild(e);
      },
    }
  }
};
