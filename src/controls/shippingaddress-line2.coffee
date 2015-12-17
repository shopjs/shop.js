Text = require './text'

module.exports = class ShippingAddressLine2 extends Text
  tag:  'shippingaddress-line2'
  lookup: 'order.shippingAddress.line2'

