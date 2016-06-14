Text = require './text'
Payment = require 'payment'

module.exports = class CardNumber extends Text
  tag:  'card-number'
  lookup: 'payment.account.number'

  events:
    updated: ()->
      @onUpdated()

  init: ()->
    super

  onUpdated: ()->
    if !@first
      input = $(@root).find('input')[0]
      Payment.restrictNumeric input
      Payment.formatCardNumber input
      @first = true
