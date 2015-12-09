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

module.exports = class CheckoutForm extends CrowdControl.Views.Form
  tag:  'checkout-form'
  html: '''
  <yield/>
  '''

  configs:
    'name':             [ isRequired, splitName ]

    'user.email':       [ isRequired, isEmail ]
    'user.password':    null

    'order.shippingAddress.line1':      [ isRequired ]
    'order.shippingAddress.line2':      null
    'order.shippingAddress.city':       [ isRequired ]
    'order.shippingAddress.state':      [ isRequired ]
    'order.shippingAddress.postalCode': [ isPostalRequired ]
    'order.shippingAddress.country':    [ isRequired ]

    'expiry':                   [ requiresStripe, expiration ]

    'payment.account.number':   [ requiresStripe, cardNumber]
    'payment.account.cvc':      [ requiresStripe, cvc ]
