Text = require './text'

module.exports = class ShippingAddressCity extends Text
  tag:  'shippingaddress-city'
  lookup: 'order.shippingAddress.city'

