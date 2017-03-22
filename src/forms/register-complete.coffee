import CrowdControl from 'crowdcontrol'
import {
  isRequired
  isPassword
  splitName
  matchesPassword
} from './middleware'

import Events from '../events'
import m      from  '../mediator'

class RegisterComplete extends CrowdControl.Views.Form
  tag: 'register-complete'
  html: '''
    <form onsubmit={submit}>
      <yield/>
    </form>
  '''
  twoStageSignUp: false

  configs:
    'user.name':                [ isRequired, splitName ]
    'user.password':            [ isPassword ]
    'user.passwordConfirm':     [ isPassword, matchesPassword ]

  errorMessage: ''

  init: ->
    super

    if !@twoStageSignUp
      @_submit()

  _submit: (event) ->
    opts =
      password:         @data.get 'user.password'
      passwordConfirm:  @data.get 'user.passwordConfirm'
      tokenId:          @data.get 'tokenId'

    firstName = @data.get 'user.firstName'
    lastName = @data.get 'user.lastName'

    if firstName
      opts.firstName = firstName
    if lastName
      opts.lastName = lastName

    @errorMessage = ''

    @update()
    m.trigger Events.RegisterComplete
    @client.account.enable(opts).then (res) =>
      if res.token
        @client.setCustomerToken res.token
      m.trigger Events.RegisterCompleteSuccess, res
      @update()
    .catch (err) =>
      @errorMessage = err.message
      m.trigger Events.RegisterCompleteFailed, err
      @update()

export default RegisterComplete
