import El from 'el.js'

import Events from '../events'
import html   from '../../templates/containers/form'
import {
  isEmail
  isNewPassword
  isRequired
  matchesPassword
  splitName
} from './middleware'

class ProfileForm extends El.Form
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
    @mediator.trigger Events.ProfileLoad
    @client.account.get().then (res) =>
      @data.set 'user', res
      firstName = @data.get 'user.firstName'
      lastName = @data.get 'user.lastName'
      @data.set 'user.name', firstName + ' ' + lastName

      if @data.get('referralProgram') && (!res.referrers? || res.referrers.length == 0)
        raf =>
          @mediator.trigger Events.CreateReferralProgram
          @client.referrer.create({
            program:   @data.get 'referralProgram'
            programId: @data.get 'referralProgram.id'
            userId: res.id,
          }).then (res2) =>
            refrs = [res2]
            @data.set 'user.referrers', refrs
            @mediator.trigger Events.CreateReferralProgramSuccess, refrs
            @mediator.trigger Events.ProfileLoadSuccess, res
            El.scheduleUpdate()

          .catch (err) =>
            @errorMessage = err.message
            @mediator.trigger Events.CreateReferralProgramFailed, err
            @mediator.trigger Events.ProfileLoadSuccess, res
            El.scheduleUpdate()
      else
        @mediator.trigger Events.ProfileLoadSuccess, res
        El.scheduleUpdate()

    .catch (err) =>
      @errorMessage = err.message
      @mediator.trigger Events.ProfileLoadFailed, err
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
    @mediator.trigger Events.ProfileUpdate
    @client.account.update(opts).then (res) =>
      @data.set 'user.currentPassword', null
      @data.set 'user.password', null
      @data.set 'user.passwordConfirm', null
      @mediator.trigger Events.ProfileUpdateSuccess, res
      @scheduleUpdate()
    .catch (err)=>
      @errorMessage = err.message
      @mediator.trigger Events.ProfileUpdateFailed, err
      @scheduleUpdate()


ProfileForm.register()

export default ProfileForm
