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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2hlbHBlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQUE7QUFBQSxNQUFBLFFBQUEsRUFBQSxxQkFBQSxFQUFBLGdCQUFBLEVBQUEsS0FBQSxFQUFBLG9CQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxjQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsSUFBQTtJQUFBLG9CQUFBOzs7O0VBSUEsY0FBQSxHQUE0QixNQUFNLENBQUMsTUFBUCxDQUFjLENBQUUsSUFBRixFQUFVLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQUEsQ0FBdEIsQ0FBVixDQUFkLEVBSjVCOzs7RUFNQSxPQUFBLEdBQTRCLFFBQUEsQ0FBQSxDQUFBO1dBQUcsTUFBTSxDQUFDLE1BQVAsQ0FBYyxJQUFkO0VBQUgsRUFONUI7Ozs7OztFQVlNLFdBQU4sTUFBQSxTQUFBLENBQUE7O0lBR0UsV0FBYSxDQUFFLE1BQU0sSUFBUixDQUFBO0FBQ2YsVUFBQSxVQUFBLEVBQUEsSUFBQSxFQUFBO0FBQUk7TUFBQSxLQUFBLFdBQUE7O1FBQ0UsVUFBQTtBQUFhLGtCQUFPLElBQVA7O0FBQUEsaUJBRU4sR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFiLENBQWlCLFVBQVUsQ0FBQyxLQUE1QixDQUZNO3FCQUV1QyxDQUFBLENBQUUsVUFBRixDQUFBLEdBQUE7QUFDMUQsb0JBQUEsWUFBQSxFQUFBO2dCQUFVLENBQUE7a0JBQUUsWUFBRjtrQkFBZ0IsS0FBQSxFQUFPO2dCQUF2QixDQUFBLEdBQWdDLFVBQWhDO0FBQ0EsdUJBQU87a0JBQUUsVUFBQSxFQUFZLElBQWQ7a0JBQW9CLFlBQXBCO2tCQUFrQztnQkFBbEM7Y0FGeUMsQ0FBQSxFQUFFLFlBRnpDOztBQUFBLGlCQU1OLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBUixDQUFpQixVQUFV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bUIsQ0FBQyxPQUFwQixDQUE0QixDQUE1QjtFQUFULEVBekpWOzs7OztFQTRKQSxNQUFNLENBQUMsT0FBUCxHQUFpQixDQUNmLFFBRGUsRUFFZixHQUZlLEVBR2YsZ0JBSGUsRUFJZixJQUplLEVBS2YsTUFMZSxFQU9mLHFCQVBlLEVBUWYsT0FSZSxFQVVmLE1BVmUsRUFXZixLQVhlLEVBWWYsSUFaZSxFQWFmLElBYmUsRUFjZixHQWRlO0FBNUpqQiIsInNvdXJjZXNDb250ZW50IjpbIlxuJ3VzZSBzdHJpY3QnXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBvcHRpb25hbCAgICAgICAgICAgICAgICAgID0gU3ltYm9sICdvcHRpb25hbCdcbnBvZF9wcm90b3R5cGVzICAgICAgICAgICAgPSBPYmplY3QuZnJlZXplIFsgbnVsbCwgKCBPYmplY3QuZ2V0UHJvdG90eXBlT2Yge30gKSwgXVxuIyBuZXdfcG9kICAgICAgICAgICAgICAgICAgID0gLT4ge31cbm5ld19wb2QgICAgICAgICAgICAgICAgICAgPSAtPiBPYmplY3QuY3JlYXRlIG51bGxcblxuIyAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgQGJpbmRfcHJvdG8gPSAoIHRoYXQsIGYgKSAtPiB0aGF0OjpbIGYubmFtZSBdID0gZi5iaW5kIHRoYXQ6OlxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFRlbXBsYXRlXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdHJ1Y3RvcjogKCBjZmcgPSBudWxsICkgLT5cbiAgICBmb3IgbmFtZSwgZGVzY3JpcHRvciBvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyBjZmcgPyB7fVxuICAgICAgZGVzY3JpcHRvciA9IHN3aXRjaCB0cnVlXG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgd2hlbiBnbmQuZnVuY3Rpb24uaXNhIGRlc2NyaXB0b3IudmFsdWUgICAgdGhlbiBkbyAoIGRlc2NyaXB0b3IgKSA9PlxuICAgICAgICAgIHsgY29uZmlndXJhYmxlLCB2YWx1ZTogZ2V0LCB9ID0gZGVzY3JpcHRvclxuICAgICAgICAgIHJldHVybiB7IGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZSwgZ2V0LCB9XG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgd2hlbiBnbmQucG9kLmlzYSAgICAgIGRlc2NyaXB0b3IudmFsdWUgICAgdGhlbiBkbyAoIGRlc2NyaXB0b3IgKSA9PlxuICAgICAgICAgIHsgY29uZmlndXJhYmxlLCB2YWx1ZSwgfSA9IGRlc2NyaXB0b3JcbiAgICAgICAgICBnZXQgPSAtPiBuZXcgVGVtcGxhdGUgdmFsdWVcbiAgICAgICAgICByZXR1cm4geyBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGUsIGdldCwgfVxuICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBkZXNjcmlwdG9yXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBALCBuYW1lLCBkZXNjcmlwdG9yXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY3JlYXRlX3ZhbGlkYXRvciA9ICggdHlwZW5hbWUsIGlzYSApIC0+XG4gICMjIyBUQUlOVCBgZ25kLm5vbmVtcHR5X3RleHQudmFsaWRhdGUgdHlwZW5hbWVgICMjI1xuICAjIyMgVEFJTlQgYGduZC5mdW5jdGlvbi52YWxpZGF0ZSBpc2FgICMjI1xuICAjIyMgVEFJTlQgc2lsZW50bHkgYWNjZXB0cyB0cnV0aHksIGZhbHN5IHZhbHVlcyByZXR1cm5lZCBieSBgaXNhKClgLCBub3Qgb25seSBib29sZWFucyAjIyNcbiAgcmV0dXJuICggeCApIC0+XG4gICAgcmV0dXJuIHggaWYgaXNhIHhcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yIFwizqluZmFfX18xIHZhbGlkYXRpb24gZXJyb3I6IGV4cGVjdGVkIGEgI3t0eXBlbmFtZX0gZ290ICN7cnByIHh9XCJcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmduZCA9IGRvIC0+XG4gIFIgPVxuICAgICMgYm9vbGVhbjogICAgICAgIGlzYTogICggeCApIC0+ICggeCBpcyB0cnVlICkgb3IgKCB4IGlzIGZhbHNlIClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGZ1bmN0aW9uOlxuICAgICAgaXNhOiAgKCB4ICkgLT4gKCBPYmplY3Q6OnRvU3RyaW5nLmNhbGwgeCApIGlzICdbb2JqZWN0IEZ1bmN0aW9uXSdcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGFzeW5jZnVuY3Rpb246XG4gICAgICBpc2E6ICAoIHggKSAtPiAoIE9iamVjdDo6dG9TdHJpbmcuY2FsbCB4ICkgaXMgJ1tvYmplY3QgQXN5bmNGdW5jdGlvbl0nXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBnZW5lcmF0b3JmdW5jdGlvbjpcbiAgICAgIGlzYTogICggeCApIC0+ICggT2JqZWN0Ojp0b1N0cmluZy5jYWxsIHggKSBpcyAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBjYWxsYWJsZTpcbiAgICAgIGlzYTogICggeCApIC0+ICggT2JqZWN0Ojp0b1N0cmluZy5jYWxsIHggKSBpbiBbICdbb2JqZWN0IEZ1bmN0aW9uXScsICdbb2JqZWN0IEFzeW5jRnVuY3Rpb25dJywgJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJywgXVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgdGVtcGxhdGU6XG4gICAgICBpc2E6ICAgICggeCApIC0+IHggaW5zdGFuY2VvZiBUZW1wbGF0ZVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcG9kOlxuICAgICAgaXNhOiAgICAoIHggKSAtPiB4PyBhbmQgKCBPYmplY3QuZ2V0UHJvdG90eXBlT2YgeCApIGluIHBvZF9wcm90b3R5cGVzXG4gICAgICBjcmVhdGU6ICggUS4uLiApIC0+IE9iamVjdC5hc3NpZ24gbmV3X3BvZCgpLCBRLi4uXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBuZmFfY2ZnOlxuICAgICAgaXNhOiAoIHggKSAtPlxuICAgICAgICByZXR1cm4gZmFsc2UgdW5sZXNzIGduZC5wb2QuaXNhIHhcbiAgICAgICAgcmV0dXJuIGZhbHNlIHVubGVzcyBnbmQudGVtcGxhdGUuaXNhX29wdGlvbmFsIHgudGVtcGxhdGVcbiAgICAgICAgcmV0dXJuIGZhbHNlIHVubGVzcyBnbmQuZnVuY3Rpb24uaXNhX29wdGlvbmFsIHguaXNhXG4gICAgICAgIHJldHVybiBmYWxzZSB1bmxlc3MgZ25kLmZ1bmN0aW9uLmlzYV9vcHRpb25hbCB4LnZhbGlkYXRlXG4gICAgICAgICMgcmV0dXJuIGZhbHNlIHVubGVzcyBnbmQuZnVuY3Rpb24uaXNhX29wdGlvbmFsIHgudHlwZVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgdGVtcGxhdGU6XG4gICAgICAgIHRlbXBsYXRlOiBudWxsXG4gICAgICAgIGlzYTogICAgICBudWxsXG4gICAgICAgIHZhbGlkYXRlOiBudWxsXG4gICAgICAgIHR5cGU6ICAgICBudWxsXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZm9yIHR5cGVuYW1lLCB0eXBlIG9mIFJcbiAgICB0eXBlLm5hbWUgICAgID0gdHlwZW5hbWVcbiAgICAjIHR5cGUudmFsaWRhdGUgPSAoIHggKSAtPiAuLi5cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gUlxuIyMjIFRBSU5UIHRoaXMgaXMgbW9yZSBvciBsZXNzIGBDbGVhclR5cGUuVHlwZTo6Y3JlYXRlKClgICMjI1xuZG8gPT4gZm9yIHR5cGVuYW1lLCB0eXBlIG9mIGduZCB0aGVuIGRvICggdHlwZW5hbWUsIHR5cGUgKSAtPlxuICBpZiB0eXBlLnRlbXBsYXRlPyB0aGVuIHR5cGUudGVtcGxhdGUgPSAoIG5ldyBUZW1wbGF0ZSB0eXBlLnRlbXBsYXRlIClcbiAgaWYgdHlwZS5pc2E/XG4gICAgdW5sZXNzIHR5cGUuaXNhX29wdGlvbmFsPyB0aGVuIHR5cGUuaXNhX29wdGlvbmFsICA9ICggeCApIC0+ICggbm90IHg/ICkgb3IgKCB0eXBlLmlzYSB4IClcbiAgICB1bmxlc3MgdHlwZS52YWxpZGF0ZT8gICAgIHRoZW4gdHlwZS52YWxpZGF0ZSAgICAgID0gY3JlYXRlX3ZhbGlkYXRvciB0eXBlLm5hbWUsICggeCApIC0+IHR5cGUuaXNhIHhcbiAgcmV0dXJuIG51bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmhpZGUgPSAoIG9iamVjdCwgbmFtZSwgdmFsdWUgKSA9PiBPYmplY3QuZGVmaW5lUHJvcGVydHkgb2JqZWN0LCBuYW1lLFxuICAgIGVudW1lcmFibGU6ICAgZmFsc2VcbiAgICB3cml0YWJsZTogICAgIHRydWVcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB2YWx1ZTogICAgICAgIHZhbHVlXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxubmFtZWl0ID0gKCBuYW1lLCBmICkgLT4gT2JqZWN0LmRlZmluZVByb3BlcnR5IGYsICduYW1lJywgeyB2YWx1ZTogbmFtZSwgfTsgZlxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmdldF9pbnN0YW5jZV9tZXRob2RzID0gKCBpbnN0YW5jZSApIC0+XG4gIFIgICAgICAgICAgICAgPSB7fVxuICBmb3Iga2V5LCB7IHZhbHVlOiBtZXRob2QsIH0gb2YgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMgaW5zdGFuY2VcbiAgICBjb250aW51ZSBpZiBrZXkgaXMgJ2NvbnN0cnVjdG9yJ1xuICAgIGNvbnRpbnVlIHVubGVzcyBnbmQuZnVuY3Rpb24uaXNhIG1ldGhvZFxuICAgIFJbIGtleSBdID0gbWV0aG9kXG4gIHJldHVybiBSXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuYmluZF9pbnN0YW5jZV9tZXRob2RzID0gKCBpbnN0YW5jZSwga2VlcF9uYW1lID0gdHJ1ZSApIC0+XG4gIGZvciBrZXksIG1ldGhvZCBvZiBnZXRfaW5zdGFuY2VfbWV0aG9kcyBPYmplY3QuZ2V0UHJvdG90eXBlT2YgaW5zdGFuY2VcbiAgICBpZiBrZWVwX25hbWVcbiAgICAgIGhpZGUgaW5zdGFuY2UsIGtleSwgbmFtZWl0IG1ldGhvZC5uYW1lLCBtZXRob2QuYmluZCBpbnN0YW5jZVxuICAgIGVsc2VcbiAgICAgIGhpZGUgaW5zdGFuY2UsIGtleSwgbWV0aG9kLmJpbmQgaW5zdGFuY2VcbiAgcmV0dXJuIG51bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbnB1c2hfYXQgPSAoIGxpc3QsIGlkeCwgeCApIC0+XG4gIHVubGVzcyBpZHggPCAwXG4gICAgdGhyb3cgbmV3IEVycm9yIFwizqluZmFfX183IGV4cGVjdGVkIG5lZ2F0aXZlIG51bWJlciwgZ290ICN7cnByIGlkeH1cIlxuICBsaXN0LnNwbGljZSAoIE1hdGgubWF4IGxpc3QubGVuZ3RoICsgaWR4LCAwICksIDAsIHhcbiAgcmV0dXJuIGxpc3RcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgcG9wX2F0ID0gKCBsaXN0LCBpZHgsIHggKSAtPlxuIyAgIHVubGVzcyBpZHggPCAwXG4jICAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqW5mYV9fXzggZXhwZWN0ZWQgbmVnYXRpdmUgbnVtYmVyLCBnb3QgI3tycHIgaWR4fVwiXG4jICAgdW5sZXNzIGxpc3QubGVuZ3RoID49IE1hdGguYWJzIGlkeFxuIyAgICAgdGhyb3cgbmV3IEVycm9yIFwizqluZmFfX185IGxpc3QgdG9vIHNob3J0LCBnb3QgaW5kZXggI3tpZHh9IGZvciBsZW5ndGggb2YgI3tsaXN0Lmxlbmd0aH1cIlxuIyAgIHJldHVybiAoIGxpc3Quc3BsaWNlIGlkeCwgMSApWyAwIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5zZXRfYXQgPSAoIGxpc3QsIGlkeCwgeCApIC0+XG4gIHVubGVzcyBpZHggPCAwXG4gICAgdGhyb3cgbmV3IEVycm9yIFwizqluZmFfXzEwIGV4cGVjdGVkIG5lZ2F0aXZlIG51bWJlciwgZ290ICN7cnByIGlkeH1cIlxuICBsaXN0WyBsaXN0Lmxlbmd0aCArIGlkeCBdID0geFxuICByZXR1cm4geFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZGVidWcgICA9IGNvbnNvbGUuZGVidWdcbmhlbHAgICAgPSBjb25zb2xlLmhlbHBcbndhcm4gICAgPSBjb25zb2xlLndhcm5cbnJwciAgICAgPSAoIHggKSAtPiAoIHJlcXVpcmUgJ2xvdXBlJyApLmluc3BlY3QgeFxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbm1vZHVsZS5leHBvcnRzID0ge1xuICBUZW1wbGF0ZVxuICBnbmRcbiAgY3JlYXRlX3ZhbGlkYXRvclxuICBoaWRlXG4gIG5hbWVpdFxuICAjIGdldF9pbnN0YW5jZV9tZXRob2RzXG4gIGJpbmRfaW5zdGFuY2VfbWV0aG9kc1xuICBwdXNoX2F0XG4gICMgcG9wX2F0XG4gIHNldF9hdFxuICBkZWJ1Z1xuICBoZWxwXG4gIHdhcm5cbiAgcnByIH1cbiJdfQ==
