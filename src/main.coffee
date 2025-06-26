
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
      throw new Not_implemented_error "Ωnfa__10 configuration not implemented"
    bind_instance_methods @
    return undefined

  #---------------------------------------------------------------------------------------------------------
  nfa: ( fn ) ->
    ### Normalize Function Arguments ###
    signature         = @get_signature fn
    names             = Object.keys signature
    pos_names         = names[ .. names.length - 2 ]
    arity             = names.length
    dispositions      = ( signature[ name ] for name in names )
    #.......................................................................................................
    for disposition, idx in dispositions
      continue if disposition is 'bare'
      throw new Not_implemented_error "Ωnfa___6 encountered unimplemented disposition #{rpr disposition} for parameter #names[ idx ]"
    #.......................................................................................................
    return ( P... ) ->
      #.....................................................................................................
      if P.length > arity
        throw new Arity_error "Ωnfa___7 expected up to #{arity} arguments, got #{P.length}"
      #.....................................................................................................
      unless gnd.pod.isa P.at -1
        if P.length > arity - 1
          throw new Arity_error "Ωnfa___8 expected up to #{arity - 1} positional arguments plus one POD, got #{P.length} positional arguments"
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
            #   throw new Value_mismatch_error "Ωnfa___9"
            # P[ idx  ] = nme_value                                           # strategy: 'named'
            Q[ name ] = pos_value                                             # strategy: 'positional'
      #.....................................................................................................
      return fn.call @, P...

  #---------------------------------------------------------------------------------------------------------
  get_signature: ( fn ) ->
    ### thx to https://github.com/sindresorhus/identifier-regex ###
    jsid_re              = /// ^ [ $ _ \p{ID_Start} ] [ $ _ \u200C \u200D \p{ID_Continue} ]* $ ///sv
    debug()
    body    = fn.toString()
    kernel  = body.replace /// ^ [^ \( ]* \( \s* ( [^ \) ]* ) \s* \) .* $ ///sv, '$1'
    parts   = kernel.split /// , \s* ///sv
    # urge 'Ωnfa___1', rpr body
    # urge 'Ωnfa___2', rpr kernel
    # urge 'Ωnfa___3', rpr parts
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
            throw new Error "Ωnfa___4 not compliant: #{rpr part} in #{rpr kernel}"
          name          = part
          disposition   = 'bare'
      # info 'Ωnfa___5', ( rpr part ), { name, disposition, }
      R[ name ] = disposition
      # R[ name ] = { name, disposition, }
      $names.push name
    return R


#===========================================================================================================
normalizer  = new Normalize_function_arguments()
{ nfa }     = normalizer

#===========================================================================================================
module.exports = { nfa, internals, }

