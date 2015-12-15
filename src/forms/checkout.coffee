{
  isRequired,
  isEmail,
  splitName,
  isPostalRequired,
  requiresStripe,
  expiration,
  cardNumber,
  cvc,
  isEcardGiftRequired,
  agreeToTerms,
} = require './middleware'

CrowdControl = require 'crowdcontrol'
riot = require 'riot'
m = require '../mediator'
Events = require '../events'
analytics = require '../utils/analytics'

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

  configs:
    'user.email':       [ isRequired, isEmail ]
    'user.name':        [ isRequired, splitName ]
    'user.password':    null

    'order.shippingAddress.line1':      [ isRequired ]
    'order.shippingAddress.line2':      null
    'order.shippingAddress.city':       [ isRequired ]
    'order.shippingAddress.state':      [ isRequired ]
    'order.shippingAddress.postalCode': [ isPostalRequired ]
    'order.shippingAddress.country':    [ isRequired ]

    'order.gift':           null
    'order.giftType':       null
    'order.giftEmail':      [ isEcardGiftRequired, isEmail ]
    'order.giftMessage':    null

    'payment.account.number':   [ requiresStripe, cardNumber]
    'payment.account.expiry':   [ requiresStripe, expiration ]
    'payment.account.cvc':      [ requiresStripe, cvc ]

    'terms':                    [ agreeToTerms ]

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

    @update()
    @client.checkout.charge(data).then((order)=>

      @loading = false
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

      @checkedOut = true
      m.trigger Events.SubmitSuccess, @tag
      @update()
    ).catch (err) =>
      @loading = false
      console.log "shipping submit Error: #{err}"

      if err.message == 'Your card was declined.'
        @errorMessage = 'Sorry, your card was declined. Please check your payment information.'
      else
        @errorMessage = 'Sorry, unable to complete your transaction. Please try again later.'

      m.trigger Events.SubmitFailed, @tag
      @update()
