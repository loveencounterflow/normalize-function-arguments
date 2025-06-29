(function() {
  'use strict';
  var Template, bind_instance_methods, create_validator, debug, get_instance_methods, gnd, help, hide, nameit, new_pod, pod_prototypes, push_at, rpr, set_at, warn,
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
  create_validator = function(typename, isa) {
    /* TAINT `gnd.nonempty_text.validate typename` */
    /* TAINT `gnd.function.validate isa` */
    /* TAINT silently accepts truthy, falsy values returned by `isa()`, not only booleans */
    return function(x) {
      if (isa(x)) {
        return x;
      }
      throw new TypeError(`Ωnfa___1 validation error: expected a ${typename} got ${rpr(x)}`);
    };
  };

  //===========================================================================================================
  gnd = (function() {
    var R, type, typename;
    R = {
      // boolean:        isa:  ( x ) -> ( x is true ) or ( x is false )
      //.......................................................................................................
      function: {
        isa: function(x) {
          return (Object.prototype.toString.call(x)) === '[object Function]';
        }
      },
      //.......................................................................................................
      template: {
        isa: function(x) {
          return x instanceof Template;
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
        isa: function(x) {
          if (!gnd.pod.isa(x)) {
            return false;
          }
          if (!gnd.template.isa_optional(x.template)) {
            return false;
          }
          if (!gnd.function.isa_optional(x.isa)) {
            return false;
          }
          if (!gnd.function.isa_optional(x.validate)) {
            return false;
          }
          // return false unless gnd.function.isa_optional x.type
          return true;
        },
        template: {
          template: null,
          isa: null,
          validate: null,
          type: null
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

  (() => {    /* TAINT this is more or less `ClearType.Type::create()` */
    var results, type, typename;
    results = [];
    for (typename in gnd) {
      type = gnd[typename];
      results.push((function(typename, type) {
        if (type.template != null) {
          type.template = new Template(type.template);
        }
        if (type.isa != null) {
          if (type.isa_optional == null) {
            type.isa_optional = function(x) {
              return (x == null) || (type.isa(x));
            };
          }
          if (type.validate == null) {
            type.validate = create_validator(type.name, function(x) {
              return type.isa(x);
            });
          }
        }
        return null;
      })(typename, type));
    }
    return results;
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
      throw new Error(`Ωnfa___7 expected negative number, got ${rpr(idx)}`);
    }
    list.splice(Math.max(list.length + idx, 0), 0, x);
    return list;
  };

  // #-----------------------------------------------------------------------------------------------------------
  // pop_at = ( list, idx, x ) ->
  //   unless idx < 0
  //     throw new Error "Ωnfa___8 expected negative number, got #{rpr idx}"
  //   unless list.length >= Math.abs idx
  //     throw new Error "Ωnfa___9 list too short, got index #{idx} for length of #{list.length}"
  //   return ( list.splice idx, 1 )[ 0 ]

  //-----------------------------------------------------------------------------------------------------------
  set_at = function(list, idx, x) {
    if (!(idx < 0)) {
      throw new Error(`Ωnfa__10 expected negative number, got ${rpr(idx)}`);
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
  // pop_at
  module.exports = {Template, gnd, create_validator, hide, nameit, bind_instance_methods, push_at, set_at, debug, help, warn, rpr};

}).call(this);

//# sourceMappingURL=helpers.js.map