import El    from 'el.js'
import store from 'akasha'

import Events  from '../events'
import configs from './configs'
import html    from '../../templates/containers/checkout'

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
          @data.set('payment.account.name', value) if value
        if !@data.get 'order.shippingAddress.name'
          @data.set('order.shippingAddress.name', value) if value
      El.scheduleUpdate()

    @data.on 'set', (name, value) =>
      if name.indexOf('shippingAddress') >= 0
        @cart.invoice()
        El.scheduleUpdate()

  _submit: (event) ->
    return if @loading or @checkedOut

    @loading = true
    @mediator.trigger Events.Submit, @tag

    @errorMessage = ''

    El.scheduleUpdate()
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

      El.scheduleUpdate()
      @cart.checkout().then (pRef) =>
        return pRef.p
          .then (order)=>
            hasErrored = false
            setTimeout =>
              if !hasErrored
                @loading = false
                store.clear()

                @checkedOut = true
                El.scheduleUpdate()
            , 200

            @mediator.trigger Events.SubmitSuccess, order
            return order

          .catch (err) =>
            window?.Raven?.captureException(err)

            hasErrored = true
            @loading = false
            console.log "checkout submit Error: #{err}"
            @errorMessage = 'Unable to complete your transaction. Please try again later.'

            @mediator.trigger Events.SubmitFailed, err
            El.scheduleUpdate()

      .catch (err) =>
        @loading = false
        console.log "authorize submit Error: #{err}"

        if err.type == 'authorization-error'
          @errorMessage = err.message
        else
          window?.Raven?.captureException(err)
          @errorMessage = 'Unable to complete your transaction. Please try again later.'

        @mediator.trigger Events.SubmitFailed, err
        El.scheduleUpdate()

    .catch (err) =>
      @loading = false
      console.log "authorize submit Error: #{err}"

      if err.type == 'authorization-error'
        @errorMessage = err.message
      else
        window?.Raven?.captureException(err)
        @errorMessage = 'Unable to complete your transaction. Please try again later.'

      @mediator.trigger Events.SubmitFailed, err
      El.scheduleUpdate()

CheckoutForm.register()

export default CheckoutForm
