
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
    { names
      q_idx }         = @get_signature fn
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
        throw new Positional_arity_error "Ωnfa___5 expected up to #{p_arity} positional arguments, got #{P.length}"
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
    this_cfg_q_name = 'cfg' ### TAINT pick from @cfg ###
    ### thx to https://github.com/sindresorhus/identifier-regex ###
    jsid_re   = /// ^ [ $ _ \p{ID_Start} ] [ $ _ \u200C \u200D \p{ID_Continue} ]* $ ///sv
    #.......................................................................................................
    signature = fn.toString()
    signature = signature.replace /// \s+ ///svg, ''
    signature = signature.replace /// ^ [^ \( ]* \( (?<parens> [^ \) ]* ) \) .* $ ///svg, '$<parens>'
    names     = signature.split ','
    #.......................................................................................................
    q_idx     = null
    for name, idx in names
      if jsid_re.test name
        q_idx = idx
      else
        throw new Signature_disposition_Error "Ωnfa___6 parameter disposition not compliant: #{rpr name} in #{rpr signature}"
    #.......................................................................................................
    unless ( last_name = names.at -1 ) is this_cfg_q_name
      throw new Signature_naming_Error "Ωnfa___7 parameter naming not compliant: last parameter must be named #{rpr this_cfg_q_name}, got #{rpr last_name}"
    #.......................................................................................................
    if q_idx isnt names.length - 1
      throw new Error "Ωnfa___8 expected #{rpr this_cfg_q_name} to come last, found it at index #{q_idx} of #{names.length} parameters"
    #.......................................................................................................
    return { names, q_idx, }


#===========================================================================================================
normalizer                = new Normalize_function_arguments()
{ nfa
  get_signature         } = normalizer

#===========================================================================================================
module.exports = { nfa, get_signature, Normalize_function_arguments, Template, internals, }

