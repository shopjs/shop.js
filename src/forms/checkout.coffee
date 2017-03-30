import El    from 'el.js'
import store from 'akasha'

import Events  from '../events'
import configs from './configs'
import html    from '../../templates/forms/checkout'
import m       from '../mediator'

class CheckoutForm extends El.Form
  tag:  'checkout'
  html: html

  # Support Attrs
  # termsUrl: ''

  errorMessage: ''
  loading:      false
  checkedOut:   false
  configs:      configs

  init: ->
    super()

    @data.on 'set', (name, value) =>
      if name == 'user.email'
        @cart._cartUpdate
          email:    value
          currency: @data.get 'order.currency'
          mailchimp:
            checkoutUrl: @data.get 'order.checkoutUrl'

    @data.on 'set', (name, value) =>
      if name == 'user.name'
        if !@data.get 'payment.account.name'
          @data.set 'payment.account.name', value
        if !@data.get 'order.shippingAddress.name'
          @data.set 'order.shippingAddress.name', value
      El.scheduleUpdate()

  _submit: (event) ->
    return if @loading or @checkedOut

    @loading = true
    m.trigger Events.Submit, @tag

    @errorMessage = ''

    @scheduleUpdate()
    email = ''
    @client.account.exists(@data.get 'user.email').then (res) =>

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
      @cart.checkout().then (pRef) =>
        pRef.p
          .then =>
            hasErrored = false
            setTimeout =>
              if !hasErrored
                @loading = false
                store.clear()

                @checkedOut = true
                @scheduleUpdate()
            , 200

            m.trigger Events.SubmitSuccess

          .catch (err) =>
            window?.Raven?.captureException(err)

            hasErrored = true
            @loading = false
            console.log "checkout submit Error: #{err}"
            @errorMessage = 'Unable to complete your transaction. Please try again later.'

            m.trigger Events.SubmitFailed, err
            @scheduleUpdate()

      .catch (err) =>
        @loading = false
        console.log "authorize submit Error: #{err}"

        if err.type == 'authorization-error'
          @errorMessage = err.message
        else
          window?.Raven?.captureException(err)
          @errorMessage = 'Unable to complete your transaction. Please try again later.'

        m.trigger Events.SubmitFailed, err
        @scheduleUpdate()

    .catch (err) =>
      @loading = false
      console.log "authorize submit Error: #{err}"

      if err.type == 'authorization-error'
        @errorMessage = err.message
      else
        window?.Raven?.captureException(err)
        @errorMessage = 'Unable to complete your transaction. Please try again later.'

      m.trigger Events.SubmitFailed, err
      @scheduleUpdate()

export default CheckoutForm
