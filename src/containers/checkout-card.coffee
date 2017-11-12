import El    from 'el.js'
import store from 'akasha'

import Events from '../events'
import html   from '../../templates/containers/checkout-card'
import {
  cardNumber
  cvc
  expiration
  isEmail
  isRequired
  requiresStripe
  splitName
} from './middleware'

# Render this form first if using a multipage flow where shipping data is entered first
# followed by credit card info on different pages.  Then use the CheckoutForm to
# collect the credit card data, user and order data should be autofilled for it.
class CheckoutCardForm extends El.Form
  tag:  'checkout-card'
  html: html

  # Support Attrs
  # paged: false

  configs:
    'user.email':       [ isRequired, isEmail ]
    'user.name':        [ isRequired, splitName ]

    'payment.account.name':     [ requiresStripe, isRequired ]
    'payment.account.number':   [ requiresStripe, cardNumber]
    'payment.account.expiry':   [ requiresStripe, expiration ]
    'payment.account.cvc':      [ requiresStripe, cvc ]

  init: ->
    super

  _submit: ->
    @mediator.trigger Events.SubmitCard

    if @paged
      # Store partial pieces of checkout data.
      store.set 'checkout-user',    @data.get 'user'
      store.set 'checkout-payment', @data.get 'order.payment'
    @scheduleUpdate()

CheckoutCardForm.register()

export default CheckoutCardForm
