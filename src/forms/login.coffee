import CrowdControl from 'crowdcontrol'

import {
  isRequired
  isEmail
  isPassword
} from './middleware'

import Events from '../events'
import m      from '../mediator'

class LoginForm extends CrowdControl.Views.Form
  tag: 'login'
  html: '''
    <form onsubmit={submit}>
      <yield/>
    </form>
  '''

  configs:
    'user.email':       [ isRequired, isEmail ]
    'user.password':    [ isPassword ]

  errorMessage: ''

  _submit: (event) ->
    opts =
      email:    @data.get 'user.email'
      password: @data.get 'user.password'

    @errorMessage = ''

    @update()
    m.trigger Events.Login
    @client.account.login(opts).then (res) =>
      m.trigger Events.LoginSuccess, res
      @update()
    .catch (err) =>
      @errorMessage = err.message
      m.trigger Events.LoginFailed, err
      @update()

export default LoginForm
