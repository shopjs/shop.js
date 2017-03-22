import El from 'el.js'

import Events from '../events'
import html   from '../../templates/forms/form'
import m      from '../mediator'
import {
  isRequired
  isEmail
} from './middleware'

class ResetPasswordForm extends El.Views.Form
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
    m.trigger Events.ResetPassword
    @client.account.reset(opts).then (res) =>
      m.trigger Events.ResetPasswordSuccess, res
      @scheduleUpdate()
    .catch (err)=>
      @errorMessage = err.message
      m.trigger Events.ResetPasswordFailed, err
      @scheduleUpdate()

export default ResetPasswordForm
