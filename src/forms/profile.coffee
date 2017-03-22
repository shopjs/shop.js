import El from 'el.js'

import Events from '../events'
import html   from '../../templates/forms/form'
import m      from '../mediator'
import {
  isEmail
  isNewPassword
  isRequired
  matchesPassword
  splitName
} from './middleware'


class ProfileForm extends El.Views.Form
  tag: 'profile'
  html: html

  configs:
    'user.email':               [ isRequired, isEmail ]
    'user.name':                [ isRequired, splitName ]
    'user.currentPassword':     [ isNewPassword ]
    'user.password':            [ isNewPassword ]
    'user.passwordConfirm':     [ isNewPassword, matchesPassword ]

  errorMessage: ''

  hasOrders: ->
    orders = @data.get('user.orders')
    return orders && orders.length > 0

  init: ->
    m.trigger Events.ProfileLoad
    @client.account.get().then (res) =>
      @data.set 'user', res
      firstName = @data.get 'user.firstName'
      lastName = @data.get 'user.lastName'
      @data.set 'user.name', firstName + ' ' + lastName

      if @data.get('referralProgram') && (!res.referrers? || res.referrers.length == 0)
        raf =>
          m.trigger Events.CreateReferralProgram
          @client.referrer.create({
            program:   @data.get 'referralProgram'
            programId: @data.get 'referralProgram.id'
            userId: res.id,
          }).then (res2) =>
            refrs = [res2]
            @data.set 'user.referrers', refrs
            m.trigger Events.CreateReferralProgramSuccess, refrs
            m.trigger Events.ProfileLoadSuccess, res
            El.scheduleUpdate()

          .catch (err) =>
            @errorMessage = err.message
            m.trigger Events.CreateReferralProgramFailed, err
            m.trigger Events.ProfileLoadSuccess, res
            El.scheduleUpdate()
      else
        m.trigger Events.ProfileLoadSuccess, res
        El.scheduleUpdate()

    .catch (err) =>
      @errorMessage = err.message
      m.trigger Events.ProfileLoadFailed, err
      El.scheduleUpdate()

    super

  _submit: (event) ->
    opts =
      email:            @data.get 'user.email'
      firstName:        @data.get 'user.firstName'
      lastName:         @data.get 'user.lastName'
      currentPassword:  @data.get 'user.currentPassword'
      password:         @data.get 'user.password'
      passwordConfirm:  @data.get 'user.passwordConfirm'

    @errorMessage = ''

    @scheduleUpdate()
    m.trigger Events.ProfileUpdate
    @client.account.update(opts).then (res) =>
      @data.set 'user.currentPassword', null
      @data.set 'user.password', null
      @data.set 'user.passwordConfirm', null
      m.trigger Events.ProfileUpdateSuccess, res
      @scheduleUpdate()
    .catch (err)=>
      @errorMessage = err.message
      m.trigger Events.ProfileUpdateFailed, err
      @scheduleUpdate()


export default ProfileForm
