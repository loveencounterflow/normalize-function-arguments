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
      callable: {
        isa: function(x) {
          var ref;
          return (ref = Object.prototype.toString.call(x)) === '[object Function]' || ref === '[object AsyncFunction]';
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2hlbHBlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQUE7QUFBQSxNQUFBLFFBQUEsRUFBQSxxQkFBQSxFQUFBLGdCQUFBLEVBQUEsS0FBQSxFQUFBLG9CQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxjQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsSUFBQTtJQUFBLG9CQUFBOzs7O0VBSUEsY0FBQSxHQUE0QixNQUFNLENBQUMsTUFBUCxDQUFjLENBQUUsSUFBRixFQUFVLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQUEsQ0FBdEIsQ0FBVixDQUFkLEVBSjVCOzs7RUFNQSxPQUFBLEdBQTRCLFFBQUEsQ0FBQSxDQUFBO1dBQUcsTUFBTSxDQUFDLE1BQVAsQ0FBYyxJQUFkO0VBQUgsRUFONUI7Ozs7OztFQVlNLFdBQU4sTUFBQSxTQUFBLENBQUE7O0lBR0UsV0FBYSxDQUFFLE1BQU0sSUFBUixDQUFBO0FBQ2YsVUFBQSxVQUFBLEVBQUEsSUFBQSxFQUFBO0FBQUk7TUFBQSxLQUFBLFdBQUE7O1FBQ0UsVUFBQTtBQUFhLGtCQUFPLElBQVA7O0FBQUEsaUJBRU4sR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFiLENBQWlCLFVBQVUsQ0FBQyxLQUE1QixDQUZNO3FCQUV1QyxDQUFBLENBQUUsVUFBRixDQUFBLEdBQUE7QUFDMUQsb0JBQUEsWUFBQSxFQUFBO2dCQUFVLENBQUE7a0JBQUUsWUFBRjtrQkFBZ0IsS0FBQSxFQUFPO2dCQUF2QixDQUFBLEdBQWdDLFVBQWhDO0FBQ0EsdUJBQU87a0JBQUUsVUFBQSxFQUFZLElBQWQ7a0JBQW9CLFlBQXBCO2tCQUFrQztnQkFBbEM7Y0FGeUMsQ0FBQSxFQUFFLFlBRnpDOztBQUFBLGlCQU1OLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBUixDQUFpQixVQUFV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WGUsRUFZZixJQVplLEVBYWYsSUFiZSxFQWNmLEdBZGU7QUF6SmpCIiwic291cmNlc0NvbnRlbnQiOlsiXG4ndXNlIHN0cmljdCdcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIG9wdGlvbmFsICAgICAgICAgICAgICAgICAgPSBTeW1ib2wgJ29wdGlvbmFsJ1xucG9kX3Byb3RvdHlwZXMgICAgICAgICAgICA9IE9iamVjdC5mcmVlemUgWyBudWxsLCAoIE9iamVjdC5nZXRQcm90b3R5cGVPZiB7fSApLCBdXG4jIG5ld19wb2QgICAgICAgICAgICAgICAgICAgPSAtPiB7fVxubmV3X3BvZCAgICAgICAgICAgICAgICAgICA9IC0+IE9iamVjdC5jcmVhdGUgbnVsbFxuXG4jICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBAYmluZF9wcm90byA9ICggdGhhdCwgZiApIC0+IHRoYXQ6OlsgZi5uYW1lIF0gPSBmLmJpbmQgdGhhdDo6XG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVGVtcGxhdGVcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAoIGNmZyA9IG51bGwgKSAtPlxuICAgIGZvciBuYW1lLCBkZXNjcmlwdG9yIG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzIGNmZyA/IHt9XG4gICAgICBkZXNjcmlwdG9yID0gc3dpdGNoIHRydWVcbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICB3aGVuIGduZC5mdW5jdGlvbi5pc2EgZGVzY3JpcHRvci52YWx1ZSAgICB0aGVuIGRvICggZGVzY3JpcHRvciApID0+XG4gICAgICAgICAgeyBjb25maWd1cmFibGUsIHZhbHVlOiBnZXQsIH0gPSBkZXNjcmlwdG9yXG4gICAgICAgICAgcmV0dXJuIHsgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlLCBnZXQsIH1cbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICB3aGVuIGduZC5wb2QuaXNhICAgICAgZGVzY3JpcHRvci52YWx1ZSAgICB0aGVuIGRvICggZGVzY3JpcHRvciApID0+XG4gICAgICAgICAgeyBjb25maWd1cmFibGUsIHZhbHVlLCB9ID0gZGVzY3JpcHRvclxuICAgICAgICAgIGdldCA9IC0+IG5ldyBUZW1wbGF0ZSB2YWx1ZVxuICAgICAgICAgIHJldHVybiB7IGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZSwgZ2V0LCB9XG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgZWxzZVxuICAgICAgICAgIGRlc2NyaXB0b3JcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEAsIG5hbWUsIGRlc2NyaXB0b3JcbiAgICByZXR1cm4gdW5kZWZpbmVkXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jcmVhdGVfdmFsaWRhdG9yID0gKCB0eXBlbmFtZSwgaXNhICkgLT5cbiAgIyMjIFRBSU5UIGBnbmQubm9uZW1wdHlfdGV4dC52YWxpZGF0ZSB0eXBlbmFtZWAgIyMjXG4gICMjIyBUQUlOVCBgZ25kLmZ1bmN0aW9uLnZhbGlkYXRlIGlzYWAgIyMjXG4gICMjIyBUQUlOVCBzaWxlbnRseSBhY2NlcHRzIHRydXRoeSwgZmFsc3kgdmFsdWVzIHJldHVybmVkIGJ5IGBpc2EoKWAsIG5vdCBvbmx5IGJvb2xlYW5zICMjI1xuICByZXR1cm4gKCB4ICkgLT5cbiAgICByZXR1cm4geCBpZiBpc2EgeFxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IgXCLOqW5mYV9fXzEgdmFsaWRhdGlvbiBlcnJvcjogZXhwZWN0ZWQgYSAje3R5cGVuYW1lfSBnb3QgI3tycHIgeH1cIlxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZ25kID0gZG8gLT5cbiAgUiA9XG4gICAgIyBib29sZWFuOiAgICAgICAgaXNhOiAgKCB4ICkgLT4gKCB4IGlzIHRydWUgKSBvciAoIHggaXMgZmFsc2UgKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZnVuY3Rpb246XG4gICAgICBpc2E6ICAoIHggKSAtPiAoIE9iamVjdDo6dG9TdHJpbmcuY2FsbCB4ICkgaXMgJ1tvYmplY3QgRnVuY3Rpb25dJ1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgYXN5bmNmdW5jdGlvbjpcbiAgICAgIGlzYTogICggeCApIC0+ICggT2JqZWN0Ojp0b1N0cmluZy5jYWxsIHggKSBpcyAnW29iamVjdCBBc3luY0Z1bmN0aW9uXSdcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGNhbGxhYmxlOlxuICAgICAgaXNhOiAgKCB4ICkgLT4gKCBPYmplY3Q6OnRvU3RyaW5nLmNhbGwgeCApIGluIFsgJ1tvYmplY3QgRnVuY3Rpb25dJywgJ1tvYmplY3QgQXN5bmNGdW5jdGlvbl0nLCBdXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB0ZW1wbGF0ZTpcbiAgICAgIGlzYTogICAgKCB4ICkgLT4geCBpbnN0YW5jZW9mIFRlbXBsYXRlXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb2Q6XG4gICAgICBpc2E6ICAgICggeCApIC0+IHg/IGFuZCAoIE9iamVjdC5nZXRQcm90b3R5cGVPZiB4ICkgaW4gcG9kX3Byb3RvdHlwZXNcbiAgICAgIGNyZWF0ZTogKCBRLi4uICkgLT4gT2JqZWN0LmFzc2lnbiBuZXdfcG9kKCksIFEuLi5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIG5mYV9jZmc6XG4gICAgICBpc2E6ICggeCApIC0+XG4gICAgICAgIHJldHVybiBmYWxzZSB1bmxlc3MgZ25kLnBvZC5pc2EgeFxuICAgICAgICByZXR1cm4gZmFsc2UgdW5sZXNzIGduZC50ZW1wbGF0ZS5pc2Ffb3B0aW9uYWwgeC50ZW1wbGF0ZVxuICAgICAgICByZXR1cm4gZmFsc2UgdW5sZXNzIGduZC5mdW5jdGlvbi5pc2Ffb3B0aW9uYWwgeC5pc2FcbiAgICAgICAgcmV0dXJuIGZhbHNlIHVubGVzcyBnbmQuZnVuY3Rpb24uaXNhX29wdGlvbmFsIHgudmFsaWRhdGVcbiAgICAgICAgIyByZXR1cm4gZmFsc2UgdW5sZXNzIGduZC5mdW5jdGlvbi5pc2Ffb3B0aW9uYWwgeC50eXBlXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB0ZW1wbGF0ZTpcbiAgICAgICAgdGVtcGxhdGU6IG51bGxcbiAgICAgICAgaXNhOiAgICAgIG51bGxcbiAgICAgICAgdmFsaWRhdGU6IG51bGxcbiAgICAgICAgdHlwZTogICAgIG51bGxcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBmb3IgdHlwZW5hbWUsIHR5cGUgb2YgUlxuICAgIHR5cGUubmFtZSAgICAgPSB0eXBlbmFtZVxuICAgICMgdHlwZS52YWxpZGF0ZSA9ICggeCApIC0+IC4uLlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHJldHVybiBSXG4jIyMgVEFJTlQgdGhpcyBpcyBtb3JlIG9yIGxlc3MgYENsZWFyVHlwZS5UeXBlOjpjcmVhdGUoKWAgIyMjXG5kbyA9PiBmb3IgdHlwZW5hbWUsIHR5cGUgb2YgZ25kIHRoZW4gZG8gKCB0eXBlbmFtZSwgdHlwZSApIC0+XG4gIGlmIHR5cGUudGVtcGxhdGU/IHRoZW4gdHlwZS50ZW1wbGF0ZSA9ICggbmV3IFRlbXBsYXRlIHR5cGUudGVtcGxhdGUgKVxuICBpZiB0eXBlLmlzYT9cbiAgICB1bmxlc3MgdHlwZS5pc2Ffb3B0aW9uYWw/IHRoZW4gdHlwZS5pc2Ffb3B0aW9uYWwgID0gKCB4ICkgLT4gKCBub3QgeD8gKSBvciAoIHR5cGUuaXNhIHggKVxuICAgIHVubGVzcyB0eXBlLnZhbGlkYXRlPyAgICAgdGhlbiB0eXBlLnZhbGlkYXRlICAgICAgPSBjcmVhdGVfdmFsaWRhdG9yIHR5cGUubmFtZSwgKCB4ICkgLT4gdHlwZS5pc2EgeFxuICByZXR1cm4gbnVsbFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuaGlkZSA9ICggb2JqZWN0LCBuYW1lLCB2YWx1ZSApID0+IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBvYmplY3QsIG5hbWUsXG4gICAgZW51bWVyYWJsZTogICBmYWxzZVxuICAgIHdyaXRhYmxlOiAgICAgdHJ1ZVxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIHZhbHVlOiAgICAgICAgdmFsdWVcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5uYW1laXQgPSAoIG5hbWUsIGYgKSAtPiBPYmplY3QuZGVmaW5lUHJvcGVydHkgZiwgJ25hbWUnLCB7IHZhbHVlOiBuYW1lLCB9OyBmXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZ2V0X2luc3RhbmNlX21ldGhvZHMgPSAoIGluc3RhbmNlICkgLT5cbiAgUiAgICAgICAgICAgICA9IHt9XG4gIGZvciBrZXksIHsgdmFsdWU6IG1ldGhvZCwgfSBvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyBpbnN0YW5jZVxuICAgIGNvbnRpbnVlIGlmIGtleSBpcyAnY29uc3RydWN0b3InXG4gICAgY29udGludWUgdW5sZXNzIGduZC5mdW5jdGlvbi5pc2EgbWV0aG9kXG4gICAgUlsga2V5IF0gPSBtZXRob2RcbiAgcmV0dXJuIFJcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5iaW5kX2luc3RhbmNlX21ldGhvZHMgPSAoIGluc3RhbmNlLCBrZWVwX25hbWUgPSB0cnVlICkgLT5cbiAgZm9yIGtleSwgbWV0aG9kIG9mIGdldF9pbnN0YW5jZV9tZXRob2RzIE9iamVjdC5nZXRQcm90b3R5cGVPZiBpbnN0YW5jZVxuICAgIGlmIGtlZXBfbmFtZVxuICAgICAgaGlkZSBpbnN0YW5jZSwga2V5LCBuYW1laXQgbWV0aG9kLm5hbWUsIG1ldGhvZC5iaW5kIGluc3RhbmNlXG4gICAgZWxzZVxuICAgICAgaGlkZSBpbnN0YW5jZSwga2V5LCBtZXRob2QuYmluZCBpbnN0YW5jZVxuICByZXR1cm4gbnVsbFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxucHVzaF9hdCA9ICggbGlzdCwgaWR4LCB4ICkgLT5cbiAgdW5sZXNzIGlkeCA8IDBcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqW5mYV9fXzcgZXhwZWN0ZWQgbmVnYXRpdmUgbnVtYmVyLCBnb3QgI3tycHIgaWR4fVwiXG4gIGxpc3Quc3BsaWNlICggTWF0aC5tYXggbGlzdC5sZW5ndGggKyBpZHgsIDAgKSwgMCwgeFxuICByZXR1cm4gbGlzdFxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBwb3BfYXQgPSAoIGxpc3QsIGlkeCwgeCApIC0+XG4jICAgdW5sZXNzIGlkeCA8IDBcbiMgICAgIHRocm93IG5ldyBFcnJvciBcIs6pbmZhX19fOCBleHBlY3RlZCBuZWdhdGl2ZSBudW1iZXIsIGdvdCAje3JwciBpZHh9XCJcbiMgICB1bmxlc3MgbGlzdC5sZW5ndGggPj0gTWF0aC5hYnMgaWR4XG4jICAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqW5mYV9fXzkgbGlzdCB0b28gc2hvcnQsIGdvdCBpbmRleCAje2lkeH0gZm9yIGxlbmd0aCBvZiAje2xpc3QubGVuZ3RofVwiXG4jICAgcmV0dXJuICggbGlzdC5zcGxpY2UgaWR4LCAxIClbIDAgXVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnNldF9hdCA9ICggbGlzdCwgaWR4LCB4ICkgLT5cbiAgdW5sZXNzIGlkeCA8IDBcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqW5mYV9fMTAgZXhwZWN0ZWQgbmVnYXRpdmUgbnVtYmVyLCBnb3QgI3tycHIgaWR4fVwiXG4gIGxpc3RbIGxpc3QubGVuZ3RoICsgaWR4IF0gPSB4XG4gIHJldHVybiB4XG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5kZWJ1ZyAgID0gY29uc29sZS5kZWJ1Z1xuaGVscCAgICA9IGNvbnNvbGUuaGVscFxud2FybiAgICA9IGNvbnNvbGUud2FyblxucnByICAgICA9ICggeCApIC0+ICggcmVxdWlyZSAnbG91cGUnICkuaW5zcGVjdCB4XG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFRlbXBsYXRlXG4gIGduZFxuICBjcmVhdGVfdmFsaWRhdG9yXG4gIGhpZGVcbiAgbmFtZWl0XG4gICMgZ2V0X2luc3RhbmNlX21ldGhvZHNcbiAgYmluZF9pbnN0YW5jZV9tZXRob2RzXG4gIHB1c2hfYXRcbiAgIyBwb3BfYXRcbiAgc2V0X2F0XG4gIGRlYnVnXG4gIGhlbHBcbiAgd2FyblxuICBycHIgfVxuIl19
