import { Text } from 'el-controls'
#import Text from 'el-controls/src/controls/text'

export default class ShippingAddressPostalCode extends Text
  tag:  'shippingaddress-postalcode'
  bind: 'order.shippingAddress.postalCode'

ShippingAddressPostalCode.register()
