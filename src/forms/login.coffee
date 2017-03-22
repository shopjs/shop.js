import CrowdControl from 'crowdcontrol'
import {
  isRequired,
  isEmail,
  isPassword,
} from './middleware'
import m from '../mediator'
import Events from '../events'

import html from '../../templates/forms/from'

export default class LoginForm extends CrowdControl.Views.Form
  tag: 'login'
  html: html

  configs:
    'user.email':       [ isRequired, isEmail ]
    'user.password':    [ isPassword ]

  errorMessage: ''

  _submit: (event)->
    opts =
      email:    @data.get 'user.email'
      password: @data.get 'user.password'

    @errorMessage = ''

    @scheduleUpdate()
    m.trigger Events.Login
    @client.account.login(opts).then((res)=>
      m.trigger Events.LoginSuccess, res
      @scheduleUpdate()
    ).catch (err)=>
      @errorMessage = err.message
      m.trigger Events.LoginFailed, err
      @scheduleUpdate()
