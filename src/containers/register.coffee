import El from 'el.js'

import Events from '../events'
import html   from '../../templates/containers/register'

import {
  isRequired
  isEmail
  isUsername
  isPassword
  splitName
  matchesPassword
} from './middleware'


class RegisterForm extends El.Form
  tag: 'register'
  html: html

  immediateLogin: false
  immediateLoginLatency: 400
  affiliateSignup: false

  # allow customers to set a default form to add this email to
  #formId: ''

  configs:
    'user.username':        [ isRequired, isUsername ]
    'user.email':           [ isRequired, isEmail ]
    'user.name':            [ isRequired, splitName ]
    'user.password':        [ isPassword ]
    'user.passwordConfirm': [ isPassword, matchesPassword ]

  source: ''
  errorMessage: ''

  init: ->
    super arguments...

  _submit: (event) ->
    opts =
      email:           @data.get 'user.email'
      firstName:       @data.get 'user.firstName'
      lastName:        @data.get 'user.lastName'
      formId:          @formId
      password:        @data.get 'user.password'
      passwordConfirm: @data.get 'user.passwordConfirm'
      referrerId:      @data.get 'order.referrerId'
      isAffiliate:     !!@affiliateSignup
      metadata:
        source: @source

    # only add username if its not null
    username = @data.get 'user.username'
    if username?
      opts.username = username

    #optional captcha
    captcha = @data.get 'user.g-recaptcha-response'
    if captcha
      opts['g-recaptcha-response'] = captcha

    @errorMessage = ''

    @scheduleUpdate()
    @mediator.trigger Events.Register
    @client.account.create(opts).then (res) =>
      @mediator.trigger Events.RegisterSuccess, res
      @scheduleUpdate()

      if @immediateLogin && res.token
        @client.setCustomerToken res.token
        latency = @immediateLoginLatency / 2
        # simulate login with a little bit of latency for page transitions
        setTimeout =>
          @mediator.trigger Events.Login
          setTimeout =>
            @mediator.trigger Events.LoginSuccess, res
            @scheduleUpdate()
          , latency
        , latency
    .catch (err) =>
      @errorMessage = err.message
      @mediator.trigger Events.RegisterFailed, err
      @scheduleUpdate()

RegisterForm.register()

export default RegisterForm
