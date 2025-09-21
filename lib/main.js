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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQUE7QUFBQSxNQUFBLG1CQUFBLEVBQUEsV0FBQSxFQUFBLENBQUEsRUFBQSxTQUFBLEVBQUEsaUJBQUEsRUFBQSxTQUFBLEVBQUEsNEJBQUEsRUFBQSxxQkFBQSxFQUFBLHNCQUFBLEVBQUEsbUJBQUEsRUFBQSw0QkFBQSxFQUFBLDJCQUFBLEVBQUEsZUFBQSxFQUFBLGlDQUFBLEVBQUEsc0JBQUEsRUFBQSxRQUFBLEVBQUEsVUFBQSxFQUFBLG9CQUFBLEVBQUEscUJBQUEsRUFBQSxnQkFBQSxFQUFBLEtBQUEsRUFBQSxhQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsVUFBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsTUFBQSxFQUFBLElBQUE7OztFQUdBLENBQUEsR0FBNEIsT0FBQSxDQUFRLFdBQVIsRUFINUI7Ozs7RUFJQSxDQUFBLENBQUUsUUFBRixFQUNFLEdBREYsRUFFRSxJQUZGLEVBR0UsZ0JBSEYsRUFLRSxxQkFMRixFQU1FLE1BTkYsRUFPRSxPQVBGLEVBU0UsTUFURixFQVVFLEtBVkYsRUFXRSxJQVhGLEVBWUUsSUFaRixFQWFFLEdBYkYsQ0FBQSxHQWE0QixDQWI1QixFQUpBOzs7Ozs7RUF1Qk0sWUFBTixNQUFBLFVBQUEsUUFBa0QsTUFBbEQsQ0FBQTs7RUFDTSxjQUFOLE1BQUEsWUFBQSxRQUFrRCxVQUFsRCxDQUFBOztFQUNNLG9CQUFOLE1BQUEsa0JBQUEsUUFBa0QsWUFBbEQsQ0FBQTs7RUFDTSxzQkFBTixNQUFBLG9CQUFBLFFBQWtELFlBQWxELENBQUE7O0VBQ00seUJBQU4sTUFBQSx1QkFBQSxRQUFrRCxZQUFsRCxDQUFBOztFQUNNLHdCQUFOLE1BQUEsc0JBQUEsUUFBa0QsVUFBbEQsQ0FBQTs7RUFDTSxrQkFB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LEtBQVA7QUFBQSxhQUNPLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FEdEI7VUFDNkIsTUFBQSxHQUFTLENBQUM7QUFBaEM7QUFEUCxhQUVPLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FGdEI7VUFFNkIsTUFBQSxHQUFTLENBQUM7QUFBaEM7QUFGUDtVQUlJLE1BQU0sSUFBSSw0QkFBSixDQUFpQyxDQUFBLG9EQUFBLENBQUEsQ0FBdUQsR0FBQSxDQUFJLGVBQUosQ0FBdkQsQ0FBQSxpREFBQSxDQUFBLENBQThILEtBQTlILENBQUEsSUFBQSxDQUFBLENBQTBJLEtBQUssQ0FBQyxNQUFoSixDQUFBLFdBQUEsQ0FBakM7QUFKVixPQXBCSjs7QUEwQkksYUFBTyxDQUFFLEtBQUYsRUFBUyxLQUFULEVBQWdCLE1BQWhCO0lBM0JNOztFQWhFakIsRUFuREE7OztFQWtKQSxVQUFBLEdBQTRCLElBQUksNEJBQUosQ0FBQTs7RUFDNUIsQ0FBQSxDQUFFLEdBQUYsRUFDRSxhQURGLENBQUEsR0FDNEIsVUFENUIsRUFuSkE7OztFQXVKQSxNQUFNLENBQUMsT0FBUCxHQUFpQixDQUFFLEdBQUYsRUFBTyxhQUFQLEVBQXNCLDRCQUF0QixFQUFvRCxRQUFwRCxFQUE4RCxTQUE5RDtBQXZKakIiLCJzb3VyY2VzQ29udGVudCI6WyJcbid1c2Ugc3RyaWN0J1xuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbkggICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL2hlbHBlcnMnXG57IFRlbXBsYXRlXG4gIGduZFxuICBoaWRlXG4gIGNyZWF0ZV92YWxpZGF0b3JcbiAgIyBnZXRfaW5zdGFuY2VfbWV0aG9kc1xuICBiaW5kX2luc3RhbmNlX21ldGhvZHNcbiAgbmFtZWl0XG4gIHB1c2hfYXRcbiAgIyBwb3BfYXRcbiAgc2V0X2F0XG4gIGRlYnVnXG4gIHdhcm5cbiAgaGVscFxuICBycHIgICAgICAgICAgICAgICAgICAgfSA9IEhcbiMgRSAgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vZXJyb3JzJ1xuIyBvcHRpb25hbCAgICAgICAgICAgICAgICAgID0gU3ltYm9sICdvcHRpb25hbCdcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBOZmFfZXJyb3IgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmRzIEVycm9yXG5jbGFzcyBBcml0eV9lcnJvciAgICAgICAgICAgICAgICAgICAgICAgICBleHRlbmRzIE5mYV9lcnJvclxuY2xhc3MgTmFtZWRfYXJpdHlfZXJyb3IgICAgICAgICAgICAgICAgICAgZXh0ZW5kcyBBcml0eV9lcnJvclxuY2xhc3MgUnVudGltZV9hcml0eV9lcnJvciAgICAgICAgICAgICAgICAgZXh0ZW5kcyBBcml0eV9lcnJvclxuY2xhc3MgUG9zaXRpb25hbF9hcml0eV9lcnJvciAgICAgICAgICAgICAgZXh0ZW5kcyBBcml0eV9lcnJvclxuY2xhc3MgTm90X2ltcGxlbWVudGVkX2Vycm9yICAgICAgICAgICAgICAgZXh0ZW5kcyBOZmFfZXJyb3JcbmNsYXNzIFNpZ25hdHVyZV9lcnJvciAgICAgICAgICAgICAgICAgICAgIGV4dGVuZHMgTmZhX2Vycm9yXG5jbGFzcyBTaWduYXR1cmVfZGlzcG9zaXRpb25fRXJyb3IgICAgICAgICBleHRlbmRzIFNpZ25hdHVyZV9lcnJvclxuY2xhc3MgU2lnbmF0dXJlX25hbWluZ19FcnJvciAgICAgICAgICAgICAgZXh0ZW5kcyBTaWduYXR1cmVfZXJyb3JcbmNsYXNzIFNpZ25hdHVyZV9taXNzaW5nX3BhcmFtZXRlcl9FcnJvciAgIGV4dGVuZHMgU2lnbmF0dXJlX2Vycm9yXG5jbGFzcyBTaWduYXR1cmVfY2ZnX3Bvc2l0aW9uX2Vycm9yICAgICAgICBleHRlbmRzIFNpZ25hdHVyZV9lcnJvclxuY2xhc3MgVmFsdWVfbWlzbWF0Y2hfZXJyb3IgICAgICAgICAgICAgICAgZXh0ZW5kcyBOZmFfZXJyb3JcbmNsYXNzIFR5cGVfZXJyb3IgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZHMgTmZhX2Vycm9yXG5jbGFzcyBBcmd1bWVudF90eXBlX2Vycm9yICAgICAgICAgICAgICAgICBleHRlbmRzIFR5cGVfZXJyb3JcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmludGVybmFscyA9IG5ldyBjbGFzcyBJbnRlcm5hbHMgdGhlbiBjb25zdHJ1Y3RvcjogLT5cbiAgQHBvZF9wcm90b3R5cGVzID0gSC5wb2RfcHJvdG90eXBlc1xuICBAZ25kICAgICAgICAgICAgPSBnbmRcbiAgQHB1c2hfYXQgICAgICAgID0gcHVzaF9hdFxuICAjIEBwb3BfYXQgICAgICAgICA9IHBvcF9hdFxuICBAc2V0X2F0ICAgICAgICAgPSBzZXRfYXRcbiAgQG5hbWVpdCAgICAgICAgID0gbmFtZWl0XG4gIHJldHVybiB1bmRlZmluZWRcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIE5vcm1hbGl6ZV9mdW5jdGlvbl9hcmd1bWVudHNcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAoIGNmZyA9IG51bGwgKSAtPlxuICAgIGlmIGNmZz9cbiAgICAgIHRocm93IG5ldyBOb3RfaW1wbGVtZW50ZWRfZXJyb3IgXCLOqW5mYV9fXzEgY29uZmlndXJhdGlvbiBub3QgaW1wbGVtZW50ZWRcIlxuICAgIGJpbmRfaW5zdGFuY2VfbWV0aG9kcyBAXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgbmZhOiAoIGNmZywgZm4gKSAtPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjIyBOb3JtYWxpemUgRnVuY3Rpb24gQXJndW1lbnRzICMjI1xuICAgIHN3aXRjaCBhcml0eSA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIHdoZW4gMSB0aGVuIFsgY2ZnLCBmbiwgXSA9IFsge30sIGNmZywgXVxuICAgICAgd2hlbiAyIHRoZW4gbnVsbFxuICAgICAgZWxzZSB0aHJvdyBuZXcgUnVudGltZV9hcml0eV9lcnJvciBcIs6pbmZhX19fMiBleHBlY3RlZCAxIG9yIDIgYXJndW1lbnRzLCBnb3QgI3thcml0eX1cIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyMjIFRBSU5UIGRvIHRoaXMgaW4gYGduZGAgIyMjXG4gICAgdW5sZXNzIGduZC5wb2QuaXNhIGNmZyAgICAgIHRoZW4gdGhyb3cgbmV3IFR5cGVfZXJyb3IgXCLOqW5mYV9fXzMgZXhwZWN0ZWQgYSBQT0QsIGdvdCAje3JwciBjZmd9XCJcbiAgICB1bmxlc3MgZ25kLmNhbGxhYmxlLmlzYSBmbiAgdGhlbiB0aHJvdyBuZXcgVHlwZV9lcnJvciBcIs6pbmZhX19fNCBleHBlY3RlZCBhIGNhbGxhYmxlLCBnb3QgI3tycHIgY2ZnfVwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBjZmcgICAgICAgICAgICAgICA9IHsgZ25kLm5mYV9jZmcudGVtcGxhdGUuLi4sIGNmZy4uLiwgfVxuICAgIGNmZy50ZW1wbGF0ZSAgICAgID0gKCBuZXcgVGVtcGxhdGUgY2ZnLnRlbXBsYXRlICkgaWYgY2ZnLnRlbXBsYXRlP1xuICAgIGduZC5uZmFfY2ZnLnZhbGlkYXRlIGNmZ1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgeyBuYW1lc1xuICAgICAgcV9pZHhcbiAgICAgIHFfcmlkeCAgICAgICAgfSA9IEBnZXRfc2lnbmF0dXJlIGZuXG4gICAgYXJpdHkgICAgICAgICAgICAgPSBuYW1lcy5sZW5ndGhcbiAgICBmbl9uYW1lICAgICAgICAgICA9IGZuLm5hbWVcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHZhbGlkYXRlID0gaWYgY2ZnLmlzYT8gdGhlbiAoIGNyZWF0ZV92YWxpZGF0b3IgXCIje2ZuX25hbWV9X2NmZ1wiLCBjZmcuaXNhICkgZWxzZSAoIHggKSAtPiB4XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICByZXR1cm4gbmFtZWl0IGZuX25hbWUsICggUC4uLiApIC0+XG4gICAgICBpZiBQLmxlbmd0aCA+IGFyaXR5XG4gICAgICAgIHRocm93IG5ldyBQb3NpdGlvbmFsX2FyaXR5X2Vycm9yIFwizqluZmFfX181IGV4cGVjdGVkIHVwIHRvICN7YXJpdHl9IGFyZ3VtZW50cywgZ290ICN7UC5sZW5ndGh9XCJcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgaWYgKCBxX3JpZHggaXMgLTIgKSBhbmQgKCBnbmQuY2FsbGFibGUuaXNhICggUC5hdCAtMSApIClcbiAgICAgICAgaWYgZ25kLnBvZC5pc2EgUC5hdCBxX3JpZHggdGhlbiBwdXNoX2F0IFAsIHFfcmlkeCwgdW5kZWZpbmVkIHdoaWxlIFAubGVuZ3RoIDwgYXJpdHlcbiAgICAgICAgZWxzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdXNoX2F0IFAsICAgICAtMSwgdW5kZWZpbmVkIHdoaWxlIFAubGVuZ3RoIDwgYXJpdHlcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgaWYgZ25kLnBvZC5pc2EgUC5hdCBxX3JpZHhcbiAgICAgICAgcHVzaF9hdCBQLCBxX3JpZHgsIHVuZGVmaW5lZCB3aGlsZSBQLmxlbmd0aCA8IGFyaXR5XG4gICAgICAgICMjIyBBVFAsIGBQYCBob2xkcyBgYXJpdHlgIGFyZ3VtZW50cyBhbmQgdGhlcmUgKmlzKiBhIFBPRCBpbiBDRkcgcG9zaXRpb24gKHdoaWNoIHdlIGFzc3VtZSB0b1xuICAgICAgICByZXByZXNlbnQgQ0ZHIHNvIHdlIGNhbiBtYWtlIGEgY29weSwgZmlsbGluZyBpbiB0ZW1wbGF0ZSB2YWx1ZXMpOiAjIyNcbiAgICAgICAgUSA9IHNldF9hdCBQLCBxX3JpZHgsIGduZC5wb2QuY3JlYXRlIGNmZy50ZW1wbGF0ZSwgUC5hdCBxX3JpZHhcbiAgICAgIGVsc2VcbiAgICAgICAgUC5wdXNoIHVuZGVmaW5lZCB3aGlsZSBQLmxlbmd0aCA8IGFyaXR5XG4gICAgICAgICMjIyBBVFAsIGBQYCBob2xkcyBgYXJpdHlgIGFyZ3VtZW50cyBhbmQgdGhlcmUgKm1heSBiZSogYW4gYHVuZGVmaW5lZGAgaW4gQ0ZHIHBvc2l0aW9uICh3aGljaCB3ZVxuICAgICAgICBhc3N1bWUgaXMgcmVwbGFjZWFibGUgYnkgYSBuZXdseSBjcmVhdGVkIENGRyBpbnN0YW5jZSB3aXRoIHRlbXBsYXRlIHZhbHVlcyk6ICMjI1xuICAgICAgICBpZiAoIFAuYXQgcV9yaWR4ICkgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgUSA9IHNldF9hdCBQLCBxX3JpZHgsIGduZC5wb2QuY3JlYXRlIGNmZy50ZW1wbGF0ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50X3R5cGVfZXJyb3IgXCLOqW5mYV9fXzYgZXhwZWN0ZWQgYW4gb3B0aW9uYWwgUE9EIGF0IHBvc2l0aW9uICN7cV9yaWR4fSwgZ290ICN7cnByIFAuYXQgcV9yaWR4fVwiXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICMjIyBIYXJtb25pemUgdmFsdWVzOiAjIyNcbiAgICAgIGZvciBuYW1lLCBpZHggaW4gbmFtZXNcbiAgICAgICAgY29udGludWUgaWYgaWR4IGlzIHFfaWR4ICMjIyBza2lwIG92ZXIgQ0ZHIG9iamVjdCdzIChgUWAncycpIHBvc2l0aW9uIGluIFAgIyMjXG4gICAgICAgIGlmICggUFsgaWR4ICAgXSBpcyB1bmRlZmluZWQgKSAgdGhlbiAgUFsgaWR4ICBdID0gUVsgbmFtZSBdXG4gICAgICAgIGVsc2UgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUVsgbmFtZSBdID0gUFsgaWR4ICBdICMjIyBwb3MuYXJnOnMgb3RoZXIgdGhhbiB1bmRlZi4gdGFrZSBwcmVjZWRlbmNlICMjI1xuICAgICAgICBpZiAoIFFbIG5hbWUgIF0gaXMgdW5kZWZpbmVkICkgIHRoZW4gIFFbIG5hbWUgXSA9IFBbIGlkeCAgXSAjIyMgZW5zdXJlIGFsbCBzaWduLiBuYW1lcyBhcmUgc2V0IGluIENGRyBQT0QgYFFgICMjI1xuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICByZXR1cm4gdmFsaWRhdGUgZm4uY2FsbCBALCBQLi4uXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBnZXRfc2lnbmF0dXJlOiAoIGZuICkgLT5cbiAgICB0aGlzX2NmZ19xX25hbWUgPSAnY2ZnJyAjIyMgVEFJTlQgcGljayBmcm9tIEBjZmcgIyMjXG4gICAgIyMjIHRoeCB0byBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL2lkZW50aWZpZXItcmVnZXggIyMjXG4gICAganNpZF9yZSAgID0gLy8vIF4gWyAkIF8gXFxwe0lEX1N0YXJ0fSBdIFsgJCBfIFxcdTIwMEMgXFx1MjAwRCBcXHB7SURfQ29udGludWV9IF0qICQgLy8vc3ZcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHNpZ25hdHVyZSA9IGZuLnRvU3RyaW5nKClcbiAgICBzaWduYXR1cmUgPSBzaWduYXR1cmUucmVwbGFjZSAvLy8gXFxzKyAvLy9zdmcsICcnXG4gICAgc2lnbmF0dXJlID0gc2lnbmF0dXJlLnJlcGxhY2UgLy8vIF4gW14gXFwoIF0qIFxcKCAoPzxwYXJlbnM+IFteIFxcKSBdKiApIFxcKSAuKiAkIC8vL3N2ZywgJyQ8cGFyZW5zPidcbiAgICBuYW1lcyAgICAgPSBzaWduYXR1cmUuc3BsaXQgJywnXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBxX2lkeCAgICAgPSBudWxsXG4gICAgZm9yIG5hbWUsIGlkeCBpbiBuYW1lc1xuICAgICAgaWYganNpZF9yZS50ZXN0IG5hbWVcbiAgICAgICAgcV9pZHggPSBpZHggaWYgbmFtZSBpcyB0aGlzX2NmZ19xX25hbWVcbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgbmV3IFNpZ25hdHVyZV9kaXNwb3NpdGlvbl9FcnJvciBcIs6pbmZhX19fNyBwYXJhbWV0ZXIgZGlzcG9zaXRpb24gbm90IGNvbXBsaWFudDogI3tycHIgbmFtZX0gaW4gI3tycHIgc2lnbmF0dXJlfVwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB1bmxlc3MgcV9pZHg/XG4gICAgICBuYW1lc19ycHIgPSBuYW1lcy5qb2luICcsICdcbiAgICAgIHRocm93IG5ldyBTaWduYXR1cmVfbmFtaW5nX0Vycm9yIFwizqluZmFfX184IHBhcmFtZXRlciBuYW1pbmcgbm90IGNvbXBsaWFudDogbm8gcGFyYW1ldGVyIG5hbWVkICN7cnByIHRoaXNfY2ZnX3FfbmFtZX0sIGdvdCAje3JwciBuYW1lc19ycHJ9XCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHN3aXRjaCBxX2lkeFxuICAgICAgd2hlbiBuYW1lcy5sZW5ndGggLSAyIHRoZW4gcV9yaWR4ID0gLTJcbiAgICAgIHdoZW4gbmFtZXMubGVuZ3RoIC0gMSB0aGVuIHFfcmlkeCA9IC0xXG4gICAgICBlbHNlXG4gICAgICAgIHRocm93IG5ldyBTaWduYXR1cmVfY2ZnX3Bvc2l0aW9uX2Vycm9yIFwizqluZmFfX185IHBhcmFtZXRlciBvcmRlcmluZyBub3QgY29tcGxpYW50OiBleHBlY3RlZCAje3JwciB0aGlzX2NmZ19xX25hbWV9IHRvIGNvbWUgbGFzdCBvciBuZXh0LXRvLWxhc3QsIGZvdW5kIGl0IGF0IGluZGV4ICN7cV9pZHh9IG9mICN7bmFtZXMubGVuZ3RofSBwYXJhbWV0ZXJzXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHJldHVybiB7IG5hbWVzLCBxX2lkeCwgcV9yaWR4LCB9XG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5ub3JtYWxpemVyICAgICAgICAgICAgICAgID0gbmV3IE5vcm1hbGl6ZV9mdW5jdGlvbl9hcmd1bWVudHMoKVxueyBuZmFcbiAgZ2V0X3NpZ25hdHVyZSAgICAgICAgIH0gPSBub3JtYWxpemVyXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxubW9kdWxlLmV4cG9ydHMgPSB7IG5mYSwgZ2V0X3NpZ25hdHVyZSwgTm9ybWFsaXplX2Z1bmN0aW9uX2FyZ3VtZW50cywgVGVtcGxhdGUsIGludGVybmFscywgfVxuXG4iXX0=
