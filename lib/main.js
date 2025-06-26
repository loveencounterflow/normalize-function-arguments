(function() {
  'use strict';
  var Arity_error, H, Internals, Named_arity_error, Nfa_error, Normalize_function_arguments, Not_implemented_error, Positional_arity_error, Runtime_arity_error, Signature_disposition_Error, Signature_error, Signature_missing_parameter_Error, Signature_naming_Error, Template, Type_error, Value_mismatch_error, bind_instance_methods, debug, get_signature, gnd, help, hide, internals, nameit, nfa, normalizer, rpr, warn;

  //===========================================================================================================
  H = require('./helpers');

  // get_instance_methods
  ({Template, gnd, hide, bind_instance_methods, nameit, debug, warn, help, rpr} = H);

  // E                         = require './errors'
  // optional                  = Symbol 'optional'

    //=========================================================================================================
  Nfa_error = class Nfa_error extends Error {};

  Arity_error = class Arity_error extends Nfa_error {};

  Named_arity_error = class Named_arity_error extends Arity_error {};

  Runtime_arity_error = class Runtime_arity_error extends Arity_error {};

  Positional_arity_error = class Positional_arity_error extends Arity_error {};

  Not_implemented_error = class Not_implemented_error extends Nfa_error {};

  Value_mismatch_error = class Value_mismatch_error extends Nfa_error {};

  Signature_error = class Signature_error extends Nfa_error {};

  Signature_disposition_Error = class Signature_disposition_Error extends Signature_error {};

  Signature_naming_Error = class Signature_naming_Error extends Arity_error {};

  Signature_missing_parameter_Error = class Signature_missing_parameter_Error extends Arity_error {};

  Type_error = class Type_error extends Nfa_error {};

  // class Npo_type_error                      extends Type_error

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
    nfa(cfg, fn)/* Normalize Function Arguments */ {
      var arity, names, p_arity, p_names, signature;
      switch (arity = arguments.length) {
        case 1:
          [cfg, fn] = [{}, cfg];
          break;
        case 2:
          null;
          break;
        default:
          throw new Runtime_arity_error(`Ωnfa___2 expected 1 or 2 arguments, got ${arity}`);
      }
      //.......................................................................................................
      /* TAINT do this in `gnd` */
      if (!gnd.pod.isa(cfg)) {
        throw new Type_error(`Ωnfa___3 expected a POD, got ${rpr(cfg)}`);
      }
      if (!gnd.function.isa(fn)) {
        throw new Type_error(`Ωnfa___4 expected a function, got ${rpr(cfg)}`);
      }
      //.......................................................................................................
      cfg = {...gnd.nfa_cfg.template, ...cfg};
      if (cfg.template != null) {
        cfg.template = new Template(cfg.template);
      }
      //.......................................................................................................
      signature = this.get_signature(fn);
      // q_name            = 'cfg'
      names = Object.keys(signature);
      arity = names.length;
      p_names = names.slice(0, names.length - 1);
      p_arity = p_names.length;
      //.......................................................................................................
      return function(...P) {
        var Q, i, idx, len, name, p_value, q_value;
        //.....................................................................................................
        if (gnd.pod.isa(P.at(-1))) {
          Q = gnd.pod.create(cfg.template, P.pop());
        } else {
          Q = gnd.pod.create(cfg.template);
        }
        //.....................................................................................................
        if (P.length > p_arity) {
          throw new Positional_arity_error(`Ωnfa__10 expected up to ${p_arity} positional arguments, got ${P.length}`);
        }
        while (P.length < p_arity) {
          //.....................................................................................................
          P.push(void 0);
        }
//.....................................................................................................
        for (idx = i = 0, len = p_names.length; i < len; idx = ++i) {
          name = p_names[idx];
          p_value = P[idx];
          q_value = Q[name];
          switch (true) {
            case p_value !== void 0:
              Q[name] = p_value;
              break;
            case (p_value === void 0) && (q_value !== void 0):
              P[idx] = q_value;
          }
        }
        //.....................................................................................................
        return fn.call(this, ...P, Q);
      };
    }

    //---------------------------------------------------------------------------------------------------------
    get_signature(fn) {
      /* thx to https://github.com/sindresorhus/identifier-regex */
      var R, body, disposition, i, jsid_re, kernel, last_name, len, name, names, part, parts, q_name;
      q_name = 'cfg';
      jsid_re = /^[$_\p{ID_Start}][$_\u200C\u200D\p{ID_Continue}]*$/sv;
      R = {};
      body = fn.toString();
      kernel = body.replace(/^[^\(]*\(\s*([^\)]*)\s*\).*$/sv, '$1');
      if (kernel === '') {
        throw new Signature_missing_parameter_Error(`Ωnfa__13 not compliant: missing parameter ${rpr(q_name)}`);
      }
      parts = kernel.split(/,\s*/sv);
      parts = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = parts.length; i < len; i++) {
          part = parts[i];
          results.push(part.trim());
        }
        return results;
      })();
      names = [];
//.......................................................................................................
      for (i = 0, len = parts.length; i < len; i++) {
        part = parts[i];
        if ((part.match(jsid_re)) == null) {
          throw new Signature_disposition_Error(`Ωnfa__14 parameter disposition not compliant: ${rpr(part)} in ${rpr(kernel)}`);
        }
        disposition = 'bare';
        name = part;
        //.....................................................................................................
        R[name] = disposition;
        names.push(name);
      }
      //.......................................................................................................
      if ((last_name = names.at(-1)) !== q_name) {
        throw new Signature_naming_Error(`Ωnfa__15 parameter naming not compliant: last parameter must be named ${rpr(q_name)}, got ${rpr(last_name)}`);
      }
      // delete R[ q_name ]
      //.......................................................................................................
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