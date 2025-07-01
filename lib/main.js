(function() {
  'use strict';
  var Argument_type_error, Arity_error, H, Internals, Named_arity_error, Nfa_error, Normalize_function_arguments, Not_implemented_error, Positional_arity_error, Runtime_arity_error, Signature_cfg_position_error, Signature_disposition_Error, Signature_error, Signature_missing_parameter_Error, Signature_naming_Error, Template, Type_error, Value_mismatch_error, bind_instance_methods, create_validator, debug, get_signature, gnd, help, hide, internals, nameit, nfa, normalizer, push_at, rpr, set_at, warn;

  //===========================================================================================================
  H = require('./helpers');

  // get_instance_methods
  // pop_at
  ({Template, gnd, hide, create_validator, bind_instance_methods, nameit, push_at, set_at, debug, warn, help, rpr} = H);

  // E                         = require './errors'
  // optional                  = Symbol 'optional'

    //=========================================================================================================
  Nfa_error = class Nfa_error extends Error {};

  Arity_error = class Arity_error extends Nfa_error {};

  Named_arity_error = class Named_arity_error extends Arity_error {};

  Runtime_arity_error = class Runtime_arity_error extends Arity_error {};

  Positional_arity_error = class Positional_arity_error extends Arity_error {};

  Not_implemented_error = class Not_implemented_error extends Nfa_error {};

  Signature_error = class Signature_error extends Nfa_error {};

  Signature_disposition_Error = class Signature_disposition_Error extends Signature_error {};

  Signature_naming_Error = class Signature_naming_Error extends Signature_error {};

  Signature_missing_parameter_Error = class Signature_missing_parameter_Error extends Signature_error {};

  Signature_cfg_position_error = class Signature_cfg_position_error extends Signature_error {};

  Value_mismatch_error = class Value_mismatch_error extends Nfa_error {};

  Type_error = class Type_error extends Nfa_error {};

  Argument_type_error = class Argument_type_error extends Type_error {};

  //===========================================================================================================
  internals = new (Internals = class Internals {
    constructor() {
      this.pod_prototypes = H.pod_prototypes;
      this.gnd = gnd;
      this.push_at = push_at;
      // @pop_at         = pop_at
      this.set_at = set_at;
      this.nameit = nameit;
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
      var arity, fn_name, names, q_idx, q_ridx, validate;
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
      gnd.nfa_cfg.validate(cfg);
      //.......................................................................................................
      ({names, q_idx, q_ridx} = this.get_signature(fn));
      arity = names.length;
      fn_name = fn.name;
      //.......................................................................................................
      validate = cfg.isa != null ? create_validator(`${fn_name}_cfg`, cfg.isa) : function(x) {
        return x;
      };
      //.......................................................................................................
      return nameit(fn_name, function(...P) {
        /* ATP, `P` holds `arity` arguments and there *is* a POD in CFG position (which we assume to
               represent CFG so we can make a copy, filling in template values): */
        var Q, i, idx, len, name;
        if (P.length > arity) {
          throw new Positional_arity_error(`Ωnfa___5 expected up to ${arity} arguments, got ${P.length}`);
        }
        //.....................................................................................................
        if (gnd.pod.isa(P.at(q_ridx))) {
          while (P.length < arity) {
            push_at(P, q_ridx, void 0);
          }
          Q = set_at(P, q_ridx, gnd.pod.create(cfg.template, P.at(q_ridx)));
        } else {
          while (P.length < arity) {
            P.push(void 0);
          }
          /* ATP, `P` holds `arity` arguments and there *may be* an `undefined` in CFG position (which we
                 assume is replaceable by a newly created CFG instance with template values): */
          if ((P.at(q_ridx)) === void 0) {
            Q = set_at(P, q_ridx, gnd.pod.create(cfg.template));
          } else {
            throw new Argument_type_error(`Ωnfa___6 expected an optional POD at position ${q_ridx}, got ${rpr(P.at(q_ridx))}`);
          }
        }
//.....................................................................................................
/* Harmonize values: */
        for (idx = i = 0, len = names.length; i < len; idx = ++i) {
          name = names[idx];
          if (idx === q_idx/* skip over CFG object's (`Q`'s') position in P */) {
            continue;
          }
          if (P[idx] === void 0) {
            P[idx] = Q[name];
          } else {
            Q[name] = P[idx];
          }
          if (Q[name] === void 0) {
            Q[name] = P[idx];
          }
        }
        //.....................................................................................................
        return validate(fn.call(this, ...P));
      });
    }

    //---------------------------------------------------------------------------------------------------------
    get_signature(fn) {
      /* thx to https://github.com/sindresorhus/identifier-regex */
      var i, idx, jsid_re, len, name, names, names_rpr, q_idx, q_ridx, signature, this_cfg_q_name;
      this_cfg_q_name = 'cfg'/* TAINT pick from @cfg */
      jsid_re = /^[$_\p{ID_Start}][$_\u200C\u200D\p{ID_Continue}]*$/sv;
      //.......................................................................................................
      signature = fn.toString();
      signature = signature.replace(/\s+/svg, '');
      signature = signature.replace(/^[^\(]*\((?<parens>[^\)]*)\).*$/svg, '$<parens>');
      names = signature.split(',');
      //.......................................................................................................
      q_idx = null;
      for (idx = i = 0, len = names.length; i < len; idx = ++i) {
        name = names[idx];
        if (jsid_re.test(name)) {
          if (name === this_cfg_q_name) {
            q_idx = idx;
          }
        } else {
          throw new Signature_disposition_Error(`Ωnfa___7 parameter disposition not compliant: ${rpr(name)} in ${rpr(signature)}`);
        }
      }
      //.......................................................................................................
      if (q_idx == null) {
        names_rpr = names.join(', ');
        throw new Signature_naming_Error(`Ωnfa___8 parameter naming not compliant: no parameter named ${rpr(this_cfg_q_name)}, got ${rpr(names_rpr)}`);
      }
      //.......................................................................................................
      switch (q_idx) {
        case names.length - 2:
          q_ridx = -2;
          break;
        case names.length - 1:
          q_ridx = -1;
          break;
        default:
          throw new Signature_cfg_position_error(`Ωnfa___9 parameter ordering not compliant: expected ${rpr(this_cfg_q_name)} to come last or next-to-last, found it at index ${q_idx} of ${names.length} parameters`);
      }
      //.......................................................................................................
      return {names, q_idx, q_ridx};
    }

  };

  //===========================================================================================================
  normalizer = new Normalize_function_arguments();

  ({nfa, get_signature} = normalizer);

  //===========================================================================================================
  module.exports = {nfa, get_signature, Normalize_function_arguments, Template, internals};

}).call(this);

//# sourceMappingURL=main.js.map