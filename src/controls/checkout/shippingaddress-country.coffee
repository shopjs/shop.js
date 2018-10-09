# import { CountrySelect } from 'el-controls'
import AddressCountry from './address-country'

export default class ShippingAddressCountry extends AddressCountry
  tag:  'shippingaddress-country'
  bind: 'order.shippingAddress.country'

  init: ->
    super arguments...

ShippingAddressCountry.register()
