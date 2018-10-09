# import { StateSelect } from 'el-controls'
import AddressState from './address-state'

export default class ShippingAddressState extends AddressState
  tag:  'shippingaddress-state'
  bind: 'order.shippingAddress.state'
  countryField: 'order.shippingAddress.country'

  init: ->
    super arguments...

ShippingAddressState.register()

