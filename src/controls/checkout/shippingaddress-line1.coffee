import { Text } from 'el-controls'
# import Text from 'el-controls/src/controls/text'

export default class ShippingAddressLine1 extends Text
  tag:  'shippingaddress-line1'
  bind: 'order.shippingAddress.line1'

ShippingAddressLine1.register()
