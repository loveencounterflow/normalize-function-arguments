
'use strict'

#===========================================================================================================
H                         = require './helpers'
{ gnd
  hide
  # get_instance_methods
  bind_instance_methods
  nameit
  debug
  warn
  help
  rpr                   } = H
# E                         = require './errors'
# optional                  = Symbol 'optional'


#=========================================================================================================
class Arity_error extends Error
class Not_implemented_error extends Error
class Value_mismatch_error extends Error


#===========================================================================================================
internals = new class Internals then constructor: ->
  @pod_prototypes = H.pod_prototypes
  @gnd            = gnd
  return undefined





#===========================================================================================================
class Normalize_function_arguments

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg = null ) ->
    if cfg?
      throw new Not_implemented_error "Ωnfa___1 configuration not implemented"
    bind_instance_methods @
    return undefined

  #---------------------------------------------------------------------------------------------------------
  nfa: ( fn ) ->                                                        ### Normalize Function Arguments ###
    signature         = @get_signature fn
    names             = Object.keys signature
    arity             = names.length
    p_names           = names[ ... names.length - 1 ]
    p_arity           = p_names.length
    #.......................................................................................................
    dispositions      = ( signature[ name ] for name in names )
    for disposition, idx in dispositions
      continue if disposition is 'bare'
      throw new Not_implemented_error "Ωnfa___2 encountered unimplemented disposition #{rpr disposition} for parameter #names[ idx ]"
    #.......................................................................................................
    return ( P... ) ->
      #.....................................................................................................
      if gnd.pod.isa P.at -1  then  Q = gnd.pod.create P.pop() ### NOTE copy object so we can modify it ###
      else                          Q = gnd.pod.create()
      #.....................................................................................................
      if P.length > p_arity
        throw new Arity_error "Ωnfa___3 expected up to #{p_arity} positional arguments, got #{P.length}"
      #.....................................................................................................
      P.push undefined while P.length < p_arity
      #.....................................................................................................
      for name, idx in p_names
        p_value = P[ idx  ]
        q_value = Q[ name ]
        switch true
          when ( p_value is   undefined ) and ( q_value is   undefined ) then null
          when ( p_value is   undefined ) and ( q_value isnt undefined ) then P[ idx  ] = q_value
          when ( p_value isnt undefined ) and ( q_value is   undefined ) then Q[ name ] = p_value
          else
            ### TAINT treat acc to value mismatch resolution strategy ###
            # unless p_value is q_value                                   # strategy: 'error'
            #   throw new Value_mismatch_error "Ωnfa___4"
            # P[ idx  ] = q_value                                           # strategy: 'named'
            Q[ name ] = p_value                                             # strategy: 'positional'
      #.....................................................................................................
      return fn.call @, P..., Q

  #---------------------------------------------------------------------------------------------------------
  get_signature: ( fn ) ->
    ### thx to https://github.com/sindresorhus/identifier-regex ###
    jsid_re = /// ^ [ $ _ \p{ID_Start} ] [ $ _ \u200C \u200D \p{ID_Continue} ]* $ ///sv
    R       = {}
    body    = fn.toString()
    kernel  = body.replace /// ^ [^ \( ]* \( \s* ( [^ \) ]* ) \s* \) .* $ ///sv, '$1'
    return R if kernel is ''
    parts   = kernel.split /// , \s* ///sv
    $names  = []
    #.......................................................................................................
    for part in parts
      switch true
        #...................................................................................................
        when ( match = part.match /// ^ [.]{3} \s* (?<name> \S+ ) \s* $ ///sv )?
          disposition   = 'soak'
          name          = match.groups.name
        #...................................................................................................
        when ( match = part.match /// ^ (?<name> \S+ ) \s* = \s* optional $///sv )?
          disposition   = 'optional'
          name          = match.groups.name
        #...................................................................................................
        else
          unless ( part.match jsid_re )?
            throw new Error "Ωnfa___5 not compliant: #{rpr part} in #{rpr kernel}"
          disposition   = 'bare'
          name          = part
      #.....................................................................................................
      R[ name ] = disposition
      $names.push name
    return R


#===========================================================================================================
normalizer                = new Normalize_function_arguments()
{ nfa
  get_signature }         = normalizer

#===========================================================================================================
module.exports = { nfa, get_signature, internals, }

