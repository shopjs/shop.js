import CrowdControl from 'crowdcontrol'
import m from '../mediator'
import Events from '../events'
import store from 'akasha'

import html from '../../templates/forms/form'

export default class CheckoutForm extends CrowdControl.Views.Form
  tag:  'checkout'
  html: html

  errorMessage: ''
  loading: false
  checkedOut: false
  termsUrl: 'terms'

  configs: require './checkout-configs'

  init: ()->
    super

    m.on Events.ChangeSuccess, (name, value)=>
      if name == 'user.email'
        @cart._cartUpdate
          email:    value
          mailchimp:
            checkoutUrl: @data.get 'order.checkoutUrl'
          currency: @data.get 'order.currency'

  _submit: (event)->
    if @loading || @checkedOut
      return

    @loading = true
    m.trigger Events.Submit, @tag

    @errorMessage = ''

    @scheduleUpdate()
    email = ''
    @client.account.exists(@data.get 'user.email').then((res)=>

      if res.exists
        @data.set 'user.id', @data.get 'user.email'

        email =         @data.get 'user.email'

        cart =
          userId: email
          email:  email
          mailchimp:
            checkoutUrl: @data.get 'order.checkoutUrl'
          currency: @data.get 'order.currency'

        @cart._cartUpdate cart

      @data.set 'order.email', email

      @scheduleUpdate()
      @cart.checkout().then((pRef)=>
        pRef.p
          .then ()=>
            hasErrored = false
            setTimeout =>
              if !hasErrored
                @loading = false
                store.clear()

                @checkedOut = true
                @scheduleUpdate()
            , 200

            m.trigger Events.SubmitSuccess
          .catch (err)=>
            window?.Raven?.captureException(err)

            hasErrored = true
            @loading = false
            console.log "checkout submit Error: #{err}"
            @errorMessage = 'Unable to complete your transaction. Please try again later.'

            m.trigger Events.SubmitFailed, err
            @scheduleUpdate()
      ).catch (err)=>
        @loading = false
        console.log "authorize submit Error: #{err}"

        if err.type == 'authorization-error'
          @errorMessage = err.message
        else
          window?.Raven?.captureException(err)
          @errorMessage = 'Unable to complete your transaction. Please try again later.'

        m.trigger Events.SubmitFailed, err
        @scheduleUpdate()
    ).catch (err)=>
      @loading = false
      console.log "authorize submit Error: #{err}"

      if err.type == 'authorization-error'
        @errorMessage = err.message
      else
        window?.Raven?.captureException(err)
        @errorMessage = 'Unable to complete your transaction. Please try again later.'

      m.trigger Events.SubmitFailed, err
      @scheduleUpdate()
