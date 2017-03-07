CrowdControl    = require 'crowdcontrol'
{
  isRequired,
  isEmail,
  isPassword,
  splitName,
  matchesPassword
} = require './middleware'
m = require '../mediator'
Events = require '../events'

module.exports = class RegisterForm extends CrowdControl.Views.Form
  tag: 'register'
  html: '''
    <form onsubmit={submit}>
      <yield/>
    </form>
  '''
  immediateLogin: false
  immediateLoginLatency: 400

  configs:
    'user.email':               [ isRequired, isEmail ]
    'user.name':                [ isRequired, splitName ]
    'user.password':            [ isPassword ]
    'user.passwordConfirm':     [ isPassword, matchesPassword ]

  source: ''
  errorMessage: ''

  init: ()->
    super

  _submit: (event)->
    opts =
      email:            @data.get 'user.email'
      firstName:        @data.get 'user.firstName'
      lastName:         @data.get 'user.lastName'
      password:         @data.get 'user.password'
      passwordConfirm:  @data.get 'user.passwordConfirm'
      referrerId:       @data.get 'order.referrerId'
      metadata:
        source: @source

    #optional captcha
    captcha = @data.get 'user.g-recaptcha-response'
    if captcha
      opts['g-recaptcha-response'] = captcha

    @errorMessage = ''

    @update()
    m.trigger Events.Register
    @client.account.create(opts).then((res)=>
      m.trigger Events.RegisterSuccess, res
      @update()

      if @immediateLogin && res.token
        @client.setCustomerToken res.token
        latency = @immediateLoginLatency / 2
        # simulate login with a little bit of latency for page transitions
        setTimeout =>
          m.trigger Events.Login
          setTimeout =>
            m.trigger Events.LoginSuccess, res
            @update()
          , latency
        , latency
    ).catch (err)=>
      @errorMessage = err.message
      m.trigger Events.RegisterFailed, err
      @update()
