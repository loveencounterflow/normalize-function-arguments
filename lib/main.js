(function() {
  'use strict';
  var Arity_error, Internals, Not_implemented_error, Value_mismatch_error, debug, get_signature, gnd, help, hide, internals, nameit, nfa, pod_prototypes, rpr, warn,
    indexOf = [].indexOf;

  //===========================================================================================================
  // get_instance_methods
  // bind_instance_methods
  ({hide, nameit, debug, warn, help, rpr} = require('./helpers'));

  // E                         = require './errors'
  //-----------------------------------------------------------------------------------------------------------
  // optional                  = Symbol 'optional'
  pod_prototypes = Object.freeze([null, Object.getPrototypeOf({})]);

  gnd = {
    pod: {
      isa: function(x) {
        var ref;
        return (x != null) && (ref = Object.getPrototypeOf(x), indexOf.call(pod_prototypes, ref) >= 0);
      }
    }
  };

  //=========================================================================================================
  Arity_error = class Arity_error extends Error {};

  Not_implemented_error = class Not_implemented_error extends Error {};

  Value_mismatch_error = class Value_mismatch_error extends Error {};

  //===========================================================================================================
  internals = new (Internals = class Internals {
    constructor() {
      this.pod_prototypes = pod_prototypes;
      this.gnd = gnd;
      return void 0;
    }

  })();

  //=========================================================================================================
  get_signature = function(f) {
    /* thx to https://github.com/sindresorhus/identifier-regex */
    var $names, R, body, disposition, i, jsid_re, kernel, len, match, name, part, parts;
    jsid_re = /^[$_\p{ID_Start}][$_\u200C\u200D\p{ID_Continue}]*$/sv;
    debug();
    body = f.toString();
    kernel = body.replace(/^[^\(]*\(\s*([^\)]*)\s*\).*$/sv, '$1');
    parts = kernel.split(/,\s*/sv);
    // urge 'Ω__59', rpr body
    // urge 'Ω__60', rpr kernel
    // urge 'Ω__61', rpr parts
    $names = [];
    // R       = { $names, }
    R = {};
    for (i = 0, len = parts.length; i < len; i++) {
      part = parts[i];
      switch (true) {
        case (match = part.match(/^[.]{3}\s*(?<name>\S+)\s*$/sv)) != null:
          name = match.groups.name;
          disposition = 'soak';
          break;
        case (match = part.match(/^(?<name>\S+)\s*=\s*optional$/sv)) != null:
          name = match.groups.name;
          disposition = 'optional';
          break;
        default:
          if ((part.match(jsid_re)) == null) {
            throw new Error(`Ω__62 not compliant: ${rpr(part)} in ${rpr(kernel)}`);
          }
          name = part;
          disposition = 'bare';
      }
      // info 'Ω__63', ( rpr part ), { name, disposition, }
      R[name] = disposition;
      // R[ name ] = { name, disposition, }
      $names.push(name);
    }
    return R;
  };

  //=========================================================================================================
  nfa = function(fn) {
    /* Normalize Function Arguments */
    var arity, disposition, dispositions, i, idx, len, name, names, pos_names, signature;
    signature = get_signature(fn);
    names = Object.keys(signature);
    pos_names = names.slice(0, +(names.length - 2) + 1 || 9e9);
    arity = names.length;
    dispositions = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = names.length; i < len; i++) {
        name = names[i];
        results.push(signature[name]);
      }
      return results;
    })();
//.......................................................................................................
    for (idx = i = 0, len = dispositions.length; i < len; idx = ++i) {
      disposition = dispositions[idx];
      if (disposition === 'bare') {
        continue;
      }
      throw new Not_implemented_error(`Ω__65 encountered unimplemented disposition ${rpr(disposition)} for parameter #names[ idx ]`);
    }
    //.......................................................................................................
    return function(...P) {
      var Q, j, len1, nme_value, pos_value;
      //.....................................................................................................
      if (P.length > arity) {
        throw new Arity_error(`Ω__66 expected up to ${arity} arguments, got ${P.length}`);
      }
      //.....................................................................................................
      if (!gnd.pod.isa(P.at(-1))) {
        if (P.length > arity - 1) {
          throw new Arity_error(`Ω__67 expected up to ${arity - 1} positional arguments plus one POD, got ${P.length} positional arguments`);
        }
        P.push({}); // Object.create null
      } else {
        /* NOTE copy object so we can modify it */
        // P[ P.length - 1 ] = Object.assign ( Object.create null ), P.at -1
        P[P.length - 1] = Object.assign({}, P.at(-1));
      }
      //.....................................................................................................
      while (P.length < arity) {
        P.splice(P.length - 1, 0, void 0);
      }
      //.....................................................................................................
      /* TAINT use Q = P.pop(), fn.call @, P..., Q */
      Q = P.at(-1);
      for (idx = j = 0, len1 = pos_names.length; j < len1; idx = ++j) {
        name = pos_names[idx];
        pos_value = P[idx];
        nme_value = Q[name];
        switch (true) {
          case (pos_value === void 0) && (nme_value === void 0):
            null;
            break;
          case (pos_value === void 0) && (nme_value !== void 0):
            P[idx] = nme_value;
            break;
          case (pos_value !== void 0) && (nme_value === void 0):
            Q[name] = pos_value;
            break;
          default:
            /* TAINT treat acc to value mismatch resolution strategy */
            // unless pos_value is nme_value                                   # strategy: 'error'
            //   throw new Value_mismatch_error "Ω__68"
            // P[ idx  ] = nme_value                                           # strategy: 'named'
            Q[name] = pos_value; // strategy: 'positional'
        }
      }
      //.....................................................................................................
      return fn.call(this, ...P);
    };
  };

  //===========================================================================================================
  module.exports = {nfa, internals};

}).call(this);

//# sourceMappingURL=main.js.map