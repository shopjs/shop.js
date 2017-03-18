CrowdControl    = require 'crowdcontrol'
{
  isRequired,
  isEmail
} = require './middleware'
m = require '../mediator'
Events = require '../events'

module.exports = class ResetPasswordForm extends CrowdControl.Views.Form
  tag: 'reset-password'
  html: require '../../templates/forms/form'

  configs:
    'user.email':               [ isRequired, isEmail ]

  errorMessage: ''

  init: ()->
    super

  _submit: (event)->
    opts =
      email:            @data.get 'user.email'

    @errorMessage = ''

    @update()
    m.trigger Events.ResetPassword
    @client.account.reset(opts).then((res)=>
      m.trigger Events.ResetPasswordSuccess, res
      @update()
    ).catch (err)=>
      @errorMessage = err.message
      m.trigger Events.ResetPasswordFailed, err
      @update()
