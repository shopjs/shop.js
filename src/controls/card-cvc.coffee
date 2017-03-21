import Text from './text'
import cardUtils from '../utils/card'
import keys from '../utils/keys'

export default class CardCVC extends Text
  tag:  'card-cvc'
  lookup: 'payment.account.cvc'

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

        if value.length > 4
          return false

      @first = true
