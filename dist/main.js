var $eprfK$loupe = require("loupe");


      var $parcel$global = globalThis;
    
var $parcel$modules = {};
var $parcel$inits = {};

var parcelRequire = $parcel$global["parcelRequire993b"];

if (parcelRequire == null) {
  parcelRequire = function(id) {
    if (id in $parcel$modules) {
      return $parcel$modules[id].exports;
    }
    if (id in $parcel$inits) {
      var init = $parcel$inits[id];
      delete $parcel$inits[id];
      var module = {id: id, exports: {}};
      $parcel$modules[id] = module;
      init.call(module.exports, module, module.exports);
      return module.exports;
    }
    var err = new Error("Cannot find module '" + id + "'");
    err.code = 'MODULE_NOT_FOUND';
    throw err;
  };

  parcelRequire.register = function register(id, init) {
    $parcel$inits[id] = init;
  };

  $parcel$global["parcelRequire993b"] = parcelRequire;
}

var parcelRegister = parcelRequire.register;
parcelRegister("l9Mf5", function(module, exports) {

(function() {
    'use strict';
    var Template, bind_instance_methods, create_validator, debug, get_instance_methods, gnd, help, hide, nameit, new_pod, pod_prototypes, push_at, rpr, set_at, warn, indexOf = [].indexOf;
    //===========================================================================================================
    // optional                  = Symbol 'optional'
    pod_prototypes = Object.freeze([
        null,
        Object.getPrototypeOf({})
    ]);
    // new_pod                   = -> {}
    new_pod = function() {
        return Object.create(null);
    };
    // #===========================================================================================================
    // @bind_proto = ( that, f ) -> that::[ f.name ] = f.bind that::
    //===========================================================================================================
    Template = class Template {
        //---------------------------------------------------------------------------------------------------------
        constructor(cfg = null){
            var descriptor, name, ref;
            ref = Object.getOwnPropertyDescriptors(cfg != null ? cfg : {});
            for(name in ref){
                descriptor = ref[name];
                descriptor = (function() {
                    switch(true){
                        //...................................................................................................
                        case gnd.function.isa(descriptor.value):
                            return ((descriptor)=>{
                                var configurable, get;
                                ({ configurable: configurable, value: get } = descriptor);
                                return {
                                    enumerable: true,
                                    configurable: configurable,
                                    get: get
                                };
                            })(descriptor);
                        //...................................................................................................
                        case gnd.pod.isa(descriptor.value):
                            return ((descriptor)=>{
                                var configurable, get, value;
                                ({ configurable: configurable, value: value } = descriptor);
                                get = function() {
                                    return new Template(value);
                                };
                                return {
                                    enumerable: true,
                                    configurable: configurable,
                                    get: get
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
        /* TAINT `gnd.nonempty_text.validate typename` */ /* TAINT `gnd.function.validate isa` */ /* TAINT silently accepts truthy, falsy values returned by `isa()`, not only booleans */ return function(x) {
            if (isa(x)) return x;
            throw new TypeError(`\u{3A9}nfa___1 validation error: expected a ${typename} got ${rpr(x)}`);
        };
    };
    //===========================================================================================================
    gnd = function() {
        var R, type, typename;
        R = {
            // boolean:        isa:  ( x ) -> ( x is true ) or ( x is false )
            //.......................................................................................................
            function: {
                isa: function(x) {
                    return Object.prototype.toString.call(x) === '[object Function]';
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
                    return x != null && (ref = Object.getPrototypeOf(x), indexOf.call(pod_prototypes, ref) >= 0);
                },
                create: function(...Q) {
                    return Object.assign(new_pod(), ...Q);
                }
            },
            //.......................................................................................................
            nfa_cfg: {
                isa: function(x) {
                    if (!gnd.pod.isa(x)) return false;
                    if (!gnd.template.isa_optional(x.template)) return false;
                    if (!gnd.function.isa_optional(x.isa)) return false;
                    if (!gnd.function.isa_optional(x.validate)) return false;
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
        for(typename in R){
            type = R[typename];
            type.name = typename;
        }
        // type.validate = ( x ) -> ...
        //.........................................................................................................
        return R;
    }();
    (()=>{
        var results, type, typename;
        results = [];
        for(typename in gnd){
            type = gnd[typename];
            results.push(function(typename, type) {
                if (type.template != null) type.template = new Template(type.template);
                if (type.isa != null) {
                    if (type.isa_optional == null) type.isa_optional = function(x) {
                        return x == null || type.isa(x);
                    };
                    if (type.validate == null) type.validate = create_validator(type.name, function(x) {
                        return type.isa(x);
                    });
                }
                return null;
            }(typename, type));
        }
        return results;
    })();
    //===========================================================================================================
    hide = (object, name, value)=>{
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
        for(key in ref){
            ({ value: method } = ref[key]);
            if (key === 'constructor') continue;
            if (!gnd.function.isa(method)) continue;
            R[key] = method;
        }
        return R;
    };
    //===========================================================================================================
    bind_instance_methods = function(instance, keep_name = true) {
        var key, method, ref;
        ref = get_instance_methods(Object.getPrototypeOf(instance));
        for(key in ref){
            method = ref[key];
            if (keep_name) hide(instance, key, nameit(method.name, method.bind(instance)));
            else hide(instance, key, method.bind(instance));
        }
        return null;
    };
    //===========================================================================================================
    push_at = function(list, idx, x) {
        if (!(idx < 0)) throw new Error(`\u{3A9}nfa___7 expected negative number, got ${rpr(idx)}`);
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
        if (!(idx < 0)) throw new Error(`\u{3A9}nfa__10 expected negative number, got ${rpr(idx)}`);
        list[list.length + idx] = x;
        return x;
    };
    //===========================================================================================================
    debug = console.debug;
    help = console.help;
    warn = console.warn;
    rpr = function(x) {
        return $eprfK$loupe.inspect(x);
    };
    //===========================================================================================================
    // get_instance_methods
    // pop_at
    module.exports = {
        Template: Template,
        gnd: gnd,
        create_validator: create_validator,
        hide: hide,
        nameit: nameit,
        bind_instance_methods: bind_instance_methods,
        push_at: push_at,
        set_at: set_at,
        debug: debug,
        help: help,
        warn: warn,
        rpr: rpr
    };
}).call(module.exports);

});


(function() {
    'use strict';
    var Argument_type_error, Arity_error, H, Internals, Named_arity_error, Nfa_error, Normalize_function_arguments, Not_implemented_error, Positional_arity_error, Runtime_arity_error, Signature_cfg_position_error, Signature_disposition_Error, Signature_error, Signature_missing_parameter_Error, Signature_naming_Error, Template, Type_error, Value_mismatch_error, bind_instance_methods, create_validator, debug, get_signature, gnd, help, hide, internals, nameit, nfa, normalizer, push_at, rpr, set_at, warn;
    //===========================================================================================================
    H = (parcelRequire("l9Mf5"));
    // get_instance_methods
    // pop_at
    ({ Template: Template, gnd: gnd, hide: hide, create_validator: create_validator, bind_instance_methods: bind_instance_methods, nameit: nameit, push_at: push_at, set_at: set_at, debug: debug, warn: warn, help: help, rpr: rpr } = H);
    // E                         = require './errors'
    // optional                  = Symbol 'optional'
    //=========================================================================================================
    Nfa_error = class Nfa_error extends Error {
    };
    Arity_error = class Arity_error extends Nfa_error {
    };
    Named_arity_error = class Named_arity_error extends Arity_error {
    };
    Runtime_arity_error = class Runtime_arity_error extends Arity_error {
    };
    Positional_arity_error = class Positional_arity_error extends Arity_error {
    };
    Not_implemented_error = class Not_implemented_error extends Nfa_error {
    };
    Signature_error = class Signature_error extends Nfa_error {
    };
    Signature_disposition_Error = class Signature_disposition_Error extends Signature_error {
    };
    Signature_naming_Error = class Signature_naming_Error extends Signature_error {
    };
    Signature_missing_parameter_Error = class Signature_missing_parameter_Error extends Signature_error {
    };
    Signature_cfg_position_error = class Signature_cfg_position_error extends Signature_error {
    };
    Value_mismatch_error = class Value_mismatch_error extends Nfa_error {
    };
    Type_error = class Type_error extends Nfa_error {
    };
    Argument_type_error = class Argument_type_error extends Type_error {
    };
    //===========================================================================================================
    internals = new (Internals = class Internals {
        constructor(){
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
        constructor(cfg = null){
            if (cfg != null) throw new Not_implemented_error("\u03A9nfa___1 configuration not implemented");
            bind_instance_methods(this);
            return void 0;
        }
        //---------------------------------------------------------------------------------------------------------
        nfa(cfg, fn) /* Normalize Function Arguments */ {
            var arity, fn_name, names, q_idx, q_ridx, validate;
            switch(arity = arguments.length){
                case 1:
                    [cfg, fn] = [
                        {},
                        cfg
                    ];
                    break;
                case 2:
                    break;
                default:
                    throw new Runtime_arity_error(`\u{3A9}nfa___2 expected 1 or 2 arguments, got ${arity}`);
            }
            //.......................................................................................................
            /* TAINT do this in `gnd` */ if (!gnd.pod.isa(cfg)) throw new Type_error(`\u{3A9}nfa___3 expected a POD, got ${rpr(cfg)}`);
            if (!gnd.function.isa(fn)) throw new Type_error(`\u{3A9}nfa___4 expected a function, got ${rpr(cfg)}`);
            //.......................................................................................................
            cfg = {
                ...gnd.nfa_cfg.template,
                ...cfg
            };
            if (cfg.template != null) cfg.template = new Template(cfg.template);
            gnd.nfa_cfg.validate(cfg);
            //.......................................................................................................
            ({ names: names, q_idx: q_idx, q_ridx: q_ridx } = this.get_signature(fn));
            arity = names.length;
            fn_name = fn.name;
            //.......................................................................................................
            validate = cfg.isa != null ? create_validator(`${fn_name}_cfg`, cfg.isa) : function(x) {
                return x;
            };
            //.......................................................................................................
            return nameit(fn_name, function(...P) {
                /* ATP, `P` holds `arity` arguments and there *is* a POD in CFG position (which we assume to
               represent CFG so we can make a copy, filling in template values): */ var Q, i, idx, len, name;
                if (P.length > arity) throw new Positional_arity_error(`\u{3A9}nfa___5 expected up to ${arity} arguments, got ${P.length}`);
                //.....................................................................................................
                if (gnd.pod.isa(P.at(q_ridx))) {
                    while(P.length < arity)push_at(P, q_ridx, void 0);
                    Q = set_at(P, q_ridx, gnd.pod.create(cfg.template, P.at(q_ridx)));
                } else {
                    while(P.length < arity)P.push(void 0);
                    /* ATP, `P` holds `arity` arguments and there *may be* an `undefined` in CFG position (which we
                 assume is replaceable by a newly created CFG instance with template values): */ if (P.at(q_ridx) === void 0) Q = set_at(P, q_ridx, gnd.pod.create(cfg.template));
                    else throw new Argument_type_error(`\u{3A9}nfa___6 expected an optional POD at position ${q_ridx}, got ${rpr(P.at(q_ridx))}`);
                }
                //.....................................................................................................
                /* Harmonize values: */ for(idx = i = 0, len = names.length; i < len; idx = ++i){
                    name = names[idx];
                    if (idx === q_idx /* skip over CFG object's (`Q`'s') position in P */ ) continue;
                    if (P[idx] === void 0) P[idx] = Q[name];
                    else Q[name] = P[idx];
                    if (Q[name] === void 0) Q[name] = P[idx];
                }
                //.....................................................................................................
                return validate(fn.call(this, ...P));
            });
        }
        //---------------------------------------------------------------------------------------------------------
        get_signature(fn) {
            /* thx to https://github.com/sindresorhus/identifier-regex */ var i, idx, jsid_re, len, name, names, names_rpr, q_idx, q_ridx, signature, this_cfg_q_name;
            this_cfg_q_name = 'cfg' /* TAINT pick from @cfg */ ;
            jsid_re = /^[$_\p{ID_Start}][$_\u200C\u200D\p{ID_Continue}]*$/sv;
            //.......................................................................................................
            signature = fn.toString();
            signature = signature.replace(/\s+/svg, '');
            signature = signature.replace(/^[^\(]*\((?<parens>[^\)]*)\).*$/svg, '$<parens>');
            names = signature.split(',');
            //.......................................................................................................
            q_idx = null;
            for(idx = i = 0, len = names.length; i < len; idx = ++i){
                name = names[idx];
                if (jsid_re.test(name)) {
                    if (name === this_cfg_q_name) q_idx = idx;
                } else throw new Signature_disposition_Error(`\u{3A9}nfa___7 parameter disposition not compliant: ${rpr(name)} in ${rpr(signature)}`);
            }
            //.......................................................................................................
            if (q_idx == null) {
                names_rpr = names.join(', ');
                throw new Signature_naming_Error(`\u{3A9}nfa___8 parameter naming not compliant: no parameter named ${rpr(this_cfg_q_name)}, got ${rpr(names_rpr)}`);
            }
            //.......................................................................................................
            switch(q_idx){
                case names.length - 2:
                    q_ridx = -2;
                    break;
                case names.length - 1:
                    q_ridx = -1;
                    break;
                default:
                    throw new Signature_cfg_position_error(`\u{3A9}nfa___9 parameter ordering not compliant: expected ${rpr(this_cfg_q_name)} to come last or next-to-last, found it at index ${q_idx} of ${names.length} parameters`);
            }
            //.......................................................................................................
            return {
                names: names,
                q_idx: q_idx,
                q_ridx: q_ridx
            };
        }
    };
    //===========================================================================================================
    normalizer = new Normalize_function_arguments();
    ({ nfa: nfa, get_signature: get_signature } = normalizer);
    //===========================================================================================================
    module.exports = {
        nfa: nfa,
        get_signature: get_signature,
        Normalize_function_arguments: Normalize_function_arguments,
        Template: Template,
        internals: internals
    };
}).call(module.exports);


//# sourceMappingURL=main.js.map
