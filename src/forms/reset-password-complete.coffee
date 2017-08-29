import El from 'el.js'

import Events from '../events'
import html   from '../../templates/forms/reset-password-complete'

import {
  isPassword,
  matchesPassword
} from './middleware'

class ResetPasswordCompleteForm extends El.Form
  tag: 'reset-password-complete'
  html: html

  configs:
    'user.password':        [ isPassword ]
    'user.passwordConfirm': [ isPassword, matchesPassword ]

  errorMessage: ''

  init: ->
    super

  _submit: (event) ->
    opts =
      password:         @data.get 'user.password'
      passwordConfirm:  @data.get 'user.passwordConfirm'
      tokenId:          @data.get 'tokenId'

    @errorMessage = ''

    @scheduleUpdate()
    @mediator.trigger Events.ResetPasswordComplete
    @client.account.confirm(opts).then (res) =>
      if res.token
        @client.setCustomerToken res.token
      @mediator.trigger Events.ResetPasswordCompleteSuccess, res
      @scheduleUpdate()
    .catch (err)=>
      @errorMessage = err.message.replace 'Token', 'Link'
      @mediator.trigger Events.ResetPasswordCompleteFailed, err
      @scheduleUpdate()

export default ResetPasswordCompleteForm
