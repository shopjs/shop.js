Text = require './text'

module.exports = class UserPasswordConfirm extends Text
  tag:      'user-password-confirm'
  lookup:   'user.passwordConfirm'
  type:     'password'
