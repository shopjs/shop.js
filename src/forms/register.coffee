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

  configs:
    'user.email':               [ isRequired, isEmail ]
    'user.name':                [ isRequired, splitName ]
    'user.password':            [ isPassword ]
    'user.passwordConfirm':     [ isPassword, matchesPassword ]

  errorMessage: ''

  _submit: (event)->
    opts =
      email:            @data.get 'user.email'
      firstName:        @data.get 'user.firstName'
      lastName:         @data.get 'user.lastName'
      password:         @data.get 'user.password'
      passwordConfirm:  @data.get 'user.passwordConfirm'
      referrerId:       @data.get 'order.referrerId'

    @errorMessage = ''

    @update()
    m.trigger Events.Register
    @client.account.create(opts).then((res)=>
      m.trigger Events.RegisterSuccess, res
      @update()

      if @immediateLogin
        opts =
          email:    @data.get 'user.email'
          password: @data.get 'user.password'

        @errorMessage = ''

        @update()
        m.trigger Events.Login
        @client.account.login(opts).then((res)=>
          m.trigger Events.LoginSuccess, res
          @update()
        ).catch (err)=>
          @errorMessage = err.message
          m.trigger Events.LoginFailed, err
          @update()
    ).catch (err)=>
      @errorMessage = err.message
      m.trigger Events.RegisterFailed, err
      @update()
