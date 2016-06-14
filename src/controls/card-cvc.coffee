Text = require './text'
Payment = require 'payment'

module.exports = class CardCVC extends Text
  tag:  'card-cvc'
  lookup: 'payment.account.cvc'

  events:
    updated: ()->
      @onUpdated()

  init: ()->
    super

  onUpdated: ()->
    if !@first
      input = $(@root).find('input')[0]
      Payment.restrictNumeric input
      Payment.formatCardCVC input
      @first = true
