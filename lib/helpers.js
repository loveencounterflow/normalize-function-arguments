(function() {
  'use strict';
  var bind_instance_methods, debug, get_instance_methods, gnd, help, hide, nameit, new_pod, pod_prototypes, rpr, warn,
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
      // #.........................................................................................................
      // boolean:        isa:  ( x ) -> ( x is true ) or ( x is false )
      function: {
        isa: function(x) {
          return (Object.prototype.toString.call(x)) === '[object Function]';
        }
      },
      pod: {
        isa: function(x) {
          var ref;
          return (x != null) && (ref = Object.getPrototypeOf(x), indexOf.call(pod_prototypes, ref) >= 0);
        },
        create: function(Q = null) {
          return Object.assign(new_pod(), Q);
        }
      }
    };
    for (typename in R) {
      type = R[typename];
      type.name = typename;
    }
    return R;
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
  debug = console.debug;

  help = console.help;

  warn = console.warn;

  rpr = function(x) {
    return (require('loupe')).inspect(x);
  };

  //===========================================================================================================
  // get_instance_methods
  module.exports = {gnd, hide, nameit, bind_instance_methods, debug, help, warn, rpr};

}).call(this);

//# sourceMappingURL=helpers.js.map