import Text from './text'
import keys from '../utils/keys'
import {cardFromNumber, restrictNumeric} from '../utils/card'


class CardNumber extends Text
  tag:      'card-number'
  lookup:   'payment.account.number'
  cardType: ''

  events:
    updated: ->
      @onUpdated()

  init: ->
    super

  onUpdated: ->
    if !@first
      $input = $($(@root).find('input')[0])
      $input.on 'keypress', restrictNumeric
      $input.on 'keypress', (e)=>
        return true if e.which not in keys.numeric

        $input.removeClass @cardType + ' identified unknown'

        value = $input.val() + String.fromCharCode e.which

        value = value.replace(/\D/g, '')
        length  = value.length
        upperLength = 16

        card = cardFromNumber value
        if card
          upperLength = card.length[card.length.length - 1]

          @cardType = card.type

          if @cardType
            $input.addClass @cardType + ' identified'
          else
            $input.addClass 'unknown'

        if length > upperLength
          return false

        newValue = value[0]
        if length > 1
          if card && card.type is 'amex'
            for i in [1..length-1]
              if i == 3 || i == 9
                newValue += value[i] + ' '
              else
                newValue += value[i]
          else
            for i in [1..length-1]
              if (i + 1) % 4 == 0 && i != length - 1
                newValue += value[i] + ' '
              else
                newValue += value[i]

        $input.val newValue

        e.preventDefault()

      @first = true

export default CardNumber
