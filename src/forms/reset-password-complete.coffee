import CrowdControl from 'crowdcontrol'
import {
  isPassword,
  matchesPassword
} from './middleware'
import m from '../mediator'
import Events from '../events'

import html from '../../templates/forms/form'

export default class ResetPasswordCompleteForm extends CrowdControl.Views.Form
  tag: 'reset-password-complete'
  html: html

  configs:
    'user.password':            [ isPassword ]
    'user.passwordConfirm':     [ isPassword, matchesPassword ]

  errorMessage: ''

  init: ()->
    super

  _submit: (event)->
    opts =
      password:         @data.get 'user.password'
      passwordConfirm:  @data.get 'user.passwordConfirm'
      tokenId:          @data.get 'tokenId'

    @errorMessage = ''

    @scheduleUpdate()
    m.trigger Events.ResetPasswordComplete
    @client.account.confirm(opts).then((res)=>
      if res.token
        @client.setCustomerToken res.token
      m.trigger Events.ResetPasswordCompleteSuccess, res
      @scheduleUpdate()
    ).catch (err)=>
      @errorMessage = err.message.replace 'Token', 'Link'
      m.trigger Events.ResetPasswordCompleteFailed, err
      @scheduleUpdate()
