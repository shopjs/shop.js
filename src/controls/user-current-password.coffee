Text = require './text'

module.exports = class UserCurrentPassword extends Text
  tag:      'user-current-password'
  lookup:   'user.currentPassword'
  type:     'password'
  autoComplete: 'off'

  init: ()->
    super

