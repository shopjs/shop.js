# import { CheckBox } from 'el-controls'
import CheckBox from 'el-controls/src/controls/checkbox'

export default class Terms extends CheckBox
  tag:  'terms'
  bind: 'terms'

  init: ->
    super arguments...

Terms.register()

