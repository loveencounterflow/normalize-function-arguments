
'use strict'

#===========================================================================================================
# optional                  = Symbol 'optional'
pod_prototypes            = Object.freeze [ null, ( Object.getPrototypeOf {} ), ]
# new_pod                   = -> {}
new_pod                   = -> Object.create null
SFMODULES                 = require 'bricabrac-sfmodules'
{ type_of,              } = SFMODULES.unstable.require_type_of()

# #===========================================================================================================
# @bind_proto = ( that, f ) -> that::[ f.name ] = f.bind that::

#===========================================================================================================
class Template

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg = null ) ->
    for name, descriptor of Object.getOwnPropertyDescriptors cfg ? {}
      descriptor = switch true
        #...................................................................................................
        when gnd.function.isa descriptor.value    then do ( descriptor ) =>
          { configurable, value: get, } = descriptor
          return { enumerable: true, configurable, get, }
        #...................................................................................................
        when gnd.pod.isa      descriptor.value    then do ( descriptor ) =>
          { configurable, value, } = descriptor
          get = -> new Template value
          return { enumerable: true, configurable, get, }
        #...................................................................................................
        else
          descriptor
      #.....................................................................................................
      Object.defineProperty @, name, descriptor
    return undefined


#===========================================================================================================
create_validator = ( typename, isa ) ->
  ### TAINT `gnd.nonempty_text.validate typename` ###
  ### TAINT `gnd.function.validate isa` ###
  ### TAINT silently accepts truthy, falsy values returned by `isa()`, not only booleans ###
  return ( x ) ->
    return x if isa x
    throw new TypeError "Ωnfah___1 validation error: expected a #{typename}, got a #{type_of x} (#{rpr x})"


#===========================================================================================================
gnd = do ->
  R =
    # boolean:        isa:  ( x ) -> ( x is true ) or ( x is false )
    #.......................................................................................................
    function:
      isa:  ( x ) -> ( Object::toString.call x ) is '[object Function]'
    #.......................................................................................................
    asyncfunction:
      isa:  ( x ) -> ( Object::toString.call x ) is '[object AsyncFunction]'
    #.......................................................................................................
    generatorfunction:
      isa:  ( x ) -> ( Object::toString.call x ) is '[object GeneratorFunction]'
    #.......................................................................................................
    callable:
      isa:  ( x ) -> ( Object::toString.call x ) in [ '[object Function]', '[object AsyncFunction]', '[object GeneratorFunction]', ]
    #.......................................................................................................
    template:
      isa:    ( x ) -> x instanceof Template
    #.......................................................................................................
    pod:
      isa:    ( x ) -> x? and ( Object.getPrototypeOf x ) in pod_prototypes
      create: ( Q... ) -> Object.assign new_pod(), Q...
    #.......................................................................................................
    nfa_cfg:
      isa: ( x ) ->
        return false unless gnd.pod.isa x
        return false unless gnd.template.isa_optional x.template
        return false unless gnd.function.isa_optional x.isa
        return false unless gnd.function.isa_optional x.validate
        # return false unless gnd.function.isa_optional x.type
        return true
      template:
        template: null
        isa:      null
        validate: null
        type:     null
  #.........................................................................................................
  for typename, type of R
    type.name     = typename
    # type.validate = ( x ) -> ...
  #.........................................................................................................
  return R
### TAINT this is more or less `ClearType.Type::create()` ###
do => for typename, type of gnd then do ( typename, type ) ->
  if type.template? then type.template = ( new Template type.template )
  if type.isa?
    unless type.isa_optional? then type.isa_optional  = ( x ) -> ( not x? ) or ( type.isa x )
    unless type.validate?     then type.validate      = create_validator type.name, ( x ) -> type.isa x
  return null


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
push_at = ( list, idx, x ) ->
  unless idx < 0
    throw new Error "Ωnfah___2 expected negative number, got a #{type_of idx} (#{rpr idx})"
  list.splice ( Math.max list.length + idx, 0 ), 0, x
  return list

# #-----------------------------------------------------------------------------------------------------------
# pop_at = ( list, idx, x ) ->
#   unless idx < 0
#     throw new Error "Ωnfah___3 expected negative number, got a #{type_of idx} (#{rpr idx})"
#   unless list.length >= Math.abs idx
#     throw new Error "Ωnfah___4 list too short, got index #{idx} for length of #{list.length}"
#   return ( list.splice idx, 1 )[ 0 ]

#-----------------------------------------------------------------------------------------------------------
set_at = ( list, idx, x ) ->
  unless idx < 0
    throw new Error "Ωnfah___5 expected negative number, got a #{type_of idx} (#{rpr idx})"
  list[ list.length + idx ] = x
  return x


#===========================================================================================================
debug   = console.debug
help    = console.help
warn    = console.warn
rpr     = ( x ) -> ( require 'loupe' ).inspect x

#===========================================================================================================
module.exports = {
  Template
  gnd
  create_validator
  hide
  nameit
  # get_instance_methods
  bind_instance_methods
  push_at
  # pop_at
  set_at
  debug
  help
  warn
  rpr }
