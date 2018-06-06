# import { Text } from 'el-controls'
import Text from 'el-controls/src/controls/text'

export default class ShippingAddressName extends Text
  tag:  'shippingaddress-name'
  bind: 'order.shippingAddress.name'

  init: ->
    super arguments...

ShippingAddressName.register()

