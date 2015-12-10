Select = require './select'

module.exports = class QuantitySelect extends Select
  tag: 'quantity-select-control'
  options:
    1: 1
    2: 2
    3: 3
    4: 4
    5: 5
    6: 6
    7: 7
    8: 8
    9: 9

  getValue: (event)->
    return parseFloat($(event.target).val()?.trim())

