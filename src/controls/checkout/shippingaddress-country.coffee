# import { CountrySelect } from 'el-controls'
import CountrySelect from 'el-controls/src/controls/country-select'

export default class ShippingAddressCountry extends CountrySelect
  tag:  'shippingaddress-country'
  bind: 'order.shippingAddress.country'
  countriesField: 'countries'

  init: ->
    super

    @input.ref.on 'set', (k, v)=>
      if k.indexOf(@countriesField) > -1
        # force update of selectOptions
        @options()
        @update()

ShippingAddressCountry.register()
