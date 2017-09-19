import { Select } from 'el-controls'
# import Select from 'el-controls/src/controls/select'

class GiftType extends Select
  tag:  'gift-type'
  bind: 'order.giftType'

GiftType.register()

export default GiftType
