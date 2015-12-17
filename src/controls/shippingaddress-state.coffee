StateSelect = require './state-select'

module.exports = class ShippingAddressState extends StateSelect
  tag:  'shippingaddress-state'
  lookup: 'order.shippingAddress.state'

