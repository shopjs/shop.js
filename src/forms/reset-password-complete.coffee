import CrowdControl from 'crowdcontrol'

import m      from'../mediator'
import Events from '../events'
import {
  isPassword,
  matchesPassword
} from './middleware'


class ResetPasswordCompleteForm extends CrowdControl.Views.Form
  tag: 'reset-password-complete'
  html: '''
    <form onsubmit={submit}>
      <yield/>
    </form>
  '''
  configs:
    'user.password':        [ isPassword ]
    'user.passwordConfirm': [ isPassword, matchesPassword ]

  errorMessage: ''

  init: ->
    super

  _submit: (event) ->
    opts =
      password:         @data.get 'user.password'
      passwordConfirm:  @data.get 'user.passwordConfirm'
      tokenId:          @data.get 'tokenId'

    @errorMessage = ''

    @update()
    m.trigger Events.ResetPasswordComplete
    @client.account.confirm(opts).then (res) =>
      if res.token
        @client.setCustomerToken res.token
      m.trigger Events.ResetPasswordCompleteSuccess, res
      @update()
    .catch (err) =>
      @errorMessage = err.message.replace 'Token', 'Link'
      m.trigger Events.ResetPasswordCompleteFailed, err
      @update()

export default ResetPasswordCompleteForm
