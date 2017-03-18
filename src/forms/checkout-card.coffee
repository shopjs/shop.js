CrowdControl = require 'crowdcontrol'
riot = require 'riot'
m = require '../mediator'
Events = require '../events'
{
  isRequired,
  isEmail,
  splitName,
  requiredStripe,
  cardNumber,
  expiration,
  cvc
} = require './middleware'
store = require '../utils/store'

# Render this form first if using a multipage flow where shipping data is entered first
# followed by credit card info on different pages.  Then use the CheckoutForm to
# collect the credit card data, user and order data should be autofilled for it.
module.exports = class CheckoutShippingAddressForm extends CrowdControl.Views.Form
  tag:  'checkout-shippingaddress'
  html: require '../../templates/forms/form'

  configs:
    'user.email':       [ isRequired, isEmail ]
    'user.name':        [ isRequired, splitName ]

    'payment.account.name':     [ isRequired ]
    'payment.account.number':   [ requiresStripe, cardNumber]
    'payment.account.expiry':   [ requiresStripe, expiration ]
    'payment.account.cvc':      [ requiresStripe, cvc ]

  init: ()->
    super

  _submit: ()->
    m.trigger Events.SubmitCard

    # Store partial pieces of checkout data.
    store.set 'checkout-user', @data.get 'user'
    store.set 'checkout-payment', @data.get 'order.payment'
    @update()
