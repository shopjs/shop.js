# import { Text } from 'el-controls'
import Text from 'el-controls/src/controls/text'

class GiftEmail extends Text
  tag:  'gift-email'
  bind: 'order.giftEmail'

  init: ->
    super arguments...

export default GiftEmail

GiftEmail.register()

