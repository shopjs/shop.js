# import { Select } from 'el-controls'
import Select from 'el-controls/src/controls/selection'

class GiftType extends Select
  tag:  'gift-type'
  bind: 'order.giftType'

  init: ->
    super arguments...

GiftType.register()

export default GiftType
