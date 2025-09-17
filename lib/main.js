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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQUE7QUFBQSxNQUFBLG1CQUFBLEVBQUEsV0FBQSxFQUFBLENBQUEsRUFBQSxTQUFBLEVBQUEsaUJBQUEsRUFBQSxTQUFBLEVBQUEsNEJBQUEsRUFBQSxxQkFBQSxFQUFBLHNCQUFBLEVBQUEsbUJBQUEsRUFBQSw0QkFBQSxFQUFBLDJCQUFBLEVBQUEsZUFBQSxFQUFBLGlDQUFBLEVBQUEsc0JBQUEsRUFBQSxRQUFBLEVBQUEsVUFBQSxFQUFBLG9CQUFBLEVBQUEscUJBQUEsRUFBQSxnQkFBQSxFQUFBLEtBQUEsRUFBQSxhQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsVUFBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsTUFBQSxFQUFBLElBQUE7OztFQUdBLENBQUEsR0FBNEIsT0FBQSxDQUFRLFdBQVIsRUFINUI7Ozs7RUFJQSxDQUFBLENBQUUsUUFBRixFQUNFLEdBREYsRUFFRSxJQUZGLEVBR0UsZ0JBSEYsRUFLRSxxQkFMRixFQU1FLE1BTkYsRUFPRSxPQVBGLEVBU0UsTUFURixFQVVFLEtBVkYsRUFXRSxJQVhGLEVBWUUsSUFaRixFQWFFLEdBYkYsQ0FBQSxHQWE0QixDQWI1QixFQUpBOzs7Ozs7RUF1Qk0sWUFBTixNQUFBLFVBQUEsUUFBa0QsTUFBbEQsQ0FBQTs7RUFDTSxjQUFOLE1BQUEsWUFBQSxRQUFrRCxVQUFsRCxDQUFBOztFQUNNLG9CQUFOLE1BQUEsa0JBQUEsUUFBa0QsWUFBbEQsQ0FBQTs7RUFDTSxzQkFBTixNQUFBLG9CQUFBLFFBQWtELFlBQWxELENBQUE7O0VBQ00seUJBQU4sTUFBQSx1QkFBQSxRQUFrRCxZQUFsRCxDQUFBOztFQUNNLHdCQUFOLE1BQUEsc0JBQUEsUUFBa0QsVUFBbEQsQ0FBQTs7RUFDTSxrQkFB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R0FBRixFQUNFLGFBREYsQ0FBQSxHQUM0QixVQUQ1QixFQS9JQTs7O0VBbUpBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLENBQUUsR0FBRixFQUFPLGFBQVAsRUFBc0IsNEJBQXRCLEVBQW9ELFFBQXBELEVBQThELFNBQTlEO0FBbkpqQiIsInNvdXJjZXNDb250ZW50IjpbIlxuJ3VzZSBzdHJpY3QnXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuSCAgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4vaGVscGVycydcbnsgVGVtcGxhdGVcbiAgZ25kXG4gIGhpZGVcbiAgY3JlYXRlX3ZhbGlkYXRvclxuICAjIGdldF9pbnN0YW5jZV9tZXRob2RzXG4gIGJpbmRfaW5zdGFuY2VfbWV0aG9kc1xuICBuYW1laXRcbiAgcHVzaF9hdFxuICAjIHBvcF9hdFxuICBzZXRfYXRcbiAgZGVidWdcbiAgd2FyblxuICBoZWxwXG4gIHJwciAgICAgICAgICAgICAgICAgICB9ID0gSFxuIyBFICAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9lcnJvcnMnXG4jIG9wdGlvbmFsICAgICAgICAgICAgICAgICAgPSBTeW1ib2wgJ29wdGlvbmFsJ1xuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIE5mYV9lcnJvciAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZHMgRXJyb3JcbmNsYXNzIEFyaXR5X2Vycm9yICAgICAgICAgICAgICAgICAgICAgICAgIGV4dGVuZHMgTmZhX2Vycm9yXG5jbGFzcyBOYW1lZF9hcml0eV9lcnJvciAgICAgICAgICAgICAgICAgICBleHRlbmRzIEFyaXR5X2Vycm9yXG5jbGFzcyBSdW50aW1lX2FyaXR5X2Vycm9yICAgICAgICAgICAgICAgICBleHRlbmRzIEFyaXR5X2Vycm9yXG5jbGFzcyBQb3NpdGlvbmFsX2FyaXR5X2Vycm9yICAgICAgICAgICAgICBleHRlbmRzIEFyaXR5X2Vycm9yXG5jbGFzcyBOb3RfaW1wbGVtZW50ZWRfZXJyb3IgICAgICAgICAgICAgICBleHRlbmRzIE5mYV9lcnJvclxuY2xhc3MgU2lnbmF0dXJlX2Vycm9yICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kcyBOZmFfZXJyb3JcbmNsYXNzIFNpZ25hdHVyZV9kaXNwb3NpdGlvbl9FcnJvciAgICAgICAgIGV4dGVuZHMgU2lnbmF0dXJlX2Vycm9yXG5jbGFzcyBTaWduYXR1cmVfbmFtaW5nX0Vycm9yICAgICAgICAgICAgICBleHRlbmRzIFNpZ25hdHVyZV9lcnJvclxuY2xhc3MgU2lnbmF0dXJlX21pc3NpbmdfcGFyYW1ldGVyX0Vycm9yICAgZXh0ZW5kcyBTaWduYXR1cmVfZXJyb3JcbmNsYXNzIFNpZ25hdHVyZV9jZmdfcG9zaXRpb25fZXJyb3IgICAgICAgIGV4dGVuZHMgU2lnbmF0dXJlX2Vycm9yXG5jbGFzcyBWYWx1ZV9taXNtYXRjaF9lcnJvciAgICAgICAgICAgICAgICBleHRlbmRzIE5mYV9lcnJvclxuY2xhc3MgVHlwZV9lcnJvciAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5kcyBOZmFfZXJyb3JcbmNsYXNzIEFyZ3VtZW50X3R5cGVfZXJyb3IgICAgICAgICAgICAgICAgIGV4dGVuZHMgVHlwZV9lcnJvclxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuaW50ZXJuYWxzID0gbmV3IGNsYXNzIEludGVybmFscyB0aGVuIGNvbnN0cnVjdG9yOiAtPlxuICBAcG9kX3Byb3RvdHlwZXMgPSBILnBvZF9wcm90b3R5cGVzXG4gIEBnbmQgICAgICAgICAgICA9IGduZFxuICBAcHVzaF9hdCAgICAgICAgPSBwdXNoX2F0XG4gICMgQHBvcF9hdCAgICAgICAgID0gcG9wX2F0XG4gIEBzZXRfYXQgICAgICAgICA9IHNldF9hdFxuICBAbmFtZWl0ICAgICAgICAgPSBuYW1laXRcbiAgcmV0dXJuIHVuZGVmaW5lZFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgTm9ybWFsaXplX2Z1bmN0aW9uX2FyZ3VtZW50c1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6ICggY2ZnID0gbnVsbCApIC0+XG4gICAgaWYgY2ZnP1xuICAgICAgdGhyb3cgbmV3IE5vdF9pbXBsZW1lbnRlZF9lcnJvciBcIs6pbmZhX19fMSBjb25maWd1cmF0aW9uIG5vdCBpbXBsZW1lbnRlZFwiXG4gICAgYmluZF9pbnN0YW5jZV9tZXRob2RzIEBcbiAgICByZXR1cm4gdW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBuZmE6ICggY2ZnLCBmbiApIC0+ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjIE5vcm1hbGl6ZSBGdW5jdGlvbiBBcmd1bWVudHMgIyMjXG4gICAgc3dpdGNoIGFyaXR5ID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgd2hlbiAxIHRoZW4gWyBjZmcsIGZuLCBdID0gWyB7fSwgY2ZnLCBdXG4gICAgICB3aGVuIDIgdGhlbiBudWxsXG4gICAgICBlbHNlIHRocm93IG5ldyBSdW50aW1lX2FyaXR5X2Vycm9yIFwizqluZmFfX18yIGV4cGVjdGVkIDEgb3IgMiBhcmd1bWVudHMsIGdvdCAje2FyaXR5fVwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIyMgVEFJTlQgZG8gdGhpcyBpbiBgZ25kYCAjIyNcbiAgICB1bmxlc3MgZ25kLnBvZC5pc2EgY2ZnICAgICAgdGhlbiB0aHJvdyBuZXcgVHlwZV9lcnJvciBcIs6pbmZhX19fMyBleHBlY3RlZCBhIFBPRCwgZ290ICN7cnByIGNmZ31cIlxuICAgIHVubGVzcyBnbmQuZnVuY3Rpb24uaXNhIGZuICB0aGVuIHRocm93IG5ldyBUeXBlX2Vycm9yIFwizqluZmFfX180IGV4cGVjdGVkIGEgZnVuY3Rpb24sIGdvdCAje3JwciBjZmd9XCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGNmZyAgICAgICAgICAgICAgID0geyBnbmQubmZhX2NmZy50ZW1wbGF0ZS4uLiwgY2ZnLi4uLCB9XG4gICAgY2ZnLnRlbXBsYXRlICAgICAgPSAoIG5ldyBUZW1wbGF0ZSBjZmcudGVtcGxhdGUgKSBpZiBjZmcudGVtcGxhdGU/XG4gICAgZ25kLm5mYV9jZmcudmFsaWRhdGUgY2ZnXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB7IG5hbWVzXG4gICAgICBxX2lkeFxuICAgICAgcV9yaWR4ICAgICAgICB9ID0gQGdldF9zaWduYXR1cmUgZm5cbiAgICBhcml0eSAgICAgICAgICAgICA9IG5hbWVzLmxlbmd0aFxuICAgIGZuX25hbWUgICAgICAgICAgID0gZm4ubmFtZVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgdmFsaWRhdGUgPSBpZiBjZmcuaXNhPyB0aGVuICggY3JlYXRlX3ZhbGlkYXRvciBcIiN7Zm5fbmFtZX1fY2ZnXCIsIGNmZy5pc2EgKSBlbHNlICggeCApIC0+IHhcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHJldHVybiBuYW1laXQgZm5fbmFtZSwgKCBQLi4uICkgLT5cbiAgICAgIGlmIFAubGVuZ3RoID4gYXJpdHlcbiAgICAgICAgdGhyb3cgbmV3IFBvc2l0aW9uYWxfYXJpdHlfZXJyb3IgXCLOqW5mYV9fXzUgZXhwZWN0ZWQgdXAgdG8gI3thcml0eX0gYXJndW1lbnRzLCBnb3QgI3tQLmxlbmd0aH1cIlxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBpZiBnbmQucG9kLmlzYSBQLmF0IHFfcmlkeFxuICAgICAgICBwdXNoX2F0IFAsIHFfcmlkeCwgdW5kZWZpbmVkIHdoaWxlIFAubGVuZ3RoIDwgYXJpdHlcbiAgICAgICAgIyMjIEFUUCwgYFBgIGhvbGRzIGBhcml0eWAgYXJndW1lbnRzIGFuZCB0aGVyZSAqaXMqIGEgUE9EIGluIENGRyBwb3NpdGlvbiAod2hpY2ggd2UgYXNzdW1lIHRvXG4gICAgICAgIHJlcHJlc2VudCBDRkcgc28gd2UgY2FuIG1ha2UgYSBjb3B5LCBmaWxsaW5nIGluIHRlbXBsYXRlIHZhbHVlcyk6ICMjI1xuICAgICAgICBRID0gc2V0X2F0IFAsIHFfcmlkeCwgZ25kLnBvZC5jcmVhdGUgY2ZnLnRlbXBsYXRlLCBQLmF0IHFfcmlkeFxuICAgICAgZWxzZVxuICAgICAgICBQLnB1c2ggdW5kZWZpbmVkIHdoaWxlIFAubGVuZ3RoIDwgYXJpdHlcbiAgICAgICAgIyMjIEFUUCwgYFBgIGhvbGRzIGBhcml0eWAgYXJndW1lbnRzIGFuZCB0aGVyZSAqbWF5IGJlKiBhbiBgdW5kZWZpbmVkYCBpbiBDRkcgcG9zaXRpb24gKHdoaWNoIHdlXG4gICAgICAgIGFzc3VtZSBpcyByZXBsYWNlYWJsZSBieSBhIG5ld2x5IGNyZWF0ZWQgQ0ZHIGluc3RhbmNlIHdpdGggdGVtcGxhdGUgdmFsdWVzKTogIyMjXG4gICAgICAgIGlmICggUC5hdCBxX3JpZHggKSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBRID0gc2V0X2F0IFAsIHFfcmlkeCwgZ25kLnBvZC5jcmVhdGUgY2ZnLnRlbXBsYXRlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB0aHJvdyBuZXcgQXJndW1lbnRfdHlwZV9lcnJvciBcIs6pbmZhX19fNiBleHBlY3RlZCBhbiBvcHRpb25hbCBQT0QgYXQgcG9zaXRpb24gI3txX3JpZHh9LCBnb3QgI3tycHIgUC5hdCBxX3JpZHh9XCJcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgIyMjIEhhcm1vbml6ZSB2YWx1ZXM6ICMjI1xuICAgICAgZm9yIG5hbWUsIGlkeCBpbiBuYW1lc1xuICAgICAgICBjb250aW51ZSBpZiBpZHggaXMgcV9pZHggIyMjIHNraXAgb3ZlciBDRkcgb2JqZWN0J3MgKGBRYCdzJykgcG9zaXRpb24gaW4gUCAjIyNcbiAgICAgICAgaWYgKCBQWyBpZHggICBdIGlzIHVuZGVmaW5lZCApICB0aGVuICBQWyBpZHggIF0gPSBRWyBuYW1lIF1cbiAgICAgICAgZWxzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBRWyBuYW1lIF0gPSBQWyBpZHggIF0gIyMjIHBvcy5hcmc6cyBvdGhlciB0aGFuIHVuZGVmLiB0YWtlIHByZWNlZGVuY2UgIyMjXG4gICAgICAgIGlmICggUVsgbmFtZSAgXSBpcyB1bmRlZmluZWQgKSAgdGhlbiAgUVsgbmFtZSBdID0gUFsgaWR4ICBdICMjIyBlbnN1cmUgYWxsIHNpZ24uIG5hbWVzIGFyZSBzZXQgaW4gQ0ZHIFBPRCBgUWAgIyMjXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHJldHVybiB2YWxpZGF0ZSBmbi5jYWxsIEAsIFAuLi5cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGdldF9zaWduYXR1cmU6ICggZm4gKSAtPlxuICAgIHRoaXNfY2ZnX3FfbmFtZSA9ICdjZmcnICMjIyBUQUlOVCBwaWNrIGZyb20gQGNmZyAjIyNcbiAgICAjIyMgdGh4IHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvaWRlbnRpZmllci1yZWdleCAjIyNcbiAgICBqc2lkX3JlICAgPSAvLy8gXiBbICQgXyBcXHB7SURfU3RhcnR9IF0gWyAkIF8gXFx1MjAwQyBcXHUyMDBEIFxccHtJRF9Db250aW51ZX0gXSogJCAvLy9zdlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgc2lnbmF0dXJlID0gZm4udG9TdHJpbmcoKVxuICAgIHNpZ25hdHVyZSA9IHNpZ25hdHVyZS5yZXBsYWNlIC8vLyBcXHMrIC8vL3N2ZywgJydcbiAgICBzaWduYXR1cmUgPSBzaWduYXR1cmUucmVwbGFjZSAvLy8gXiBbXiBcXCggXSogXFwoICg/PHBhcmVucz4gW14gXFwpIF0qICkgXFwpIC4qICQgLy8vc3ZnLCAnJDxwYXJlbnM+J1xuICAgIG5hbWVzICAgICA9IHNpZ25hdHVyZS5zcGxpdCAnLCdcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHFfaWR4ICAgICA9IG51bGxcbiAgICBmb3IgbmFtZSwgaWR4IGluIG5hbWVzXG4gICAgICBpZiBqc2lkX3JlLnRlc3QgbmFtZVxuICAgICAgICBxX2lkeCA9IGlkeCBpZiBuYW1lIGlzIHRoaXNfY2ZnX3FfbmFtZVxuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgU2lnbmF0dXJlX2Rpc3Bvc2l0aW9uX0Vycm9yIFwizqluZmFfX183IHBhcmFtZXRlciBkaXNwb3NpdGlvbiBub3QgY29tcGxpYW50OiAje3JwciBuYW1lfSBpbiAje3JwciBzaWduYXR1cmV9XCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHVubGVzcyBxX2lkeD9cbiAgICAgIG5hbWVzX3JwciA9IG5hbWVzLmpvaW4gJywgJ1xuICAgICAgdGhyb3cgbmV3IFNpZ25hdHVyZV9uYW1pbmdfRXJyb3IgXCLOqW5mYV9fXzggcGFyYW1ldGVyIG5hbWluZyBub3QgY29tcGxpYW50OiBubyBwYXJhbWV0ZXIgbmFtZWQgI3tycHIgdGhpc19jZmdfcV9uYW1lfSwgZ290ICN7cnByIG5hbWVzX3Jwcn1cIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgc3dpdGNoIHFfaWR4XG4gICAgICB3aGVuIG5hbWVzLmxlbmd0aCAtIDIgdGhlbiBxX3JpZHggPSAtMlxuICAgICAgd2hlbiBuYW1lcy5sZW5ndGggLSAxIHRoZW4gcV9yaWR4ID0gLTFcbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgbmV3IFNpZ25hdHVyZV9jZmdfcG9zaXRpb25fZXJyb3IgXCLOqW5mYV9fXzkgcGFyYW1ldGVyIG9yZGVyaW5nIG5vdCBjb21wbGlhbnQ6IGV4cGVjdGVkICN7cnByIHRoaXNfY2ZnX3FfbmFtZX0gdG8gY29tZSBsYXN0IG9yIG5leHQtdG8tbGFzdCwgZm91bmQgaXQgYXQgaW5kZXggI3txX2lkeH0gb2YgI3tuYW1lcy5sZW5ndGh9IHBhcmFtZXRlcnNcIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcmV0dXJuIHsgbmFtZXMsIHFfaWR4LCBxX3JpZHgsIH1cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbm5vcm1hbGl6ZXIgICAgICAgICAgICAgICAgPSBuZXcgTm9ybWFsaXplX2Z1bmN0aW9uX2FyZ3VtZW50cygpXG57IG5mYVxuICBnZXRfc2lnbmF0dXJlICAgICAgICAgfSA9IG5vcm1hbGl6ZXJcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5tb2R1bGUuZXhwb3J0cyA9IHsgbmZhLCBnZXRfc2lnbmF0dXJlLCBOb3JtYWxpemVfZnVuY3Rpb25fYXJndW1lbnRzLCBUZW1wbGF0ZSwgaW50ZXJuYWxzLCB9XG5cbiJdfQ==
