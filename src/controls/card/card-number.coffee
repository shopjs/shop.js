# import { Text } from 'el-controls'
import Text from 'el-controls/src/controls/text'

import keys from '../../utils/keys'
import {
  cardFromNumber
  restrictNumeric
} from 'shop.js-util/src/card'

class CardNumber extends Text
  tag:      'card-number'
  bind:     'payment.account.number'
  cardType: ''

  init: ->
    super

    @on 'mount', =>
      # avoid weird rendering race conditions
      el = @root.querySelector('input')

      @_identifyCard = (e) =>
        key = e.keyCode

        return true if key not in keys.numeric

        @root.classList.remove @cardType if @cardType
        @root.classList.remove 'identified'
        @root.classList.remove 'unknown'

        value = el.value + String.fromCharCode key

        value = value.replace(/\D/g, '')
        length  = value.length
        upperLength = 16

        card = cardFromNumber value
        if card
          upperLength = card.length[card.length.length - 1]

          @cardType = card.type

          if @cardType
            @root.classList.add @cardType
            @root.classList.add 'identified'
          else
            @root.classList.add 'unknown'

        if length > upperLength
          e.preventDefault()
          e.stopPropagation()
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

        el.value = newValue
        e.preventDefault()

      el.addEventListener 'keypress', restrictNumeric
      el.addEventListener 'keypress', @_identifyCard

      @on 'unmount', =>
        el.removeEventListener 'keypress', restrictNumeric
        el.removeEventListener 'keypress', @_identifyCard

CardNumber.register()

export default CardNumber
