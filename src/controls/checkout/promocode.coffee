import { Text } from 'el-controls'
# import Text from 'el-controls/src/controls/text'

import html from 'el-controls/templates/controls/input-normal-placeholder'

export default class PromoCode extends Text
  tag:  'promocode'
  html: html
  bind: 'order.promoCode'

PromoCode.register()
