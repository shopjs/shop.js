CrowdControl = require 'crowdcontrol'
{
  isRequired,
  isEmail,
  isNewPassword,
  splitName,
  matchesPassword
} = require './middleware'
m = require '../mediator'
Events = require '../events'

module.exports = class ProfileForm extends CrowdControl.Views.Form
  tag: 'profile'
  html: '''
    <form onsubmit={submit}>
      <yield/>
    </form>
  '''

  configs:
    'user.email':               [ isRequired, isEmail ]
    'user.name':                [ isRequired, splitName ]
    'user.currentPassword':     [ isNewPassword ]
    'user.password':            [ isNewPassword ]
    'user.passwordConfirm':     [ isNewPassword, matchesPassword ]

  errorMessage: null

  hasOrders: ()->
    orders = @data.get('user.orders')
    return orders && orders.length > 0

  init: ()->
    m.trigger Events.ProfileLoad
    @client.account.get().then((res)=>
      @data.set 'user', res
      firstName = @data.get 'user.firstName'
      lastName = @data.get 'user.lastName'
      @data.set 'user.name', firstName + ' ' + lastName

      if @data.get 'referralProgram' && (!res.referrers? || res.referrers.length == 0)
        requestAnimationFrame ()=>
          m.trigger Events.CreateReferralProgram
          @client.referrer.create({
            program:
              @data.get 'referralProgram'
            userId: res.id,
          }).then((res2)=>
            refrs = [res2]
            @data.set 'user.referrers', refrs
            m.trigger Events.CreateReferralProgramSuccess, refrs
            m.trigger Events.ProfileLoadSuccess, res
            riot.update()

          ).catch (err)=>
            @errorMessage = err.message
            m.trigger Events.CreateReferralProgramFailed, err
            m.trigger Events.ProfileLoadSuccess, res
            riot.update()
      else
        m.trigger Events.ProfileLoadSuccess, res
        riot.update()

    ).catch (err)=>
      @errorMessage = err.message
      m.trigger Events.ProfileLoadFailed, err
      riot.update()

    super

  _submit: (event)->
    opts =
      email:            @data.get 'user.email'
      firstName:        @data.get 'user.firstName'
      lastName:         @data.get 'user.lastName'
      currentPassword:  @data.get 'user.currentPassword'
      password:         @data.get 'user.password'
      passwordConfirm:  @data.get 'user.passwordConfirm'

    @errorMessage = null

    m.trigger Events.ProfileUpdate
    @client.account.update(opts).then((res)=>
      @data.set 'user.currentPassword', null
      @data.set 'user.password', null
      @data.set 'user.passwordConfirm', null
      m.trigger Events.ProfileUpdateSuccess, res
      @update()
    ).catch (err)=>
      @errorMessage = err.message
      m.trigger Events.ProfileUpdateFailed, err
      @update()

