# import { Text } from 'el-controls'
import Text from 'el-controls/src/controls/text'

export default class UserCurrentPassword extends Text
  tag:  'user-current-password'
  bind: 'user.currentPassword'
  type: 'password'
  autocomplete: 'off'

  init: ->
    super arguments...

UserCurrentPassword.register()
