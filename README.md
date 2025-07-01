
# normalize-function-arguments


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [normalize-function-arguments](#normalize-function-arguments)
  - [Properties](#properties)
  - [Terminology](#terminology)
  - [To Do](#to-do)
    - [To Be Written: Template Class](#to-be-written-template-class)
  - [Is Done](#is-done)
  - [Don't](#dont)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



# normalize-function-arguments

Normalize JavaScript function arguments to simplify variadic function signatures, default values, type
validation

## Properties

* method `nfa()` accepts (among other things) a function `fn` as argument
* `nfa()` returns a function (call it `nfn`), which is a wrapped version of `fn` that
  * accepts the same number of arguments;
  * `fn` will be called with a normalized arguments
  * and its return value will be returned by the wrapper.
* The declaration of `fn`:
  * **must not** use spread syntax or default values on any on the parameters
  * **must** have a parameter named `cfg` as its *only*, or as its *last* or as its *next-to-last* parameter

<!--
* **Argument Normalization**

  * let
    * `P` be the list of values that `nfn` is called with.
    * `names` be the list of names of the parameter that `fn` was declared with.
    * `arity` be the length of list `names`.
    * `q_idx` be the left-to_right (positive, zero-based) index of the `cfg` parameter.
    * `q_ridx` be the right-left (negative, minus-one-based) index of the `cfg` parameter; this will be
      either `-1` or `-2`, depending on whether `cfg` comes in ultimate or penultimate position

  * if the length of `P` exceeds `arity`, an error will be thrown.
  * In order to locate the `cfg` argument, we assume that
    * if its name (`cfg`) comes last in the declaration (`q_ridx == -1`), its value, if any, may only be the
      last element of `P`;
    * likewise, if its name comes next-to-last (`q_ridx == -2`), its value, if any, may only be the
      next-to-last element of `P`.
    * we check whether a plain object (or POD for 'plain old dictionary') is in the ultimate or penultimate
      position;
      * if it is a POD, we apply templating and replace the original with a copy;
      * if it isn't a POD, we produce a new object by templating an empty object and push it to the correct
        ultimate or penultimate position
  * We now have a `cfg` object at the desired position and are ready to care for the positional arguments
    preceding the named parameters object, if any.
  * In case the length of `P` equals `arity`, we're done.
  * In case the length of `P` is greater than `arity`, we throw an error.
  * In the remaining case we push as many filler values (`undefined`) into the position *preceding* the
    `cfg` object untile the length of `P` equals `arity`.
-->

* (**TBD**) normalization of call-time arguments
* (**TBD**) templating
* (**TBD**) validation
* (**TBD**) ClearType integration

## Terminology

* **qualified parameters** (`Q`)
* **qualified argument(s)**
* **positional parameters** (`P`)
* **positional arguments**


## To Do

* **`[—]`** integrate ClearType as `nfa type, fn` and `nfa { type, }, fn`
* **`[—]`** allow shifting of arguments depending on their type
* **`[—]`** configuration settings:
  * **`[—]`** demand vs allow final CFG
  * **`[—]`** demand n positional arguments
  * **`[+]`** fallback value for unset qualified arguments (`template`)
  * **`[+]`** function or type to check whether last argument is 'Q-worthy' (one expected for named
    arguments)
  * **`[—]`** name of named parameters object (defaults to `cfg`)
  * **`[—]`** allow both standalone `type` (as in `nfa type ( cfg ) ->`) and `type` as named setting (as in
    `nfa { type, } ( cfg ) ->`)
* resolution strategy for repeated setting:
  * **`[—]`** `cfg.template` should prevail in `cfg = { template, type: { template, }, }`
  * **`[—]`** `cfg.isa`      should prevail in `cfg = { isa, type: { isa, }, }`
  * **`[—]`** `cfg.validate` should prevail in `cfg = { validate, type: { validate, }, }`
  * **`[—]`** `cfg.validate` should prevail in `cfg = { validate, isa, type: { validate, isa, }, }`
  * in general, the 'lower'/outer, ('more visible') setting should prevail; explicit `validate()` should
    prevail over implicit validation constructed from `isa()`
* **`[—]`** allow the CFG parameter to be in penultimate position to cover cases (like in
  `Normalize_function_arguments::nfa()`) where a final parameter should be occupied by e.g. a function (but
  do not place type restrictions on that last parameter)
* **`[—]`** allow asynchronous functions, generator functions, async generator functions for
  `Normalize_function_arguments::nfa#fn`
* **`[—]`** errors:
  * **`[—]`** refactor error classes to proper module
  * **`[—]`** use standard setup
  * **`[—]`** apply to errors thrown in submodule `helpers`
* **`[—]`** implement a 'nano' or 'kernel' version of ClearType (sans `create()` prob.) but, crucially, with
  constructor for `validate()` methods, proper `type_of()`


### To Be Written: Template Class

* class `Template` accepts `cfg`, an optional, single POD for instantiation
* will copy all own properties of `cfg`, but
* properties that are functions will be turned into managed properties
* in order to have templates with mutable objects as properties that are not shared after copying with `t =
  new Template cfg; { t..., }`, do not use `t = { n: [ 1, 2, 3, ], }`, instead wrap value in function, as in
  `t = { n: ( -> [ 1, 2, 3, ] ), }`; now every time `t` is copied, `t.n` will be a new list
* nested PODs will be recursively turned into instances of `Template`

## Is Done

* **`[+]`** handle empty signatures
  * **`[+]`** in `Normalize_function_arguments::get_signature()`
  * **`[+]`** in `Normalize_function_arguments::nfa()`
* **`[+]`** consider to dump dispositions, disallow soaks, default values in signatures to make analysis
  simpler, faster; will be handled by `cfg.template` / `cfg.type`
* **`[+]`** implement class `Template`
* **`[+]`** implement recursive templating in class `Template`
* **`[+]`** <del>if last parameter is named `cfg`, assume it is for the named parameters object and assign it
  a fallback value `{}`</del> <ins>mandate at least one and final parameter that must have the configured
  `q_name`</ins>
* **`[+]`** CFG setting `template` as `nfa { template, }, fn`
* **`[+]`** preserve name of wrapped function
* **`[+]`** implement validation as `nfa { isa, }, fn`

## Don't

* **`[—]`** <del>name clash resolution strategies</del> <ins>positional arguments other than `undefined`
  always override values in `cfg`</ins>
* **`[—]`** <del>fallback value for unset positional arguments (or use `template`)</del> <ins>positional
  arguments other than `undefined` always override values in `cfg`</ins>

<!--
###

# Restriction

In order to avoid having to integrate a JS expression parser, we restrict eligible functions to those whose
signatures consists of nothing but bare parameter names, parameter names with spread (soak) symbol '...',
and parameter names with the symbolic default 'optional' which must be spelled out in those same letters.

# CFG Resolution Strategies

* demand fixed number positional
* demand last one named
* signature has *p* ∈ ℕ₀ positional parameters (named in signature)
* signature has *q* ∈ [ 0, 1 ] PODs for named parameters (i.e. has one or none)
* signature has *p* + *q* = *b* ∈ ℕ₀ parameters
* signature has *s* ∈ [ 0, 1 ] splats (i.e. has one or none)
* function call has *a* ∈ ℕ₀ arguments
  * pre-check strategies:
    * **PCS1**: reject if *b* ≠ *p*
    * **PCS2**: reject if *b* > *p* (Note: can/will not apply if any parameter is declared as a rest (or
      soak) parameter (i.e. with `...`); in that case, assume *b* = *p*)
* recognition of CFG:
  * all strategies / invariants:
    * CFG may only be last parameter and therefore last argument
    * CFG must be a POD
  * CFG recognition strategies:
    * **CRS1** CFG must be at position of CFG in parameters, arguments[ b - 1 ]
    * **CRS2** CFG must be at last position of arguments, arguments[ a - 1 ]
Given a function `f = ( a, b, c, cfg ) ->` that is called as follows:

* **p0_n0**: f()
* **p1_n0**: f 1
* **p2_n0**: f 1, 2
* **p3_n0**: f 1, 2, 3
* **p0_n1**: f          { a: 4, d: 5, }
* **p1_n1**: f 1,       { a: 4, d: 5, }
* **p2_n1**: f 1, 2,    { a: 4, d: 5, }
* **p3_n1**: f 1, 2, 3, { a: 4, d: 5, }
* **p4_n0**: f 1, 2, 3, 4

* **NN**: demand 4 arguments, last one must be a POD
  * **p0_n0**: f()                          # ERROR
  * **p1_n0**: f 1                          # ERROR
  * **p2_n0**: f 1, 2                       # ERROR
  * **p3_n0**: f 1, 2, 3                    # ERROR
  * **p0_n1**: f          { a: 4, d: 5, }   # ERROR
  * **p1_n1**: f 1,       { a: 4, d: 5, }   # ERROR
  * **p2_n1**: f 1, 2,    { a: 4, d: 5, }   # ERROR
  * **p3_n1**: f 1, 2, 3, { a: 4, d: 5, }   # depends on Name Clash Resolution Strategy
  * **p4_n0**: f 1, 2, 3, 4                 # ERROR

* **NN**: assign positional arguments that appear in signature, last must be a POD
  * **p0_n0**: f()                          # ERROR
  * **p1_n0**: f 1                          # ERROR
  * **p2_n0**: f 1, 2                       # ERROR
  * **p3_n0**: f 1, 2, 3                    # ERROR
  * **p0_n1**: f          { a: 4, d: 5, }   # { a: 4, d: 5, }
  * **p1_n1**: f 1,       { a: 4, d: 5, }   # {       d: 5, }, `a` depends on Name Clash Resolution Strategy
  * **p2_n1**: f 1, 2,    { a: 4, d: 5, }   # {       d: 5, }, `a` depends on Name Clash Resolution Strategy
  * **p3_n1**: f 1, 2, 3, { a: 4, d: 5, }   # {       d: 5, }, `a` depends on Name Clash Resolution Strategy
  * **p4_n0**: f 1, 2, 3, 4                 # ERROR

* **NN**: assign positional arguments that appear in signature, last may be a POD (udf: `undefined`)
  * **p0_n0**: f()                          # { a: 4, b: udf, c: udf, }
  * **p1_n0**: f 1                          # { a: 4, b: udf, c: udf, }
  * **p2_n0**: f 1, 2                       # { a: 4, b: udf, c: udf, }
  * **p3_n0**: f 1, 2, 3                    # { a: 4, b: udf, c: udf, }
  * **p0_n1**: f          { a: 4, d: 5, }   # { a: 4, b: udf, c: udf, d: 5, }
  * **p1_n1**: f 1,       { a: 4, d: 5, }   # {       b: udf, c: udf, d: 5, }, `a` depends on Name Clash Resolution Strategy
  * **p2_n1**: f 1, 2,    { a: 4, d: 5, }   # {       b: udf, c: udf, d: 5, }, `a` depends on Name Clash Resolution Strategy
  * **p3_n1**: f 1, 2, 3, { a: 4, d: 5, }   # {       b: udf, c: udf, d: 5, }, `a` depends on Name Clash Resolution Strategy
  * **p4_n0**: f 1, 2, 3, 4                 # ERROR

###

-->