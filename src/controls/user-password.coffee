Text = require './text'

module.exports = class UserPassword extends Text
  tag:      'user-password'
  lookup:   'user.password'
  type:     'password'
