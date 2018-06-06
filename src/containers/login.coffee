import El from 'el.js'

import Events from '../events'
import html   from '../../templates/containers/login'

import {
  isEmail
  isPassword
  isRequired
} from './middleware'

class LoginForm extends El.Form
  tag: 'login'
  html: html

  configs:
    'user.email':       [ isRequired, isEmail ]
    'user.password':    [ isPassword ]

  errorMessage: ''

  init: ->
    super arguments...

  _submit: (event) ->
    opts =
      email:    @data.get 'user.email'
      password: @data.get 'user.password'

    @errorMessage = ''

    @scheduleUpdate()
    @mediator.trigger Events.Login
    @client.account.login(opts).then (res) =>
      @mediator.trigger Events.LoginSuccess, res
      @scheduleUpdate()
    .catch (err)=>
      @errorMessage = err.message
      @mediator.trigger Events.LoginFailed, err
      @scheduleUpdate()

LoginForm.register()

export default LoginForm
