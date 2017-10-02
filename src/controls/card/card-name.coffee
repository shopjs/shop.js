# import { Text } from 'el-controls'
import Text from 'el-controls/src/controls/text'

class CardName extends Text
  tag:    'card-name'
  bind: 'payment.account.name'

CardName.register()

export default CardName
