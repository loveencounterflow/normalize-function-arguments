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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2hlbHBlcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQUE7QUFBQSxNQUFBLFFBQUEsRUFBQSxxQkFBQSxFQUFBLGdCQUFBLEVBQUEsS0FBQSxFQUFBLG9CQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxjQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsSUFBQTtJQUFBLG9CQUFBOzs7O0VBSUEsY0FBQSxHQUE0QixNQUFNLENBQUMsTUFBUCxDQUFjLENBQUUsSUFBRixFQUFVLE1BQU0sQ0FBQyxjQUFQLENBQXNCLENBQUEsQ0FBdEIsQ0FBVixDQUFkLEVBSjVCOzs7RUFNQSxPQUFBLEdBQTRCLFFBQUEsQ0FBQSxDQUFBO1dBQUcsTUFBTSxDQUFDLE1BQVAsQ0FBYyxJQUFkO0VBQUgsRUFONUI7Ozs7OztFQVlNLFdBQU4sTUFBQSxTQUFBLENBQUE7O0lBR0UsV0FBYSxDQUFFLE1BQU0sSUFBUixDQUFBO0FBQ2YsVUFBQSxVQUFBLEVBQUEsSUFBQSxFQUFBO0FBQUk7TUFBQSxLQUFBLFdBQUE7O1FBQ0UsVUFBQTtBQUFhLGtCQUFPLElBQVA7O0FBQUEsaUJBRU4sR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFiLENBQWlCLFVBQVUsQ0FBQyxLQUE1QixDQUZNO3FCQUV1QyxDQUFBLENBQUUsVUFBRixDQUFBLEdBQUE7QUFDMUQsb0JBQUEsWUFBQSxFQUFBO2dCQUFVLENBQUE7a0JBQUUsWUFBRjtrQkFBZ0IsS0FBQSxFQUFPO2dCQUF2QixDQUFBLEdBQWdDLFVBQWhDO0FBQ0EsdUJBQU87a0JBQUUsVUFBQSxFQUFZLElBQWQ7a0JBQW9CLFlBQXBCO2tCQUFrQztnQkFBbEM7Y0FGeUMsQ0FBQSxFQUFFLFlBRnpDOztBQUFBLGlCQU1OLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBUixDQUFpQixVQUFV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QWQsRUFBK0MsQ0FBL0MsRUFBa0QsQ0FBbEQ7QUFDQSxXQUFPO0VBSkMsRUF0SFY7Ozs7Ozs7Ozs7O0VBcUlBLE1BQUEsR0FBUyxRQUFBLENBQUUsSUFBRixFQUFRLEdBQVIsRUFBYSxDQUFiLENBQUE7SUFDUCxNQUFPLEdBQUEsR0FBTSxFQUFiO01BQ0UsTUFBTSxJQUFJLEtBQUosQ0FBVSxDQUFBLHVDQUFBLENBQUEsQ0FBMEMsR0FBQSxDQUFJLEdBQUosQ0FBMUMsQ0FBQSxDQUFWLEVBRFI7O0lBRUEsSUFBSSxDQUFFLElBQUksQ0FBQyxNQUFMLEdBQWMsR0FBaEIsQ0FBSixHQUE0QjtBQUM1QixXQUFPO0VBSkEsRUFySVQ7OztFQTZJQSxLQUFBLEdBQVUsT0FBTyxDQUFDOztFQUNsQixJQUFBLEdBQVUsT0FBTyxDQUFDOztFQUNsQixJQUFBLEdBQVUsT0FBTyxDQUFDOztFQUNsQixHQUFBLEdBQVUsUUFBQSxDQUFFLENBQUYsQ0FBQTtXQUFTLENBQUUsT0FBQSxDQUFRLE9BQVIsQ0FBRixDQUFtQixDQUFDLE9BQXBCLENBQTRCLENBQTVCO0VBQVQsRUFoSlY7Ozs7O0VBbUpBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLENBQ2YsUUFEZSxFQUVmLEdBRmUsRUFHZixnQkFIZSxFQUlmLElBSmUsRUFLZixNQUxlLEVBT2YscUJBUGUsRUFRZixPQVJlLEVBVWYsTUFWZSxFQVdmLEtBWGUsRUFZZixJQVplLEVBYWYsSUFiZSxFQWNmLEdBZGU7QUFuSmpCIiwic291cmNlc0NvbnRlbnQiOlsiXG4ndXNlIHN0cmljdCdcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIG9wdGlvbmFsICAgICAgICAgICAgICAgICAgPSBTeW1ib2wgJ29wdGlvbmFsJ1xucG9kX3Byb3RvdHlwZXMgICAgICAgICAgICA9IE9iamVjdC5mcmVlemUgWyBudWxsLCAoIE9iamVjdC5nZXRQcm90b3R5cGVPZiB7fSApLCBdXG4jIG5ld19wb2QgICAgICAgICAgICAgICAgICAgPSAtPiB7fVxubmV3X3BvZCAgICAgICAgICAgICAgICAgICA9IC0+IE9iamVjdC5jcmVhdGUgbnVsbFxuXG4jICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBAYmluZF9wcm90byA9ICggdGhhdCwgZiApIC0+IHRoYXQ6OlsgZi5uYW1lIF0gPSBmLmJpbmQgdGhhdDo6XG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVGVtcGxhdGVcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAoIGNmZyA9IG51bGwgKSAtPlxuICAgIGZvciBuYW1lLCBkZXNjcmlwdG9yIG9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzIGNmZyA/IHt9XG4gICAgICBkZXNjcmlwdG9yID0gc3dpdGNoIHRydWVcbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICB3aGVuIGduZC5mdW5jdGlvbi5pc2EgZGVzY3JpcHRvci52YWx1ZSAgICB0aGVuIGRvICggZGVzY3JpcHRvciApID0+XG4gICAgICAgICAgeyBjb25maWd1cmFibGUsIHZhbHVlOiBnZXQsIH0gPSBkZXNjcmlwdG9yXG4gICAgICAgICAgcmV0dXJuIHsgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlLCBnZXQsIH1cbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICB3aGVuIGduZC5wb2QuaXNhICAgICAgZGVzY3JpcHRvci52YWx1ZSAgICB0aGVuIGRvICggZGVzY3JpcHRvciApID0+XG4gICAgICAgICAgeyBjb25maWd1cmFibGUsIHZhbHVlLCB9ID0gZGVzY3JpcHRvclxuICAgICAgICAgIGdldCA9IC0+IG5ldyBUZW1wbGF0ZSB2YWx1ZVxuICAgICAgICAgIHJldHVybiB7IGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZSwgZ2V0LCB9XG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgZWxzZVxuICAgICAgICAgIGRlc2NyaXB0b3JcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5IEAsIG5hbWUsIGRlc2NyaXB0b3JcbiAgICByZXR1cm4gdW5kZWZpbmVkXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jcmVhdGVfdmFsaWRhdG9yID0gKCB0eXBlbmFtZSwgaXNhICkgLT5cbiAgIyMjIFRBSU5UIGBnbmQubm9uZW1wdHlfdGV4dC52YWxpZGF0ZSB0eXBlbmFtZWAgIyMjXG4gICMjIyBUQUlOVCBgZ25kLmZ1bmN0aW9uLnZhbGlkYXRlIGlzYWAgIyMjXG4gICMjIyBUQUlOVCBzaWxlbnRseSBhY2NlcHRzIHRydXRoeSwgZmFsc3kgdmFsdWVzIHJldHVybmVkIGJ5IGBpc2EoKWAsIG5vdCBvbmx5IGJvb2xlYW5zICMjI1xuICByZXR1cm4gKCB4ICkgLT5cbiAgICByZXR1cm4geCBpZiBpc2EgeFxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IgXCLOqW5mYV9fXzEgdmFsaWRhdGlvbiBlcnJvcjogZXhwZWN0ZWQgYSAje3R5cGVuYW1lfSBnb3QgI3tycHIgeH1cIlxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZ25kID0gZG8gLT5cbiAgUiA9XG4gICAgIyBib29sZWFuOiAgICAgICAgaXNhOiAgKCB4ICkgLT4gKCB4IGlzIHRydWUgKSBvciAoIHggaXMgZmFsc2UgKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZnVuY3Rpb246XG4gICAgICBpc2E6ICAoIHggKSAtPiAoIE9iamVjdDo6dG9TdHJpbmcuY2FsbCB4ICkgaXMgJ1tvYmplY3QgRnVuY3Rpb25dJ1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgdGVtcGxhdGU6XG4gICAgICBpc2E6ICAgICggeCApIC0+IHggaW5zdGFuY2VvZiBUZW1wbGF0ZVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcG9kOlxuICAgICAgaXNhOiAgICAoIHggKSAtPiB4PyBhbmQgKCBPYmplY3QuZ2V0UHJvdG90eXBlT2YgeCApIGluIHBvZF9wcm90b3R5cGVzXG4gICAgICBjcmVhdGU6ICggUS4uLiApIC0+IE9iamVjdC5hc3NpZ24gbmV3X3BvZCgpLCBRLi4uXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBuZmFfY2ZnOlxuICAgICAgaXNhOiAoIHggKSAtPlxuICAgICAgICByZXR1cm4gZmFsc2UgdW5sZXNzIGduZC5wb2QuaXNhIHhcbiAgICAgICAgcmV0dXJuIGZhbHNlIHVubGVzcyBnbmQudGVtcGxhdGUuaXNhX29wdGlvbmFsIHgudGVtcGxhdGVcbiAgICAgICAgcmV0dXJuIGZhbHNlIHVubGVzcyBnbmQuZnVuY3Rpb24uaXNhX29wdGlvbmFsIHguaXNhXG4gICAgICAgIHJldHVybiBmYWxzZSB1bmxlc3MgZ25kLmZ1bmN0aW9uLmlzYV9vcHRpb25hbCB4LnZhbGlkYXRlXG4gICAgICAgICMgcmV0dXJuIGZhbHNlIHVubGVzcyBnbmQuZnVuY3Rpb24uaXNhX29wdGlvbmFsIHgudHlwZVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgdGVtcGxhdGU6XG4gICAgICAgIHRlbXBsYXRlOiBudWxsXG4gICAgICAgIGlzYTogICAgICBudWxsXG4gICAgICAgIHZhbGlkYXRlOiBudWxsXG4gICAgICAgIHR5cGU6ICAgICBudWxsXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZm9yIHR5cGVuYW1lLCB0eXBlIG9mIFJcbiAgICB0eXBlLm5hbWUgICAgID0gdHlwZW5hbWVcbiAgICAjIHR5cGUudmFsaWRhdGUgPSAoIHggKSAtPiAuLi5cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gUlxuIyMjIFRBSU5UIHRoaXMgaXMgbW9yZSBvciBsZXNzIGBDbGVhclR5cGUuVHlwZTo6Y3JlYXRlKClgICMjI1xuZG8gPT4gZm9yIHR5cGVuYW1lLCB0eXBlIG9mIGduZCB0aGVuIGRvICggdHlwZW5hbWUsIHR5cGUgKSAtPlxuICBpZiB0eXBlLnRlbXBsYXRlPyB0aGVuIHR5cGUudGVtcGxhdGUgPSAoIG5ldyBUZW1wbGF0ZSB0eXBlLnRlbXBsYXRlIClcbiAgaWYgdHlwZS5pc2E/XG4gICAgdW5sZXNzIHR5cGUuaXNhX29wdGlvbmFsPyB0aGVuIHR5cGUuaXNhX29wdGlvbmFsICA9ICggeCApIC0+ICggbm90IHg/ICkgb3IgKCB0eXBlLmlzYSB4IClcbiAgICB1bmxlc3MgdHlwZS52YWxpZGF0ZT8gICAgIHRoZW4gdHlwZS52YWxpZGF0ZSAgICAgID0gY3JlYXRlX3ZhbGlkYXRvciB0eXBlLm5hbWUsICggeCApIC0+IHR5cGUuaXNhIHhcbiAgcmV0dXJuIG51bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmhpZGUgPSAoIG9iamVjdCwgbmFtZSwgdmFsdWUgKSA9PiBPYmplY3QuZGVmaW5lUHJvcGVydHkgb2JqZWN0LCBuYW1lLFxuICAgIGVudW1lcmFibGU6ICAgZmFsc2VcbiAgICB3cml0YWJsZTogICAgIHRydWVcbiAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB2YWx1ZTogICAgICAgIHZhbHVlXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxubmFtZWl0ID0gKCBuYW1lLCBmICkgLT4gT2JqZWN0LmRlZmluZVByb3BlcnR5IGYsICduYW1lJywgeyB2YWx1ZTogbmFtZSwgfTsgZlxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmdldF9pbnN0YW5jZV9tZXRob2RzID0gKCBpbnN0YW5jZSApIC0+XG4gIFIgICAgICAgICAgICAgPSB7fVxuICBmb3Iga2V5LCB7IHZhbHVlOiBtZXRob2QsIH0gb2YgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMgaW5zdGFuY2VcbiAgICBjb250aW51ZSBpZiBrZXkgaXMgJ2NvbnN0cnVjdG9yJ1xuICAgIGNvbnRpbnVlIHVubGVzcyBnbmQuZnVuY3Rpb24uaXNhIG1ldGhvZFxuICAgIFJbIGtleSBdID0gbWV0aG9kXG4gIHJldHVybiBSXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuYmluZF9pbnN0YW5jZV9tZXRob2RzID0gKCBpbnN0YW5jZSwga2VlcF9uYW1lID0gdHJ1ZSApIC0+XG4gIGZvciBrZXksIG1ldGhvZCBvZiBnZXRfaW5zdGFuY2VfbWV0aG9kcyBPYmplY3QuZ2V0UHJvdG90eXBlT2YgaW5zdGFuY2VcbiAgICBpZiBrZWVwX25hbWVcbiAgICAgIGhpZGUgaW5zdGFuY2UsIGtleSwgbmFtZWl0IG1ldGhvZC5uYW1lLCBtZXRob2QuYmluZCBpbnN0YW5jZVxuICAgIGVsc2VcbiAgICAgIGhpZGUgaW5zdGFuY2UsIGtleSwgbWV0aG9kLmJpbmQgaW5zdGFuY2VcbiAgcmV0dXJuIG51bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbnB1c2hfYXQgPSAoIGxpc3QsIGlkeCwgeCApIC0+XG4gIHVubGVzcyBpZHggPCAwXG4gICAgdGhyb3cgbmV3IEVycm9yIFwizqluZmFfX183IGV4cGVjdGVkIG5lZ2F0aXZlIG51bWJlciwgZ290ICN7cnByIGlkeH1cIlxuICBsaXN0LnNwbGljZSAoIE1hdGgubWF4IGxpc3QubGVuZ3RoICsgaWR4LCAwICksIDAsIHhcbiAgcmV0dXJuIGxpc3RcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgcG9wX2F0ID0gKCBsaXN0LCBpZHgsIHggKSAtPlxuIyAgIHVubGVzcyBpZHggPCAwXG4jICAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqW5mYV9fXzggZXhwZWN0ZWQgbmVnYXRpdmUgbnVtYmVyLCBnb3QgI3tycHIgaWR4fVwiXG4jICAgdW5sZXNzIGxpc3QubGVuZ3RoID49IE1hdGguYWJzIGlkeFxuIyAgICAgdGhyb3cgbmV3IEVycm9yIFwizqluZmFfX185IGxpc3QgdG9vIHNob3J0LCBnb3QgaW5kZXggI3tpZHh9IGZvciBsZW5ndGggb2YgI3tsaXN0Lmxlbmd0aH1cIlxuIyAgIHJldHVybiAoIGxpc3Quc3BsaWNlIGlkeCwgMSApWyAwIF1cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5zZXRfYXQgPSAoIGxpc3QsIGlkeCwgeCApIC0+XG4gIHVubGVzcyBpZHggPCAwXG4gICAgdGhyb3cgbmV3IEVycm9yIFwizqluZmFfXzEwIGV4cGVjdGVkIG5lZ2F0aXZlIG51bWJlciwgZ290ICN7cnByIGlkeH1cIlxuICBsaXN0WyBsaXN0Lmxlbmd0aCArIGlkeCBdID0geFxuICByZXR1cm4geFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZGVidWcgICA9IGNvbnNvbGUuZGVidWdcbmhlbHAgICAgPSBjb25zb2xlLmhlbHBcbndhcm4gICAgPSBjb25zb2xlLndhcm5cbnJwciAgICAgPSAoIHggKSAtPiAoIHJlcXVpcmUgJ2xvdXBlJyApLmluc3BlY3QgeFxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbm1vZHVsZS5leHBvcnRzID0ge1xuICBUZW1wbGF0ZVxuICBnbmRcbiAgY3JlYXRlX3ZhbGlkYXRvclxuICBoaWRlXG4gIG5hbWVpdFxuICAjIGdldF9pbnN0YW5jZV9tZXRob2RzXG4gIGJpbmRfaW5zdGFuY2VfbWV0aG9kc1xuICBwdXNoX2F0XG4gICMgcG9wX2F0XG4gIHNldF9hdFxuICBkZWJ1Z1xuICBoZWxwXG4gIHdhcm5cbiAgcnByIH1cbiJdfQ==
