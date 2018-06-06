import El from 'el.js'

import Events from '../events'
import html   from '../../templates/containers/form'
import {
  isPassword,
  isRequired,
  matchesPassword
  splitName,
} from './middleware'

class RegisterCompleteForm extends El.Form
  tag: 'register-complete'
  html: html

  twoStageSignUp: false

  configs:
    'user.name':                [ isRequired, splitName ]
    'user.password':            [ isPassword ]
    'user.passwordConfirm':     [ isPassword, matchesPassword ]

  errorMessage: ''

  init: ->
    super arguments...

    if !@twoStageSignUp
      @_submit()

  _submit: (event) ->
    opts =
      password:         @data.get 'user.password'
      passwordConfirm:  @data.get 'user.passwordConfirm'
      tokenId:          @data.get 'tokenId'

    firstName = @data.get 'user.firstName'
    lastName = @data.get 'user.lastName'

    if firstName
      opts.firstName = firstName
    if lastName
      opts.lastName = lastName

    @errorMessage = ''

    @scheduleUpdate()
    @mediator.trigger Events.RegisterComplete
    @client.account.enable(opts).then (res) =>
      if res.token
        @client.setCustomerToken res.token
      @mediator.trigger Events.RegisterCompleteSuccess, res
      @scheduleUpdate()
    .catch (err)=>
      @errorMessage = err.message
      @mediator.trigger Events.RegisterCompleteFailed, err
      @scheduleUpdate()

RegisterCompleteForm.register()

export default RegisterCompleteForm
