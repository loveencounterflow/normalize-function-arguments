(function() {
  'use strict';
  var Argument_type_error, Arity_error, H, Internals, Named_arity_error, Nfa_error, Normalize_function_arguments, Not_implemented_error, Positional_arity_error, Runtime_arity_error, SFMODULES, Signature_cfg_position_error, Signature_disposition_Error, Signature_error, Signature_missing_parameter_Error, Signature_naming_Error, Template, Type_error, Value_mismatch_error, _call_asyncfunction, _call_generatorfunction, bind_instance_methods, create_validator, debug, get_signature, gnd, help, hide, internals, nameit, nfa, normalizer, push_at, rpr, set_at, type_of, warn;

  //===========================================================================================================
  H = require('./helpers');

  // get_instance_methods
  // pop_at
  ({Template, gnd, hide, create_validator, bind_instance_methods, nameit, push_at, set_at, debug, warn, help, rpr} = H);

  // E                         = require './errors'
  // optional                  = Symbol 'optional'
  SFMODULES = require('bricabrac-sfmodules');

  ({type_of} = SFMODULES.unstable.require_type_of());

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
      if (!gnd.callable.isa(fn)) {
        throw new Type_error(`Ωnfa___4 expected a callable, got ${rpr(cfg)}`);
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
      if (fn_name === '') {
        fn_name = '(ANONOYMOUS FUNCTION)';
      }
      //.......................................................................................................
      validate = cfg.isa != null ? create_validator(`${fn_name}_cfg`, cfg.isa) : function(x) {
        return x;
      };
      //.......................................................................................................
      return nameit(fn_name, function(...P) {
        /* ATP, `P` holds `arity` arguments and there *is* a POD in CFG position (which we assume to
               represent CFG so we can make a copy, filling in template values): */
        var Q, i, idx, len, name, type;
        if (P.length > arity) {
          throw new Positional_arity_error(`Ωnfa___5 expected up to ${arity} arguments, got ${P.length}`);
        }
        //.....................................................................................................
        if ((q_ridx === -2) && (gnd.callable.isa(P.at(-1)))) {
          if (gnd.pod.isa(P.at(q_ridx))) {
            while (P.length < arity) {
              push_at(P, q_ridx, void 0);
            }
          } else {
            while (P.length < arity) {
              push_at(P, -1, void 0);
            }
          }
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
        switch (type = type_of(fn)) {
          case 'function':
            return validate(fn.call(this, ...P));
          case 'asyncfunction':
            return _call_asyncfunction.call(this, validate, fn, P);
          case 'generatorfunction':
            return _call_generatorfunction.call(this, validate, fn, P);
          default:
            throw new Error(`Ωnfa___8 unable to handle callable of type ${rpr(type)}`);
        }
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
          throw new Signature_disposition_Error(`Ωnfa___9 parameter disposition not compliant: ${rpr(name)} in ${rpr(signature)}`);
        }
      }
      //.......................................................................................................
      if (q_idx == null) {
        names_rpr = names.join(', ');
        throw new Signature_naming_Error(`Ωnfa__10 parameter naming not compliant: no parameter named ${rpr(this_cfg_q_name)}, got ${rpr(names_rpr)}`);
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
          throw new Signature_cfg_position_error(`Ωnfa__11 parameter ordering not compliant: expected ${rpr(this_cfg_q_name)} to come last or next-to-last, found it at index ${q_idx} of ${names.length} parameters`);
      }
      //.......................................................................................................
      return {names, q_idx, q_ridx};
    }

  };

  //===========================================================================================================
  // _call_asyncfunction     = ( validate, fn, P ) -> validate await fn.call @, P...
  /* TAINT where to put validate()??? */
  _call_asyncfunction = async function(validate, fn, P) {
    return (await fn.call(this, ...P));
  };

  _call_generatorfunction = function*(validate, fn, P) {
    return (yield* fn.call(this, ...P));
  };

  //===========================================================================================================
  normalizer = new Normalize_function_arguments();

  ({nfa, get_signature} = normalizer);

  //===========================================================================================================
  module.exports = {nfa, get_signature, Normalize_function_arguments, Template, internals};

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQUE7QUFBQSxNQUFBLG1CQUFBLEVBQUEsV0FBQSxFQUFBLENBQUEsRUFBQSxTQUFBLEVBQUEsaUJBQUEsRUFBQSxTQUFBLEVBQUEsNEJBQUEsRUFBQSxxQkFBQSxFQUFBLHNCQUFBLEVBQUEsbUJBQUEsRUFBQSxTQUFBLEVBQUEsNEJBQUEsRUFBQSwyQkFBQSxFQUFBLGVBQUEsRUFBQSxpQ0FBQSxFQUFBLHNCQUFBLEVBQUEsUUFBQSxFQUFBLFVBQUEsRUFBQSxvQkFBQSxFQUFBLG1CQUFBLEVBQUEsdUJBQUEsRUFBQSxxQkFBQSxFQUFBLGdCQUFBLEVBQUEsS0FBQSxFQUFBLGFBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxVQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBLElBQUE7OztFQUdBLENBQUEsR0FBNEIsT0FBQSxDQUFRLFdBQVIsRUFINUI7Ozs7RUFJQSxDQUFBLENBQUUsUUFBRixFQUNFLEdBREYsRUFFRSxJQUZGLEVBR0UsZ0JBSEYsRUFLRSxxQkFMRixFQU1FLE1BTkYsRUFPRSxPQVBGLEVBU0UsTUFURixFQVVFLEtBVkYsRUFXRSxJQVhGLEVBWUUsSUFaRixFQWFFLEdBYkYsQ0FBQSxHQWE0QixDQWI1QixFQUpBOzs7O0VBb0JBLFNBQUEsR0FBNEIsT0FBQSxDQUFRLHFCQUFSOztFQUM1QixDQUFBLENBQUUsT0FBRixDQUFBLEdBQTRCLFNBQVMsQ0FBQyxRQUFRLENBQUMsZUFBbkIsQ0FBQSxDQUE1QixFQXJCQTs7O0VBeUJNLFlBQU4sTUFBQSxVQUFBLFFBQWtELE1BQWxELENBQUE7O0VBQ00sY0FBTixNQUFBLFlBQUEsUUFBa0QsVUFBbEQsQ0FBQTs7RUFDTSxvQkFBTixNQUFBLGtC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QXJFakIsRUFyREE7Ozs7O0VBMEpBLG1CQUFBLEdBQTBCLE1BQUEsUUFBQSxDQUFFLFFBQUYsRUFBWSxFQUFaLEVBQWdCLENBQWhCLENBQUE7V0FBdUIsQ0FBQSxNQUFNLEVBQUUsQ0FBQyxJQUFILENBQVEsSUFBUixFQUFXLEdBQUEsQ0FBWCxDQUFOO0VBQXZCOztFQUMxQix1QkFBQSxHQUEwQixTQUFBLENBQUUsUUFBRixFQUFZLEVBQVosRUFBZ0IsQ0FBaEIsQ0FBQTtXQUF1QixDQUFBLE9BQVcsRUFBRSxDQUFDLElBQUgsQ0FBUSxJQUFSLEVBQVcsR0FBQSxDQUFYLENBQVg7RUFBdkIsRUEzSjFCOzs7RUE4SkEsVUFBQSxHQUE0QixJQUFJLDRCQUFKLENBQUE7O0VBQzVCLENBQUEsQ0FBRSxHQUFGLEVBQ0UsYUFERixDQUFBLEdBQzRCLFVBRDVCLEVBL0pBOzs7RUFtS0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsQ0FBRSxHQUFGLEVBQU8sYUFBUCxFQUFzQiw0QkFBdEIsRUFBb0QsUUFBcEQsRUFBOEQsU0FBOUQ7QUFuS2pCIiwic291cmNlc0NvbnRlbnQiOlsiXG4ndXNlIHN0cmljdCdcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5IICAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9oZWxwZXJzJ1xueyBUZW1wbGF0ZVxuICBnbmRcbiAgaGlkZVxuICBjcmVhdGVfdmFsaWRhdG9yXG4gICMgZ2V0X2luc3RhbmNlX21ldGhvZHNcbiAgYmluZF9pbnN0YW5jZV9tZXRob2RzXG4gIG5hbWVpdFxuICBwdXNoX2F0XG4gICMgcG9wX2F0XG4gIHNldF9hdFxuICBkZWJ1Z1xuICB3YXJuXG4gIGhlbHBcbiAgcnByICAgICAgICAgICAgICAgICAgIH0gPSBIXG4jIEUgICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL2Vycm9ycydcbiMgb3B0aW9uYWwgICAgICAgICAgICAgICAgICA9IFN5bWJvbCAnb3B0aW9uYWwnXG5TRk1PRFVMRVMgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnYnJpY2FicmFjLXNmbW9kdWxlcydcbnsgdHlwZV9vZiwgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV90eXBlX29mKClcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBOZmFfZXJyb3IgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmRzIEVycm9yXG5jbGFzcyBBcml0eV9lcnJvciAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmRzIE5mYV9lcnJvclxuY2xhc3MgTmFtZWRfYXJpdHlfZXJyb3IgICAgICAgICAgICAgICAgICAgZXh0ZW5kcyBBcml0eV9lcnJvclxuY2xhc3MgUnVudGltZV9hcml0eV9lcnJvciAgICAgICAgICAgICAgICAgZXh0ZW5kcyBBcml0eV9lcnJvclxuY2xhc3MgUG9zaXRpb25hbF9hcml0eV9lcnJvciAgICAgICAgICAgICAgZXh0ZW5kcyBBcml0eV9lcnJvclxuY2xhc3MgTm90X2ltcGxlbWVudGVkX2Vycm9yICAgICAgICAgICAgICAgZXh0ZW5kcyBOZmFfZXJyb3JcbmNsYXNzIFNpZ25hdHVyZV9lcnJvciAgICAgICAgICAgICAgICAgICAgIGV4dGVuZHMgTmZhX2Vycm9yXG5jbGFzcyBTaWduYXR1cmVfZGlzcG9zaXRpb25fRXJyb3IgICAgICAgICBleHRlbmRzIFNpZ25hdHVyZV9lcnJvclxuY2xhc3MgU2lnbmF0dXJlX25hbWluZ19FcnJvciAgICAgICAgICAgICAgZXh0ZW5kcyBTaWduYXR1cmVfZXJyb3JcbmNsYXNzIFNpZ25hdHVyZV9taXNzaW5nX3BhcmFtZXRlcl9FcnJvciAgIGV4dGVuZHMgU2lnbmF0dXJlX2Vycm9yXG5jbGFzcyBTaWduYXR1cmVfY2ZnX3Bvc2l0aW9uX2Vycm9yICAgICAgICBleHRlbmRzIFNpZ25hdHVyZV9lcnJvclxuY2xhc3MgVmFsdWVfbWlzbWF0Y2hfZXJyb3IgICAgICAgICAgICAgICAgZXh0ZW5kcyBOZmFfZXJyb3JcbmNsYXNzIFR5cGVfZXJyb3IgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZHMgTmZhX2Vycm9yXG5jbGFzcyBBcmd1bWVudF90eXBlX2Vycm9yICAgICAgICAgICAgICAgICBleHRlbmRzIFR5cGVfZXJyb3JcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmludGVybmFscyA9IG5ldyBjbGFzcyBJbnRlcm5hbHMgdGhlbiBjb25zdHJ1Y3RvcjogLT5cbiAgQHBvZF9wcm90b3R5cGVzID0gSC5wb2RfcHJvdG90eXBlc1xuICBAZ25kICAgICAgICAgICAgPSBnbmRcbiAgQHB1c2hfYXQgICAgICAgID0gcHVzaF9hdFxuICAjIEBwb3BfYXQgICAgICAgICA9IHBvcF9hdFxuICBAc2V0X2F0ICAgICAgICAgPSBzZXRfYXRcbiAgQG5hbWVpdCAgICAgICAgID0gbmFtZWl0XG4gIHJldHVybiB1bmRlZmluZWRcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIE5vcm1hbGl6ZV9mdW5jdGlvbl9hcmd1bWVudHNcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAoIGNmZyA9IG51bGwgKSAtPlxuICAgIGlmIGNmZz9cbiAgICAgIHRocm93IG5ldyBOb3RfaW1wbGVtZW50ZWRfZXJyb3IgXCLOqW5mYV9fXzEgY29uZmlndXJhdGlvbiBub3QgaW1wbGVtZW50ZWRcIlxuICAgIGJpbmRfaW5zdGFuY2VfbWV0aG9kcyBAXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgbmZhOiAoIGNmZywgZm4gKSAtPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjIyBOb3JtYWxpemUgRnVuY3Rpb24gQXJndW1lbnRzICMjI1xuICAgIHN3aXRjaCBhcml0eSA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHdoZW4gMSB0aGVuIFsgY2ZnLCBmbiwgXSA9IFsge30sIGNmZywgXVxuICAgICAgd2hlbiAyIHRoZW4gbnVsbFxuICAgICAgZWxzZSB0aHJvdyBuZXcgUnVudGltZV9hcml0eV9lcnJvciBcIs6pbmZhX19fMiBleHBlY3RlZCAxIG9yIDIgYXJndW1lbnRzLCBnb3QgI3thcml0eX1cIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyMjIFRBSU5UIGRvIHRoaXMgaW4gYGduZGAgIyMjXG4gICAgdW5sZXNzIGduZC5wb2QuaXNhIGNmZyAgICAgIHRoZW4gdGhyb3cgbmV3IFR5cGVfZXJyb3IgXCLOqW5mYV9fXzMgZXhwZWN0ZWQgYSBQT0QsIGdvdCAje3JwciBjZmd9XCJcbiAgICB1bmxlc3MgZ25kLmNhbGxhYmxlLmlzYSBmbiAgdGhlbiB0aHJvdyBuZXcgVHlwZV9lcnJvciBcIs6pbmZhX19fNCBleHBlY3RlZCBhIGNhbGxhYmxlLCBnb3QgI3tycHIgY2ZnfVwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBjZmcgICAgICAgICAgICAgICA9IHsgZ25kLm5mYV9jZmcudGVtcGxhdGUuLi4sIGNmZy4uLiwgfVxuICAgIGNmZy50ZW1wbGF0ZSAgICAgID0gKCBuZXcgVGVtcGxhdGUgY2ZnLnRlbXBsYXRlICkgaWYgY2ZnLnRlbXBsYXRlP1xuICAgIGduZC5uZmFfY2ZnLnZhbGlkYXRlIGNmZ1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgeyBuYW1lc1xuICAgICAgcV9pZHhcbiAgICAgIHFfcmlkeCAgICAgICAgfSA9IEBnZXRfc2lnbmF0dXJlIGZuXG4gICAgYXJpdHkgICAgICAgICAgICAgPSBuYW1lcy5sZW5ndGhcbiAgICBmbl9uYW1lICAgICAgICAgICA9IGZuLm5hbWVcbiAgICBmbl9uYW1lICAgICAgICAgICA9ICcoQU5PTk9ZTU9VUyBGVU5DVElPTiknIGlmIGZuX25hbWUgaXMgJydcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHZhbGlkYXRlID0gaWYgY2ZnLmlzYT8gdGhlbiAoIGNyZWF0ZV92YWxpZGF0b3IgXCIje2ZuX25hbWV9X2NmZ1wiLCBjZmcuaXNhICkgZWxzZSAoIHggKSAtPiB4XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICByZXR1cm4gbmFtZWl0IGZuX25hbWUsICggUC4uLiApIC0+XG4gICAgICBpZiBQLmxlbmd0aCA+IGFyaXR5XG4gICAgICAgIHRocm93IG5ldyBQb3NpdGlvbmFsX2FyaXR5X2Vycm9yIFwizqluZmFfX181IGV4cGVjdGVkIHVwIHRvICN7YXJpdHl9IGFyZ3VtZW50cywgZ290ICN7UC5sZW5ndGh9XCJcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgaWYgKCBxX3JpZHggaXMgLTIgKSBhbmQgKCBnbmQuY2FsbGFibGUuaXNhICggUC5hdCAtMSApIClcbiAgICAgICAgaWYgZ25kLnBvZC5pc2EgUC5hdCBxX3JpZHggdGhlbiBwdXNoX2F0IFAsIHFfcmlkeCwgdW5kZWZpbmVkIHdoaWxlIFAubGVuZ3RoIDwgYXJpdHlcbiAgICAgICAgZWxzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdXNoX2F0IFAsICAgICAtMSwgdW5kZWZpbmVkIHdoaWxlIFAubGVuZ3RoIDwgYXJpdHlcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgaWYgZ25kLnBvZC5pc2EgUC5hdCBxX3JpZHhcbiAgICAgICAgcHVzaF9hdCBQLCBxX3JpZHgsIHVuZGVmaW5lZCB3aGlsZSBQLmxlbmd0aCA8IGFyaXR5XG4gICAgICAgICMjIyBBVFAsIGBQYCBob2xkcyBgYXJpdHlgIGFyZ3VtZW50cyBhbmQgdGhlcmUgKmlzKiBhIFBPRCBpbiBDRkcgcG9zaXRpb24gKHdoaWNoIHdlIGFzc3VtZSB0b1xuICAgICAgICByZXByZXNlbnQgQ0ZHIHNvIHdlIGNhbiBtYWtlIGEgY29weSwgZmlsbGluZyBpbiB0ZW1wbGF0ZSB2YWx1ZXMpOiAjIyNcbiAgICAgICAgUSA9IHNldF9hdCBQLCBxX3JpZHgsIGduZC5wb2QuY3JlYXRlIGNmZy50ZW1wbGF0ZSwgUC5hdCBxX3JpZHhcbiAgICAgIGVsc2VcbiAgICAgICAgUC5wdXNoIHVuZGVmaW5lZCB3aGlsZSBQLmxlbmd0aCA8IGFyaXR5XG4gICAgICAgICMjIyBBVFAsIGBQYCBob2xkcyBgYXJpdHlgIGFyZ3VtZW50cyBhbmQgdGhlcmUgKm1heSBiZSogYW4gYHVuZGVmaW5lZGAgaW4gQ0ZHIHBvc2l0aW9uICh3aGljaCB3ZVxuICAgICAgICBhc3N1bWUgaXMgcmVwbGFjZWFibGUgYnkgYSBuZXdseSBjcmVhdGVkIENGRyBpbnN0YW5jZSB3aXRoIHRlbXBsYXRlIHZhbHVlcyk6ICMjI1xuICAgICAgICBpZiAoIFAuYXQgcV9yaWR4ICkgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgUSA9IHNldF9hdCBQLCBxX3JpZHgsIGduZC5wb2QuY3JlYXRlIGNmZy50ZW1wbGF0ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50X3R5cGVfZXJyb3IgXCLOqW5mYV9fXzYgZXhwZWN0ZWQgYW4gb3B0aW9uYWwgUE9EIGF0IHBvc2l0aW9uICN7cV9yaWR4fSwgZ290ICN7cnByIFAuYXQgcV9yaWR4fVwiXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICMjIyBIYXJtb25pemUgdmFsdWVzOiAjIyNcbiAgICAgIGZvciBuYW1lLCBpZHggaW4gbmFtZXNcbiAgICAgICAgY29udGludWUgaWYgaWR4IGlzIHFfaWR4ICMjIyBza2lwIG92ZXIgQ0ZHIG9iamVjdCdzIChgUWAncycpIHBvc2l0aW9uIGluIFAgIyMjXG4gICAgICAgIGlmICggUFsgaWR4ICAgXSBpcyB1bmRlZmluZWQgKSAgdGhlbiAgUFsgaWR4ICBdID0gUVsgbmFtZSBdXG4gICAgICAgIGVsc2UgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUVsgbmFtZSBdID0gUFsgaWR4ICBdICMjIyBwb3MuYXJnOnMgb3RoZXIgdGhhbiB1bmRlZi4gdGFrZSBwcmVjZWRlbmNlICMjI1xuICAgICAgICBpZiAoIFFbIG5hbWUgIF0gaXMgdW5kZWZpbmVkICkgIHRoZW4gIFFbIG5hbWUgXSA9IFBbIGlkeCAgXSAjIyMgZW5zdXJlIGFsbCBzaWduLiBuYW1lcyBhcmUgc2V0IGluIENGRyBQT0QgYFFgICMjI1xuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzd2l0Y2ggdHlwZSA9IHR5cGVfb2YgZm5cbiAgICAgICAgd2hlbiAnZnVuY3Rpb24nICAgICAgICAgICB0aGVuIHJldHVybiAgICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0ZSBmbi5jYWxsIEAsIFAuLi5cbiAgICAgICAgd2hlbiAnYXN5bmNmdW5jdGlvbicgICAgICB0aGVuIHJldHVybiBfY2FsbF9hc3luY2Z1bmN0aW9uLmNhbGwgICAgICBALCB2YWxpZGF0ZSwgZm4sIFBcbiAgICAgICAgd2hlbiAnZ2VuZXJhdG9yZnVuY3Rpb24nICB0aGVuIHJldHVybiBfY2FsbF9nZW5lcmF0b3JmdW5jdGlvbi5jYWxsICBALCB2YWxpZGF0ZSwgZm4sIFBcbiAgICAgICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IgXCLOqW5mYV9fXzggdW5hYmxlIHRvIGhhbmRsZSBjYWxsYWJsZSBvZiB0eXBlICN7cnByIHR5cGV9XCJcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGdldF9zaWduYXR1cmU6ICggZm4gKSAtPlxuICAgIHRoaXNfY2ZnX3FfbmFtZSA9ICdjZmcnICMjIyBUQUlOVCBwaWNrIGZyb20gQGNmZyAjIyNcbiAgICAjIyMgdGh4IHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvaWRlbnRpZmllci1yZWdleCAjIyNcbiAgICBqc2lkX3JlICAgPSAvLy8gXiBbICQgXyBcXHB7SURfU3RhcnR9IF0gWyAkIF8gXFx1MjAwQyBcXHUyMDBEIFxccHtJRF9Db250aW51ZX0gXSogJCAvLy9zdlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgc2lnbmF0dXJlID0gZm4udG9TdHJpbmcoKVxuICAgIHNpZ25hdHVyZSA9IHNpZ25hdHVyZS5yZXBsYWNlIC8vLyBcXHMrIC8vL3N2ZywgJydcbiAgICBzaWduYXR1cmUgPSBzaWduYXR1cmUucmVwbGFjZSAvLy8gXiBbXiBcXCggXSogXFwoICg/PHBhcmVucz4gW14gXFwpIF0qICkgXFwpIC4qICQgLy8vc3ZnLCAnJDxwYXJlbnM+J1xuICAgIG5hbWVzICAgICA9IHNpZ25hdHVyZS5zcGxpdCAnLCdcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHFfaWR4ICAgICA9IG51bGxcbiAgICBmb3IgbmFtZSwgaWR4IGluIG5hbWVzXG4gICAgICBpZiBqc2lkX3JlLnRlc3QgbmFtZVxuICAgICAgICBxX2lkeCA9IGlkeCBpZiBuYW1lIGlzIHRoaXNfY2ZnX3FfbmFtZVxuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgU2lnbmF0dXJlX2Rpc3Bvc2l0aW9uX0Vycm9yIFwizqluZmFfX185IHBhcmFtZXRlciBkaXNwb3NpdGlvbiBub3QgY29tcGxpYW50OiAje3JwciBuYW1lfSBpbiAje3JwciBzaWduYXR1cmV9XCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHVubGVzcyBxX2lkeD9cbiAgICAgIG5hbWVzX3JwciA9IG5hbWVzLmpvaW4gJywgJ1xuICAgICAgdGhyb3cgbmV3IFNpZ25hdHVyZV9uYW1pbmdfRXJyb3IgXCLOqW5mYV9fMTAgcGFyYW1ldGVyIG5hbWluZyBub3QgY29tcGxpYW50OiBubyBwYXJhbWV0ZXIgbmFtZWQgI3tycHIgdGhpc19jZmdfcV9uYW1lfSwgZ290ICN7cnByIG5hbWVzX3Jwcn1cIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgc3dpdGNoIHFfaWR4XG4gICAgICB3aGVuIG5hbWVzLmxlbmd0aCAtIDIgdGhlbiBxX3JpZHggPSAtMlxuICAgICAgd2hlbiBuYW1lcy5sZW5ndGggLSAxIHRoZW4gcV9yaWR4ID0gLTFcbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgbmV3IFNpZ25hdHVyZV9jZmdfcG9zaXRpb25fZXJyb3IgXCLOqW5mYV9fMTEgcGFyYW1ldGVyIG9yZGVyaW5nIG5vdCBjb21wbGlhbnQ6IGV4cGVjdGVkICN7cnByIHRoaXNfY2ZnX3FfbmFtZX0gdG8gY29tZSBsYXN0IG9yIG5leHQtdG8tbGFzdCwgZm91bmQgaXQgYXQgaW5kZXggI3txX2lkeH0gb2YgI3tuYW1lcy5sZW5ndGh9IHBhcmFtZXRlcnNcIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcmV0dXJuIHsgbmFtZXMsIHFfaWR4LCBxX3JpZHgsIH1cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIF9jYWxsX2FzeW5jZnVuY3Rpb24gICAgID0gKCB2YWxpZGF0ZSwgZm4sIFAgKSAtPiB2YWxpZGF0ZSBhd2FpdCBmbi5jYWxsIEAsIFAuLi5cbiMjIyBUQUlOVCB3aGVyZSB0byBwdXQgdmFsaWRhdGUoKT8/PyAjIyNcbl9jYWxsX2FzeW5jZnVuY3Rpb24gICAgID0gKCB2YWxpZGF0ZSwgZm4sIFAgKSAtPiBhd2FpdCBmbi5jYWxsIEAsIFAuLi5cbl9jYWxsX2dlbmVyYXRvcmZ1bmN0aW9uID0gKCB2YWxpZGF0ZSwgZm4sIFAgKSAtPiB5aWVsZCBmcm9tIGZuLmNhbGwgQCwgUC4uLlxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbm5vcm1hbGl6ZXIgICAgICAgICAgICAgICAgPSBuZXcgTm9ybWFsaXplX2Z1bmN0aW9uX2FyZ3VtZW50cygpXG57IG5mYVxuICBnZXRfc2lnbmF0dXJlICAgICAgICAgfSA9IG5vcm1hbGl6ZXJcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5tb2R1bGUuZXhwb3J0cyA9IHsgbmZhLCBnZXRfc2lnbmF0dXJlLCBOb3JtYWxpemVfZnVuY3Rpb25fYXJndW1lbnRzLCBUZW1wbGF0ZSwgaW50ZXJuYWxzLCB9XG5cbiJdfQ==
