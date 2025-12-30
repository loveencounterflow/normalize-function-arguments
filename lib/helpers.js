(function() {
  'use strict';
  var SFMODULES, Template, bind_instance_methods, create_validator, debug, get_instance_methods, gnd, help, hide, nameit, new_pod, pod_prototypes, push_at, rpr, set_at, type_of, warn,
    indexOf = [].indexOf;

  //===========================================================================================================
  // optional                  = Symbol 'optional'
  pod_prototypes = Object.freeze([null, Object.getPrototypeOf({})]);

  // new_pod                   = -> {}
  new_pod = function() {
    return Object.create(null);
  };

  SFMODULES = require('bricabrac-sfmodules');

  ({type_of} = SFMODULES.unstable.require_type_of());

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
      throw new TypeError(`Ωnfah___1 validation error: expected a ${typename}, got a ${type_of(x)} (${rpr(x)})`);
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
      asyncfunction: {
        isa: function(x) {
          return (Object.prototype.toString.call(x)) === '[object AsyncFunction]';
        }
      },
      //.......................................................................................................
      generatorfunction: {
        isa: function(x) {
          return (Object.prototype.toString.call(x)) === '[object GeneratorFunction]';
        }
      },
      //.......................................................................................................
      callable: {
        isa: function(x) {
          var ref;
          return (ref = Object.prototype.toString.call(x)) === '[object Function]' || ref === '[object AsyncFunction]' || ref === '[object GeneratorFunction]';
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
      throw new Error(`Ωnfah___2 expected negative number, got a ${type_of(idx)} (${rpr(idx)})`);
    }
    list.splice(Math.max(list.length + idx, 0), 0, x);
    return list;
  };

  // #-----------------------------------------------------------------------------------------------------------
  // pop_at = ( list, idx, x ) ->
  //   unless idx < 0
  //     throw new Error "Ωnfah___3 expected negative number, got a #{type_of idx} (#{rpr idx})"
  //   unless list.length >= Math.abs idx
  //     throw new Error "Ωnfah___4 list too short, got index #{idx} for length of #{list.length}"
  //   return ( list.splice idx, 1 )[ 0 ]

  //-----------------------------------------------------------------------------------------------------------
  set_at = function(list, idx, x) {
    if (!(idx < 0)) {
      throw new Error(`Ωnfah___5 expected negative number, got a ${type_of(idx)} (${rpr(idx)})`);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2hlbHBlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQUE7QUFBQSxNQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEscUJBQUEsRUFBQSxnQkFBQSxFQUFBLEtBQUEsRUFBQSxvQkFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsY0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxJQUFBO0lBQUEsb0JBQUE7Ozs7RUFJQSxjQUFBLEdBQTRCLE1BQU0sQ0FBQyxNQUFQLENBQWMsQ0FBRSxJQUFGLEVBQVUsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsQ0FBQSxDQUF0QixDQUFWLENBQWQsRUFKNUI7OztFQU1BLE9BQUEsR0FBNEIsUUFBQSxDQUFBLENBQUE7V0FBRyxNQUFNLENBQUMsTUFBUCxDQUFjLElBQWQ7RUFBSDs7RUFDNUIsU0FBQSxHQUE0QixPQUFBLENBQVEscUJBQVI7O0VBQzVCLENBQUEsQ0FBRSxPQUFGLENBQUEsR0FBNEIsU0FBUyxDQUFDLFFBQVEsQ0FBQyxlQUFuQixDQUFBLENBQTVCLEVBUkE7Ozs7OztFQWNNLFdBQU4sTUFBQSxTQUFBLENBQUE7O0lBR0UsV0FBYSxDQUFFLE1BQU0sSUFBUixDQUFBO0FBQ2YsVUFBQSxVQUFBLEVBQUEsSUFBQSxFQUFBO0FBQUk7TUFBQSxLQUFBLFdBQUE7O1FBQ0UsVUFBQTtBQUFhLGtCQUFPLElBQVA7O0FBQUEsaUJBRU4sR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFiLENBQWlCLFVBQVUsQ0FBQyxLQUE1QixDQUZNO3FCQUV1QyxDQUFBLENBQUUsVUFBRixDQUFBLEdBQUE7QUFDMUQsb0JBQUEsWUFBQSxFQUFBO2dCQUFVLENBQUE7a0JBQUUsWUFBRjtrQkFBZ0IsS0FBQSxFQUFPO2dCQUF2QixDQUFBLEdBQWdDLFVBQWhDO0FBQ0Es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LENBQUksR0FBSixDQUE3RCxDQUFBLENBQUEsQ0FBVixFQURSOztJQUVBLElBQUksQ0FBRSxJQUFJLENBQUMsTUFBTCxHQUFjLEdBQWhCLENBQUosR0FBNEI7QUFDNUIsV0FBTztFQUpBLEVBaEpUOzs7RUF3SkEsS0FBQSxHQUFVLE9BQU8sQ0FBQzs7RUFDbEIsSUFBQSxHQUFVLE9BQU8sQ0FBQzs7RUFDbEIsSUFBQSxHQUFVLE9BQU8sQ0FBQzs7RUFDbEIsR0FBQSxHQUFVLFFBQUEsQ0FBRSxDQUFGLENBQUE7V0FBUyxDQUFFLE9BQUEsQ0FBUSxPQUFSLENBQUYsQ0FBbUIsQ0FBQyxPQUFwQixDQUE0QixDQUE1QjtFQUFULEVBM0pWOzs7OztFQThKQSxNQUFNLENBQUMsT0FBUCxHQUFpQixDQUNmLFFBRGUsRUFFZixHQUZlLEVBR2YsZ0JBSGUsRUFJZixJQUplLEVBS2YsTUFMZSxFQU9mLHFCQVBlLEVBUWYsT0FSZSxFQVVmLE1BVmUsRUFXZixLQVhlLEVBWWYsSUFaZSxFQWFmLElBYmUsRUFjZixHQWRlO0FBOUpqQiIsInNvdXJjZXNDb250ZW50IjpbIlxuJ3VzZSBzdHJpY3QnXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBvcHRpb25hbCAgICAgICAgICAgICAgICAgID0gU3ltYm9sICdvcHRpb25hbCdcbnBvZF9wcm90b3R5cGVzICAgICAgICAgICAgPSBPYmplY3QuZnJlZXplIFsgbnVsbCwgKCBPYmplY3QuZ2V0UHJvdG90eXBlT2Yge30gKSwgXVxuIyBuZXdfcG9kICAgICAgICAgICAgICAgICAgID0gLT4ge31cbm5ld19wb2QgICAgICAgICAgICAgICAgICAgPSAtPiBPYmplY3QuY3JlYXRlIG51bGxcblNGTU9EVUxFUyAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdicmljYWJyYWMtc2Ztb2R1bGVzJ1xueyB0eXBlX29mLCAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX3R5cGVfb2YoKVxuXG4jICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBAYmluZF9wcm90byA9ICggdGhhdCwgZiApIC0+IHRoYXQ6OlsgZi5uYW1lIF0gPSBmLmJpbmQgdGhhdDo6XG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVGVtcGxhdGVcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAoIGNmZyA9IG51bGwgKSAtPlxuICAgIGZvciBuYW1lLCBkZXNjcmlwdG9yIG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzIGNmZyA/IHt9XG4gICAgICBkZXNjcmlwdG9yID0gc3dpdGNoIHRydWVcbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICB3aGVuIGduZC5mdW5jdGlvbi5pc2EgZGVzY3JpcHRvci52YWx1ZSAgICB0aGVuIGRvICggZGVzY3JpcHRvciApID0+XG4gICAgICAgICAgeyBjb25maWd1cmFibGUsIHZhbHVlOiBnZXQsIH0gPSBkZXNjcmlwdG9yXG4gICAgICAgICAgcmV0dXJuIHsgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlLCBnZXQsIH1cbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICB3aGVuIGduZC5wb2QuaXNhICAgICAgZGVzY3JpcHRvci52YWx1ZSAgICB0aGVuIGRvICggZGVzY3JpcHRvciApID0+XG4gICAgICAgICAgeyBjb25maWd1cmFibGUsIHZhbHVlLCB9ID0gZGVzY3JpcHRvclxuICAgICAgICAgIGdldCA9IC0+IG5ldyBUZW1wbGF0ZSB2YWx1ZVxuICAgICAgICAgIHJldHVybiB7IGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZSwgZ2V0LCB9XG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgZWxzZVxuICAgICAgICAgIGRlc2NyaXB0b3JcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEAsIG5hbWUsIGRlc2NyaXB0b3JcbiAgICByZXR1cm4gdW5kZWZpbmVkXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jcmVhdGVfdmFsaWRhdG9yID0gKCB0eXBlbmFtZSwgaXNhICkgLT5cbiAgIyMjIFRBSU5UIGBnbmQubm9uZW1wdHlfdGV4dC52YWxpZGF0ZSB0eXBlbmFtZWAgIyMjXG4gICMjIyBUQUlOVCBgZ25kLmZ1bmN0aW9uLnZhbGlkYXRlIGlzYWAgIyMjXG4gICMjIyBUQUlOVCBzaWxlbnRseSBhY2NlcHRzIHRydXRoeSwgZmFsc3kgdmFsdWVzIHJldHVybmVkIGJ5IGBpc2EoKWAsIG5vdCBvbmx5IGJvb2xlYW5zICMjI1xuICByZXR1cm4gKCB4ICkgLT5cbiAgICByZXR1cm4geCBpZiBpc2EgeFxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IgXCLOqW5mYWhfX18xIHZhbGlkYXRpb24gZXJyb3I6IGV4cGVjdGVkIGEgI3t0eXBlbmFtZX0sIGdvdCBhICN7dHlwZV9vZiB4fSAoI3tycHIgeH0pXCJcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmduZCA9IGRvIC0+XG4gIFIgPVxuICAgICMgYm9vbGVhbjogICAgICAgIGlzYTogICggeCApIC0+ICggeCBpcyB0cnVlICkgb3IgKCB4IGlzIGZhbHNlIClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGZ1bmN0aW9uOlxuICAgICAgaXNhOiAgKCB4ICkgLT4gKCBPYmplY3Q6OnRvU3RyaW5nLmNhbGwgeCApIGlzICdbb2JqZWN0IEZ1bmN0aW9uXSdcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGFzeW5jZnVuY3Rpb246XG4gICAgICBpc2E6ICAoIHggKSAtPiAoIE9iamVjdDo6dG9TdHJpbmcuY2FsbCB4ICkgaXMgJ1tvYmplY3QgQXN5bmNGdW5jdGlvbl0nXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBnZW5lcmF0b3JmdW5jdGlvbjpcbiAgICAgIGlzYTogICggeCApIC0+ICggT2JqZWN0Ojp0b1N0cmluZy5jYWxsIHggKSBpcyAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBjYWxsYWJsZTpcbiAgICAgIGlzYTogICggeCApIC0+ICggT2JqZWN0Ojp0b1N0cmluZy5jYWxsIHggKSBpbiBbICdbb2JqZWN0IEZ1bmN0aW9uXScsICdbb2JqZWN0IEFzeW5jRnVuY3Rpb25dJywgJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJywgXVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgdGVtcGxhdGU6XG4gICAgICBpc2E6ICAgICggeCApIC0+IHggaW5zdGFuY2VvZiBUZW1wbGF0ZVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcG9kOlxuICAgICAgaXNhOiAgICAoIHggKSAtPiB4PyBhbmQgKCBPYmplY3QuZ2V0UHJvdG90eXBlT2YgeCApIGluIHBvZF9wcm90b3R5cGVzXG4gICAgICBjcmVhdGU6ICggUS4uLiApIC0+IE9iamVjdC5hc3NpZ24gbmV3X3BvZCgpLCBRLi4uXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBuZmFfY2ZnOlxuICAgICAgaXNhOiAoIHggKSAtPlxuICAgICAgICByZXR1cm4gZmFsc2UgdW5sZXNzIGduZC5wb2QuaXNhIHhcbiAgICAgICAgcmV0dXJuIGZhbHNlIHVubGVzcyBnbmQudGVtcGxhdGUuaXNhX29wdGlvbmFsIHgudGVtcGxhdGVcbiAgICAgICAgcmV0dXJuIGZhbHNlIHVubGVzcyBnbmQuZnVuY3Rpb24uaXNhX29wdGlvbmFsIHguaXNhXG4gICAgICAgIHJldHVybiBmYWxzZSB1bmxlc3MgZ25kLmZ1bmN0aW9uLmlzYV9vcHRpb25hbCB4LnZhbGlkYXRlXG4gICAgICAgICMgcmV0dXJuIGZhbHNlIHVubGVzcyBnbmQuZnVuY3Rpb24uaXNhX29wdGlvbmFsIHgudHlwZVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgdGVtcGxhdGU6XG4gICAgICAgIHRlbXBsYXRlOiBudWxsXG4gICAgICAgIGlzYTogICAgICBudWxsXG4gICAgICAgIHZhbGlkYXRlOiBudWxsXG4gICAgICAgIHR5cGU6ICAgICBudWxsXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZm9yIHR5cGVuYW1lLCB0eXBlIG9mIFJcbiAgICB0eXBlLm5hbWUgICAgID0gdHlwZW5hbWVcbiAgICAjIHR5cGUudmFsaWRhdGUgPSAoIHggKSAtPiAuLi5cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gUlxuIyMjIFRBSU5UIHRoaXMgaXMgbW9yZSBvciBsZXNzIGBDbGVhclR5cGUuVHlwZTo6Y3JlYXRlKClgICMjI1xuZG8gPT4gZm9yIHR5cGVuYW1lLCB0eXBlIG9mIGduZCB0aGVuIGRvICggdHlwZW5hbWUsIHR5cGUgKSAtPlxuICBpZiB0eXBlLnRlbXBsYXRlPyB0aGVuIHR5cGUudGVtcGxhdGUgPSAoIG5ldyBUZW1wbGF0ZSB0eXBlLnRlbXBsYXRlIClcbiAgaWYgdHlwZS5pc2E/XG4gICAgdW5sZXNzIHR5cGUuaXNhX29wdGlvbmFsPyB0aGVuIHR5cGUuaXNhX29wdGlvbmFsICA9ICggeCApIC0+ICggbm90IHg/ICkgb3IgKCB0eXBlLmlzYSB4IClcbiAgICB1bmxlc3MgdHlwZS52YWxpZGF0ZT8gICAgIHRoZW4gdHlwZS52YWxpZGF0ZSAgICAgID0gY3JlYXRlX3ZhbGlkYXRvciB0eXBlLm5hbWUsICggeCApIC0+IHR5cGUuaXNhIHhcbiAgcmV0dXJuIG51bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmhpZGUgPSAoIG9iamVjdCwgbmFtZSwgdmFsdWUgKSA9PiBPYmplY3QuZGVmaW5lUHJvcGVydHkgb2JqZWN0LCBuYW1lLFxuICAgIGVudW1lcmFibGU6ICAgZmFsc2VcbiAgICB3cml0YWJsZTogICAgIHRydWVcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB2YWx1ZTogICAgICAgIHZhbHVlXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxubmFtZWl0ID0gKCBuYW1lLCBmICkgLT4gT2JqZWN0LmRlZmluZVByb3BlcnR5IGYsICduYW1lJywgeyB2YWx1ZTogbmFtZSwgfTsgZlxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmdldF9pbnN0YW5jZV9tZXRob2RzID0gKCBpbnN0YW5jZSApIC0+XG4gIFIgICAgICAgICAgICAgPSB7fVxuICBmb3Iga2V5LCB7IHZhbHVlOiBtZXRob2QsIH0gb2YgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMgaW5zdGFuY2VcbiAgICBjb250aW51ZSBpZiBrZXkgaXMgJ2NvbnN0cnVjdG9yJ1xuICAgIGNvbnRpbnVlIHVubGVzcyBnbmQuZnVuY3Rpb24uaXNhIG1ldGhvZFxuICAgIFJbIGtleSBdID0gbWV0aG9kXG4gIHJldHVybiBSXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuYmluZF9pbnN0YW5jZV9tZXRob2RzID0gKCBpbnN0YW5jZSwga2VlcF9uYW1lID0gdHJ1ZSApIC0+XG4gIGZvciBrZXksIG1ldGhvZCBvZiBnZXRfaW5zdGFuY2VfbWV0aG9kcyBPYmplY3QuZ2V0UHJvdG90eXBlT2YgaW5zdGFuY2VcbiAgICBpZiBrZWVwX25hbWVcbiAgICAgIGhpZGUgaW5zdGFuY2UsIGtleSwgbmFtZWl0IG1ldGhvZC5uYW1lLCBtZXRob2QuYmluZCBpbnN0YW5jZVxuICAgIGVsc2VcbiAgICAgIGhpZGUgaW5zdGFuY2UsIGtleSwgbWV0aG9kLmJpbmQgaW5zdGFuY2VcbiAgcmV0dXJuIG51bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbnB1c2hfYXQgPSAoIGxpc3QsIGlkeCwgeCApIC0+XG4gIHVubGVzcyBpZHggPCAwXG4gICAgdGhyb3cgbmV3IEVycm9yIFwizqluZmFoX19fMiBleHBlY3RlZCBuZWdhdGl2ZSBudW1iZXIsIGdvdCBhICN7dHlwZV9vZiBpZHh9ICgje3JwciBpZHh9KVwiXG4gIGxpc3Quc3BsaWNlICggTWF0aC5tYXggbGlzdC5sZW5ndGggKyBpZHgsIDAgKSwgMCwgeFxuICByZXR1cm4gbGlzdFxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBwb3BfYXQgPSAoIGxpc3QsIGlkeCwgeCApIC0+XG4jICAgdW5sZXNzIGlkeCA8IDBcbiMgICAgIHRocm93IG5ldyBFcnJvciBcIs6pbmZhaF9fXzMgZXhwZWN0ZWQgbmVnYXRpdmUgbnVtYmVyLCBnb3QgYSAje3R5cGVfb2YgaWR4fSAoI3tycHIgaWR4fSlcIlxuIyAgIHVubGVzcyBsaXN0Lmxlbmd0aCA+PSBNYXRoLmFicyBpZHhcbiMgICAgIHRocm93IG5ldyBFcnJvciBcIs6pbmZhaF9fXzQgbGlzdCB0b28gc2hvcnQsIGdvdCBpbmRleCAje2lkeH0gZm9yIGxlbmd0aCBvZiAje2xpc3QubGVuZ3RofVwiXG4jICAgcmV0dXJuICggbGlzdC5zcGxpY2UgaWR4LCAxIClbIDAgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnNldF9hdCA9ICggbGlzdCwgaWR4LCB4ICkgLT5cbiAgdW5sZXNzIGlkeCA8IDBcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqW5mYWhfX181IGV4cGVjdGVkIG5lZ2F0aXZlIG51bWJlciwgZ290IGEgI3t0eXBlX29mIGlkeH0gKCN7cnByIGlkeH0pXCJcbiAgbGlzdFsgbGlzdC5sZW5ndGggKyBpZHggXSA9IHhcbiAgcmV0dXJuIHhcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmRlYnVnICAgPSBjb25zb2xlLmRlYnVnXG5oZWxwICAgID0gY29uc29sZS5oZWxwXG53YXJuICAgID0gY29uc29sZS53YXJuXG5ycHIgICAgID0gKCB4ICkgLT4gKCByZXF1aXJlICdsb3VwZScgKS5pbnNwZWN0IHhcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVGVtcGxhdGVcbiAgZ25kXG4gIGNyZWF0ZV92YWxpZGF0b3JcbiAgaGlkZVxuICBuYW1laXRcbiAgIyBnZXRfaW5zdGFuY2VfbWV0aG9kc1xuICBiaW5kX2luc3RhbmNlX21ldGhvZHNcbiAgcHVzaF9hdFxuICAjIHBvcF9hdFxuICBzZXRfYXRcbiAgZGVidWdcbiAgaGVscFxuICB3YXJuXG4gIHJwciB9XG4iXX0=
