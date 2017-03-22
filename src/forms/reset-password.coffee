import CrowdControl from 'crowdcontrol'

import m      from '../mediator'
import Events from '../events'
import {
  isRequired
  isEmail
} from './middleware'


class ResetPasswordForm extends CrowdControl.Views.Form
  tag: 'reset-password'
  html: '''
    <form onsubmit={submit}>
      <yield/>
    </form>
  '''
  configs:
    'user.email': [ isRequired, isEmail ]

  errorMessage: ''

  init: ->
    super

  _submit: (event) ->
    opts =
      email: @data.get 'user.email'

    @errorMessage = ''

    @update()
    m.trigger Events.ResetPassword
    @client.account.reset(opts).then (res) =>
      m.trigger Events.ResetPasswordSuccess, res
      @update()
    .catch (err) =>
      @errorMessage = err.message
      m.trigger Events.ResetPasswordFailed, err
      @update()

export default ResetPasswordForm
