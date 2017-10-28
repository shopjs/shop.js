# import { Text } from 'el-controls'
import Text from 'el-controls/src/controls/text'

export default class PromoCode extends Text
  tag:  'promocode'
  bind: 'order.promoCode'

PromoCode.register()
