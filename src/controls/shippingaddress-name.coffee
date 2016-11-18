Text = require './text'

module.exports = class ShippingAddressName extends Text
  tag:  'shippingaddress-name'
  lookup: 'order.shippingAddress.name'

