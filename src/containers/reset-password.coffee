import El from 'el.js'

import Events from '../events'
import html   from '../../templates/containers/reset-password'

import {
  isRequired
  isEmail
} from './middleware'

class ResetPasswordForm extends El.Form
  tag: 'reset-password'
  html: html

  configs:
    'user.email': [ isRequired, isEmail ]

  errorMessage: ''

  init: ->
    super

  _submit: (event) ->
    opts =
      email: @data.get 'user.email'

    @errorMessage = ''

    @scheduleUpdate()
    @mediator.trigger Events.ResetPassword
    @client.account.reset(opts).then (res) =>
      @mediator.trigger Events.ResetPasswordSuccess, res
      @scheduleUpdate()
    .catch (err)=>
      @errorMessage = err.message
      @mediator.trigger Events.ResetPasswordFailed, err
      @scheduleUpdate()

ResetPasswordForm.register()

export default ResetPasswordForm
