# import { Select } from 'el-controls'
import Select from 'el-controls/src/controls/selection'

class GiftType extends Select
  tag:  'gift-type'
  bind: 'order.giftType'

GiftType.register()

export default GiftType
