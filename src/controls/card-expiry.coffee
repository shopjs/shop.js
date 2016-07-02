Text = require './text'
Payment = require 'payment'

module.exports = class CardExpiry extends Text
  tag:  'card-expiry'
  lookup: 'payment.account.expiry'

  events:
    updated: ()->
      @onUpdated()

  init: ()->
    super

  onUpdated: ()->
    if !@first
      input = $(@root).find('input')[0]
      Payment.restrictNumeric input
      Payment.formatCardExpiry input
      @first = true
