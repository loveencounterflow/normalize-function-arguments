
'use strict'

#===========================================================================================================
H                         = require './helpers'
{ Template
  gnd
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
class Nfa_error                           extends Error
class Arity_error                         extends Nfa_error
class Named_arity_error                   extends Arity_error
class Runtime_arity_error                 extends Arity_error
class Positional_arity_error              extends Arity_error
class Not_implemented_error               extends Nfa_error
class Value_mismatch_error                extends Nfa_error
class Signature_error                     extends Nfa_error
class Signature_disposition_Error         extends Signature_error
class Signature_naming_Error              extends Arity_error
class Signature_missing_parameter_Error   extends Arity_error
class Type_error                          extends Nfa_error
# class Npo_type_error                      extends Type_error


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
  nfa: ( cfg, fn ) ->                                                   ### Normalize Function Arguments ###
    switch arity = arguments.length
      when 1 then [ cfg, fn, ] = [ {}, cfg, ]
      when 2 then null
      else throw new Runtime_arity_error "Ωnfa___2 expected 1 or 2 arguments, got #{arity}"
    #.......................................................................................................
    ### TAINT do this in `gnd` ###
    unless gnd.pod.isa cfg      then throw new Type_error "Ωnfa___3 expected a POD, got #{rpr cfg}"
    unless gnd.function.isa fn  then throw new Type_error "Ωnfa___4 expected a function, got #{rpr cfg}"
    #.......................................................................................................
    cfg               = { gnd.nfa_cfg.template..., cfg..., }
    cfg.template      = ( new Template cfg.template ) if cfg.template?
    #.......................................................................................................
    signature         = @get_signature fn
    # q_name            = 'cfg'
    names             = Object.keys signature
    arity             = names.length
    p_names           = names[ ... names.length - 1 ]
    p_arity           = p_names.length
    #.......................................................................................................
    return ( P... ) ->
      #.....................................................................................................
      if gnd.pod.isa P.at -1  then  Q = gnd.pod.create cfg.template, P.pop()
      else                          Q = gnd.pod.create cfg.template
      #.....................................................................................................
      if P.length > p_arity
        throw new Positional_arity_error "Ωnfa__10 expected up to #{p_arity} positional arguments, got #{P.length}"
      #.....................................................................................................
      P.push undefined while P.length < p_arity
      #.....................................................................................................
      ### Harmonize values: ###
      for name, idx in p_names
        if ( P[ idx ] isnt undefined ) then Q[ name ] = P[ idx  ]
        else                                P[ idx  ] = Q[ name ]
      #.....................................................................................................
      return fn.call @, P..., Q

  #---------------------------------------------------------------------------------------------------------
  get_signature: ( fn ) ->
    q_name  = 'cfg'
    ### thx to https://github.com/sindresorhus/identifier-regex ###
    jsid_re = /// ^ [ $ _ \p{ID_Start} ] [ $ _ \u200C \u200D \p{ID_Continue} ]* $ ///sv
    R       = {}
    body    = fn.toString()
    kernel  = body.replace /// ^ [^ \( ]* \( \s* ( [^ \) ]* ) \s* \) .* $ ///sv, '$1'
    if kernel is ''
     throw new Signature_missing_parameter_Error "Ωnfa__13 not compliant: missing parameter #{rpr q_name}"
    parts   = kernel.split /// , \s* ///sv
    parts   = ( part.trim() for part in parts )
    names   = []
    #.......................................................................................................
    for part in parts
      unless ( part.match jsid_re )?
        throw new Signature_disposition_Error "Ωnfa__14 parameter disposition not compliant: #{rpr part} in #{rpr kernel}"
      disposition   = 'bare'
      name          = part
      #.....................................................................................................
      R[ name ] = disposition
      names.push name
    #.......................................................................................................
    unless ( last_name = names.at -1 ) is q_name
      throw new Signature_naming_Error "Ωnfa__15 parameter naming not compliant: last parameter must be named #{rpr q_name}, got #{rpr last_name}"
    # delete R[ q_name ]
    #.......................................................................................................
    return R


#===========================================================================================================
normalizer                = new Normalize_function_arguments()
{ nfa
  get_signature }         = normalizer

#===========================================================================================================
module.exports = { nfa, get_signature, Normalize_function_arguments, Template, internals, }

