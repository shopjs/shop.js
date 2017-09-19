import { Text } from 'el-controls'
# import Text from 'el-controls/src/controls/text'

export default class UserPasswordConfirm extends Text
  tag:  'user-password-confirm'
  bind: 'user.passwordConfirm'
  type: 'password'

  autocomplete: 'off'

  init: ()->
    super

UserPasswordConfirm.register()
