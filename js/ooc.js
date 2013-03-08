/*!
 * Object Oriented Canvas (ooc)
 *  plugin for jQuery JavaScript Library
 * http://ooc.stremblay.com/
 *
 * Copyright 2013 Sébastien Tremblay
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-03-03
 */

/*
Development notes:

  All class being either container, content or both should extends either:
    - Content - Only Content (i.e.: Rectangle, Ellipse, Poly)
    - Container - Only Container (i.e.: Canvas, Group)
    - Contentainer - Both Content and Container (i.e. Viewport)

*/

(function($, undefined){
  var coreName = "ooc";
  var core;

  core = $.fn[coreName] = function(p1, p2) {
    // Method calling logic
    if (typeof p1 === "function") {
      //execHandler without selector
      return core.fn.exec.apply(this, "canvas", p1);
    } else if (typeof p2 === "function") {
      //execHandler with selector
      return core.fn.exec.apply(this, p1, p2);
    } else if (core.fn[p1]) {
      //existing method without selector with/without arguments
      return core.fn[p1].apply(this, Array.prototype.splice.call(arguments, 0, 1, "canvas"));
    } else if (core.fn[p2]) {
      //existing method with selector with/without arguments
      return core.fn[p2].apply(this, Array.prototype.splice.call(arguments, 1, 1));
    } else if (arguments.length === 0) {
      //No argument specified, using default "load" method
      return core.fn.load.apply(this, "canvas");
    } else {
      //Unsupported syntax
      $.error('Method ' +  p1 + ' does not exist on jQuery.' + coreName);
    }
  };
  
  var isCanvas = function(dom) {
    return (dom.tagName === "CANVAS");
  };
  
  //Define utilities
  core.util = {
    trim: function (s) {
      return s.replace(/^\s*/,"").replace(/\s*$/,"");
    },
    getCanvas: function (o) {
      while (o && !(o instanceof core.classes.canvas)) {
        o = o.parent;
      }
      return o;
    }
  };

  //Inner classes
  var inner = {};
  
  inner.lib = function() {
    this.d = {};
  };
  inner.lib.prototype = {
    add: function (type, id, data) {
      if (!this.d[type]) {
        this.d[type] = {};
      }
      
      this.d[type][id] = data;
    },
    get: function (type, id) {
      if (!this.d[type]) {
        return undefined;
      }
      else {
        return this.d[type][id];
      }
    }
  };
  inner.unit = function(p) {
    this.parse(p);
  };
  inner.unit.prototype = {
    parse: function (p) {
      if (typeof p === "number") {
        this.val = Math.floor(p);
        this.unit = "px";
      }
      if (typeof p === "string") {
        var ptrim = core.util.trim(p);
        
        //Look for some units
        if ((/^\d+(px)?$/i).test(ptrim)) {
          //no unit defaults to px
          this.val = parseInt(ptrim.replace(/px/i,""), 10);
          this.unit = "px";
        }
        else if ((/^\d+(.\d*)?%$/).test(ptrim)) {
          this.val = parseFloat(ptrim.replace(/%/,""));
          this.unit = "%";
        }
        else if ((/^\d+(.\d*)?in$/i).test(ptrim)) {
          this.val = parseFloat(ptrim.replace(/in/i,""));
          this.unit = "in";
        }
        else {
          delete this.val;
          delete this.unit;
        }
      }
      else if (typeof p === "object") {
        if (typeof p.val === "string") {
          parse(p.val);
        }
        else if (typeof p.val === "number") {
          this.unit = p.unit;
          if (this.validateUnit()) {
            this.val = p.val;
            
            if (this.unit == "px") {
              this.val = Math.floor(this.val);
            }
          }
        }
      }
    },
    toPx: function(size) {
      if (this._.unit == "px") {
        return this._.val;
      }
      else if (this._.unit == "%") {
        return Math.floor(this._.val / 100 * size);
      }
      else if (this._.unit == "in") {
        // 72 DPI assumed
        return Math.floor(this._.val * 72);
      }
      else {
        return undefined;
      }
    },
    validateUnit: function() {
      if (this.unit === undefined || this.unit === null) {
        //Default unit to px
        this.unit = "px";
        return true;
      }
      else if (this.unit === "px" || this.unit === "%" || this.unit === "in") {
        return true;
      }
      else {
        delete this.unit;
        return false;
      }
    }
  };

  /*var implement_class = function(c, obj, subobj) {
    for (prop in c.prototype) {
      if (typeof c.prototype[prop] === "function" && c.prototype.hasOwnProperty("prop")) {
        obj[prop] = function () {
          c.prototype[prop].apply(subobj, arguments);
        };
      }
    }
  }*/

  //Define supported obects classes
  core.classes = {};
  
  core.classes.pos = function(p1, p2) {
    this.parse(p1, p2);
  };
  core.classes.pos.prototype = {
    parse: function(p1, p2) {
      //If p2 is supplied, p1 is x and p2 is y
      if (p2) {
        this.x = new inner.unit(p1);
        this.y = new inner.unit(p2);
      }
      else if (p1) {
        if (typeof p1 === "string") {
          var p = core.util.trim(p1).split(" ");
          
          if (p.length == 2) {
            this.x = new inner.unit(p[0]);
            this.y = new inner.unit(p[1]);
          }
        }
        else if (typeof p1 == "object") {
          if (p1.x && p1.y) {
            this.x = new inner.unit(p1.x);
            this.y = new inner.unit(p1.y);
          }
        }  
      }
    },
    toPx: function(size) {
      return {
        x: this.x.toPx(size.w),
        y: this.y.toPx(size.h),
      };
    }
  };

  core.classes.size = function(p1, p2) {
    this.parse(p1, p2);
  };
  core.classes.size.prototype = {
    parse: function(p1, p2) {
      //If p2 is supplied, p1 is width and p2 is height
      if (p2) {
        this.w = new inner.unit(p1);
        this.h = new inner.unit(p2);
      }
      else if (p1) {
        if (typeof p1 === "string") {
          var p = core.util.trim(p1).split(" ");
          
          if (p.length == 2) {
            this.w = new inner.unit(p[0]);
            this.h = new inner.unit(p[1]);
          }
        }
        else if (typeof p1 == "object") {
          var w;
          if (p1.width) w = p1.width;
          else if (p1.w) w = p1.w;

          var h;
          if (p1.height) h = p1.height;
          else if (p1.h) h = p1.h;

          if (w !== undefined && h != undefined) {
            this.w = new inner.unit(w);
            this.h = new inner.unit(h);
          }
        }  
      }
    },
    toPx: function(size) {
      return {
        w: this.w.toPx(size.w),
        h: this.h.toPx(size.h),
      };
    }
  };
  
  core.classes.viewport = function(x, y, w, h) {
    this._pos = new core.classes.pos(x, y);
    this._size = new core.classes.size(w, h);
    
    this.content = [];
  };
  core.classes.viewport.prototype = {
    add: function() {
      var obj;
      if (arguments.length == 1) {
        if (arguments[0] instanceof Array) {
          for (var i = 0; i <  arguments[0].length; i++) {
            this.add (arguments[0][i]);
          }
        }
        if (typeof arguments[0] === "string") {
          var p = core.util.trim(arguments[0]).split("#");
          //Si un seul keyword et que le keyword est un nametag
          if (p.length == 1 && (/^\s*#/).test(arguments[0]) ) {
            //definie le type par défaut
            p.unshift("drawing");  // VERIFIER SI ON GARDE CE TYPE OU PAS
          }
          
          if (p.length == 2) {
            obj = core.util.getCore(this)._lib.get(p[0], p[1]);
          }
        }
        else if (typeof arguments[0] === "object") {
          obj = arguments[0];
        }
      }
      
      if (obj && obj.type === "drawing") {
        this.content.push (obj);
      }
    }
  };

  //Main core object definition
  core.classes.canvas = function($jq) {
    this.$ = $jq;
    this._ctx = $jq[0].getContext("2d");
    
    this.def_vp = new core.classes.viewport(0, 0, "100%", "100%");
    
    //Init obj library
    this._lib = new inner.lib();
  }
  core.classes.canvas.prototype = {
    width: function() {
      return this.$.width();
    },
    
    height: function() {
      return this.$.height();
    },
    
    hasCtx: function() {
      return !!this._ctx;
    }
  }
  
  //Supported functions
  core.fn = {};
  
  core.fn.exec = function(fn) {
    return this.each(function () {
      if (typeof fn === "function") {
        var $this = $(this);
        //Load or create new Canvas instance
        var thiscore = $this.data(coreName) || {obj: new core.classes.canvas($this)};
  
        if (thiscore.obj.hasCtx()) {
          fn.apply (thiscore.obj, Array.prototype.slice.call(arguments, 1));
        }
        $this.data(coreName, thiscore);
      }
    });
  };

  core.fn.load = function(options) {
    return this.each(function () {
      var $this = $(this);
      //Load or create new Core instance
      var thiscore = $this.data(coreName) || new core.classes.canvas($this);

      //Perform load here
      
      $this.data(coreName, thiscore);
    });
  };
  
  /*core.load.group = defaultload;
  core.load.rect = defaultload;
  core.load.poly = defaultload;
  core.load.line = defaultload;
  core.load.move = defaultload;
  core.load.softjoint = defaultload;*/

})(jQuery);
