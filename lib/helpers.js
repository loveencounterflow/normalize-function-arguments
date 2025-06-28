(function() {
  'use strict';
  var Template, bind_instance_methods, debug, get_instance_methods, gnd, help, hide, nameit, new_pod, pod_prototypes, pop_at, push_at, rpr, set_at, warn,
    indexOf = [].indexOf;

  //===========================================================================================================
  // optional                  = Symbol 'optional'
  pod_prototypes = Object.freeze([null, Object.getPrototypeOf({})]);

  // new_pod                   = -> {}
  new_pod = function() {
    return Object.create(null);
  };

  // #===========================================================================================================
  // @bind_proto = ( that, f ) -> that::[ f.name ] = f.bind that::

    //===========================================================================================================
  Template = class Template {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg = null) {
      var descriptor, name, ref;
      ref = Object.getOwnPropertyDescriptors(cfg != null ? cfg : {});
      for (name in ref) {
        descriptor = ref[name];
        descriptor = (function() {
          switch (true) {
            //...................................................................................................
            case gnd.function.isa(descriptor.value):
              return ((descriptor) => {
                var configurable, get;
                ({
                  configurable,
                  value: get
                } = descriptor);
                return {
                  enumerable: true,
                  configurable,
                  get
                };
              })(descriptor);
            //...................................................................................................
            case gnd.pod.isa(descriptor.value):
              return ((descriptor) => {
                var configurable, get, value;
                ({configurable, value} = descriptor);
                get = function() {
                  return new Template(value);
                };
                return {
                  enumerable: true,
                  configurable,
                  get
                };
              })(descriptor);
            default:
              //...................................................................................................
              return descriptor;
          }
        }).call(this);
        //.....................................................................................................
        Object.defineProperty(this, name, descriptor);
      }
      return void 0;
    }

  };

  //===========================================================================================================
  gnd = (function() {
    var R, type, typename;
    R = {
      // anything:       isa:  ( x ) -> true
      // primitive:      isa:  ( x ) -> primitive_types.includes type_of x
      // #.........................................................................................................
      // ### NOTE types 'simple' and 'compound' more or less boil down to x being a POD, their explicit definition
      // are for clarity and to allow for later modification ###
      // simple:         isa:  ( x ) -> ( not x? ) or ( not gnd.compound.isa x )
      // compound:       isa:  ( x ) -> gnd.pod.isa x
      // boolean:        isa:  ( x ) -> ( x is true ) or ( x is false )
      //.......................................................................................................
      function: {
        isa: function(x) {
          return (Object.prototype.toString.call(x)) === '[object Function]';
        }
      },
      //.......................................................................................................
      pod: {
        isa: function(x) {
          var ref;
          return (x != null) && (ref = Object.getPrototypeOf(x), indexOf.call(pod_prototypes, ref) >= 0);
        },
        create: function(...Q) {
          return Object.assign(new_pod(), ...Q);
        }
      },
      //.......................................................................................................
      nfa_cfg: {
        template: {
          template: null
        }
      }
    };
//.........................................................................................................
    for (typename in R) {
      type = R[typename];
      type.name = typename;
    }
    // type.validate = ( x ) -> ...
    //.........................................................................................................
    return R;
  })();

  (() => {
    var type, typename;
    for (typename in gnd) {
      type = gnd[typename];
      if (type.template != null) {
        type.template = new Template(type.template);
      }
    }
    return null;
  })();

  //===========================================================================================================
  hide = (object, name, value) => {
    return Object.defineProperty(object, name, {
      enumerable: false,
      writable: true,
      configurable: true,
      value: value
    });
  };

  //===========================================================================================================
  nameit = function(name, f) {
    Object.defineProperty(f, 'name', {
      value: name
    });
    return f;
  };

  //===========================================================================================================
  get_instance_methods = function(instance) {
    var R, key, method, ref;
    R = {};
    ref = Object.getOwnPropertyDescriptors(instance);
    for (key in ref) {
      ({
        value: method
      } = ref[key]);
      if (key === 'constructor') {
        continue;
      }
      if (!gnd.function.isa(method)) {
        continue;
      }
      R[key] = method;
    }
    return R;
  };

  //===========================================================================================================
  bind_instance_methods = function(instance, keep_name = true) {
    var key, method, ref;
    ref = get_instance_methods(Object.getPrototypeOf(instance));
    for (key in ref) {
      method = ref[key];
      if (keep_name) {
        hide(instance, key, nameit(method.name, method.bind(instance)));
      } else {
        hide(instance, key, method.bind(instance));
      }
    }
    return null;
  };

  //===========================================================================================================
  push_at = function(list, idx, x) {
    if (!(idx < 0)) {
      throw new Error(`Ωnfa___1 expected negative number, got ${rpr(idx)}`);
    }
    list.splice(Math.max(list.length + idx, 0), 0, x);
    return list;
  };

  //-----------------------------------------------------------------------------------------------------------
  pop_at = function(list, idx, x) {
    if (!(idx < 0)) {
      throw new Error(`Ωnfa___2 expected negative number, got ${rpr(idx)}`);
    }
    if (!(list.length >= Math.abs(idx))) {
      throw new Error(`Ωnfa___3 list too short, got index ${idx} for length of ${list.length}`);
    }
    return (list.splice(idx, 1))[0];
  };

  //-----------------------------------------------------------------------------------------------------------
  set_at = function(list, idx, x) {
    if (!(idx < 0)) {
      throw new Error(`Ωnfa___4 expected negative number, got ${rpr(idx)}`);
    }
    list[list.length + idx] = x;
    return x;
  };

  //===========================================================================================================
  debug = console.debug;

  help = console.help;

  warn = console.warn;

  rpr = function(x) {
    return (require('loupe')).inspect(x);
  };

  //===========================================================================================================
  // get_instance_methods
  module.exports = {Template, gnd, hide, nameit, bind_instance_methods, push_at, pop_at, set_at, debug, help, warn, rpr};

}).call(this);

//# sourceMappingURL=helpers.js.map