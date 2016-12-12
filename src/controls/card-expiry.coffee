Text = require './text'
cardUtils = require '../utils/card'
keys = require '../utils/keys'

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
      $input = $($(@root).find('input')[0])
      $input.on 'keypress', cardUtils.restrictNumeric
      $input.on 'keypress', (e)->
        return true if e.which not in keys.numeric

        value = $input.val() + String.fromCharCode e.which

        if value.length > 7
          return false

        if /^\d$/.test(value) and value not in ['0', '1']
          $input.val '0' + value + ' / '
          e.preventDefault()
        else if /^\d\d$/.test(value)
          $input.val value + ' / '
          e.preventDefault()

      @first = true
