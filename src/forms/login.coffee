import El from 'el.js'

import Events from '../events'
import html   from '../../templates/forms/form'
import m      from '../mediator'
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

  _submit: (event) ->
    opts =
      email:    @data.get 'user.email'
      password: @data.get 'user.password'

    @errorMessage = ''

    @scheduleUpdate()
    m.trigger Events.Login
    @client.account.login(opts).then (res) =>
      m.trigger Events.LoginSuccess, res
      @scheduleUpdate()
    .catch (err)=>
      @errorMessage = err.message
      m.trigger Events.LoginFailed, err
      @scheduleUpdate()

export default LoginForm
