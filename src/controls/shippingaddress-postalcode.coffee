Text = require './text'

module.exports = class ShippingAddressPostalCode extends Text
  tag:  'shippingaddress-postalcode'
  lookup: 'order.shippingAddress.postalCode'

