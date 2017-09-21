import { CountrySelect } from 'el-controls'
# import CountrySelect from 'el-controls/src/controls/country-select'

export default class ShippingAddressCountry extends CountrySelect
  tag:  'shippingaddress-country'
  bind: 'order.shippingAddress.country'

  init: ->
    super

    @input.ref.on 'set', (k, v)=>
      if k == 'countries'
        # force update of selectOptions
        @options()
        @update()

ShippingAddressCountry.register()
