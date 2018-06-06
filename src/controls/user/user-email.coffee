# import { Text } from 'el-controls'
import Text from 'el-controls/src/controls/text'

export default class UserEmail extends Text
  tag:  'user-email'
  bind: 'user.email'

  init: ->
    super arguments...

UserEmail.register()
