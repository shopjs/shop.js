# import { Text } from 'el-controls'
import Text from 'el-controls/src/controls/text'

export default class UserUsername extends Text
  tag:  'user-username'
  bind: 'user.username'

UserUsername.register()
