import { Text } from 'el-controls'
# import Text from 'el-controls/src/controls/text'

export default class ShippingAddressLine2 extends Text
  tag:  'shippingaddress-line2'
  bind: 'order.shippingAddress.line2'

ShippingAddressLine2.register()
