import Text from './text'
import keys from '../utils/keys'
import {restrictNumeric} from '../utils/card'

class CardCVC extends Text
  tag:    'card-cvc'
  lookup: 'payment.account.cvc'

  events:
    updated: ->
      @onUpdated()

  init: ->
    super

  onUpdated: ->
    if !@first
      $input = $($(@root).find('input')[0])
      $input.on 'keypress', restrictNumeric
      $input.on 'keypress', (e) ->
        return true if e.which not in keys.numeric

        value = $input.val() + String.fromCharCode e.which

        if value.length > 4
          return false

      @first = true

export default CardCVC
