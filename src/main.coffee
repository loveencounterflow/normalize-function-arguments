
'use strict'

#===========================================================================================================
H                         = require './helpers'
{ Template
  gnd
  hide
  # get_instance_methods
  bind_instance_methods
  nameit
  push_at
  # pop_at
  set_at
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
class Signature_naming_Error              extends Signature_error
class Signature_missing_parameter_Error   extends Signature_error
class Signature_cfg_position_error        extends Signature_error
class Type_error                          extends Nfa_error
# class Npo_type_error                      extends Type_error


#===========================================================================================================
internals = new class Internals then constructor: ->
  @pod_prototypes = H.pod_prototypes
  @gnd            = gnd
  @push_at        = push_at
  # @pop_at         = pop_at
  @set_at         = set_at
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
      q_idx
      q_ridx        } = @get_signature fn
    arity             = names.length
    p_names           = ( name for name, idx in names when idx isnt q_idx )
    p_arity           = p_names.length
    #.......................................................................................................
    return ( P... ) ->
      if P.length > arity
        throw new Positional_arity_error "Ωnfa___5 expected up to #{arity} arguments, got #{P.length}"
      #.....................................................................................................
      if P.length < arity
        if gnd.pod.isa P.at q_ridx
          while P.length < arity
            push_at P, q_ridx, undefined
        else
          while P.length < arity
            P.push undefined
      #.....................................................................................................
      cfg_value = P.at q_ridx
      if      ( gnd.pod.isa cfg_value  ) then Q = set_at P, q_ridx, gnd.pod.create cfg.template, P.at q_ridx
      else if ( cfg_value is undefined ) then Q = set_at P, q_ridx, gnd.pod.create cfg.template
      else throw new Error "Ωnfa___8 expected an optional POD at position #{q_ridx}, got #{rpr cfg_value}"
      #.....................................................................................................
      ### Harmonize values: ###
      for name, idx in names
        continue if idx is q_idx
        if ( P[ idx ] isnt undefined ) then Q[ name ] = P[ idx  ]
        P[ idx  ] = Q[ name ]
        Q[ name ] = P[ idx  ]
        # if ( P[ idx ] isnt undefined ) then Q[ name ] = P[ idx  ]
        # else                                P[ idx  ] = Q[ name ]
      #.....................................................................................................
      return fn.call @, P...

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
        q_idx = idx if name is this_cfg_q_name
      else
        throw new Signature_disposition_Error "Ωnfa___7 parameter disposition not compliant: #{rpr name} in #{rpr signature}"
    #.......................................................................................................
    unless q_idx?
      names_rpr = names.join ', '
      throw new Signature_naming_Error "Ωnfa___8 parameter naming not compliant: no parameter named #{rpr this_cfg_q_name}, got #{rpr names_rpr}"
    #.......................................................................................................
    switch q_idx
      when names.length - 2 then q_ridx = -2
      when names.length - 1 then q_ridx = -1
      else
        throw new Signature_cfg_position_error "Ωnfa___9 parameter ordering not compliant: expected #{rpr this_cfg_q_name} to come last or next-to-last, found it at index #{q_idx} of #{names.length} parameters"
    #.......................................................................................................
    return { names, q_idx, q_ridx, }


#===========================================================================================================
normalizer                = new Normalize_function_arguments()
{ nfa
  get_signature         } = normalizer

#===========================================================================================================
module.exports = { nfa, get_signature, Normalize_function_arguments, Template, internals, }

