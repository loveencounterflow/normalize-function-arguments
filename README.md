
# normalize-function-arguments


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [normalize-function-arguments](#normalize-function-arguments)
  - [To Do](#to-do)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



# normalize-function-arguments

Normalize JavaScript function arguments to simplify variadic function signatures, default values, type
validation

## To Do

* **`[—]`** implement class `Template`, argument `template` as `nfa { template, }, fn`
* **`[—]`** implement validation as `nfa { isa, }, fn`
* **`[—]`** integrate ClearType as `nfa type, fn`
* **`[—]`** allow shifting of arguments depending on their type
* **`[—]`** configuration settings:
  * **`[—]`** demand vs allow final CFG
  * **`[—]`** demand n positional arguments
  * **`[—]`** name clash resolution strategies


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