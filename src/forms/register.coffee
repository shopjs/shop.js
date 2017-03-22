import CrowdControl from 'crowdcontrol'

import Events from '../events'
import html   from '../../templates/forms/form'
import m      from '../mediator'
import {
  isRequired
  isEmail
  isPassword
  splitName
  matchesPassword
} from './middleware'


class RegisterForm extends CrowdControl.Views.Form
  tag: 'register'
  html: form

  immediateLogin: false
  immediateLoginLatency: 400

  configs:
    'user.email':           [ isRequired, isEmail ]
    'user.name':            [ isRequired, splitName ]
    'user.password':        [ isPassword ]
    'user.passwordConfirm': [ isPassword, matchesPassword ]

  source: ''
  errorMessage: ''

  init: ->
    super

  _submit: (event) ->
    opts =
      email:           @data.get 'user.email'
      firstName:       @data.get 'user.firstName'
      lastName:        @data.get 'user.lastName'
      password:        @data.get 'user.password'
      passwordConfirm: @data.get 'user.passwordConfirm'
      referrerId:      @data.get 'order.referrerId'
      metadata:
        source: @source

    #optional captcha
    captcha = @data.get 'user.g-recaptcha-response'
    if captcha
      opts['g-recaptcha-response'] = captcha

    @errorMessage = ''

    @scheduleUpdate()
    m.trigger Events.Register
    @client.account.create(opts).then (res) =>
      m.trigger Events.RegisterSuccess, res
      @scheduleUpdate()

      if @immediateLogin && res.token
        @client.setCustomerToken res.token
        latency = @immediateLoginLatency / 2
        # simulate login with a little bit of latency for page transitions
        setTimeout =>
          m.trigger Events.Login
          setTimeout =>
            m.trigger Events.LoginSuccess, res
            @scheduleUpdate()
          , latency
        , latency
    .catch (err) =>
      @errorMessage = err.message
      m.trigger Events.RegisterFailed, err
      @scheduleUpdate()

export default RegisterForm
