import Text from './text'

export default class UserPasswordConfirm extends Text
  tag:          'user-password-confirm'
  lookup:       'user.passwordConfirm'
  type:         'password'
  autoComplete: 'off'

  init: ()->
    super
