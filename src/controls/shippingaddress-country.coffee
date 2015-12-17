CountrySelect = require './country-select'

module.exports = class ShippingAddressCountry extends CountrySelect
  tag:  'shippingaddress-country'
  lookup: 'order.shippingAddress.country'

