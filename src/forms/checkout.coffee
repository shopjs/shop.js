CrowdControl = require 'crowdcontrol'
riot = require 'riot'
m = require '../mediator'
Events = require '../events'
store = require 'store'

module.exports = class CheckoutForm extends CrowdControl.Views.Form
  tag:  'checkout'
  html: '''
    <form onsubmit={submit}>
      <yield/>
    </form>
  '''

  errorMessage: null
  loading: false
  checkedOut: false

  configs: require './config'

  _submit: (event)->
    if @loading || @checkedOut
      return

    @loading = true
    m.trigger Events.Submit, @tag

    @errorMessage = null
    data =
      user:     @data.get 'user'
      order:    @data.get 'order'
      payment:  @data.get 'payment'

    # Do this until there is a riot version that fixes loops and riot.upate
    newItems = []
    for item in data.order.items
      if item.quantity > 0
        newItems.push item

    data.order.items = newItems

    @update()
    @client.checkout.authorize(data).then((order)=>
      @data.set 'coupon', @data.get('order.coupon') || {}
      @data.set 'order', order

      referralProgram = @data.get 'referralProgram'

      if referralProgram?
        @client.referrer.create(
          userId: data.order.userId
          orderId: data.order.orderId
          program: referralProgram
        ).then((referrer)=>
          @data.set 'referrerId', referrer.id
        ).catch (err)->
          console.log "new referralProgram Error: #{err}"

      hasErrored = false
      @client.checkout.capture(order.id).then((order)=>
        @data.set 'order', order
      ).catch (err)=>
        hasErrored = true
        @loading = false
        console.log "checkout submit Error: #{err}"
        @errorMessage = 'Sorry, unable to complete your transaction. Please try again later.'

        m.trigger Events.SubmitFailed, @tag
        @update()

      # Don't immediately issue success so we allow for some time to analytics to catch up
      setTimeout ()=>
        if !hasErrored
          @loading = false
          store.clear()

          @checkedOut = true
          m.trigger Events.SubmitSuccess, @tag
          @update()
      , 200

      @update()
    ).catch (err) =>
      @loading = false
      console.log "authorize submit Error: #{err}"

      if err.message == 'Your card was declined.'
        @errorMessage = 'Sorry, your card was declined. Please check your payment information.'
      else
        @errorMessage = 'Sorry, unable to complete your transaction. Please try again later.'

      m.trigger Events.SubmitFailed, @tag
      @update()
