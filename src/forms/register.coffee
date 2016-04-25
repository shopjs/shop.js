CrowdControl    = require 'crowdcontrol'
Crowdstart      = require 'crowdstart.js'
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

  configs:
    'user.email':               [ isRequired, isEmail ]
    'user.name':                [ isRequired, splitName ]
    'user.password':            [ isPassword ]
    'user.passwordConfirm':     [ isPassword, matchesPassword ]

  errorMessage: null

  _submit: (event)->
    opts =
      email:            @data.get 'user.email'
      firstName:        @data.get 'user.firstName'
      lastName:         @data.get 'user.lastName'
      password:         @data.get 'user.password'
      passwordConfirm:  @data.get 'user.passwordConfirm'

    @errorMessage = null

    m.trigger Events.Register
    @client.account.create(opts).then((res)=>
      m.trigger Events.RegisterSuccess, res
      @update()
    ).catch (err)=>
      @errorMessage = err.message
      m.trigger Events.RegisterFailed, err
      @update()
