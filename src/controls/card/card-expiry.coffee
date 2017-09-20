import { Text } from 'el-controls'
# import Text from 'el-controls/src/controls/text'

import keys from '../../utils/keys'
import { restrictNumeric } from '../../utils/card'

class CardExpiry extends Text
  tag:  'card-expiry'
  bind: 'payment.account.expiry'

  init: ->
    super

    @on 'mount', =>
      el = @root.querySelector('input')

      @_limit7 = (e) ->
        key = e.key

        return true if key not in keys.numeric

        value = el.value + String.fromCharCode key

        if value.length > 7
          return false

        if /^\d$/.test(value) and value not in ['0', '1']
          $input.val '0' + value + ' / '
          e.preventDefault()
        else if /^\d\d$/.test value
          $input.val value + ' / '
          e.preventDefault()

      el.addEventListener 'keypress', restrictNumeric
      el.addEventListener 'keypress', @_limit7

    @on 'unmount', =>
      el.removeEventListener 'keypress', restrictNumeric
      el.removeEventListener 'keypress', @_limit7

CardExpiry.register()

export default CardExpiry
