Select = require './select'

module.exports = class QuantitySelect extends Select
  tag: 'quantity-select-control'
  options: ->
    return {
      1: 1
      2: 2
      3: 3
      4: 4
      5: 5
      6: 6
      7: 7
      8: 8
      9: 9
    }

  readOnly: true

  getValue: (event)->
    return parseFloat($(event.target).val()?.trim())

  change: (e)->
    # riot phantom tag issue
    if !e.target?
      return

    oldValue = @data.get 'quantity'
    super
    newValue = @data.get 'quantity'
    @data.set 'quantity', oldValue

    #unset and reset using cart to get correct analytics/side effects
    @cart.set @data.get('productId'), newValue
