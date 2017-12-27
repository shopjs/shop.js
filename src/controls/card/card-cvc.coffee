# import { Text } from 'el-controls'
import Text from 'el-controls/src/controls/text'

import keys from '../../utils/keys'
import { restrictNumeric } from 'shop.js-util/src/card'

class CardCVC extends Text
  tag:    'card-cvc'
  bind: 'payment.account.cvc'

  init: ->
    super

    @on 'mount', =>
      el = @root.querySelector('input')

      @_limit4 = (e) ->
        key = e.keyCode

        return true if key not in keys.numeric

        value = el.value + String.fromCharCode key

        if value.length > 4
          e.preventDefault()
          e.stopPropagation()
          return false

      el.addEventListener 'keypress', restrictNumeric
      el.addEventListener 'keypress', @_limit4

      @on 'unmount', =>
        el.removeEventListener 'keypress', restrictNumeric
        el.removeEventListener 'keypress', @_limit4

CardCVC.register()

export default CardCVC
