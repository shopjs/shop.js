Text = require './text'

module.exports = class ShippingAddressLine1 extends Text
  tag:  'shippingaddress-line1'
  lookup: 'order.shippingAddress.line1'

