# import { StateSelect } from 'el-controls'
import StateSelect from 'el-controls/src/controls/state-select'

export default class ShippingAddressState extends StateSelect
  tag:  'shippingaddress-state'
  bind: 'order.shippingAddress.state'
  countryField: 'order.shippingAddress.country'

  getCountry: ->
    return @data.get @countryField

  init: ->
    super arguments...

    @input.ref.on 'set', (k, v)=>
      if k.indexOf(@countryField) > -1
        # force update of selectOptions
        @options()
        @update()

ShippingAddressState.register()

