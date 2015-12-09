{isRequired, isEmail, splitName, isPostalRequired, requiresStripe} = require './middleware'
CrowdControl = require 'crowdcontrol'

model.export = class CheckoutForm extends CrowdControl.Views.Form
  tag:  'checkout-form'
  configs:
    'name':             [ isRequire, splitName ]

    'user.email':       [ isRequired, isEmail ]
    'user.password':    null

    'order.shippingAddress.line1':      [ isRequired ]
    'order.shippingAddress.line2':      null
    'order.shippingAddress.city':       [ isRequired ]
    'order.shippingAddress.state':      [ isRequired ]
    'order.shippingAddress.postalCode': [ isPostalRequired ]
    'order.shippingAddress.country':    [ isRequired ]

    'expiry':                   [ requireStripe, expiration ]

    'payment.account.number':   [ requiresStripe, cardNumber]
    'payment.account.cvc':      [ requireStripe, cvc ]
  init: ()->
    super

CheckoutForm.register()
