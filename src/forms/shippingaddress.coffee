CrowdControl = require 'crowdcontrol'
riot = require 'riot'
m = require '../mediator'
Events = require '../events'
{
  isRequired,
  isPostalRequired,
} = require './middleware'

module.exports = class ShippingAddressForm extends CrowdControl.Views.Form
  tag:  'shippingaddress'
  html: '''
    <form onsubmit={submit}>
      <yield/>
    </form>
  '''

  configs:
    'order.shippingAddress.line1':      [ isRequired ]
    'order.shippingAddress.line2':      null
    'order.shippingAddress.city':       [ isRequired ]
    'order.shippingAddress.state':      [ isRequired ]
    'order.shippingAddress.postalCode': [ isPostalRequired ]
    'order.shippingAddress.country':    [ isRequired ]

  _submit: ()->
    m.trigger Events.ShippingAddressValidated
