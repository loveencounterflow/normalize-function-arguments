
'use strict'

#===========================================================================================================
# optional                  = Symbol 'optional'
pod_prototypes            = Object.freeze [ null, ( Object.getPrototypeOf {} ), ]

# #===========================================================================================================
# @bind_proto = ( that, f ) -> that::[ f.name ] = f.bind that::

#===========================================================================================================
gnd = do ->
  R =
    # anything:       isa:  ( x ) -> true
    # primitive:      isa:  ( x ) -> primitive_types.includes type_of x
    # #.........................................................................................................
    # ### NOTE types 'simple' and 'compound' more or less boil down to x being a POD, their explicit definition
    # are for clarity and to allow for later modification ###
    # simple:         isa:  ( x ) -> ( not x? ) or ( not gnd.compound.isa x )
    # compound:       isa:  ( x ) -> gnd.pod.isa x
    # #.........................................................................................................
    # boolean:        isa:  ( x ) -> ( x is true ) or ( x is false )
    function:       isa:  ( x ) -> ( Object::toString.call x ) is '[object Function]'
    pod: isa: ( x ) -> x? and ( Object.getPrototypeOf x ) in pod_prototypes
  type.name = typename for typename, type of R
  return R



#===========================================================================================================
hide = ( object, name, value ) => Object.defineProperty object, name,
    enumerable:   false
    writable:     true
    configurable: true
    value:        value

#===========================================================================================================
nameit = ( name, f ) -> Object.defineProperty f, 'name', { value: name, }; f

#===========================================================================================================
get_instance_methods = ( instance ) ->
  R             = {}
  for key, { value: method, } of Object.getOwnPropertyDescriptors instance
    continue if key is 'constructor'
    continue unless gnd.function.isa method
    R[ key ] = method
  return R

#===========================================================================================================
bind_instance_methods = ( instance, keep_name = true ) ->
  for key, method of get_instance_methods Object.getPrototypeOf instance
    if keep_name
      hide instance, key, nameit method.name, method.bind instance
    else
      hide instance, key, method.bind instance
  return null

#===========================================================================================================
debug   = console.debug
help    = console.help
warn    = console.warn
rpr     = ( x ) -> ( require 'loupe' ).inspect x

#===========================================================================================================
module.exports = {
  gnd
  hide
  nameit
  # get_instance_methods
  bind_instance_methods
  debug
  help
  warn
  rpr }
