(function() {
  'use strict';
  var Arity_error, H, Internals, Named_arity_error, Normalize_function_arguments, Not_implemented_error, Positional_arity_error, Template, Value_mismatch_error, bind_instance_methods, debug, get_signature, gnd, help, hide, internals, nameit, nfa, normalizer, rpr, warn;

  //===========================================================================================================
  H = require('./helpers');

  // get_instance_methods
  ({gnd, hide, bind_instance_methods, nameit, debug, warn, help, rpr} = H);

  // E                         = require './errors'
  // optional                  = Symbol 'optional'

    //=========================================================================================================
  Arity_error = class Arity_error extends Error {};

  Named_arity_error = class Named_arity_error extends Arity_error {};

  Positional_arity_error = class Positional_arity_error extends Arity_error {};

  Not_implemented_error = class Not_implemented_error extends Error {};

  Value_mismatch_error = class Value_mismatch_error extends Error {};

  //===========================================================================================================
  internals = new (Internals = class Internals {
    constructor() {
      this.pod_prototypes = H.pod_prototypes;
      this.gnd = gnd;
      return void 0;
    }

  })();

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
  Normalize_function_arguments = class Normalize_function_arguments {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg = null) {
      if (cfg != null) {
        throw new Not_implemented_error("Ωnfa___2 configuration not implemented");
      }
      bind_instance_methods(this);
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    nfa(fn)/* Normalize Function Arguments */ {
      var arity, names, p_arity, p_names, signature;
      signature = this.get_signature(fn);
      names = Object.keys(signature);
      arity = names.length;
      p_names = names.slice(0, names.length - 1);
      p_arity = p_names.length;
      //.......................................................................................................
      return function(...P) {
        var Q, i, idx, len, name, p_value, q_value;
        //.....................................................................................................
        if (gnd.pod.isa(P.at(-1))) {
          if (arity === 0) {
            throw new Named_arity_error("Ωnfa___3 expected up to 0 named arguments objects, got 1");
          } else {
            Q = gnd.pod.create(P.pop());
          }
        } else {
          if (/* NOTE copy object so we can modify it */arity === 0) {
            Q = null;
          } else {
            Q = gnd.pod.create();
          }
        }
        //.....................................................................................................
        if (P.length > p_arity) {
          throw new Positional_arity_error(`Ωnfa___4 expected up to ${p_arity} positional arguments, got ${P.length}`);
        }
        while (P.length < p_arity) {
          //.....................................................................................................
          P.push(void 0);
        }
        //.....................................................................................................
        if ((p_arity > 0) && (Q != null)) {
          for (idx = i = 0, len = p_names.length; i < len; idx = ++i) {
            name = p_names[idx];
            p_value = P[idx];
            q_value = Q[name];
            switch (true) {
              case (p_value === void 0) && (q_value === void 0):
                null;
                break;
              case (p_value === void 0) && (q_value !== void 0):
                P[idx] = q_value;
                break;
              case (p_value !== void 0) && (q_value === void 0):
                Q[name] = p_value;
                break;
              default:
                /* TAINT treat acc to value mismatch resolution strategy */
                // unless p_value is q_value                                   # strategy: 'error'
                //   throw new Value_mismatch_error "Ωnfa___5"
                // P[ idx  ] = q_value                                           # strategy: 'named'
                Q[name] = p_value; // strategy: 'positional'
            }
          }
        }
        //.....................................................................................................
        return fn.call(this, ...P, Q);
      };
    }

    //---------------------------------------------------------------------------------------------------------
    get_signature(fn) {
      /* thx to https://github.com/sindresorhus/identifier-regex */
      var $names, R, body, disposition, i, jsid_re, kernel, len, name, part, parts;
      jsid_re = /^[$_\p{ID_Start}][$_\u200C\u200D\p{ID_Continue}]*$/sv;
      R = {};
      body = fn.toString();
      kernel = body.replace(/^[^\(]*\(\s*([^\)]*)\s*\).*$/sv, '$1');
      if (kernel === '') {
        return R;
      }
      parts = kernel.split(/,\s*/sv);
      $names = [];
//.......................................................................................................
      for (i = 0, len = parts.length; i < len; i++) {
        part = parts[i];
        // switch true
        //   #...................................................................................................
        //   when ( match = part.match /// ^ [.]{3} \s* (?<name> \S+ ) \s* $ ///sv )?
        //     disposition   = 'soak'
        //     name          = match.groups.name
        //   #...................................................................................................
        //   when ( match = part.match /// ^ (?<name> \S+ ) \s* = \s* optional $///sv )?
        //     disposition   = 'optional'
        //     name          = match.groups.name
        //   #...................................................................................................
        //   else
        if ((part.match(jsid_re)) == null) {
          throw new Error(`Ωnfa___6 not compliant: ${rpr(part)} in ${rpr(kernel)}`);
        }
        disposition = 'bare';
        name = part;
        //.....................................................................................................
        R[name] = disposition;
        $names.push(name);
      }
      return R;
    }

  };

  //===========================================================================================================
  normalizer = new Normalize_function_arguments();

  ({nfa, get_signature} = normalizer);

  //===========================================================================================================
  module.exports = {nfa, get_signature, Normalize_function_arguments, Template, internals};

}).call(this);

//# sourceMappingURL=main.js.map