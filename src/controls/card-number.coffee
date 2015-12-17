Text = require './text'

module.exports = class CardNumber extends Text
  tag:  'card-number'
  lookup: 'payment.account.number'

