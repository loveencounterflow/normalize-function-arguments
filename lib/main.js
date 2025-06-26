(function() {
  'use strict';
  var Arity_error, H, Internals, Normalize_function_arguments, Not_implemented_error, Value_mismatch_error, bind_instance_methods, debug, get_signature, gnd, help, hide, internals, nameit, nfa, normalizer, rpr, warn;

  //===========================================================================================================
  H = require('./helpers');

  // get_instance_methods
  ({gnd, hide, bind_instance_methods, nameit, debug, warn, help, rpr} = H);

  // E                         = require './errors'
  // optional                  = Symbol 'optional'

    //=========================================================================================================
  Arity_error = class Arity_error extends Error {};

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
  Normalize_function_arguments = class Normalize_function_arguments {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg = null) {
      if (cfg != null) {
        throw new Not_implemented_error("Ωnfa___1 configuration not implemented");
      }
      bind_instance_methods(this);
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    nfa(fn)/* Normalize Function Arguments */ {
      var arity, disposition, dispositions, i, idx, len, name, names, p_arity, p_names, signature;
      signature = this.get_signature(fn);
      names = Object.keys(signature);
      arity = names.length;
      p_names = names.slice(0, names.length - 1);
      p_arity = p_names.length;
      //.......................................................................................................
      dispositions = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = names.length; i < len; i++) {
          name = names[i];
          results.push(signature[name]);
        }
        return results;
      })();
      for (idx = i = 0, len = dispositions.length; i < len; idx = ++i) {
        disposition = dispositions[idx];
        if (disposition === 'bare') {
          continue;
        }
        throw new Not_implemented_error(`Ωnfa___2 encountered unimplemented disposition ${rpr(disposition)} for parameter #names[ idx ]`);
      }
      //.......................................................................................................
      return function(...P) {
        var Q/* NOTE copy object so we can modify it */, j, len1, p_value, q_value;
        //.....................................................................................................
        if (gnd.pod.isa(P.at(-1))) {
          Q = gnd.pod.create(P.pop());
        } else {
          Q = gnd.pod.create();
        }
        //.....................................................................................................
        if (P.length > p_arity) {
          throw new Arity_error(`Ωnfa___3 expected up to ${p_arity} positional arguments, got ${P.length}`);
        }
        while (P.length < p_arity) {
          //.....................................................................................................
          P.push(void 0);
        }
//.....................................................................................................
        for (idx = j = 0, len1 = p_names.length; j < len1; idx = ++j) {
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
              //   throw new Value_mismatch_error "Ωnfa___4"
              // P[ idx  ] = q_value                                           # strategy: 'named'
              Q[name] = p_value; // strategy: 'positional'
          }
        }
        //.....................................................................................................
        return fn.call(this, ...P, Q);
      };
    }

    //---------------------------------------------------------------------------------------------------------
    get_signature(fn) {
      /* thx to https://github.com/sindresorhus/identifier-regex */
      var $names, R, body, disposition, i, jsid_re, kernel, len, match, name, part, parts;
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
        switch (true) {
          //...................................................................................................
          case (match = part.match(/^[.]{3}\s*(?<name>\S+)\s*$/sv)) != null:
            disposition = 'soak';
            name = match.groups.name;
            break;
          //...................................................................................................
          case (match = part.match(/^(?<name>\S+)\s*=\s*optional$/sv)) != null:
            disposition = 'optional';
            name = match.groups.name;
            break;
          default:
            //...................................................................................................
            if ((part.match(jsid_re)) == null) {
              throw new Error(`Ωnfa___8 not compliant: ${rpr(part)} in ${rpr(kernel)}`);
            }
            disposition = 'bare';
            name = part;
        }
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
  module.exports = {nfa, get_signature, internals};

}).call(this);

//# sourceMappingURL=main.js.map