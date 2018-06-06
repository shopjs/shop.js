# import { Text } from 'el-controls'
import Text from 'el-controls/src/controls/text'

export default class UserName extends Text
  tag:  'user-name'
  bind: 'user.name'

  init: ->
    super arguments...

UserName.register()
