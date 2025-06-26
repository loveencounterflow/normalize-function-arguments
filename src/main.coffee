
'use strict'

#===========================================================================================================
{ hide
  # get_instance_methods
  # bind_instance_methods
  nameit
  debug
  warn
  help
  rpr                   } = require './helpers'
# E                         = require './errors'
#-----------------------------------------------------------------------------------------------------------
# optional                  = Symbol 'optional'
pod_prototypes            = Object.freeze [ null, ( Object.getPrototypeOf {} ), ]
gnd                       =
  pod: isa: ( x ) -> x? and ( Object.getPrototypeOf x ) in pod_prototypes


#=========================================================================================================
class Arity_error extends Error
class Not_implemented_error extends Error
class Value_mismatch_error extends Error


#===========================================================================================================
internals = new class Internals then constructor: ->
  @pod_prototypes = pod_prototypes
  @gnd            = gnd
  return undefined


#=========================================================================================================
get_signature = ( f ) ->
  ### thx to https://github.com/sindresorhus/identifier-regex ###
  jsid_re              = /// ^ [ $ _ \p{ID_Start} ] [ $ _ \u200C \u200D \p{ID_Continue} ]* $ ///sv
  debug()
  body    = f.toString()
  kernel  = body.replace /// ^ [^ \( ]* \( \s* ( [^ \) ]* ) \s* \) .* $ ///sv, '$1'
  parts   = kernel.split /// , \s* ///sv
  # urge 'Ω__59', rpr body
  # urge 'Ω__60', rpr kernel
  # urge 'Ω__61', rpr parts
  $names  = []
  # R       = { $names, }
  R       = {}
  for part in parts
    switch true
      when ( match = part.match /// ^ [.]{3} \s* (?<name> \S+ ) \s* $ ///sv )?
        name          = match.groups.name
        disposition   = 'soak'
      when ( match = part.match /// ^ (?<name> \S+ ) \s* = \s* optional $///sv )?
        name          = match.groups.name
        disposition   = 'optional'
      else
        unless ( part.match jsid_re )?
          throw new Error "Ω__62 not compliant: #{rpr part} in #{rpr kernel}"
        name          = part
        disposition   = 'bare'
    # info 'Ω__63', ( rpr part ), { name, disposition, }
    R[ name ] = disposition
    # R[ name ] = { name, disposition, }
    $names.push name
  return R

#=========================================================================================================
nfa = ( fn ) ->
  ### Normalize Function Arguments ###
  signature         = get_signature fn
  names             = Object.keys signature
  pos_names         = names[ .. names.length - 2 ]
  arity             = names.length
  dispositions      = ( signature[ name ] for name in names )
  #.......................................................................................................
  for disposition, idx in dispositions
    continue if disposition is 'bare'
    throw new Not_implemented_error "Ω__65 encountered unimplemented disposition #{rpr disposition} for parameter #names[ idx ]"
  #.......................................................................................................
  return ( P... ) ->
    #.....................................................................................................
    if P.length > arity
      throw new Arity_error "Ω__66 expected up to #{arity} arguments, got #{P.length}"
    #.....................................................................................................
    unless gnd.pod.isa P.at -1
      if P.length > arity - 1
        throw new Arity_error "Ω__67 expected up to #{arity - 1} positional arguments plus one POD, got #{P.length} positional arguments"
      P.push {} # Object.create null
    else
      ### NOTE copy object so we can modify it ###
      # P[ P.length - 1 ] = Object.assign ( Object.create null ), P.at -1
      P[ P.length - 1 ] = Object.assign {}, P.at -1
    #.....................................................................................................
    while P.length < arity
      P.splice P.length - 1, 0, undefined
    #.....................................................................................................
    ### TAINT use Q = P.pop(), fn.call @, P..., Q ###
    Q = P.at -1
    for name, idx in pos_names
      pos_value = P[ idx  ]
      nme_value = Q[ name ]
      switch true
        when ( pos_value is   undefined ) and ( nme_value is   undefined ) then null
        when ( pos_value is   undefined ) and ( nme_value isnt undefined ) then P[ idx  ] = nme_value
        when ( pos_value isnt undefined ) and ( nme_value is   undefined ) then Q[ name ] = pos_value
        else
          ### TAINT treat acc to value mismatch resolution strategy ###
          # unless pos_value is nme_value                                   # strategy: 'error'
          #   throw new Value_mismatch_error "Ω__68"
          # P[ idx  ] = nme_value                                           # strategy: 'named'
          Q[ name ] = pos_value                                             # strategy: 'positional'
    #.....................................................................................................
    return fn.call @, P...


#===========================================================================================================
module.exports = { nfa, internals, }

