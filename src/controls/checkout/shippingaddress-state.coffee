import { StateSelect } from 'el-controls'
# import StateSelect from 'el-controls/src/controls/state-select'

export default class ShippingAddressState extends StateSelect
  tag:  'shippingaddress-state'
  bind: 'order.shippingAddress.state'

  getCountry: ->
    return @data.get 'order.shippingAddress.country'

ShippingAddressState.register()

