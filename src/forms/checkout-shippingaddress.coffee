import El from 'el.js'
import riot         from 'riot'
import store        from 'akasha'

import Events from '../events'
import m      from '../mediator'
import html   from '../../templates/forms/checkout-shippingaddress'
import {
  isEmail
  isPostalRequired
  isRequired
  splitName
} from './middleware'

# Render this form first if using a multipage flow where shipping data is entered first
# followed by credit card info on different pages.  Then use the CheckoutForm to
# collect the credit card data, user and order data should be autofilled for it.
class CheckoutShippingAddressForm extends El.Form
  tag:  'checkout-shippingaddress'
  html: html

  # Support Attrs
  paged: false

  configs:
    'user.email':       [ isRequired, isEmail ]
    'user.name':        [ isRequired, splitName ]

    'order.shippingAddress.name':       [ isRequired ]
    'order.shippingAddress.line1':      [ isRequired ]
    'order.shippingAddress.line2':      null
    'order.shippingAddress.city':       [ isRequired ]
    'order.shippingAddress.state':      [ isRequired ]
    'order.shippingAddress.postalCode': [ isPostalRequired ]
    'order.shippingAddress.country':    [ isRequired ]

  init: ->
    super

  _submit: ->
    m.trigger Events.SubmitShippingAddress

    if @paged
      # Store partial pieces of checkout data.
      store.set 'checkout-user', @data.get 'user'
      store.set 'checkout-shippingAddress', @data.get 'order.shippingAddress'
    @scheduleUpdate()

export default CheckoutShippingAddressForm
