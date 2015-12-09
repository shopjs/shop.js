{
  isRequired,
  isEmail,
  splitName,
  isPostalRequired,
  requiresStripe,
  expiration,
  cardNumber,
  cvc,
} = require './middleware'
CrowdControl = require 'crowdcontrol'
riot = require 'riot'

module.exports = class CheckoutForm extends CrowdControl.Views.Form
  tag:  'checkout-form'
  html: '''
    <form onsubmit={submit}>
      <yield/>
    </form>
  '''

  errorMessage: null

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

    'order.isGift':         null
    'order.giftMessage:':   null
    'order.giftEmail':      null

    'payment.account.number':   [ requiresStripe, cardNumber]
    'payment.account.expiry':   [ requiresStripe, expiration ]
    'payment.account.cvc':      [ requiresStripe, cvc ]

  _submit: (event)->
    data =
      user:     @data.get 'user'
      order:    @data.get 'order'
      payment:  @data.get 'payment'

    @client.checkout.charge(data).then((order)=>
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

      @update()
    ).catch (err) =>
      console.log "shipping submit Error: #{err}"

      if res.error.code == 'card-declined'
        @errorMessage = 'Sorry, your card was declined. Please check your payment information.'
      else
        @errorMessage = 'Sorry, unable to complete your transaction. Please try again later.'

      @update()
