# import { Text } from 'el-controls'
import Text from 'el-controls/src/controls/text'

export default class UserPassword extends Text
  tag:      'user-password'
  lookup:   'user.password'
  type:     'password'

UserPassword.register()
