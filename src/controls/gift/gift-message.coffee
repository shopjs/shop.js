import { TextBox } from 'el-controls'
# import TextBox from 'el-controls/src/controls/textbox'

export default class GiftMessage extends TextBox
  tag:  'gift-message'
  bind: 'order.giftMessage'

GiftMessage.register()
