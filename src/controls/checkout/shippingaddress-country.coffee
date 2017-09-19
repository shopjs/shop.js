import { CountrySelect } from 'el-controls'
# import CountrySelect from 'el-controls/src/controls/country-select'

export default class ShippingAddressCountry extends CountrySelect
  tag:  'shippingadddress-country'
  bind: 'order.shippingAddress.country'

ShippingAddressCountry.register()
