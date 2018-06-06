# import { Text } from 'el-controls'
import Text from 'el-controls/src/controls/text'

export default class ShippingAddressCity extends Text
  tag:  'shippingaddress-city'
  bind: 'order.shippingAddress.city'

  init: ->
    super arguments...

ShippingAddressCity.register()

