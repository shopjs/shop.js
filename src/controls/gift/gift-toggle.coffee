# import { CheckBox } from 'el-controls'
import CheckBox from 'el-controls/src/controls/checkbox'

export default class GiftToggle extends CheckBox
  tag:  'gift-toggle'
  bind: 'order.gift'

  init: ->
    super arguments...

GiftToggle.register()
